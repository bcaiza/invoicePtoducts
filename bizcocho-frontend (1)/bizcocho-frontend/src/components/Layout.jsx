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
  ShieldCheck
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
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg">
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

        <div className="p-4 border-t border-slate-200 dark:border-dark-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all duration-200"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-dark-900 shadow-2xl flex flex-col animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  B
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bizcocho</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Ventas</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg"
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

            <div className="p-4 border-t border-slate-200 dark:border-dark-800 space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all duration-200"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span className="font-medium">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="md:ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800 sticky top-0 z-40 transition-colors duration-300">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
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
                  className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role?.name}</p>
                  </div>
                  <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
