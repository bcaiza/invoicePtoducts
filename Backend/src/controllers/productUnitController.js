import ProductUnit from '../../models/ProductUnit.js';
import Product from '../../models/Product.js';
import Unit from '../../models/Unit.js';
import { Op } from 'sequelize';

export const getProductUnits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      product_id,
      unit_id,
      is_base_unit,
      is_sales_unit,
      is_purchase_unit,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (product_id) where.product_id = product_id;
    if (unit_id) where.unit_id = unit_id;
    if (is_base_unit !== undefined) where.is_base_unit = is_base_unit === 'true';
    if (is_sales_unit !== undefined) where.is_sales_unit = is_sales_unit === 'true';
    if (is_purchase_unit !== undefined) where.is_purchase_unit = is_purchase_unit === 'true';

    const includeOptions = [
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name'],
        where: search ? {
          name: { [Op.iLike]: `%${search}%` }
        } : undefined
      },
      {
        model: Unit,
        as: 'unit',
        attributes: ['id', 'name', 'abbreviation', 'type'],
        where: search ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { abbreviation: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      }
    ];

    const { count, rows } = await ProductUnit.findAndCountAll({
      where,
      include: includeOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['is_base_unit', 'DESC'], ['created_at', 'DESC']],
      distinct: true
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
    console.error('Error getting product units:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const productUnit = await ProductUnit.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name', 'abbreviation', 'type']
        }
      ]
    });

    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de unidad no encontrada'
      });
    }

    res.json({
      success: true,
      data: productUnit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductUnitsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const productUnits = await ProductUnit.findAll({
      where: { product_id: productId },
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name', 'abbreviation', 'type']
        }
      ],
      order: [['is_base_unit', 'DESC'], ['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: productUnits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createProductUnit = async (req, res) => {
  try {
    const {
      product_id,
      unit_id,
      quantity,
      is_base_unit,
      is_sales_unit,
      is_purchase_unit,
      price_modifier
    } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const unit = await Unit.findByPk(unit_id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unidad no encontrada'
      });
    }

    if (is_base_unit) {
      await ProductUnit.update(
        { is_base_unit: false },
        { where: { product_id } }
      );
    }

    const productUnit = await ProductUnit.create({
      product_id,
      unit_id,
      quantity: quantity || 1,
      is_base_unit: is_base_unit || false,
      is_sales_unit: is_sales_unit !== undefined ? is_sales_unit : true,
      is_purchase_unit: is_purchase_unit !== undefined ? is_purchase_unit : true,
      price_modifier
    });

    const createdProductUnit = await ProductUnit.findByPk(productUnit.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name', 'abbreviation', 'type']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Unidad de producto creada exitosamente',
      data: createdProductUnit
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Esta unidad ya está asignada a este producto'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProductUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      is_base_unit,
      is_sales_unit,
      is_purchase_unit,
      price_modifier
    } = req.body;

    const productUnit = await ProductUnit.findByPk(id);

    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de unidad no encontrada'
      });
    }

    if (is_base_unit && !productUnit.is_base_unit) {
      await ProductUnit.update(
        { is_base_unit: false },
        { 
          where: { 
            product_id: productUnit.product_id, 
            id: { [Op.ne]: id } 
          } 
        }
      );
    }

    await productUnit.update({
      quantity,
      is_base_unit,
      is_sales_unit,
      is_purchase_unit,
      price_modifier
    });

    const updatedProductUnit = await ProductUnit.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['id', 'name', 'abbreviation', 'type']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Unidad de producto actualizada exitosamente',
      data: updatedProductUnit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProductUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const productUnit = await ProductUnit.findByPk(id);

    if (!productUnit) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de unidad no encontrada'
      });
    }

    if (productUnit.is_base_unit) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la unidad base. Asigna otra unidad como base primero.'
      });
    }

    await productUnit.destroy();

    res.json({
      success: true,
      message: 'Unidad de producto eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const bulkCreateProductUnits = async (req, res) => {
  try {
    const { product_id, units } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const productUnits = await ProductUnit.bulkCreate(
      units.map(unit => ({
        product_id,
        ...unit
      })),
      { validate: true }
    );

    res.status(201).json({
      success: true,
      message: `${productUnits.length} unidades creadas exitosamente`,
      data: productUnits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};