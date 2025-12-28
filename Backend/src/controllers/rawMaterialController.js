import RawMaterial from '../../models/RawMaterial.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getRawMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (search) whereClause.name = { [Op.iLike]: `%${search}%` };
    if (active !== undefined) whereClause.active = active === 'true';

    const { count, rows } = await RawMaterial.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      data: rows,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching raw materials', error: error.message });
  }
};

export const createRawMaterial = async (req, res) => {
  try {
    const { name, unit_of_measure, stock, min_stock, unit_cost } = req.body;

    if (!name || !unit_of_measure) {
      return res.status(400).json({ message: 'Name and unit of measure are required' });
    }

    const rawMaterial = await RawMaterial.create({
      name,
      unit_of_measure,
      stock: stock || 0,
      min_stock: min_stock || 0,
      unit_cost: unit_cost || 0
    });

    res.status(201).json(rawMaterial);
  } catch (error) {
    res.status(500).json({ message: 'Error creating raw material', error: error.message });
  }
};

export const updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const rawMaterial = await RawMaterial.findByPk(id);

    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    await rawMaterial.update(req.body);
    res.json(rawMaterial);
  } catch (error) {
    res.status(500).json({ message: 'Error updating raw material', error: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;

    const rawMaterial = await RawMaterial.findByPk(id);
    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    let newStock = parseFloat(rawMaterial.stock);

    switch (operation) {
      case 'add':
        newStock += parseFloat(quantity);
        break;
      case 'subtract':
        newStock -= parseFloat(quantity);
        if (newStock < 0) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        break;
      case 'set':
        newStock = parseFloat(quantity);
        break;
    }

    await rawMaterial.update({ stock: newStock });
    res.json(rawMaterial);
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

export const getLowStock = async (req, res) => {
  try {
    const rawMaterials = await RawMaterial.findAll({
      where: {
        stock: { [Op.lte]: sequelize.col('min_stock') },
        active: true
      },
      order: [['stock', 'ASC']]
    });

    res.json({ data: rawMaterials });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock', error: error.message });
  }
};