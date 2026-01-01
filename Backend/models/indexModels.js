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
import Promotion from './Promotion.js';

// Call associate if defined
if (User.associate) User.associate({ Role, Permission, Invoice, Production });
if (Role.associate) Role.associate({ User, Permission });
if (Permission.associate) Permission.associate({ Role });
if (Customer.associate) Customer.associate({ Invoice });
if (Product.associate) Product.associate({ Unit, ProductUnit, InvoiceDetail, ProductRecipe, Production, Promotion });
if (Unit.associate) Unit.associate({ Product, ProductUnit, InvoiceDetail });
if (ProductUnit.associate) ProductUnit.associate({ Product, Unit });
if (Invoice.associate) Invoice.associate({ Customer, User, InvoiceDetail });
if (InvoiceDetail.associate) InvoiceDetail.associate({ Invoice, Product, Unit });
if (AuditLog.associate) AuditLog.associate({});
if (RawMaterial.associate) RawMaterial.associate({ ProductRecipe });
if (ProductRecipe.associate) ProductRecipe.associate({ RawMaterial, Product });
if (Production.associate) Production.associate({ Product, User });
if (Promotion.associate) Promotion.associate({ Product });

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
  Production,
  Promotion
};