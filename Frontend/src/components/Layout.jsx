import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users, 
  UserCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  ShieldCheck,
  Ruler,
  Gift,
  Boxes
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/invoices', label: 'Facturas', icon: FileText, module: 'invoices' },
    { path: '/products', label: 'Productos', icon: Package, module: 'products' },
    { path: '/units', label: 'Unidades', icon: Ruler, module: 'units' },
    { path: '/product-units', label: 'Unidades de Producto', icon: Boxes, module: 'products' },
    { path: '/promotions', label: 'Promociones', icon: Gift, module: 'promotion' },
    { path: '/customers', label: 'Clientes', icon: Users, module: 'customers' },
    { path: '/users', label: 'Usuarios', icon: UserCircle, module: 'users' },
    { path: '/roles', label: 'Roles', icon: ShieldCheck, module: 'users' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentMenuItem = menuItems.find(item => item.path === location.pathname) || menuItems[0];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-dark-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 transition-colors duration-300 bg-white border-r md:flex md:flex-col dark:bg-dark-900 border-slate-200 dark:border-dark-800">
        <div className="p-6 border-b border-slate-200 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white gradient-bg rounded-xl">
              B
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bizcocho</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Ventas</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-slate-200 dark:border-dark-800">
          <button
            onClick={toggleTheme}
            className="flex items-center w-full gap-3 px-4 py-3 transition-all duration-200 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-red-600 transition-all duration-200 rounded-xl dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-2xl dark:bg-dark-900 animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white gradient-bg rounded-xl">
                  B
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bizcocho</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Ventas</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 space-y-2 border-t border-slate-200 dark:border-dark-800">
              <button
                onClick={toggleTheme}
                className="flex items-center w-full gap-3 px-4 py-3 transition-all duration-200 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="font-medium">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-3 px-4 py-3 text-red-600 transition-all duration-200 rounded-xl dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="md:ml-64">
        <header className="sticky top-0 z-40 transition-colors duration-300 bg-white border-b dark:bg-dark-900 border-slate-200 dark:border-dark-800">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 transition-colors rounded-lg md:hidden hover:bg-slate-100 dark:hover:bg-dark-800"
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {currentMenuItem.label}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="hidden p-2 transition-colors rounded-lg md:flex hover:bg-slate-100 dark:hover:bg-dark-800"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role?.name}</p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full gradient-bg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;