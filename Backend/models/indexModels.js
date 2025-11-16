import Role from './Role.js';
import Permission from './Permission.js';
import User from './User.js';
import Customer from './Customer.js';
import Product from './Product.js';
import Invoice from './Invoice.js';
import InvoiceDetail from './InvoiceDetail.js';

const models = {
  Role,
  Permission,
  User,
  Customer,
  Product,
  Invoice,
  InvoiceDetail,
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { Role, Permission, User, Customer, Product, Invoice, InvoiceDetail };
export default models;