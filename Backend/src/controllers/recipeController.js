import ProductRecipe from '../../models/ProductRecipe.js';
import RawMaterial from '../../models/RawMaterial.js';

export const getProductRecipe = async (req, res) => {
  try {
    const { productId } = req.params;

    const recipes = await ProductRecipe.findAll({
      where: { product_id: productId },
      include: [
        {
          model: RawMaterial,
          as: 'rawMaterial',
          attributes: ['id', 'name', 'unit_of_measure', 'stock', 'unit_cost']
        }
      ]
    });

    // Calcular costo total de la receta
    const totalCost = recipes.reduce((sum, recipe) => {
      return sum + (parseFloat(recipe.quantity) * parseFloat(recipe.rawMaterial.unit_cost));
    }, 0);

    res.json({ 
      recipes,
      yield_quantity: recipes[0]?.yield_quantity || 1,
      total_cost: totalCost,
      cost_per_unit: recipes[0]?.yield_quantity ? totalCost / recipes[0].yield_quantity : 0
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
};

export const createOrUpdateRecipe = async (req, res) => {
  try {
    const { product_id, ingredients, yield_quantity } = req.body;

    if (!product_id || !ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Product ID and ingredients array are required' });
    }

    // Eliminar receta anterior
    await ProductRecipe.destroy({ where: { product_id } });

    // Crear nuevas entradas
    const recipes = await Promise.all(
      ingredients.map(ing => 
        ProductRecipe.create({
          product_id,
          raw_material_id: ing.raw_material_id,
          quantity: ing.quantity,
          yield_quantity: yield_quantity || 1
        })
      )
    );

    res.status(201).json({ message: 'Recipe saved successfully', recipes });
  } catch (error) {
    res.status(500).json({ message: 'Error saving recipe', error: error.message });
  }
};

export const deleteRecipeIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await ProductRecipe.findByPk(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe ingredient not found' });
    }

    await recipe.destroy();
    res.json({ message: 'Ingredient removed from recipe' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ingredient', error: error.message });
  }
};