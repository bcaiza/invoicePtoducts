import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger.json' assert { type: 'json' };

import models from '../models/indexModels.js'; 

import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import customerRoutes from './routes/customerRoute.js';
import productRoutes from './routes/productRoute.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import productUnitRoute from './routes/productUnitRoute.js';
import promotionRoutes from './routes/promotionRoute.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/product-units', productUnitRoute); 
app.use('/api/promotions', promotionRoutes); 



app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

async function syncDatabase() {
  try {
    await models.Role.sync({ alter: true });
    await models.Permission.sync({ alter: true });
    await models.User.sync({ alter: true });
    await models.Customer.sync({ alter: true });
    
    await models.Unit.sync({ alter: true });
    
    await models.Product.sync({ alter: true });
    await models.ProductUnit.sync({ alter: true });
    await models.Invoice.sync({ alter: true });
    
    await models.InvoiceDetail.sync({ alter: true });

    await models.Promotion.sync({ alter: true });
    
    console.log('🟢 Database synced');
  } catch (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
}

syncDatabase();

app.get('/', (req, res) => res.send('Bizcocho API ready 🧁'));

export default app;