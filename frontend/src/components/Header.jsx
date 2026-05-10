// components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  Sun, 
  Moon,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
  Shield,
  Sparkles,
  Building2,
  LayoutDashboard
} from "lucide-react";
import usuarioAPI from '../services/api_usuario';

const Header = ({ 
  darkMode, 
  setDarkMode, 
  sidebarOpen, 
  setSidebarOpen,
  notifications,
  showNotifications,
  setShowNotifications,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
  unreadCount,
  markAsRead
}) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    cedula: '',
    role: '',
    estatus: ''
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);

  useEffect(() => {
    loadUserInfo();
    
    const handleClickOutside = (event) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowNotifications, setShowUserMenu]);

  const loadUserInfo = async () => {
    try {
      const storedUser = usuarioAPI.getCurrentUser();
      
      if (storedUser) {
        if (storedUser.cedula_usuario && !storedUser.nombre) {
          const response = await usuarioAPI.getUsuarioByCedula(storedUser.cedula_usuario);
          if (response.success && response.data) {
            setUserInfo({
              name: response.data.persona?.nombre_completo || response.data.cedula_usuario,
              cedula: response.data.cedula_usuario,
              role: response.data.rol,
              estatus: response.data.estatus
            });
          } else {
            setUserInfo({
              name: storedUser.cedula_usuario || 'Usuario',
              cedula: storedUser.cedula_usuario,
              role: storedUser.rol || 'usuario',
              estatus: storedUser.estatus
            });
          }
        } else {
          setUserInfo({
            name: storedUser.nombre_completo || storedUser.nombre || storedUser.cedula_usuario,
            cedula: storedUser.cedula_usuario,
            role: storedUser.rol,
            estatus: storedUser.estatus
          });
        }
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
      const storedUser = usuarioAPI.getCurrentUser();
      if (storedUser) {
        setUserInfo({
          name: storedUser.nombre_completo || storedUser.cedula_usuario || 'Usuario',
          cedula: storedUser.cedula_usuario,
          role: storedUser.rol || 'usuario',
          estatus: storedUser.estatus
        });
      }
    }
  };

  const getDisplayName = () => {
    if (userInfo.name && userInfo.name !== userInfo.cedula) {
      const names = userInfo.name.split(' ');
      return names.length > 1 ? `${names[0]} ${names[names.length - 1]}` : names[0];
    }
    return userInfo.cedula ? `V-${userInfo.cedula}` : 'Usuario';
  };

  const getFormattedRole = () => {
    const roles = {
      'admin': 'Administrador',
      'ADMIN': 'Administrador',
      'administrador': 'Administrador',
      'emprendedor': 'Emprendedor',
      'EMPRENDEDOR': 'Emprendedor'
    };
    return roles[userInfo.role?.toLowerCase()] || userInfo.role || 'Usuario';
  };

  const getInitials = () => {
    const name = getDisplayName();
    if (name && name !== `V-${userInfo.cedula}`) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return userInfo.cedula ? userInfo.cedula.substring(0, 2).toUpperCase() : 'U';
  };

  const getRoleBadge = () => {
    const role = userInfo.role?.toLowerCase();
    if (role === 'admin' || role === 'administrador') {
      return {
        icon: Shield,
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300',
        borderColor: 'border-slate-300 dark:border-slate-600',
        label: 'Administrador'
      };
    }
    if (role === 'emprendedor') {
      return {
        icon: Building2,
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        textColor: 'text-slate-700 dark:text-slate-300',
        borderColor: 'border-slate-300 dark:border-slate-600',
        label: 'Emprendedor'
      };
    }
    return null;
  };

  const roleBadge = getRoleBadge();

  const handleUserMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    
    if (showNotifications) {
      setShowNotifications(false);
    }
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  };

  return (
    <header className={`
      fixed top-0 w-full z-50 h-16
      ${darkMode 
        ? 'bg-slate-900 border-slate-800' 
        : 'bg-white border-slate-200'
      }
      border-b shadow-sm
      transition-all duration-300 
      ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
    `}>
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${darkMode 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }
            `}
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search bar - Desktop */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search 
                size={16} 
                className={`
                  absolute left-3 top-1/2 -translate-y-1/2
                  ${darkMode ? 'text-slate-500' : 'text-slate-400'}
                `} 
              />
              <input
                type="text"
                placeholder="Buscar en el sistema..."
                className={`
                  w-72 xl:w-96 pl-9 pr-4 py-2 rounded-lg text-sm
                  border transition-all duration-200
                  ${darkMode 
                    ? 'bg-slate-800 border-slate-700 focus:border-slate-600 text-slate-200 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900 placeholder-slate-400'
                  }
                  focus:outline-none focus:ring-1 focus:ring-slate-400
                `}
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`
              p-2 rounded-lg lg:hidden transition-all duration-200
              ${darkMode 
                ? 'hover:bg-slate-800 text-slate-400' 
                : 'hover:bg-slate-100 text-slate-600'
              }
            `}
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${darkMode 
                ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
              }
            `}
            aria-label={darkMode ? "Modo claro" : "Modo oscuro"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={handleNotificationClick}
              className={`
                p-2 rounded-lg transition-all duration-200 relative
                ${darkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                }
                ${showNotifications ? (darkMode ? 'bg-slate-800' : 'bg-slate-100') : ''}
              `}
              aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className={`
                absolute right-0 mt-2 w-80 lg:w-96 rounded-lg shadow-xl
                ${darkMode ? 'bg-slate-900' : 'bg-white'}
                border ${darkMode ? 'border-slate-800' : 'border-slate-200'}
                z-50 overflow-hidden
              `}>
                <div className={`
                  px-4 py-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}
                `}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      Notificaciones
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-200 rounded">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif, index) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`
                          px-4 py-3 cursor-pointer transition-colors duration-150
                          ${darkMode 
                            ? `hover:bg-slate-800 ${index !== notifications.length - 1 ? 'border-b border-slate-800' : ''}` 
                            : `hover:bg-slate-50 ${index !== notifications.length - 1 ? 'border-b border-slate-100' : ''}`
                          }
                          ${!notif.read 
                            ? (darkMode ? 'border-l-2 border-l-slate-500' : 'border-l-2 border-l-slate-400') 
                            : ''
                          }
                        `}
                      >
                        <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          {notif.text}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {notif.time}
                          </span>
                          {!notif.read && (
                            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              Nueva
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Bell size={24} className={`mx-auto mb-2 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                      <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        No hay notificaciones pendientes
                      </p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className={`
                    p-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}
                  `}>
                    <button className={`
                      w-full text-center text-sm py-1.5 rounded transition-colors
                      ${darkMode 
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                      }
                    `}>
                      Ver todas las notificaciones
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              ref={userMenuButtonRef}
              onClick={handleUserMenuClick}
              className={`
                flex items-center gap-2 lg:gap-3 p-1.5 rounded-lg transition-all duration-200
                ${darkMode 
                  ? 'hover:bg-slate-800 text-slate-400' 
                  : 'hover:bg-slate-100 text-slate-700'
                }
                ${showUserMenu ? (darkMode ? 'bg-slate-800' : 'bg-slate-100') : ''}
              `}
              aria-label={`Menú de usuario ${getDisplayName()}`}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-md flex items-center justify-center
                text-white font-medium text-xs
                ${darkMode ? 'bg-slate-700' : 'bg-slate-600'}
              `}>
                {getInitials()}
              </div>

              {/* User info - Desktop */}
              <div className="hidden lg:block text-left max-w-[140px]">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {getDisplayName()}
                </p>
                <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {getFormattedRole()}
                </p>
              </div>

              <ChevronDown 
                size={14} 
                className={`
                  hidden lg:block transition-transform duration-200
                  ${showUserMenu ? 'rotate-180' : ''}
                  ${darkMode ? 'text-slate-500' : 'text-slate-400'}
                `} 
              />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div 
                ref={userMenuRef}
                className={`
                  absolute right-0 mt-2 w-64 rounded-lg shadow-xl
                  ${darkMode ? 'bg-slate-900' : 'bg-white'}
                  border ${darkMode ? 'border-slate-800' : 'border-slate-200'}
                  z-50 overflow-hidden
                `}
                onClick={(e) => e.stopPropagation()}
              >
                {/* User info header */}
                <div className={`
                  p-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}
                `}>
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-md flex items-center justify-center text-white font-medium
                      ${darkMode ? 'bg-slate-700' : 'bg-slate-600'}
                    `}>
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {getDisplayName()}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {getFormattedRole()}
                      </p>
                      {userInfo.cedula && (
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                          CI: {userInfo.cedula}
                        </p>
                      )}
                    </div>
                  </div>
                  {roleBadge && (
                    <div className="mt-3">
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium
                        border ${roleBadge.borderColor} ${roleBadge.bgColor} ${roleBadge.textColor}
                      `}>
                        <roleBadge.icon size={12} />
                        {roleBadge.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Menu items */}
                <div className="p-1.5">
                  <MenuItem 
                    icon={User} 
                    text="Mi Perfil" 
                    darkMode={darkMode}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <MenuItem 
                    icon={Settings} 
                    text="Configuración" 
                    darkMode={darkMode}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <MenuItem 
                    icon={CreditCard} 
                    text="Mis Créditos" 
                    darkMode={darkMode}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <MenuItem 
                    icon={HelpCircle} 
                    text="Ayuda y Soporte" 
                    darkMode={darkMode}
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  <div className={`my-1.5 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                  
                  <MenuItem 
                    icon={LogOut} 
                    text="Cerrar Sesión" 
                    darkMode={darkMode}
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className={`
          lg:hidden p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}
        `}>
          <div className="relative">
            <Search 
              size={16} 
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} 
            />
            <input
              type="text"
              placeholder="Buscar en el sistema..."
              className={`
                w-full pl-9 pr-4 py-2.5 rounded-lg text-sm
                border transition-all duration-200
                ${darkMode 
                  ? 'bg-slate-800 border-slate-700 focus:border-slate-600 text-slate-200 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 focus:border-slate-400 text-slate-900 placeholder-slate-400'
                }
                focus:outline-none focus:ring-1 focus:ring-slate-400
              `}
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

// Componente MenuItem corporativo
const MenuItem = ({ icon: Icon, text, darkMode, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 text-sm
      ${darkMode 
        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }
      ${className}
    `}
  >
    <Icon size={16} />
    <span>{text}</span>
  </button>
);

export default Header;