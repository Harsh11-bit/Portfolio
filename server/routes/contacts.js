// routes/contacts.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const RecycleBin = require('../models/RecycleBin');

router.post('/', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.json(newContact);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.delete('/:id', async (req, res) => {
  console.log(`Attempting to delete contact with id: ${req.params.id}`);
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      console.log(`Contact not found with id: ${req.params.id}`);
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Move to Recycle Bin
    await RecycleBin.create({
      collectionType: 'Contact',
      item: contact.toObject(),
      originalSortField: 'createdAt',
      originalSortValue: contact.createdAt,
    });

    // Delete from Contacts
    await Contact.findByIdAndDelete(req.params.id);
    console.log(`Contact moved to recycle bin: ${JSON.stringify(contact)}`);
    res.json({ message: 'Contact moved to recycle bin' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

module.exports = router;