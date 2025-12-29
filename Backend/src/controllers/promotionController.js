import Promotion from '../models/Promotion.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';

export const getPromotions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      product_id,
      active,
      promotion_type
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (product_id) where.product_id = product_id;
    if (active !== undefined) where.active = active === 'true';
    if (promotion_type) where.promotion_type = promotion_type;

    const { count, rows } = await Promotion.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting promotions:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    
    const promotions = await Promotion.findAll({
      where: {
        active: true,
        [Op.or]: [
          { start_date: null },
          { start_date: { [Op.lte]: now } }
        ],
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: now } }
        ]
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp']
        }
      ]
    });

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp']
        }
      ]
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }

    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const {
      name,
      description,
      product_id,
      promotion_type,
      buy_quantity,
      get_quantity,
      discount_percentage,
      discount_amount,
      min_quantity,
      start_date,
      end_date,
      active
    } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const promotion = await Promotion.create({
      name,
      description,
      product_id,
      promotion_type,
      buy_quantity,
      get_quantity,
      discount_percentage,
      discount_amount,
      min_quantity,
      start_date,
      end_date,
      active: active !== undefined ? active : true
    });

    const createdPromotion = await Promotion.findByPk(promotion.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Promoción creada exitosamente',
      data: createdPromotion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }

    await promotion.update(updateData);

    const updatedPromotion = await Promotion.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Promoción actualizada exitosamente',
      data: updatedPromotion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByPk(id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promoción no encontrada'
      });
    }

    await promotion.destroy();

    res.json({
      success: true,
      message: 'Promoción eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};