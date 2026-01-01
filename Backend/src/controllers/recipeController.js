import Recipe from '../../models/ProductRecipe.js';
import Product from '../../models/Product.js';
import RawMaterial from '../../models/RawMaterial.js';
import sequelize from '../config/database.js';

export const getProductRecipe = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const recipes = await Recipe.findAll({
      where: { product_id: productId },
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'description']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description
      },
      recipes: recipes.map(r => ({
        id: r.id,
        raw_material_id: r.raw_material_id,
        notes: r.notes,
        rawMaterial: r.rawMaterial
      })),
      count: recipes.length
    });

  } catch (error) {
    console.error('Error al obtener receta:', error);
    res.status(500).json({ 
      message: 'Error al obtener receta del producto',
      error: error.message 
    });
  }
};

export const saveRecipe = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { product_id, materials } = req.body;

    if (!product_id || !materials || !Array.isArray(materials)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Debe proporcionar product_id y un array de materials' 
      });
    }

    if (materials.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Debe agregar al menos una materia prima a la receta' 
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    for (const material of materials) {
      if (!material.raw_material_id) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Cada material debe tener raw_material_id' 
        });
      }

      const rawMaterial = await RawMaterial.findByPk(material.raw_material_id);
      if (!rawMaterial) {
        await transaction.rollback();
        return res.status(404).json({ 
          message: `Materia prima con ID ${material.raw_material_id} no encontrada` 
        });
      }
    }

    await Recipe.destroy({
      where: { product_id },
      transaction
    });

    const newRecipes = await Recipe.bulkCreate(
      materials.map(material => ({
        product_id,
        raw_material_id: material.raw_material_id,
        notes: material.notes || null
      })),
      { transaction }
    );

    await transaction.commit();

    const savedRecipes = await Recipe.findAll({
      where: { product_id },
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.status(201).json({
      message: 'Receta guardada correctamente',
      product_id,
      recipes: savedRecipes.map(r => ({
        id: r.id,
        raw_material_id: r.raw_material_id,
        notes: r.notes,
        rawMaterial: r.rawMaterial
      })),
      count: savedRecipes.length
    });

  } catch (error) {
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    console.error('Error al guardar receta:', error);
    res.status(500).json({ 
      message: 'Error al guardar receta',
      error: error.message 
    });
  }
};

export const addRawMaterialToRecipe = async (req, res) => {
  try {
    const { product_id, raw_material_id, notes } = req.body;

    if (!product_id || !raw_material_id) {
      return res.status(400).json({ 
        message: 'Debe proporcionar product_id y raw_material_id' 
      });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const rawMaterial = await RawMaterial.findByPk(raw_material_id);
    if (!rawMaterial) {
      return res.status(404).json({ message: 'Materia prima no encontrada' });
    }

    const existing = await Recipe.findOne({
      where: { product_id, raw_material_id }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'Esta materia prima ya está en la receta' 
      });
    }

    const recipe = await Recipe.create({
      product_id,
      raw_material_id,
      notes: notes || null
    });

    const recipeWithMaterial = await Recipe.findByPk(recipe.id, {
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.status(201).json({
      message: 'Materia prima agregada a la receta',
      recipe: {
        id: recipeWithMaterial.id,
        raw_material_id: recipeWithMaterial.raw_material_id,
        notes: recipeWithMaterial.notes,
        rawMaterial: recipeWithMaterial.rawMaterial
      }
    });

  } catch (error) {
    console.error('Error al agregar materia prima:', error);
    res.status(500).json({ 
      message: 'Error al agregar materia prima a la receta',
      error: error.message 
    });
  }
};

export const updateRecipeNotes = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { notes } = req.body;

    const recipe = await Recipe.findByPk(recipeId);
    
    if (!recipe) {
      return res.status(404).json({ 
        message: 'Ingrediente no encontrado en la receta' 
      });
    }

    recipe.notes = notes || null;
    await recipe.save();

    const updatedRecipe = await Recipe.findByPk(recipeId, {
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'description']
        }
      ]
    });

    res.json({
      message: 'Notas actualizadas correctamente',
      recipe: {
        id: updatedRecipe.id,
        raw_material_id: updatedRecipe.raw_material_id,
        notes: updatedRecipe.notes,
        rawMaterial: updatedRecipe.rawMaterial
      }
    });

  } catch (error) {
    console.error('Error al actualizar notas:', error);
    res.status(500).json({ 
      message: 'Error al actualizar notas',
      error: error.message 
    });
  }
};

export const removeRawMaterialFromRecipe = async (req, res) => {
  try {
    const { productId, rawMaterialId } = req.params;

    const deleted = await Recipe.destroy({
      where: { 
        product_id: productId,
        raw_material_id: rawMaterialId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ 
        message: 'Materia prima no encontrada en la receta' 
      });
    }

    res.json({ 
      message: 'Materia prima eliminada de la receta'
    });

  } catch (error) {
    console.error('Error al eliminar materia prima:', error);
    res.status(500).json({ 
      message: 'Error al eliminar materia prima de la receta',
      error: error.message 
    });
  }
};

export const getAllRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      name: { [sequelize.Sequelize.Op.like]: `%${search}%` }
    } : {};

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      distinct: true
    });

    const productsWithRecipes = await Promise.all(
      products.map(async (product) => {
        const recipes = await Recipe.findAll({
          where: { product_id: product.id },
          include: [
            {
              model: RawMaterial,
              as: 'rawMaterial',
              attributes: ['id', 'name']
            }
          ]
        });

        return {
          ...product.toJSON(),
          raw_materials_count: recipes.length,
          has_recipe: recipes.length > 0
        };
      })
    );

    res.json({
      data: productsWithRecipes,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: parseInt(page),
        last_page: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener recetas:', error);
    res.status(500).json({ 
      message: 'Error al obtener recetas',
      error: error.message 
    });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await Recipe.destroy({
      where: { product_id: productId }
    });

    if (deleted === 0) {
      return res.status(404).json({ 
        message: 'No se encontró receta para este producto' 
      });
    }

    res.json({ 
      message: 'Receta eliminada correctamente',
      deleted_count: deleted
    });

  } catch (error) {
    console.error('Error al eliminar receta:', error);
    res.status(500).json({ 
      message: 'Error al eliminar receta',
      error: error.message 
    });
  }
};

export const getRecipeStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();

    const productsWithRecipe = await Recipe.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('product_id')), 'product_id']
      ]
    });
    const withRecipeCount = productsWithRecipe.length;

    res.json({
      total_products: totalProducts,
      products_with_recipe: withRecipeCount,
      products_without_recipe: totalProducts - withRecipeCount
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
  getProductRecipe,
  saveRecipe,
  addRawMaterialToRecipe,
  updateRecipeNotes,
  removeRawMaterialFromRecipe,
  getAllRecipes,
  deleteRecipe,
  getRecipeStats
};