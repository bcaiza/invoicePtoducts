import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import Customer from './Customer.js';
import Product from './Product.js';
import Unit from './Unit.js';
import ProductUnit from './ProductUnit.js';
import Invoice from './Invoice.js';
import InvoiceDetail from './InvoiceDetail.js';
import AuditLog from './AuditLog.js';
import RawMaterial from './RawMaterial.js';
import ProductRecipe from './ProductRecipe.js';
import Production from './Production.js';

// Relaciones Role - Permission
Role.hasMany(Permission, { foreignKey: 'role_id' });
Permission.belongsTo(Role, { foreignKey: 'role_id' });

// Relaciones User - Role
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// Relaciones Product - Unit
Product.belongsTo(Unit, { foreignKey: 'base_unit_id', as: 'baseUnit' });
Unit.hasMany(Product, { foreignKey: 'base_unit_id', as: 'products' });

// Relaciones ProductUnit
Product.hasMany(ProductUnit, { foreignKey: 'product_id', as: 'ProductUnits' });
ProductUnit.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Unit.hasMany(ProductUnit, { foreignKey: 'unit_id', as: 'productUnits' });
ProductUnit.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

// Relaciones Invoice
Invoice.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Invoice, { foreignKey: 'customer_id', as: 'invoices' });

Invoice.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Invoice, { foreignKey: 'user_id', as: 'invoices' });

// Relaciones InvoiceDetail
Invoice.hasMany(InvoiceDetail, { foreignKey: 'invoice_id', as: 'details' });
InvoiceDetail.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice' });

InvoiceDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(InvoiceDetail, { foreignKey: 'product_id', as: 'invoiceDetails' });

InvoiceDetail.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
Unit.hasMany(InvoiceDetail, { foreignKey: 'unit_id', as: 'invoiceDetails' });

// ============================================
// Relaciones RawMaterial - ProductRecipe
// ============================================
RawMaterial.hasMany(ProductRecipe, { 
  foreignKey: 'raw_material_id', 
  as: 'recipes' 
});
ProductRecipe.belongsTo(RawMaterial, { 
  foreignKey: 'raw_material_id', 
  as: 'rawMaterial' 
});

// ============================================
// Relaciones Product - ProductRecipe
// ============================================
Product.hasMany(ProductRecipe, { 
  foreignKey: 'product_id', 
  as: 'recipes' 
});
ProductRecipe.belongsTo(Product, { 
  foreignKey: 'product_id', 
  as: 'product' 
});

// ============================================
// Relaciones Production
// ============================================
Product.hasMany(Production, { 
  foreignKey: 'product_id', 
  as: 'productions' 
});
Production.belongsTo(Product, { 
  foreignKey: 'product_id', 
  as: 'product' 
});

User.hasMany(Production, { 
  foreignKey: 'user_id', 
  as: 'productions' 
});
Production.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

export default {
  User,
  Role,
  Permission,
  Customer,
  Product,
  Unit,
  ProductUnit,
  Invoice,
  InvoiceDetail,
  AuditLog,
  RawMaterial,
  ProductRecipe,
  Production
};