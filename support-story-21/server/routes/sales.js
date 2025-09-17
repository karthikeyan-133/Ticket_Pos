import express from 'express';
// Use Supabase model instead of MySQL model
import Sale from '../models/Sale.js';

const router = express.Router();

// Middleware to inject Supabase client
router.use((req, res, next) => {
  // Override the Sale model's Supabase client with the one from the request
  if (req.supabase) {
    // We need to update the SupabaseSale model to use the provided client
    import('../models/supabase/Sale.js').then((SupabaseSale) => {
      // Patch the SupabaseSale to use the provided client
      SupabaseSale.default.supabase = req.supabase;
      next();
    });
  } else {
    next();
  }
});

// GET all sales
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      statusOfEnquiry, 
      assignedExecutive
    } = req.query;

    let filter = {};

    // Search by various fields
    if (search) {
      filter.search = search;
    }

    // Filter by status of enquiry
    if (statusOfEnquiry && statusOfEnquiry !== 'all') {
      filter.statusOfEnquiry = statusOfEnquiry;
    }

    // Filter by assigned executive
    if (assignedExecutive && assignedExecutive !== 'all') {
      filter.assignedExecutive = assignedExecutive;
    }

    const sales = await Sale.find(filter);
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET sale by ID
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: error.message });
  }
});

// CREATE new sale
router.post('/', async (req, res) => {
  try {
    const sale = new Sale(req.body);
    const newSale = await sale.save();
    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE sale
router.put('/:id', async (req, res) => {
  try {
    const updatedSale = await Sale.updateById(req.params.id, req.body);
    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE sale
router.delete('/:id', async (req, res) => {
  try {
    const result = await Sale.removeById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json({ message: 'Sale deleted' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;