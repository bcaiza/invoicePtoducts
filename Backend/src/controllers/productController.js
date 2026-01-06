import Product from "../../models/Product.js";
import Unit from "../../models/Unit.js";
import ProductUnit from "../../models/ProductUnit.js";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { createAuditLog } from "../utils/auditHelper.js";

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, active } = req.query;

    const offset = (page - 1) * limit;

    let whereClause = {};

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    if (active !== undefined) {
      whereClause.active = active === "true";
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Unit,
          as: "baseUnit",
          attributes: ["id", "name", "abbreviation", "type"],
        },
        {
          model: ProductUnit,
          as: "ProductUnits",
          include: [
            {
              model: Unit,
              as: "unit",
              attributes: ["id", "name", "abbreviation", "type"],
            },
          ],
          where: {
            is_sales_unit: true,
          },
          required: false,
        },
      ],
      order: [["name", "ASC"]],
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);
    const currentPage = parseInt(page);

    res.json({
      data: rows,
      pagination: {
        total: count,
        per_page: parseInt(limit),
        current_page: currentPage,
        total_pages: totalPages,
        from: offset + 1,
        to: offset + rows.length,
        has_next: currentPage < totalPages,
        has_prev: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    console.log("entro al get product by id");
    const { id } = req.params;
    console.log("ID:", id);

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Unit,
          as: "baseUnit",
          attributes: ["id", "name", "abbreviation", "type"],
        },
        {
          model: ProductUnit,
          as: "ProductUnits",
          include: [
            {
              model: Unit,
              as: "unit",
              attributes: ["id", "name", "abbreviation", "type"],
            },
          ],
        },
      ],
    });

    console.log("Producto encontrado:", product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, pvp, weight, stock, base_unit_id } = req.body;

    if (!name || pvp === undefined) {
      return res.status(400).json({
        message: "Name and PVP are required",
      });
    }

    if (pvp < 0) {
      return res.status(400).json({
        message: "PVP must be greater than or equal to 0",
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        message: "Stock must be greater than or equal to 0",
      });
    }

    if (weight !== undefined && weight < 0) {
      return res.status(400).json({
        message: "Weight must be greater than or equal to 0",
      });
    }

    let defaultUnitId = base_unit_id;

    if (!defaultUnitId) {
      let defaultUnit = await Unit.findOne({
        where: {
          abbreviation: "u",
          name: "Unidad",
        },
      });

      if (!defaultUnit) {
        defaultUnit = await Unit.create({
          name: "Unidad",
          abbreviation: "u",
          type: "unit",
          active: true,
        });
      }

      defaultUnitId = defaultUnit.id;
    }

    const product = await Product.create({
      name,
      pvp,
      weight,
      stock: stock || 0,
      base_unit_id: defaultUnitId,
    });

    await ProductUnit.create({
      product_id: product.id,
      unit_id: defaultUnitId,
      quantity: 1,
      is_base_unit: true,
      is_sales_unit: true,
      is_purchase_unit: true,
    });

    const productWithUnits = await Product.findByPk(product.id, {
      include: [
        {
          model: Unit,
          as: "baseUnit",
          attributes: ["id", "name", "abbreviation", "type"],
        },
        {
          model: ProductUnit,
          as: "ProductUnits",
          include: [
            {
              model: Unit,
              as: "unit",
              attributes: ["id", "name", "abbreviation", "type"],
            },
          ],
        },
      ],
    });

    await createAuditLog({
      entityType: "Product",
      entityId: product.id,
      action: "CREATE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { after: productWithUnits.toJSON() },
      req,
    });

    res.status(201).json(productWithUnits);
  } catch (error) {
    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pvp, weight, stock, active, base_unit_id } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (pvp !== undefined && pvp < 0) {
      return res.status(400).json({
        message: "PVP must be greater than or equal to 0",
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        message: "Stock must be greater than or equal to 0",
      });
    }

    if (weight !== undefined && weight < 0) {
      return res.status(400).json({
        message: "Weight must be greater than or equal to 0",
      });
    }
    const beforeUpdate = product.toJSON();

    await product.update({
      name: name || product.name,
      pvp: pvp !== undefined ? pvp : product.pvp,
      weight: weight !== undefined ? weight : product.weight,
      stock: stock !== undefined ? stock : product.stock,
      active: active !== undefined ? active : product.active,
      base_unit_id:
        base_unit_id !== undefined ? base_unit_id : product.base_unit_id,
    });

    // Cargar el producto actualizado con sus relaciones
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Unit,
          as: "baseUnit",
          attributes: ["id", "name", "abbreviation", "type"],
        },
        {
          model: ProductUnit,
          as: "ProductUnits",
          include: [
            {
              model: Unit,
              as: "unit",
              attributes: ["id", "name", "abbreviation", "type"],
            },
          ],
        },
      ],
    });

    await createAuditLog({
      entityType: "Product",
      entityId: id,
      action: "UPDATE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { before: beforeUpdate, after: updatedProduct.toJSON() },
      req,
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    await createAuditLog({
      entityType: "Product",
      entityId: id,
      action: "DELETE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: { before: product },
      req,
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const previousStatus = product.active;

    await product.update({ active: !product.active });

    await createAuditLog({
      entityType: "Product",
      entityId: id,
      action: "STATUS_CHANGE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: {
        before: { active: previousStatus },
        after: { active: product.active },
      },
      req,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error toggling product status",
      error: error.message,
    });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;

    if (!quantity || !operation) {
      return res.status(400).json({
        message: "Quantity and operation are required",
      });
    }

    if (!["add", "subtract", "set"].includes(operation)) {
      return res.status(400).json({
        message: "Invalid operation. Use: add, subtract, or set",
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const previousStock = product.stock;
    let newStock = product.stock;

    switch (operation) {
      case "add":
        newStock += parseInt(quantity);
        break;
      case "subtract":
        newStock -= parseInt(quantity);
        if (newStock < 0) {
          return res.status(400).json({
            message: "Insufficient stock. Current stock: " + product.stock,
          });
        }
        break;
      case "set":
        if (parseInt(quantity) < 0) {
          return res.status(400).json({
            message: "Stock cannot be negative",
          });
        }
        newStock = parseInt(quantity);
        break;
    }

    await product.update({ stock: newStock });

     await createAuditLog({
      entityType: "Product",
      entityId: id,
      action: "STOCK_UPDATE",
      userId: req.user?.id,
      userEmail: req.user?.email,
      changes: {
        before: { stock: previousStock }, 
        after: { stock: newStock },
        operation,
        quantity,
      },
      req,
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error updating stock",
      error: error.message,
    });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.findAll({
      where: {
        stock: { [Op.lte]: parseInt(threshold) },
        active: true,
      },
      include: [
        {
          model: Unit,
          as: "baseUnit",
          attributes: ["id", "name", "abbreviation", "type"],
        },
      ],
      order: [["stock", "ASC"]],
    });

    res.json({
      data: products,
      count: products.length,
      threshold: parseInt(threshold),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching low stock products",
      error: error.message,
    });
  }
};

export const getProductStats = async (req, res) => {
  try {
    const total = await Product.count();
    const active = await Product.count({ where: { active: true } });
    const inactive = await Product.count({ where: { active: false } });
    const outOfStock = await Product.count({ where: { stock: 0 } });
    const lowStock = await Product.count({
      where: {
        stock: {
          [Op.gt]: 0,
          [Op.lte]: 10,
        },
      },
    });

    const totalInventoryValue = await Product.findAll({
      attributes: [[sequelize.literal("SUM(pvp * stock)"), "total_value"]],
      where: { active: true },
      raw: true,
    });

    res.json({
      total,
      active,
      inactive,
      out_of_stock: outOfStock,
      low_stock: lowStock,
      total_inventory_value: totalInventoryValue[0]?.total_value || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product statistics",
      error: error.message,
    });
  }
};

export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Updates array is required",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, quantity, operation } = update;

        const product = await Product.findByPk(id);

        if (!product) {
          errors.push({ id, error: "Product not found" });
          continue;
        }

        let newStock = product.stock;

        switch (operation) {
          case "add":
            newStock += parseInt(quantity);
            break;
          case "subtract":
            newStock -= parseInt(quantity);
            if (newStock < 0) {
              errors.push({
                id,
                error: `Insufficient stock. Current: ${product.stock}`,
              });
              continue;
            }
            break;
          case "set":
            newStock = parseInt(quantity);
            break;
        }

        await product.update({ stock: newStock });
        results.push({
          id,
          previous_stock: product.stock,
          new_stock: newStock,
        });
      } catch (error) {
        errors.push({ id: update.id, error: error.message });
      }
    }

    res.json({
      success: results,
      errors,
      total_updated: results.length,
      total_errors: errors.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error bulk updating stock",
      error: error.message,
    });
  }
};
