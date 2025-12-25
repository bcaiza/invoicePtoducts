# 🚀 Guía de Inicio Rápido - Bizcocho Frontend

## Pasos para Ejecutar el Proyecto

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

### 3. Abrir en el Navegador
Abre `http://localhost:5173` en tu navegador.

### 4. Iniciar Sesión
Usa las credenciales proporcionadas por tu backend, por ejemplo:
```
Email: bcaiza@competencia.com.ec
Password: password123
```

## ⚙️ Configuración

### Cambiar URL del Backend
Si tu backend no está en `http://localhost:4000`, edita:
- `src/services/api.js` → Cambia `API_BASE_URL`

### Cambiar Puerto de Desarrollo
En `vite.config.js`, modifica:
```javascript
server: {
  port: 5173, // Cambia aquí
  open: true
}
```

## 🎨 Características Principales

### Rutas
El proyecto usa **React Router DOM** con rutas protegidas:
- `/` - Dashboard
- `/login` - Inicio de sesión
- `/invoices` - Facturas
- `/products` - Productos
- `/customers` - Clientes
- `/users` - Usuarios
- `/roles` - Roles

### Temas
- Haz clic en el ícono de sol/luna en el sidebar para cambiar entre modo claro y oscuro
- El tema seleccionado se guarda automáticamente

### Navegación
- **Dashboard**: Vista general con estadísticas
- **Facturas**: Gestión completa de facturas
- **Productos**: Administrar catálogo de productos
- **Clientes**: Base de datos de clientes
- **Usuarios**: Control de acceso de usuarios
- **Roles**: Configuración de permisos

### Permisos
El sistema respeta los permisos configurados en el backend:
- Ver (view)
- Crear (create)
- Editar (edit)
- Eliminar (delete)

## 🐛 Solución de Problemas

### Error de CORS
Si ves errores de CORS, asegúrate de que tu backend permita solicitudes desde `http://localhost:5173`.

### Backend no responde
Verifica que el backend esté ejecutándose en `http://localhost:4000`.

### Módulos no encontrados
Ejecuta `npm install` nuevamente.

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye el proyecto para producción
- `npm run preview` - Vista previa de la build de producción

## 📞 Soporte

Para cualquier problema, revisa la documentación completa en `README.md`.

---

¡Listo para usar! 🎉
