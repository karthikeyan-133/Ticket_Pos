import express from 'express';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
// Use Supabase model instead of MySQL model
import Ticket from '../models/Ticket.js';

const router = express.Router();

// Middleware to inject Supabase client
router.use((req, res, next) => {
  // Override the Ticket model's Supabase client with the one from the request
  if (req.supabase) {
    // We need to update the SupabaseTicket model to use the provided client
    import('../models/supabase/Ticket.js').then((SupabaseTicket) => {
      // Patch the SupabaseTicket to use the provided client
      SupabaseTicket.default.supabase = req.supabase;
      next();
    });
  } else {
    next();
  }
});

// GET all tickets
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      status, 
      priority, 
      company,
      serialNumber 
    } = req.query;

    let filter = {};

    // Search by serial number (exact match)
    if (serialNumber) {
      filter.serialNumber = serialNumber;
    }

    // Search by various fields
    if (search) {
      filter.search = search;
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Filter by company
    if (company && company !== 'all') {
      filter.companyName = company;
    }

    const tickets = await Ticket.find(filter);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET tickets by serial number
router.get('/serial/:serialNumber', async (req, res) => {
  try {
    const tickets = await Ticket.find({ serialNumber: req.params.serialNumber });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by serial number:', error);
    res.status(500).json({ message: error.message });
  }
});

// CREATE new ticket
router.post('/', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    const newTicket = await ticket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    // Check if it's a validation error vs connection error
    if (error.message.includes('valid Tally serial number')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// UPDATE ticket
router.put('/:id', async (req, res) => {
  try {
    const updatedTicket = await Ticket.updateById(req.params.id, req.body);
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE ticket
router.delete('/:id', async (req, res) => {
  try {
    const result = await Ticket.removeById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;