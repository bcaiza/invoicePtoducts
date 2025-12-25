# Documentación de Rutas - Bizcocho Frontend

Este proyecto utiliza **React Router DOM v6** para el manejo de rutas y navegación.

## 🛣️ Estructura de Rutas

### Rutas Públicas

#### `/login`
- **Componente**: `Login`
- **Descripción**: Página de inicio de sesión
- **Acceso**: Público (redirige a `/` si ya está autenticado)
- **Métodos**: POST para autenticación

### Rutas Protegidas

Todas las rutas protegidas requieren autenticación. Si el usuario no está autenticado, es redirigido a `/login`.

#### `/` (Dashboard)
- **Componente**: `Dashboard`
- **Descripción**: Panel principal con estadísticas
- **Permisos**: Todos los usuarios autenticados
- **Datos mostrados**:
  - Total de facturas
  - Facturas pendientes
  - Ingresos totales y mensuales
  - Lista de facturas recientes

#### `/invoices`
- **Componente**: `Invoices`
- **Descripción**: Gestión completa de facturas
- **Permisos**: Requiere permiso `invoices`
- **Operaciones**:
  - Ver todas las facturas
  - Crear nueva factura
  - Editar factura existente
  - Actualizar estado (pendiente/pagado/cancelado)
  - Filtrar por cliente
  - Buscar por número de factura

#### `/products`
- **Componente**: `Products`
- **Descripción**: Gestión de productos
- **Permisos**: Requiere permiso `products`
- **Operaciones**:
  - Ver lista de productos
  - Crear nuevo producto
  - Editar producto
  - Eliminar producto
  - Activar/desactivar producto

#### `/customers`
- **Componente**: `Customers`
- **Descripción**: Gestión de clientes
- **Permisos**: Requiere permiso `customers`
- **Operaciones**:
  - Ver lista de clientes
  - Crear nuevo cliente
  - Editar información del cliente
  - Ver facturas por cliente

#### `/users`
- **Componente**: `Users`
- **Descripción**: Gestión de usuarios del sistema
- **Permisos**: Requiere permiso `users`
- **Operaciones**:
  - Ver lista de usuarios
  - Crear nuevo usuario
  - Editar usuario
  - Asignar roles
  - Activar/desactivar usuario

#### `/roles`
- **Componente**: `Roles`
- **Descripción**: Gestión de roles y permisos
- **Permisos**: Requiere permiso `users`
- **Operaciones**:
  - Ver lista de roles
  - Crear nuevo rol
  - Editar rol
  - Configurar permisos por módulo

## 🔐 Protección de Rutas

### ProtectedRoute Component

El componente `ProtectedRoute` envuelve todas las rutas privadas y:

1. **Verifica autenticación**: Comprueba si existe un token válido
2. **Muestra spinner**: Durante la carga de verificación
3. **Redirige**: A `/login` si no está autenticado
4. **Renderiza**: El contenido si está autenticado

```jsx
<Route
  path="/invoices"
  element={
    <ProtectedRoute>
      <Layout>
        <Invoices />
      </Layout>
    </ProtectedRoute>
  }
/>
```

## 🧭 Navegación

### useNavigate Hook

El proyecto utiliza el hook `useNavigate` de React Router DOM para navegación programática:

```javascript
const navigate = useNavigate();

// Navegar a una ruta
navigate('/invoices');

// Navegar y reemplazar historial
navigate('/', { replace: true });

// Navegar hacia atrás
navigate(-1);
```

### Link Component

Para navegación declarativa, se usa el componente `Link`:

```jsx
import { Link } from 'react-router-dom';

<Link to="/invoices" className="...">
  Ir a Facturas
</Link>
```

### useLocation Hook

Para obtener información sobre la ruta actual:

```javascript
import { useLocation } from 'react-router-dom';

const location = useLocation();
const isActive = location.pathname === '/invoices';
```

## 🔄 Flujo de Autenticación

1. Usuario accede a una ruta protegida (ej: `/invoices`)
2. `ProtectedRoute` verifica autenticación
3. Si no está autenticado → redirige a `/login`
4. Usuario ingresa credenciales
5. `AuthContext` guarda token y datos de usuario
6. Al login exitoso → redirige a `/` (dashboard)
7. Usuario puede navegar libremente entre rutas protegidas

## 🚫 Ruta Catch-All

Cualquier ruta no definida redirige automáticamente al dashboard:

```jsx
<Route path="*" element={<Navigate to="/" replace />} />
```

## 📋 Parámetros de Ruta (Futuras Implementaciones)

Aunque actualmente no se usan, el proyecto está preparado para rutas dinámicas:

```jsx
// Ejemplo de ruta dinámica
<Route path="/invoices/:id" element={<InvoiceDetail />} />

// En el componente
const { id } = useParams();
```

## 🔧 Configuración

El router está configurado en `App.jsx`:

```jsx
<BrowserRouter>
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
</BrowserRouter>
```

El `BrowserRouter` utiliza la API de historial HTML5, por lo que las URLs son limpias sin `#`.

## ⚙️ Configuración del Servidor

Para desarrollo, Vite maneja automáticamente el enrutamiento del lado del cliente.

Para producción, necesitas configurar tu servidor web para redirigir todas las rutas al `index.html`:

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 📚 Recursos Adicionales

- [React Router DOM Documentation](https://reactrouter.com/)
- [React Router DOM v6 Migration Guide](https://reactrouter.com/docs/en/v6/upgrading/v5)

---

Documentación actualizada: Diciembre 2024
