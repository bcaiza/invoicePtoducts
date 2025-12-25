# Changelog - Bizcocho Frontend

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [1.1.1] - 2024-12-24

### 🐛 Correcciones
- **Invoices.jsx**: Corregido error de prop `icon` no soportado en Input component
- **UI.jsx**: Agregado nuevo componente `SearchInput` con ícono de búsqueda incorporado

### ✨ Añadido
- **SearchInput component**: Nuevo componente reutilizable para campos de búsqueda
- **TROUBLESHOOTING.md**: Documentación de errores comunes y soluciones

## [1.1.0] - 2024-12-24

### ✨ Añadido
- **React Router DOM v6**: Sistema completo de enrutamiento
- **Rutas protegidas**: ProtectedRoute component para seguridad
- **Navegación declarativa**: Links en sidebar con estado activo
- **Redirecciones automáticas**: Login redirige al dashboard, rutas no autenticadas a /login
- **Ruta catch-all**: URLs no definidas redirigen al dashboard
- **Documentación de rutas**: ROUTES.md con guía completa

### 🔄 Cambiado
- **App.jsx**: Refactorizado para usar BrowserRouter y Routes
- **Layout.jsx**: Actualizado para usar Link y useNavigate en lugar de callbacks
- **Login.jsx**: Añadida redirección automática después del login exitoso
- **Navegación**: De estado local a sistema de rutas basado en URL

### 🔧 Mejorado
- **SEO**: URLs limpias y amigables
- **Experiencia de usuario**: Navegación con botón atrás/adelante del navegador
- **Compartir URLs**: Enlaces directos a páginas específicas
- **Historial**: Navegación completa con history API

### 📚 Documentación
- Añadido ROUTES.md con documentación completa de rutas
- Actualizado README.md con información de React Router DOM
- Actualizado QUICKSTART.md con rutas disponibles

## [1.0.0] - 2024-12-24

### ✨ Release Inicial

#### Características
- Autenticación con JWT
- Sistema de temas (claro/oscuro)
- Dashboard con estadísticas
- Gestión de Facturas (CRUD completo)
- Gestión de Productos (CRUD completo)
- Gestión de Clientes (CRUD completo)
- Gestión de Usuarios (CRUD completo)
- Gestión de Roles y Permisos
- Diseño responsivo con Tailwind CSS
- Context API para estado global

#### Tecnologías
- React 18
- Vite
- Tailwind CSS
- Lucide React Icons
- Context API

---

**Formato basado en [Keep a Changelog](https://keepachangelog.com/)**
