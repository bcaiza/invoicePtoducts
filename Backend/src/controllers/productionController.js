import Production from '../../models/Production.js';
import Product from '../../models/Product.js';
import RawMaterial from '../../models/RawMaterial.js';
import Recipe from '../../models/ProductRecipe.js';
import sequelize from '../config/database.js';

// Crear nueva producción
export const createProduction = async (req, res) => {
  try {
    const { product_id, expected_quantity, notes, user_id } = req.body;

    if (!product_id || !expected_quantity || expected_quantity <= 0) {
      return res.status(400).json({
        message: 'Debe proporcionar product_id y expected_quantity válida'
      });
    }

    // Verificar que el producto existe
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar que el producto tiene receta
    const recipe = await Recipe.findAll({
      where: { product_id },
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    if (recipe.length === 0) {
      return res.status(400).json({
        message: 'Este producto no tiene receta configurada. Configure una receta antes de producir.'
      });
    }

    // Crear la producción
    const production = await Production.create({
      product_id,
      expected_quantity,
      produced_quantity: null,
      user_id: user_id || null,
      notes: notes || null,
      status: 'in_process',
      production_date: new Date()
    });

    // Obtener producción con datos del producto
    const createdProduction = await Production.findByPk(production.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp', 'stock']
        }
      ]
    });

    res.status(201).json({
      message: 'Producción creada correctamente',
      production: createdProduction
    });
  } catch (error) {
    console.error('Error al crear producción:', error);
    res.status(500).json({
      message: 'Error al crear producción',
      error: error.message
    });
  }
};

// Finalizar producción - SOLO SUMA PRODUCTO AL STOCK (NO DESCUENTA MATERIAS PRIMAS)
export const completeProduction = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { productionId } = req.params;
    const { produced_quantity } = req.body;

    if (!produced_quantity || produced_quantity <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Debe proporcionar produced_quantity válida mayor a 0'
      });
    }

    // Obtener la producción
    const production = await Production.findByPk(productionId, {
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!production) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producción no encontrada' });
    }

    if (production.status === 'completed') {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Esta producción ya fue finalizada'
      });
    }

    if (production.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({
        message: 'No se puede completar una producción cancelada'
      });
    }

    // SOLO SUMAR el producto fabricado al stock
    const product = await Product.findByPk(production.product_id);
    const currentProductStock = parseFloat(product.stock || 0);
    const newProductStock = currentProductStock + parseFloat(produced_quantity);
    
    await product.update({ stock: newProductStock }, { transaction });

    // Actualizar la producción
    await production.update(
      {
        produced_quantity,
        status: 'completed',
        completed_date: new Date()
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener producción actualizada
    const updatedProduction = await Production.findByPk(productionId, {
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    res.json({
      message: 'Producción finalizada correctamente. Stock actualizado.',
      production: updatedProduction,
      stock_update: {
        product_name: product.name,
        stock_before: currentProductStock,
        stock_after: newProductStock,
        produced: parseFloat(produced_quantity)
      }
    });
  } catch (error) {
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    console.error('Error al finalizar producción:', error);
    res.status(500).json({
      message: 'Error al finalizar producción',
      error: error.message
    });
  }
};

// Obtener todas las producciones
export const getProductions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, product_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (product_id) whereClause.product_id = product_id;

    const { count, rows: productions } = await Production.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'pvp', 'stock']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['production_date', 'DESC']]
    });

    res.json({
      data: productions,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener producciones:', error);
    res.status(500).json({
      message: 'Error al obtener producciones',
      error: error.message
    });
  }
};

// Obtener una producción por ID
export const getProductionById = async (req, res) => {
  try {
    const { productionId } = req.params;

    const production = await Production.findByPk(productionId, {
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!production) {
      return res.status(404).json({ message: 'Producción no encontrada' });
    }

    // Mostrar la receta actual del producto
    const recipe = await Recipe.findAll({
      where: { product_id: production.product_id },
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.json({
      production,
      recipe: recipe.map(r => ({
        raw_material_id: r.raw_material_id,
        name: r.rawMaterial.name,
        description: r.rawMaterial.description,
        notes: r.notes
      }))
    });
  } catch (error) {
    console.error('Error al obtener producción:', error);
    res.status(500).json({
      message: 'Error al obtener producción',
      error: error.message
    });
  }
};

// Cancelar producción
export const cancelProduction = async (req, res) => {
  try {
    const { productionId } = req.params;

    const production = await Production.findByPk(productionId);

    if (!production) {
      return res.status(404).json({ message: 'Producción no encontrada' });
    }

    if (production.status === 'completed') {
      return res.status(400).json({
        message: 'No se puede cancelar una producción ya finalizada'
      });
    }

    if (production.status === 'cancelled') {
      return res.status(400).json({
        message: 'Esta producción ya está cancelada'
      });
    }

    await production.update({ status: 'cancelled' });

    res.json({
      message: 'Producción cancelada correctamente',
      production
    });
  } catch (error) {
    console.error('Error al cancelar producción:', error);
    res.status(500).json({
      message: 'Error al cancelar producción',
      error: error.message
    });
  }
};

// Actualizar producción (solo en proceso)
export const updateProduction = async (req, res) => {
  try {
    const { productionId } = req.params;
    const { expected_quantity, notes } = req.body;

    const production = await Production.findByPk(productionId);

    if (!production) {
      return res.status(404).json({ message: 'Producción no encontrada' });
    }

    if (production.status !== 'in_process') {
      return res.status(400).json({
        message: 'Solo se pueden editar producciones en proceso'
      });
    }

    const updates = {};
    if (expected_quantity !== undefined) {
      if (expected_quantity <= 0) {
        return res.status(400).json({
          message: 'La cantidad esperada debe ser mayor a 0'
        });
      }
      updates.expected_quantity = expected_quantity;
    }
    if (notes !== undefined) updates.notes = notes;

    await production.update(updates);

    const updatedProduction = await Production.findByPk(productionId, {
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    res.json({
      message: 'Producción actualizada correctamente',
      production: updatedProduction
    });
  } catch (error) {
    console.error('Error al actualizar producción:', error);
    res.status(500).json({
      message: 'Error al actualizar producción',
      error: error.message
    });
  }
};

// Eliminar producción (solo si no está completada)
export const deleteProduction = async (req, res) => {
  try {
    const { productionId } = req.params;

    const production = await Production.findByPk(productionId);

    if (!production) {
      return res.status(404).json({ message: 'Producción no encontrada' });
    }

    if (production.status === 'completed') {
      return res.status(400).json({
        message: 'No se puede eliminar una producción finalizada'
      });
    }

    await production.destroy();

    res.json({ message: 'Producción eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar producción:', error);
    res.status(500).json({
      message: 'Error al eliminar producción',
      error: error.message
    });
  }
};

// Estadísticas de producción
export const getProductionStats = async (req, res) => {
  try {
    const total = await Production.count();
    const inProcess = await Production.count({ where: { status: 'in_process' } });
    const completed = await Production.count({ where: { status: 'completed' } });
    const cancelled = await Production.count({ where: { status: 'cancelled' } });

    res.json({
      total,
      in_process: inProcess,
      completed,
      cancelled
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

export default {
  createProduction,
  completeProduction,
  getProductions,
  getProductionById,
  cancelProduction,
  updateProduction,
  deleteProduction,
  getProductionStats
};