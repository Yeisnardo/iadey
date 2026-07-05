// components/Sidebar.jsx - Con integración de API corregida
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FileCheck,
  ClipboardCheck,
  Handshake,
  FileSignature,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronLeft,
  Building,
  FileText,
  Landmark,
  LayoutDashboard,
  Users,
  FolderOpen,
  X,
  Banknote,
  Shield,
  Lock,
  Loader2
} from "lucide-react";
import permisosAPI from "../services/api_permisos";
import usuarioAPI from "../services/api_usuario";

const Sidebar = ({ sidebarOpen, setSidebarOpen, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Estados para permisos
  const [userPermissions, setUserPermissions] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState(null);

  // Estructura de menú con sus menu_item_id
  const menuItems = [
    { 
      id: "panel", 
      icon: LayoutDashboard, 
      text: "Panel General", 
      path: "/Dashboard", 
      section: "principal",
      menu_item_id: "dashboard",
      requiredPermission: "ver",
       public: true
    },
    { 
      id: "sol", 
      icon: FileCheck, 
      text: "Solicitud de Crédito", 
      path: "/Solicitud", 
      section: "operaciones",
      menu_item_id: "solicitudes",
      requiredPermission: "ver"
    },
    { 
      id: "exp", 
      icon: FolderOpen, 
      text: "Expediente", 
      path: "/Expediente", 
      section: "operaciones",
      menu_item_id: "expedientes",
      requiredPermission: "ver"
    },
    { 
      id: "ins", 
      icon: ClipboardCheck, 
      text: "Inspección", 
      path: "/Inspeccion", 
      section: "operaciones",
      menu_item_id: "inspecciones",
      requiredPermission: "ver"
    },
    { 
      id: "apr", 
      icon: Handshake, 
      text: "Aprobación", 
      path: "/aprobacion", 
      section: "operaciones",
      menu_item_id: "aprobaciones",
      requiredPermission: "ver"
    },
    { 
      id: "banc", 
      icon: Landmark, 
      text: "Crédito a Banco", 
      path: "/Bancarios", 
      section: "financiero",
      menu_item_id: "creditos_banco",
      requiredPermission: "ver"
    },
    { 
      id: "cont", 
      icon: FileSignature, 
      text: "Contrato", 
      path: "/Contrato", 
      section: "financiero",
      menu_item_id: "contratos",
      requiredPermission: "ver"
    },
    { 
      id: "des", 
      icon: Banknote, 
      text: "Desembolso", 
      path: "/Desembolso", 
      section: "financiero",
      menu_item_id: "desembolsos",
      requiredPermission: "ver"
    },
    { 
      id: "cuo", 
      icon: CreditCard, 
      text: "Pago de Cuota", 
      path: "/Cuota", 
      section: "financiero",
      menu_item_id: "pagos_cuota",
      requiredPermission: "ver"
    }
  ];

  const settingsSubItems = [
    { 
      id: "user", 
      icon: Users, 
      text: "Usuarios, roles y permisos", 
      path: "/Usuario",
      menu_item_id: "config_usuarios",
      requiredPermission: "ver"
    },
    { 
      id: "empr", 
      icon: Building, 
      text: "Emprendimientos", 
      path: "/Clasificacion_emprendimiento",
      menu_item_id: "config_emprendimientos",
      requiredPermission: "ver"
    },
    { 
      id: "roles", 
      icon: Users, 
      text: "Roles", 
      path: "/Roles",
      menu_item_id: "config_roles",
      requiredPermission: "ver"
    },
    { 
      id: "configCont", 
      icon: FileText, 
      text: "Contratos", 
      path: "/Configuracion_contrato",
      menu_item_id: "config_contratos",
      requiredPermission: "ver"
    },
    { 
      id: "req", 
      icon: FileText, 
      text: "Requisitos", 
      path: "/Configuracion_requisitos",
      menu_item_id: "config_requisitos",
      requiredPermission: "ver"
    }
  ];

  // Cargar permisos del usuario
  useEffect(() => {
    cargarPermisosUsuario();
  }, []);

  // Escuchar cambios de autenticación
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth change detected, reloading permissions...');
      cargarPermisosUsuario();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const cargarPermisosUsuario = async () => {
    try {
      setLoadingPermisos(true);
      setErrorPermisos(null);
      
      // Obtener usuario actual usando usuarioAPI
      const currentUser = usuarioAPI.getCurrentUser();
      
      console.log('Current user from localStorage:', currentUser);
      
      if (!currentUser) {
        console.warn('No se encontró usuario en localStorage');
        setLoadingPermisos(false);
        return;
      }

      // Obtener el ID del usuario (buscar en múltiples campos)
      const userId = currentUser.id || 
                     currentUser.id_usuario || 
                     localStorage.getItem('userId');
      
      console.log('User ID:', userId);
      
      if (!userId) {
        console.warn('No se encontró ID de usuario');
        setLoadingPermisos(false);
        return;
      }

      // Verificar si es administrador
      const userRole = currentUser.nombre_rol || 
                       currentUser.rol || 
                       localStorage.getItem('userRole');
      
      console.log('User role:', userRole);
      
      if (userRole === 'Administrador' || userRole === 'Admin') {
        console.log('Usuario administrador - acceso total');
        setIsAdmin(true);
        setUserPermissions({ all: ['*'] });
        setLoadingPermisos(false);
        return;
      }

      // Obtener permisos desde la API
      console.log('Obteniendo permisos para usuario ID:', userId);
      const response = await permisosAPI.getPermisosByUsuario(userId);
      
      console.log('Respuesta de permisos:', response);
      
      if (response.success && response.data) {
        const permisosMap = {};
        
        response.data.forEach(permiso => {
          console.log('Procesando permiso:', permiso);
          
          if (permiso.acciones === '*') {
            permisosMap[permiso.menu_item_id] = ['*'];
          } else {
            permisosMap[permiso.menu_item_id] = permiso.acciones
              .split(',')
              .map(a => a.trim());
          }
        });
        
        console.log('Permisos procesados:', permisosMap);
        setUserPermissions(permisosMap);
      } else {
        console.warn('No se pudieron obtener permisos:', response.error);
        setErrorPermisos(response.error || 'Error al cargar permisos');
      }
    } catch (error) {
      console.error('Error cargando permisos del usuario:', error);
      setErrorPermisos('Error al cargar permisos');
    } finally {
      setLoadingPermisos(false);
    }
  };

  // Verificar si un item debe mostrarse
  const hasPermission = (menuItemId, requiredPermission = 'ver', isPublic = false) => {
  // Si es público, siempre visible
  if (isPublic) return true;
  
  // Si es administrador, acceso total
  if (isAdmin) return true;
  
  // Si no hay permisos cargados, no mostrar
  if (!userPermissions || Object.keys(userPermissions).length === 0) return false;
  
  // Si tiene acceso total
  if (userPermissions.all && userPermissions.all.includes('*')) return true;
  
  // Obtener permisos para este menú
  const permisosMenu = userPermissions[menuItemId];
  
  // Si no hay permisos para este menú
  if (!permisosMenu) return false;
  
  // Si tiene acceso total a este menú
  if (permisosMenu.includes('*')) return true;
  
  // Verificar permiso específico
  return permisosMenu.includes(requiredPermission);
};

  // Filtrar items según permisos
  const filteredMenuItems = menuItems.filter(item => 
  item.public || hasPermission(item.menu_item_id, item.requiredPermission)
);

  const filteredSettingsSubItems = settingsSubItems.filter(item => 
    hasPermission(item.menu_item_id, item.requiredPermission)
  );

  const showSettings = filteredSettingsSubItems.length > 0;

  // Efectos de resize y ruta
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/configuracion") && sidebarOpen) {
      setSettingsOpen(true);
    }
  }, [location.pathname, sidebarOpen]);

  // Handlers
  const handleMenuItemClick = (item) => {
    navigate(item.path);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSettingsClick = () => {
    if (sidebarOpen) {
      setSettingsOpen(!settingsOpen);
    } else {
      setSidebarOpen(true);
      setSettingsOpen(true);
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogoClick = () => {
    navigate("/");
    if (isMobile) setSidebarOpen(false);
  };

  // Utilidades de renderizado
  const isItemActive = (itemPath) => {
    if (itemPath === "/") return location.pathname === "/";
    return location.pathname === itemPath;
  };

  const isSettingsActive = () => {
    return filteredSettingsSubItems.some(item => location.pathname === item.path);
  };

  const getSectionTitle = (section) => {
    const titles = {
      principal: "PRINCIPAL",
      operaciones: "OPERACIONES",
      financiero: "GESTIÓN FINANCIERA"
    };
    return titles[section];
  };

  // Estilos
  const sidebarStyles = darkMode
    ? "bg-gray-900 border-gray-800 text-gray-300"
    : "bg-white border-gray-200 text-gray-600";

  const itemActiveStyles = darkMode
    ? "bg-gray-800 text-white"
    : "bg-gray-100 text-gray-900";

  const itemHoverStyles = darkMode
    ? "hover:bg-gray-800 hover:text-gray-200"
    : "hover:bg-gray-50 hover:text-gray-800";

  // Estado de carga
  if (loadingPermisos) {
    return (
      <aside className={`fixed left-0 top-0 h-full z-50 border-r ${sidebarStyles} ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-200 flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
          {sidebarOpen && (
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Cargando menú...
            </span>
          )}
        </div>
      </aside>
    );
  }

  // Si no hay permisos y no es admin
  if (!isAdmin && Object.keys(userPermissions).length === 0 && !loadingPermisos) {
    return (
      <aside className={`fixed left-0 top-0 h-full z-50 border-r ${sidebarStyles} ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-200`}>
        <div className="h-full flex flex-col items-center justify-center p-4">
          <Lock size={32} className={`mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
          {sidebarOpen && (
            <div className="text-center">
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sin permisos
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Contacta al administrador
              </p>
              {errorPermisos && (
                <p className="text-xs text-red-500 mt-2">{errorPermisos}</p>
              )}
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed left-0 top-0 h-full z-50
          border-r
          ${sidebarStyles}
          ${sidebarOpen ? "w-64" : "w-20"}
          ${isMobile 
            ? sidebarOpen ? "translate-x-0" : "-translate-x-full"
            : "translate-x-0"
          }
          transition-transform duration-200 ease-out
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button onClick={handleLogoClick} className="flex-1 h-full flex items-center px-4">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">I</span>
                </div>
                <div>
                  <span className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    IADEY
                  </span>
                  <span className={`text-[10px] block leading-tight ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Créditos
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center mx-auto">
                <span className="text-white font-semibold text-sm">I</span>
              </div>
            )}
          </button>

          {isMobile && sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className={`mr-3 p-1 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Indicador de rol */}
        {sidebarOpen && (
          <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <Shield size={14} className={isAdmin ? 'text-green-500' : 'text-indigo-500'} />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isAdmin ? 'Administrador' : 'Usuario'}
              </span>
              {isAdmin && (
                <span className="text-[10px] text-green-500 ml-auto">Acceso total</span>
              )}
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-3">
          {sidebarOpen ? (
            /* Modo expandido */
            <>
              {['principal', 'operaciones', 'financiero'].map((section) => {
                const sectionItems = filteredMenuItems.filter(item => item.section === section);
                if (sectionItems.length === 0) return null;
                
                return (
                  <div key={section} className="mb-4">
                    <div className={`px-2 mb-2 text-[10px] font-semibold tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {getSectionTitle(section)}
                    </div>
                    {sectionItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuItemClick(item)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 mb-0.5 rounded
                          text-sm transition-colors duration-150
                          ${isItemActive(item.path) ? itemActiveStyles : ''}
                          ${!isItemActive(item.path) ? itemHoverStyles : ''}
                        `}
                      >
                        <item.icon size={18} className="flex-shrink-0" />
                        <span className="flex-1 text-left">{item.text}</span>
                      </button>
                    ))}
                  </div>
                );
              })}

              {showSettings && (
                <>
                  <div className={`my-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} />
                  <div>
                    <div className={`px-2 mb-2 text-[10px] font-semibold tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      SISTEMA
                    </div>
                    <button
                      onClick={handleSettingsClick}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors duration-150
                        ${isSettingsActive() ? itemActiveStyles : ''}
                        ${!isSettingsActive() ? itemHoverStyles : ''}
                      `}
                    >
                      <Settings size={18} className="flex-shrink-0" />
                      <span className="flex-1 text-left">Configuración</span>
                      <ChevronDown 
                        size={14} 
                        className={`transition-transform duration-150 ${settingsOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {settingsOpen && (
                      <div className="ml-4 mt-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                        {filteredSettingsSubItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubItemClick(subItem)}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-1.5 rounded text-sm
                              transition-colors duration-150
                              ${location.pathname === subItem.path
                                ? (darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900')
                                : (darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700')
                              }
                            `}
                          >
                            <subItem.icon size={14} className="flex-shrink-0" />
                            <span>{subItem.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Modo colapsado */
            <>
              {filteredMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className={`
                    w-full flex justify-center p-2.5 mb-0.5 rounded
                    transition-colors duration-150
                    ${isItemActive(item.path) ? itemActiveStyles : ''}
                    ${!isItemActive(item.path) ? itemHoverStyles : ''}
                  `}
                  title={item.text}
                >
                  <item.icon size={20} />
                </button>
              ))}

              {showSettings && (
                <>
                  <div className={`my-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} />
                  <button
                    onClick={handleSettingsClick}
                    className={`
                      w-full flex justify-center p-2.5 rounded transition-colors duration-150
                      ${isSettingsActive() ? itemActiveStyles : ''}
                      ${!isSettingsActive() ? itemHoverStyles : ''}
                    `}
                    title="Configuración"
                  >
                    <Settings size={20} />
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        {/* Botón colapsar - Desktop */}
        {!isMobile && (
          <div className={`p-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`
                w-full flex justify-center p-2 rounded transition-colors duration-150
                ${darkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}
              `}
            >
              <ChevronLeft size={16} className={`transition-transform duration-200 ${!sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;