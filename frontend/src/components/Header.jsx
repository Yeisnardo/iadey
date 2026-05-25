// components/Header.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Menu, X, ChevronDown,
  User, Settings, HelpCircle, LogOut, CreditCard, Shield, Building2
} from "lucide-react";
import Swal from 'sweetalert2';
import usuarioAPI from '../services/api_usuario';

// Constants
const ROLE_CONFIG = {
  admin: { icon: Shield, label: 'Administrador' },
  administrador: { icon: Shield, label: 'Administrador' },
  emprendedor: { icon: Building2, label: 'Emprendedor' }
};

const ROLE_DISPLAY_NAMES = {
  admin: 'Administrador',
  administrador: 'Administrador',
  emprendedor: 'Emprendedor'
};

// Custom hook for user info management
const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    nombres: '',
    apellidos: '',
    nombre_completo: '',
    cedula: '',
    role: '',
    estatus: ''
  });

  const loadUserInfo = useCallback(async () => {
    try {
      const storedUser = usuarioAPI.getCurrentUser();
      if (!storedUser) return;

      if (storedUser.nombres && storedUser.apellidos) {
        setUserInfo({
          nombres: storedUser.nombres,
          apellidos: storedUser.apellidos,
          nombre_completo: `${storedUser.nombres} ${storedUser.apellidos}`,
          cedula: storedUser.cedula_usuario || '',
          role: storedUser.rol || '',
          estatus: storedUser.estatus || ''
        });
        return;
      }

      const response = await usuarioAPI.getUsuarioByCedula(storedUser.cedula_usuario);
      if (response?.success && response?.data) {
        const data = response.data;
        setUserInfo({
          nombres: data.nombres || data.persona?.nombres || '',
          apellidos: data.apellidos || data.persona?.apellidos || '',
          nombre_completo: data.nombre_completo || 
            data.persona?.nombre_completo || 
            `${data.nombres || ''} ${data.apellidos || ''}`.trim(),
          cedula: data.cedula_usuario || storedUser.cedula_usuario,
          role: data.rol || storedUser.rol || '',
          estatus: data.estatus || storedUser.estatus || ''
        });
        return;
      }

      // Fallback con datos mínimos
      setUserInfo(prev => ({
        ...prev,
        cedula: storedUser.cedula_usuario || '',
        role: storedUser.rol || '',
        estatus: storedUser.estatus || ''
      }));
    } catch (error) {
      console.error('Error cargando información del usuario:', error);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  return userInfo;
};

// Custom hook for click outside detection
const useClickOutside = (refs, handlers) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      refs.forEach(({ ref, handler }) => {
        if (ref.current && !ref.current.contains(event.target)) {
          handler(false);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, handlers]);
};

// Función para mostrar confirmación de cierre de sesión
const showLogoutConfirmation = async (handleLogout) => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Estás seguro de que deseas cerrar tu sesión actual?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-lg shadow-xl',
      title: 'text-lg font-semibold',
      confirmButton: 'px-4 py-2 text-sm font-medium rounded-md',
      cancelButton: 'px-4 py-2 text-sm font-medium rounded-md'
    }
  });

  if (result.isConfirmed) {
    // Mostrar loading mientras se cierra sesión
    Swal.fire({
      title: 'Cerrando sesión...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      await handleLogout();
      
      // Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Sesión cerrada!',
        text: 'Has cerrado sesión exitosamente',
        icon: 'success',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-lg shadow-xl'
        }
      });
    } catch (error) {
      // Mostrar mensaje de error si algo sale mal
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cerrar la sesión. Intenta de nuevo.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          confirmButton: 'px-4 py-2 text-sm font-medium rounded-md'
        }
      });
    }
  }
};

// Helper functions for user display
const getDisplayName = (userInfo) => {
  if (userInfo.nombres && userInfo.apellidos) {
    const [firstName] = userInfo.nombres.trim().split(' ');
    const [firstLastName] = userInfo.apellidos.trim().split(' ');
    return `${firstName} ${firstLastName}`;
  }
  
  if (userInfo.nombre_completo) {
    const names = userInfo.nombre_completo.trim().split(' ');
    return names.length >= 2 ? `${names[0]} ${names[names.length - 1]}` : names[0];
  }
  
  return userInfo.cedula ? `V-${userInfo.cedula}` : 'Usuario';
};

const getFullName = (userInfo) => {
  if (userInfo.nombres && userInfo.apellidos) {
    return `${userInfo.nombres} ${userInfo.apellidos}`;
  }
  return userInfo.nombre_completo || getDisplayName(userInfo);
};

const getFormattedRole = (role) => {
  return ROLE_DISPLAY_NAMES[role?.toLowerCase()] || role || 'Usuario';
};

const getInitials = (userInfo) => {
  if (userInfo.nombres && userInfo.apellidos) {
    return (userInfo.nombres[0] + userInfo.apellidos[0]).toUpperCase();
  }
  
  const name = getDisplayName(userInfo);
  if (name && !name.startsWith('V-')) {
    const parts = name.split(' ');
    return parts.length >= 2 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name[0].toUpperCase();
  }
  
  return userInfo.cedula?.substring(0, 2).toUpperCase() || 'U';
};

const getRoleBadge = (role) => {
  return ROLE_CONFIG[role?.toLowerCase()] || null;
};

// Sub-components
const UserAvatar = ({ initials, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`
      ${sizeClasses[size]} rounded-md flex items-center justify-center 
      text-white font-medium bg-slate-600
    `}>
      {initials}
    </div>
  );
};

const MenuItem = React.memo(({ icon: Icon, text, onClick, className = "" }) => (
  <button 
    onClick={onClick} 
    className={`
      w-full flex items-center gap-3 px-3 py-2 rounded-md 
      transition-all duration-150 text-sm text-slate-600 
      hover:bg-slate-50 hover:text-slate-900 ${className}
    `}
  >
    <Icon size={16} />
    <span>{text}</span>
  </button>
));

MenuItem.displayName = 'MenuItem';

const UserMenuDropdown = React.memo(({ 
  userInfo, showUserMenu, setShowUserMenu, 
  handleLogout, userMenuRef 
}) => {
  const displayName = useMemo(() => getDisplayName(userInfo), [userInfo]);
  const fullName = useMemo(() => getFullName(userInfo), [userInfo]);
  const formattedRole = useMemo(() => getFormattedRole(userInfo.role), [userInfo.role]);
  const initials = useMemo(() => getInitials(userInfo), [userInfo]);
  const roleBadge = useMemo(() => getRoleBadge(userInfo.role), [userInfo.role]);

  const handleLogoutClick = useCallback(() => {
    setShowUserMenu(false);
    showLogoutConfirmation(handleLogout);
  }, [handleLogout, setShowUserMenu]);

  if (!showUserMenu) return null;

  return (
    <div 
      ref={userMenuRef} 
      className="absolute right-0 mt-2 w-72 rounded-lg shadow-xl z-50 overflow-hidden bg-white border border-slate-200"
    >
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <UserAvatar initials={initials} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-900">
              {displayName}
            </p>
            <p className="text-xs mt-1 text-slate-500">
              {formattedRole}
            </p>
            {userInfo.cedula && (
              <p className="text-xs mt-0.5 text-slate-400">
                C.I: {userInfo.cedula}
              </p>
            )}
          </div>
        </div>
        {roleBadge && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border border-slate-300 bg-slate-100 text-slate-700">
              <roleBadge.icon size={12} />
              {roleBadge.label}
            </span>
          </div>
        )}
      </div>

      <div className="p-1.5">
        <MenuItem 
          icon={User} 
          text="Mi Perfil" 
          onClick={() => setShowUserMenu(false)} 
        />
        <MenuItem 
          icon={Settings} 
          text="Configuración" 
          onClick={() => setShowUserMenu(false)} 
        />
        <MenuItem 
          icon={CreditCard} 
          text="Mis Créditos" 
          onClick={() => setShowUserMenu(false)} 
        />
        <MenuItem 
          icon={HelpCircle} 
          text="Ayuda y Soporte" 
          onClick={() => setShowUserMenu(false)} 
        />
        <div className="my-1.5 border-t border-slate-200" />
        <MenuItem 
          icon={LogOut} 
          text="Cerrar Sesión" 
          onClick={handleLogoutClick}
          className="text-red-600 hover:bg-red-50"
        />
      </div>
    </div>
  );
});

UserMenuDropdown.displayName = 'UserMenuDropdown';

// Main Header component
const Header = ({ 
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
  const userInfo = useUserInfo();
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const userMenuButtonRef = useRef(null);

  const displayName = useMemo(() => getDisplayName(userInfo), [userInfo]);
  const initials = useMemo(() => getInitials(userInfo), [userInfo]);
  const formattedRole = useMemo(() => getFormattedRole(userInfo.role), [userInfo.role]);

  const clickOutsideRefs = useMemo(() => [
    { ref: notificationRef, handler: setShowNotifications },
    { ref: userMenuRef, handler: setShowUserMenu }
  ], [setShowNotifications, setShowUserMenu]);

  useClickOutside(clickOutsideRefs, [setShowNotifications, setShowUserMenu]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, [setSidebarOpen]);

  const toggleUserMenu = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
  }, [setShowUserMenu]);

  return (
    <header className={`
      fixed top-0 w-full z-50 h-16 border-b shadow-sm 
      transition-all duration-300 bg-white border-slate-200
      ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
    `}>
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg transition-all duration-200 hover:bg-slate-100 text-slate-600"
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* User menu trigger */}
          <div className="relative">
            <button
              ref={userMenuButtonRef}
              onClick={toggleUserMenu}
              className="flex items-center gap-2 lg:gap-3 p-1.5 rounded-lg transition-all hover:bg-slate-100 text-slate-700"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <UserAvatar initials={initials} size="sm" />
              <div className="hidden lg:block text-left max-w-[160px]">
                <p className="text-sm font-medium truncate text-slate-800">
                  {displayName}
                </p>
                <p className="text-xs truncate text-slate-500">
                  {formattedRole}
                </p>
              </div>
              <ChevronDown 
                size={14} 
                className={`hidden lg:block transition-transform text-slate-500 ${showUserMenu ? 'rotate-180' : ''}`} 
              />
            </button>

            <UserMenuDropdown
              userInfo={userInfo}
              showUserMenu={showUserMenu}
              setShowUserMenu={setShowUserMenu}
              handleLogout={handleLogout}
              userMenuRef={userMenuRef}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);