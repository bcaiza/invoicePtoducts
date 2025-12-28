import Production from '../../models/Production.js';
import Product from '../../models/Product.js';
import ProductRecipe from '../../models/ProductRecipe.js';
import RawMaterial from '../../models/RawMaterial.js';
import sequelize from '../config/database.js';
import { createAuditLog } from '../utils/auditHelper.js';
import User from '../../models/User.js';

export const createProduction = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { product_id, produced_quantity, notes } = req.body;

    if (!product_id || !produced_quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    // Obtener la receta del producto
    const recipes = await ProductRecipe.findAll({
      where: { product_id },
      include: [{ model: RawMaterial, as: 'rawMaterial' }]
    });

    if (recipes.length === 0) {
      return res.status(400).json({ message: 'Product does not have a recipe defined' });
    }

    const yieldQuantity = recipes[0].yield_quantity;
    
    // Agregar al stock del producto
    const product = await Product.findByPk(product_id);
    await product.update(
      { stock: product.stock + produced_quantity },
      { transaction }
    );

    // Registrar producción
    const production = await Production.create({
      product_id,
      expected_quantity: yieldQuantity, 
      produced_quantity, 
      user_id: req.user?.id,
      notes,
      status: 'completed'
    }, { transaction });

    await transaction.commit();

    await createAuditLog({
      entityType: 'Production',
      entityId: production.id,
      action: 'CREATE',
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { after: production.toJSON() },
      req
    });

    res.status(201).json({
      message: 'Production completed successfully',
      production,
      product_stock: product.stock + produced_quantity
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error creating production', error: error.message });
  }
};

export const getProductions = async (req, res) => {
  try {
    const { page = 1, limit = 20, product_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    if (product_id) whereClause.product_id = product_id;
    if (start_date || end_date) {
      whereClause.production_date = {};
      if (start_date) whereClause.production_date[Op.gte] = new Date(start_date);
      if (end_date) whereClause.production_date[Op.lte] = new Date(end_date);
    }

    const { count, rows } = await Production.findAndCountAll({
      where: whereClause,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['production_date', 'DESC']]
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
    res.status(500).json({ message: 'Error fetching productions', error: error.message });
  }
};