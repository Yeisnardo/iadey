// components/Header.jsx
import React, { useState, useEffect } from "react";
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
  LogOut
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
  // Estado para almacenar información completa del usuario
  const [userInfo, setUserInfo] = useState({
    name: '',
    cedula: '',
    role: '',
    estatus: ''
  });

  // Cargar información del usuario al montar el componente
  useEffect(() => {
    loadUserInfo();
  }, []);

  // Función para cargar información del usuario desde localStorage y API
  const loadUserInfo = async () => {
    try {
      // Obtener usuario del localStorage (datos básicos del login)
      const storedUser = usuarioAPI.getCurrentUser();
      
      if (storedUser) {
        // Si solo tenemos la cédula, obtener datos completos
        if (storedUser.cedula_usuario && !storedUser.nombre) {
          const response = await usuarioAPI.getUsuarioByCedula(storedUser.cedula_usuario);
          if (response.success && response.data) {
            // Combinar datos de persona y usuario
            setUserInfo({
              name: response.data.persona?.nombre_completo || response.data.cedula_usuario,
              cedula: response.data.cedula_usuario,
              role: response.data.rol,
              estatus: response.data.estatus
            });
          } else {
            // Fallback con datos básicos
            setUserInfo({
              name: storedUser.cedula_usuario || 'Usuario',
              cedula: storedUser.cedula_usuario,
              role: storedUser.rol || 'usuario',
              estatus: storedUser.estatus
            });
          }
        } else {
          // Ya tenemos los datos completos
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
      // Fallback: usar datos del localStorage si la API falla
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

  // Función para obtener el nombre para mostrar
  const getDisplayName = () => {
    if (userInfo.name && userInfo.name !== userInfo.cedula) {
      return userInfo.name;
    }
    return userInfo.cedula || 'Usuario';
  };

  // Función para obtener el rol formateado (solo emprendedor y administrador)
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

  // Función para obtener el color del rol (para badges o estilos)
  const getRoleColor = () => {
    const role = userInfo.role?.toLowerCase();
    if (role === 'admin' || role === 'administrador') {
      return 'from-purple-500 to-pink-500';
    }
    if (role === 'emprendedor') {
      return 'from-blue-500 to-teal-500';
    }
    return 'from-gray-500 to-gray-600';
  };

  // Función para obtener las iniciales del avatar
  const getInitials = () => {
    const name = getDisplayName();
    if (name && name !== userInfo.cedula) {
      // Si tenemos nombre completo, tomar primeras letras
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name[0].toUpperCase();
    }
    // Si solo tenemos cédula, tomar primeros 2 caracteres
    return userInfo.cedula ? userInfo.cedula.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <header className={`fixed top-0 w-full z-50 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-b transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
      <div className="h-16 flex items-center justify-between px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 md:gap-3">
          {/* Search (mobile) */}
          <button className={`p-2 rounded-lg md:hidden ${
            darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
          }`}>
            <Search size={20} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg ${
              darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            } transition-colors`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative notifications-menu">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg ${
                darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              } transition-colors relative`}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-72 md:w-80 rounded-lg shadow-xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-200'} z-50`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Notificaciones
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 border-b last:border-0 cursor-pointer transition-colors ${
                          darkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
                        } ${!notif.read ? (darkMode ? 'bg-gray-700/50' : 'bg-blue-50/50') : ''}`}
                      >
                        <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {notif.text}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Hace {notif.time}
                          </p>
                          {!notif.read && (
                            <span className="text-xs text-blue-500 font-medium">Nueva</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No hay notificaciones
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button className={`w-full text-center text-sm ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}>
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative user-menu">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="User menu"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center text-white font-semibold text-sm`}>
                {getInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {getDisplayName()}
                </p>
                <div className="flex items-center gap-1">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {getFormattedRole()}
                  </p>
                  {userInfo.role?.toLowerCase() === 'admin' && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      Admin
                    </span>
                  )}
                  {userInfo.role?.toLowerCase() === 'emprendedor' && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Emprende
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown size={16} className={`hidden md:block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-200'} z-50`}>
                <div className="p-2">
                  <div className={`md:hidden p-3 mb-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getDisplayName()}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {getFormattedRole()}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Cédula: {userInfo.cedula}
                    </p>
                  </div>
                  
                  <MenuItem 
                    icon={User} 
                    text="Mi Perfil" 
                    darkMode={darkMode}
                    onClick={() => console.log('Perfil')}
                  />
                  <MenuItem 
                    icon={Settings} 
                    text="Configuración" 
                    darkMode={darkMode}
                    onClick={() => console.log('Configuración')}
                  />
                  <MenuItem 
                    icon={HelpCircle} 
                    text="Ayuda" 
                    darkMode={darkMode}
                    onClick={() => console.log('Ayuda')}
                  />
                  <div className={`my-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                  <MenuItem 
                    icon={LogOut} 
                    text="Cerrar Sesión" 
                    darkMode={darkMode}
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Componente MenuItem para dropdowns
const MenuItem = ({ icon: Icon, text, darkMode, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
    } ${className}`}
  >
    <Icon size={18} />
    <span className="text-sm">{text}</span>
  </button>
);

export default Header;