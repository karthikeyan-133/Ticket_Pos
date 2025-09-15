import express from 'express';
// Use Supabase model instead of MySQL model
import Executive from '../models/Executive.js';

const router = express.Router();

// Middleware to inject Supabase client
router.use((req, res, next) => {
  // Override the Executive model's Supabase client with the one from the request
  if (req.supabase) {
    // We need to update the SupabaseExecutive model to use the provided client
    import('../models/supabase/Executive.js').then((SupabaseExecutive) => {
      // Patch the SupabaseExecutive to use the provided client
      SupabaseExecutive.default.supabase = req.supabase;
      next();
    });
  } else {
    next();
  }
});

// GET all executives
router.get('/', async (req, res) => {
  try {
    // For Supabase implementation, we need to handle filtering differently
    const { department, isActive } = req.query;
    
    // Get all executives first
    const allExecutives = await Executive.findAll();
    
    // Apply filters manually
    let filteredExecutives = allExecutives;
    
    if (department) {
      filteredExecutives = filteredExecutives.filter(exec => exec.department === department);
    }
    
    if (isActive !== undefined) {
      const isActiveBool = isActive === 'true' || isActive === true || isActive === 1;
      filteredExecutives = filteredExecutives.filter(exec => exec.isActive === isActiveBool);
    }
    
    res.json(filteredExecutives);
  } catch (error) {
    console.error('Error fetching executives:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET executive by ID
router.get('/:id', async (req, res) => {
  try {
    const executive = await Executive.findById(req.params.id);
    if (!executive) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    res.json(executive);
  } catch (error) {
    console.error('Error fetching executive:', error);
    res.status(500).json({ message: error.message });
  }
});

// CREATE new executive
router.post('/', async (req, res) => {
  try {
    // Convert isActive to the format expected by the model
    const executiveData = {
      ...req.body,
      isActive: req.body.is_active !== undefined ? req.body.is_active : req.body.isActive
    };
    
    // Remove the snake_case version if it exists
    if (req.body.is_active !== undefined) {
      delete executiveData.is_active;
    }
    
    const executive = new Executive(executiveData);
    const newExecutive = await executive.save();
    res.status(201).json(newExecutive);
  } catch (error) {
    console.error('Error creating executive:', error);
    res.status(400).json({ message: error.message });
  }
});

// UPDATE executive
router.put('/:id', async (req, res) => {
  try {
    // Convert isActive to the format expected by the model
    const updateData = {
      ...req.body,
      isActive: req.body.is_active !== undefined ? req.body.is_active : req.body.isActive
    };
    
    // Remove the snake_case version if it exists
    if (req.body.is_active !== undefined) {
      delete updateData.is_active;
    }
    
    const updatedExecutive = await Executive.updateById(req.params.id, updateData);
    if (!updatedExecutive) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    res.json(updatedExecutive);
  } catch (error) {
    console.error('Error updating executive:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE executive
router.delete('/:id', async (req, res) => {
  try {
    const result = await Executive.removeById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Executive not found' });
    }
    res.json({ message: 'Executive deleted' });
  } catch (error) {
    console.error('Error deleting executive:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;