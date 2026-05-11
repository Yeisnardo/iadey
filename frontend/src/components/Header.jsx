// components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Menu, X, Search, Bell, Sun, Moon, ChevronDown,
  User, Settings, HelpCircle, LogOut, CreditCard, Shield, Building2
} from "lucide-react";
import usuarioAPI from '../services/api_usuario';

const Header = ({ 
  darkMode, setDarkMode, sidebarOpen, setSidebarOpen,
  notifications, showNotifications, setShowNotifications,
  showUserMenu, setShowUserMenu, handleLogout, unreadCount, markAsRead
}) => {
  const [userInfo, setUserInfo] = useState({
    nombres: '',
    apellidos: '',
    nombre_completo: '',
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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
          userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target)) {
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
        // Verificar si ya tenemos nombres y apellidos en storage
        if (storedUser.nombres && storedUser.apellidos) {
          setUserInfo({
            nombres: storedUser.nombres,
            apellidos: storedUser.apellidos,
            nombre_completo: `${storedUser.nombres} ${storedUser.apellidos}`,
            cedula: storedUser.cedula_usuario,
            role: storedUser.rol,
            estatus: storedUser.estatus
          });
        } else {
          // Si no hay datos, intentar cargar del backend
          const response = await usuarioAPI.getUsuarioByCedula(storedUser.cedula_usuario);
          if (response.success && response.data) {
            const data = response.data;
            setUserInfo({
              nombres: data.nombres || data.persona?.nombres || '',
              apellidos: data.apellidos || data.persona?.apellidos || '',
              nombre_completo: data.nombre_completo || 
                (data.persona?.nombre_completo) || 
                `${data.nombres || ''} ${data.apellidos || ''}`.trim(),
              cedula: data.cedula_usuario,
              role: data.rol,
              estatus: data.estatus
            });
          } else {
            // Fallback con datos mínimos
            setUserInfo(prev => ({
              ...prev,
              cedula: storedUser.cedula_usuario,
              role: storedUser.rol || '',
              estatus: storedUser.estatus || ''
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  };

  const getDisplayName = () => {
    if (userInfo.nombres && userInfo.apellidos) {
      const nombres = userInfo.nombres.trim().split(' ');
      const apellidos = userInfo.apellidos.trim().split(' ');
      return `${nombres[0]} ${apellidos[0]}`;
    }
    if (userInfo.nombre_completo) {
      const names = userInfo.nombre_completo.trim().split(' ');
      return names.length >= 2 ? `${names[0]} ${names[names.length - 1]}` : names[0];
    }
    return userInfo.cedula ? `V-${userInfo.cedula}` : 'Usuario';
  };

  const getFullName = () => {
    if (userInfo.nombres && userInfo.apellidos) {
      return `${userInfo.nombres} ${userInfo.apellidos}`;
    }
    return userInfo.nombre_completo || getDisplayName();
  };

  const getFormattedRole = () => {
    const roles = {
      'admin': 'Administrador',
      'administrador': 'Administrador',
      'emprendedor': 'Emprendedor'
    };
    return roles[userInfo.role?.toLowerCase()] || userInfo.role || 'Usuario';
  };

  const getInitials = () => {
    if (userInfo.nombres && userInfo.apellidos) {
      return (userInfo.nombres[0] + userInfo.apellidos[0]).toUpperCase();
    }
    const name = getDisplayName();
    if (name && !name.startsWith('V-')) {
      const parts = name.split(' ');
      return parts.length >= 2 ? 
        (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : 
        name[0].toUpperCase();
    }
    return userInfo.cedula ? userInfo.cedula.substring(0, 2).toUpperCase() : 'U';
  };

  const roleBadge = (() => {
    const role = userInfo.role?.toLowerCase();
    if (role === 'admin' || role === 'administrador') {
      return { icon: Shield, label: 'Administrador' };
    }
    if (role === 'emprendedor') {
      return { icon: Building2, label: 'Emprendedor' };
    }
    return null;
  })();

  return (
    <header className={`
      fixed top-0 w-full z-50 h-16
      ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
      border-b shadow-sm transition-all duration-300 
      ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
    `}>
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Buscar..."
                className={`w-72 xl:w-96 pl-9 pr-4 py-2 rounded-lg text-sm border transition-all ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-200' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                } focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 lg:gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${
            darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
          }`}>
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              ref={userMenuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              className={`flex items-center gap-2 lg:gap-3 p-1.5 rounded-lg transition-all ${
                darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-medium text-xs ${
                darkMode ? 'bg-slate-700' : 'bg-slate-600'
              }`}>
                {getInitials()}
              </div>
              <div className="hidden lg:block text-left max-w-[160px]">
                <p className={`text-sm font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  {getDisplayName()}
                </p>
                <p className={`text-xs truncate ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {getFormattedRole()}
                </p>
              </div>
              <ChevronDown size={14} className={`hidden lg:block transition-transform ${
                showUserMenu ? 'rotate-180' : ''
              } ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </button>

            {showUserMenu && (
              <div ref={userMenuRef} className={`absolute right-0 mt-2 w-72 rounded-lg shadow-xl ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } border z-50 overflow-hidden`}>
                <div className={`p-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-md flex items-center justify-center text-white font-medium text-lg ${
                      darkMode ? 'bg-slate-700' : 'bg-slate-600'
                    }`}>
                      {getInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {getDisplayName()}
                      </p>
                      <p className={`text-xs truncate mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {getFullName()}
                      </p>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {getFormattedRole()}
                      </p>
                      {userInfo.cedula && (
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                          C.I: {userInfo.cedula}
                        </p>
                      )}
                    </div>
                  </div>
                  {roleBadge && (
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
                        darkMode ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-700'
                      }`}>
                        <roleBadge.icon size={12} />
                        {roleBadge.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-1.5">
                  <MenuItem icon={User} text="Mi Perfil" darkMode={darkMode} onClick={() => setShowUserMenu(false)} />
                  <MenuItem icon={Settings} text="Configuración" darkMode={darkMode} onClick={() => setShowUserMenu(false)} />
                  <MenuItem icon={CreditCard} text="Mis Créditos" darkMode={darkMode} onClick={() => setShowUserMenu(false)} />
                  <MenuItem icon={HelpCircle} text="Ayuda y Soporte" darkMode={darkMode} onClick={() => setShowUserMenu(false)} />
                  <div className={`my-1.5 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                  <MenuItem icon={LogOut} text="Cerrar Sesión" darkMode={darkMode} 
                    onClick={() => { handleLogout(); setShowUserMenu(false); }}
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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

const MenuItem = ({ icon: Icon, text, darkMode, onClick, className = "" }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 text-sm ${
    darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  } ${className}`}>
    <Icon size={16} />
    <span>{text}</span>
  </button>
);

export default Header;