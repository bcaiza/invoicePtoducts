# Sistema de Facturación

Sistema completo de facturación electrónica con control de inventario, gestión de clientes y productos.

## 📋 Descripción

Sistema profesional de facturación que permite crear y gestionar facturas, controlar inventario automáticamente, administrar clientes y productos, con estados de factura y generación de reportes.

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express**
- **Sequelize** ORM
- **PostgreSQL** - Base de datos
- UUID para identificadores únicos
- JWT para autenticación

### Frontend
- **React** con **Vite**
- **Ant Design** - Componentes UI
- Context API para gestión de estado
- Axios para peticiones HTTP

## ✨ Características Principales

### 📄 Gestión de Facturas
- ✅ Creación de facturas con múltiples productos
- ✅ Estados: `pending`, `paid`, `cancelled`, `overdue`
- ✅ Cálculo automático de subtotales, impuestos y totales
- ✅ Descuentos globales y por producto
- ✅ Múltiples métodos de pago
- ✅ Historial de facturas por cliente
- ✅ Estadísticas de facturación

### 👥 Gestión de Clientes
- ✅ Tipos de identificación: Cédula, RUC, Pasaporte, Consumidor Final
- ✅ Información completa: datos personales, contacto, dirección
- ✅ Historial de compras
- ✅ Búsqueda y filtrado

### 📦 Gestión de Productos
- ✅ Control de inventario automático
- ✅ Stock mínimo y máximo
- ✅ Categorización de productos
- ✅ Precios con impuestos configurables
- ✅ Descuento de stock al facturar
- ✅ Devolución de stock al cancelar

### 📊 Reportes y Estadísticas
- ✅ Total de ventas
- ✅ Facturas pendientes de pago
- ✅ Productos más vendidos
- ✅ Análisis por cliente
- ✅ Estados de facturas

## 📁 Estructura del Proyecto

```
facturacion/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── invoiceController.js
│   │   │   ├── customerController.js
│   │   │   └── productController.js
│   │   ├── models/
│   │   │   ├── Invoice.js
│   │   │   ├── InvoiceDetail.js
│   │   │   ├── Customer.js
│   │   │   └── Product.js
│   │   ├── routes/
│   │   │   ├── invoiceRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   └── productRoutes.js
│   │   ├── middleware/
│   │   │   └── permissions.js
│   │   └── config/
│   │       └── database.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Invoices/
    │   │   ├── Customers/
    │   │   └── Products/
    │   ├── services/
    │   │   └── invoices.js
    │   └── context/
    └── package.json
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Backend

```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env

# Ejecutar migraciones
npm run migrate

# Datos de prueba (opcional)
npm run seed

# Iniciar servidor
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Iniciar aplicación
npm run dev
```

## ⚙️ Configuración

### Variables de Entorno

**Backend (.env):**
```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=invoicing_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto_jwt
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:4000/api
```

## 📊 Modelos de Datos

### Cliente (Customer)
```javascript
{
  id: UUID,
  identification_type: ENUM('document_id', 'ruc', 'passport', 'final_consumer'),
  identification_number: String,
  first_name: String,
  last_name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state: String,
  zip_code: String
}
```

### Producto (Product)
```javascript
{
  id: UUID,
  name: String,
  description: Text,
  sku: String,
  price: Decimal,
  cost: Decimal,
  stock: Integer,
  min_stock: Integer,
  max_stock: Integer,
  category: String,
  tax_percentage: Decimal,
  is_active: Boolean
}
```

### Factura (Invoice)
```javascript
{
  id: UUID,
  invoice_number: String,
  customer_id: UUID,
  issue_date: Date,
  due_date: Date,
  status: ENUM('pending', 'paid', 'cancelled', 'overdue'),
  subtotal: Decimal,
  tax_amount: Decimal,
  discount_amount: Decimal,
  total_amount: Decimal,
  payment_method: ENUM('cash', 'card', 'transfer', 'check'),
  notes: Text
}
```

### Detalle de Factura (InvoiceDetail)
```javascript
{
  id: UUID,
  invoice_id: UUID,
  product_id: UUID,
  quantity: Integer,
  unit_price: Decimal,
  discount_percentage: Decimal,
  tax_percentage: Decimal,
  subtotal: Decimal,
  tax_amount: Decimal,
  total_amount: Decimal
}
```

## 📝 API Endpoints

### Facturas

```bash
# Obtener todas las facturas (con paginación y filtros)
GET /api/invoices
Query params: page, limit, status, customer_id, date_from, date_to

# Estadísticas de facturación
GET /api/invoices/stats

# Facturas por cliente
GET /api/invoices/customer/:customer_id

# Obtener factura por ID
GET /api/invoices/:id

# Crear factura
POST /api/invoices
Body: {
  customer_id: UUID,
  issue_date: Date,
  due_date: Date,
  payment_method: String,
  discount_amount: Decimal,
  notes: String,
  details: [
    {
      product_id: UUID,
      quantity: Integer,
      discount_percentage: Decimal
    }
  ]
}

# Actualizar factura (solo pending)
PUT /api/invoices/:id
Body: {
  payment_method: String,
  discount_amount: Decimal,
  notes: String
}

# Actualizar estado de factura
PATCH /api/invoices/:id/status
Body: {
  status: 'pending' | 'paid' | 'cancelled' | 'overdue'
}

# Eliminar factura (devuelve stock)
DELETE /api/invoices/:id
```

### Clientes

```bash
# Listar clientes
GET /api/customers

# Crear cliente
POST /api/customers

# Actualizar cliente
PUT /api/customers/:id

# Eliminar cliente
DELETE /api/customers/:id
```

### Productos

```bash
# Listar productos
GET /api/products

# Crear producto
POST /api/products

# Actualizar producto
PUT /api/products/:id

# Eliminar producto
DELETE /api/products/:id
```

## 🔄 Flujo de Facturación

### 1. Crear Factura
```javascript
// El sistema automáticamente:
✅ Descuenta stock de productos
✅ Calcula subtotales por producto
✅ Calcula impuestos
✅ Aplica descuentos
✅ Calcula total final
✅ Genera número de factura único
```

### 2. Modificar Factura
```javascript
// Solo facturas con estado 'pending'
✅ Cambiar método de pago
✅ Modificar descuentos
✅ Actualizar notas
❌ NO permite modificar productos (debe eliminarse y recrearse)
```

### 3. Cancelar Factura
```javascript
// Al cancelar:
✅ Cambia estado a 'cancelled'
✅ Devuelve stock de todos los productos
✅ Mantiene registro histórico
```

### 4. Eliminar Factura
```javascript
// Solo facturas 'pending':
✅ Devuelve stock a productos
✅ Elimina factura y detalles
✅ Transacción atómica (todo o nada)
```

## 🛡️ Reglas de Negocio

### Control de Stock
- ✅ Validación de stock disponible antes de facturar
- ✅ Descuento automático al crear factura
- ✅ Devolución automática al cancelar/eliminar
- ✅ Alertas de stock mínimo

### Estados de Factura
- **pending**: Factura creada, pendiente de pago
- **paid**: Factura pagada completamente
- **cancelled**: Factura anulada (devuelve stock)
- **overdue**: Factura vencida sin pagar

### Modificaciones
- ✅ Solo facturas `pending` pueden modificarse
- ✅ Facturas `paid` no pueden cancelarse
- ✅ Al eliminar factura `pending`, se devuelve el stock

### Cálculos
```javascript
// Por producto:
subtotal = quantity × unit_price
discount = subtotal × (discount_percentage / 100)
taxable = subtotal - discount
tax = taxable × (tax_percentage / 100)
total_line = taxable + tax

// Factura completa:
subtotal_invoice = Σ subtotal_lines
tax_invoice = Σ tax_lines
discount_invoice = discount_amount + Σ discount_lines
total_invoice = subtotal - discount_invoice + tax_invoice
```

## 🔒 Seguridad y Permisos

### Autenticación
- JWT tokens para sesiones
- Middleware de autenticación en todas las rutas

### Permisos por Módulo
- **invoices**: view, create, edit, delete
- **customers**: view, create, edit, delete
- **products**: view, create, edit, delete

### Validaciones
- Validación de stock disponible
- Validación de datos de cliente
- Validación de precios y cantidades
- Transacciones para operaciones críticas

## 🐛 Solución de Problemas

### Stock negativo al crear factura
```
Error: Insufficient stock for product X
Solución: Verificar stock disponible antes de facturar
```

### No se puede modificar factura
```
Error: Cannot modify invoice with status 'paid'
Solución: Solo facturas 'pending' pueden modificarse
```

### Error al eliminar factura
```
Error: Cannot delete invoice with status 'paid'
Solución: Solo facturas 'pending' pueden eliminarse
```

## 📈 Mejoras Futuras

- [ ] Facturación electrónica (integración SRI Ecuador)
- [ ] Generación de PDF de facturas
- [ ] Envío automático por email
- [ ] Recordatorios de pago
- [ ] Notas de crédito
- [ ] Cotizaciones
- [ ] Reportes avanzados con gráficos
- [ ] Sincronización con sistemas contables
- [ ] App móvil
- [ ] Firma electrónica

## 💡 Notas Importantes

### Integridad Contable
- El sistema NO permite modificar productos en facturas existentes
- Para correcciones, se debe: Cancelar factura → Crear nueva
- Esto mantiene la integridad del historial y el control de inventario

### Mejores Prácticas
1. **No modificar facturas `paid`**: Usar notas de crédito
2. **Validar stock**: Siempre antes de facturar
3. **Backup regular**: De base de datos
4. **Auditoría**: Mantener logs de cambios importantes

## 👥 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📧 Soporte

Para consultas o soporte técnico, contacta al equipo de desarrollo.

---

Desarrollado con ❤️ para una facturación eficiente y profesional
