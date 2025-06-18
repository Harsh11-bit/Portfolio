import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecycleBinManager.css';

function RecycleBinManager() {
  const [recycleItems, setRecycleItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const BASE_URL = 'https://portfolio-9unv.onrender.com';

  const fetchRecycleItems = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${BASE_URL}/api/recycle-bin`);
      console.log('Recycle Bin API response:', res.data);
      const data = Array.isArray(res.data) ? res.data : [];
      data.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
      setRecycleItems(data);
      if (data.length === 0) {
        setMessage('Recycle Bin is empty.');
      }
    } catch (err) {
      console.error('Error fetching recycle bin items:', err.response?.data || err.message);
      setError(`Failed to fetch recycle bin items: ${err.response?.data?.error || err.message}`);
      setRecycleItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecycleItems();
  }, []);

  const handleRestore = async (id) => {
    if (actionLoading[id]) return;
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    const previousItems = recycleItems;
    setRecycleItems(recycleItems.filter((item) => item._id !== id));
    setMessage('Item restored successfully!');

    try {
      await axios.post(`${BASE_URL}/api/recycle-bin/restore/${id}`);
      if (recycleItems.length === 1) {
        setMessage('Recycle Bin is empty.');
      }
    } catch (err) {
      console.error('Error restoring item:', err.response?.data || err.message);
      setMessage(`Error restoring item: ${err.response?.data?.error || err.message}`);
      setRecycleItems(previousItems);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handlePermanentDelete = async (id) => {
    if (actionLoading[id]) return;
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    const previousItems = recycleItems;
    setRecycleItems(recycleItems.filter((item) => item._id !== id));
    setMessage('Item permanently deleted!');

    try {
      await axios.delete(`${BASE_URL}/api/recycle-bin/${id}`);
      if (recycleItems.length === 1) {
        setMessage('Recycle Bin is empty.');
      }
    } catch (err) {
      console.error('Error permanently deleting item:', err.response?.data || err.message);
      setMessage(`Error permanently deleting item: ${err.response?.data?.error || err.message}`);
      setRecycleItems(previousItems);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const renderItemDetails = (item, collectionType) => {
    switch (collectionType) {
      case 'Project':
        return (
          <>
            <h5>{item.title || 'Untitled Project'}</h5>
            <p>{item.description || 'No description'}</p>
            {item.mainImage && <img src={item.mainImage} alt={item.title || 'Project'} style={{ width: '100px', margin: '10px 0' }} />}
            {item.technologies && (
              <div className="technologies">
                <strong>Technologies:</strong>
                {item.technologies.split(',').map((tech, i) => (
                  <span key={i} className="tech-badge">{tech.trim()}</span>
                ))}
              </div>
            )}
            {item.additionalImages?.length > 0 && (
              <div>
                <strong>Additional Images:</strong>
                {item.additionalImages.map((img, idx) => (
                  <div key={idx} style={{ margin: '10px 0' }}>
                    <img src={img.url} alt={`Additional ${idx}`} style={{ width: '100px' }} />
                    <p>{img.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
            {item.additionalDescription && <p>{item.additionalDescription}</p>}
            {item.highlights?.length > 0 && (
              <div>
                <strong>Highlights:</strong>
                {item.highlights.map((highlight, idx) => (
                  <p key={idx}>{highlight}</p>
                ))}
              </div>
            )}
          </>
        );
      case 'About':
        return (
          <>
            <h5>{item.title || 'Untitled About'}</h5>
            <p>{item.description || 'No description'}</p>
            {item.mainImage && <img src={item.mainImage} alt={item.title || 'About'} style={{ width: '100px', margin: '10px 0' }} />}
            {item.additionalImages?.length > 0 && (
              <div>
                <strong>Additional Images:</strong>
                {item.additionalImages.map((img, idx) => (
                  <div key={idx} style={{ margin: '10px 0' }}>
                    <img src={img.url} alt={`Additional ${idx}`} style={{ width: '100px' }} />
                    <p>{img.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
            {item.additionalDescription && <p>{item.additionalDescription}</p>}
          </>
        );
      case 'Blog':
        return (
          <>
            <h5>{item.title || 'Untitled Blog'}</h5>
            <p>{item.content || 'No content'}</p>
            {item.mainImage && <img src={item.mainImage} alt={item.title || 'Blog'} style={{ width: '100px', margin: '10px 0' }} />}
            {item.additionalImages?.length > 0 && (
              <div>
                <strong>Additional Images:</strong>
                {item.additionalImages.map((img, idx) => (
                  <div key={idx} style={{ margin: '10px 0' }}>
                    <img src={img.url} alt={`Additional ${idx}`} style={{ width: '100px' }} />
                    <p>{img.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
            {item.additionalDescription && <p>{item.additionalDescription}</p>}
            {item.highlights?.length > 0 && (
              <div>
                <strong>Highlights:</strong>
                {item.highlights.map((highlight, idx) => (
                  <p key={idx}>{highlight}</p>
                ))}
              </div>
            )}
          </>
        );
      case 'Certificate':
        return (
          <>
            <h5>{item.title || 'Untitled Certificate'}</h5>
            <p><strong>Organization:</strong> {item.issuingOrganization || 'Unknown'}</p>
            <p><strong>Issue Date:</strong> {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}</p>
            {item.mainImage && <img src={item.mainImage} alt={item.title || 'Certificate'} style={{ width: '100px', margin: '10px 0' }} />}
            {item.additionalImages?.length > 0 && (
              <div>
                <strong>Additional Images:</strong>
                {item.additionalImages.map((img, idx) => (
                  <div key={idx} style={{ margin: '10px 0' }}>
                    <img src={img.url} alt={`Additional ${idx}`} style={{ width: '100px' }} />
                    <p>{img.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
            {item.skills && <p><strong>Skills:</strong> {item.skills}</p>}
            {item.additionalDescription && <p>{item.additionalDescription}</p>}
            {item.highlights?.length > 0 && (
              <div>
                <strong>Highlights:</strong>
                {item.highlights.map((highlight, idx) => (
                  <p key={idx}>{highlight}</p>
                ))}
              </div>
            )}
          </>
        );
      case 'Service':
        return (
          <>
            <h5>{item.title || 'Untitled Service'}</h5>
            <p>{item.description || 'No description'}</p>
            {item.mainImage && <img src={item.mainImage} alt={item.title || 'Service'} style={{ width: '100px', margin: '10px 0' }} />}
            {item.additionalImages?.length > 0 && (
              <div>
                <strong>Additional Images:</strong>
                {item.additionalImages.map((img, idx) => (
                  <div key={idx} style={{ margin: '10px 0' }}>
                    <img src={img.url} alt={`Additional ${idx}`} style={{ width: '100px' }} />
                    <p>{img.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            )}
            {item.highlights?.length > 0 && (
              <div>
                <strong>Highlights:</strong>
                {item.highlights.map((highlight, idx) => (
                  <p key={idx}>{highlight}</p>
                ))}
              </div>
            )}
          </>
        );
      case 'Skill':
        return (
          <>
            <h5>{item.name || 'Unnamed Skill'}</h5>
            <p><strong>Proficiency:</strong> {item.proficiency || 'N/A'}</p>
            {item.image && <img src={item.image} alt={item.name || 'Skill'} style={{ width: '50px', margin: '10px 0' }} />}
            {item.description && <p>{item.description}</p>}
          </>
        );
      case 'Contact':
        return (
          <>
            <h5>{item.name || 'Unnamed Contact'}</h5>
            <p><strong>Email:</strong> {item.email || 'N/A'}</p>
            <p><strong>Message:</strong> {item.message || 'No message'}</p>
          </>
        );
      default:
        return <p>Unknown item type</p>;
    }
  };

  return (
    <div className="recycle-bin-manager my-4">
      <h2>Recycle Bin</h2>
      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Loading recycle bin items...</p>
      ) : recycleItems.length === 0 ? (
        <p>No items in the Recycle Bin.</p>
      ) : (
        <div className="recycle-bin-grid">
          {recycleItems.map((recycleItem) => (
            <div key={recycleItem._id} className="recycle-bin-card">
              <div className="recycle-bin-details">
                <p><strong>Type:</strong> {recycleItem.collectionType}</p>
                <p><strong>Deleted At:</strong> {new Date(recycleItem.deletedAt).toLocaleString()}</p>
                {renderItemDetails(recycleItem.item, recycleItem.collectionType)}
                <div className="actions" style={{ marginTop: '10px' }}>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleRestore(recycleItem._id)}
                    disabled={actionLoading[recycleItem._id]}
                  >
                    {actionLoading[recycleItem._id] ? 'Restoring...' : 'Restore'}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handlePermanentDelete(recycleItem._id)}
                    disabled={actionLoading[recycleItem._id]}
                  >
                    {actionLoading[recycleItem._id] ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecycleBinManager;