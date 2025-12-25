# Bizcocho - Sistema de Ventas Frontend

Sistema de gestión de ventas desarrollado con React, Vite y Tailwind CSS.

## 🚀 Características

- ✅ **Autenticación con JWT** - Sistema de login seguro
- ✅ **React Router DOM** - Navegación con rutas protegidas
- ✅ **Control de Roles y Permisos** - Gestión granular de accesos
- ✅ **Gestión de Facturas** - Crear, editar y administrar facturas
- ✅ **Gestión de Productos** - CRUD completo de productos
- ✅ **Gestión de Clientes** - Administración de clientes
- ✅ **Gestión de Usuarios** - Control de usuarios del sistema
- ✅ **Tema Claro/Oscuro** - Cambio dinámico de tema
- ✅ **Diseño Responsivo** - Funciona en desktop y móvil
- ✅ **Dashboard con Estadísticas** - Visualización de métricas clave

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Backend de Bizcocho API ejecutándose en `http://localhost:4000`

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar la URL del API:**
   
   Edita el archivo `src/services/api.js` y ajusta la URL base si es necesario:
   ```javascript
   const API_BASE_URL = 'http://localhost:4000/api';
   ```

3. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
bizcocho-frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── UI.jsx          # Componentes de interfaz
│   │   ├── Login.jsx       # Componente de login
│   │   └── Layout.jsx      # Layout principal
│   ├── contexts/            # Contextos de React
│   │   ├── AuthContext.jsx # Contexto de autenticación
│   │   └── ThemeContext.jsx# Contexto de tema
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Dashboard.jsx   # Dashboard principal
│   │   ├── Invoices.jsx    # Gestión de facturas
│   │   ├── Products.jsx    # Gestión de productos
│   │   └── index.js        # Customers, Users, Roles
│   ├── services/            # Servicios y APIs
│   │   └── api.js          # Cliente API
│   ├── App.jsx             # Componente principal
│   ├── main.jsx            # Punto de entrada
│   └── index.css           # Estilos globales
├── public/                  # Archivos públicos
├── index.html              # HTML principal
├── package.json            # Dependencias
├── vite.config.js          # Configuración de Vite
├── tailwind.config.js      # Configuración de Tailwind
└── postcss.config.js       # Configuración de PostCSS
```

## 🎨 Tema Personalizado

El sistema incluye un tema personalizado con:
- Paleta de colores naranja/ámbar (primary)
- Modo claro y oscuro
- Animaciones suaves
- Gradientes y sombras modernas

Para cambiar de tema, haz clic en el botón de sol/luna en el sidebar.

## 🔐 Autenticación

Credenciales de ejemplo (según tu backend):
```
Email: bcaiza@competencia.com.ec
Password: password123
```

## 📱 Módulos Principales

### Rutas Disponibles

- `/` - Dashboard principal
- `/login` - Página de inicio de sesión
- `/invoices` - Gestión de facturas
- `/products` - Gestión de productos
- `/customers` - Gestión de clientes
- `/users` - Gestión de usuarios
- `/roles` - Gestión de roles y permisos

Todas las rutas (excepto `/login`) están protegidas y requieren autenticación.

### Dashboard
- Estadísticas de ventas
- Facturas pendientes
- Ingresos del mes
- Lista de facturas recientes

### Facturas
- Crear nuevas facturas
- Editar facturas existentes
- Cambiar estado (Pendiente/Pagado/Cancelado)
- Asignar productos y clientes
- Aplicar impuestos y descuentos

### Productos
- Agregar nuevos productos
- Editar información de productos
- Gestionar inventario y precios
- Activar/desactivar productos

### Clientes
- Registrar nuevos clientes
- Actualizar información de contacto
- Ver historial de facturas por cliente

### Usuarios
- Crear cuentas de usuario
- Asignar roles y permisos
- Activar/desactivar usuarios

### Roles
- Definir roles personalizados
- Configurar permisos por módulo
- Gestionar accesos

## 🎯 Endpoints de la API

El frontend consume los siguientes endpoints:

- **Auth**: `POST /api/auth/login`
- **Roles**: `GET|POST|PUT|DELETE /api/roles`
- **Users**: `GET|POST|PUT|DELETE /api/users`
- **Customers**: `GET|POST|PUT|DELETE /api/customers`
- **Products**: `GET|POST|PUT|DELETE /api/products`
- **Invoices**: `GET|POST|PUT|PATCH /api/invoices`

## 🛡️ Control de Permisos

El sistema verifica permisos basándose en el rol del usuario:
- `can_view` - Ver registros
- `can_create` - Crear nuevos registros
- `can_edit` - Editar registros existentes
- `can_delete` - Eliminar registros

## 🔧 Tecnologías Utilizadas

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router DOM** - Enrutamiento y navegación
- **Tailwind CSS** - Framework de CSS utility-first
- **Lucide React** - Iconos modernos
- **Context API** - Gestión de estado
- **Fetch API** - Llamadas HTTP

## 📝 Notas

- Asegúrate de que el backend esté ejecutándose antes de iniciar el frontend
- El sistema guarda el token de autenticación en localStorage
- El tema seleccionado persiste entre sesiones
- Las facturas se pueden filtrar por cliente

## 🤝 Contribuir

Para contribuir al proyecto:
1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Envía un pull request

## 📄 Licencia

Este proyecto es privado y pertenece a Bizcocho.

---

Desarrollado con ❤️ para Bizcocho Sales System
