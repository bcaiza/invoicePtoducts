import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled, 
  className = '', 
  icon: Icon,
  type = 'button',
  fullWidth = false
}) => {
  const baseStyles = 'font-semibold transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg',
    danger: 'px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Card = ({ children, title, action, className = '', noPadding = false }) => (
  <div className={`card ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-dark-900 dark:to-dark-900/50">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        {action}
      </div>
    )}
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

export const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required, 
  error,
  disabled = false,
  className = ''
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`input-field ${error ? 'border-red-400 dark:border-red-500' : ''} ${className}`}
    />
    {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
  </div>
);

export const Select = ({ 
  label, 
  value, 
  onChange, 
  options, 
  required,
  placeholder = 'Seleccionar...',
  disabled = false
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="input-field"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  required,
  rows = 4,
  error
}) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`input-field resize-none ${error ? 'border-red-400 dark:border-red-500' : ''}`}
    />
    {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`bg-white dark:bg-dark-900 rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-dark-900 dark:to-dark-900/50">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-dark-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info'
  };
  
  return (
    <span className={`${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Table = ({ children, headers }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50 dark:bg-dark-800">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-dark-800">
        {children}
      </tbody>
    </table>
  </div>
);

export const Alert = ({ type = 'info', children, onClose }) => {
  const types = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
  };
  
  return (
    <div className={`p-4 rounded-lg border ${types[type]} flex items-start justify-between`}>
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} className="ml-4 hover:opacity-70">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className={`${sizes[size]} border-4 border-slate-200 dark:border-dark-700 border-t-primary-500 rounded-full animate-spin`} />
  );
};

export const SearchInput = ({ value, onChange, placeholder = 'Buscar...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field pl-10"
      />
    </div>
  );
};
