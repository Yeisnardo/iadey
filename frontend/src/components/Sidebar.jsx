// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  FileSearch, 
  Briefcase,
  FileCheck,
  ClipboardCheck,
  Handshake,
  FileSignature,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronLeft,
  UserPlus,
  Building,
  FileText,
  Landmark,
  LayoutDashboard,
  DollarSign,
  Users,
  FolderOpen,
  X
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };

    // Verificar estado inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar al cambiar de ruta en móvil
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

  const menuItems = [
    { 
      id: "overview", 
      icon: LayoutDashboard, 
      text: "Panel General", 
      path: "/Dashboard",
      section: "principal"
    },
    { 
      id: "credit-request", 
      icon: FileCheck, 
      text: "Solicitud de Crédito", 
      path: "/Solicitud",
      section: "operaciones"
    },
    { 
      id: "entrepreneur-file", 
      icon: FolderOpen, 
      text: "Expediente", 
      path: "/Expediente",
      section: "operaciones"
    },
    { 
      id: "inspection", 
      icon: ClipboardCheck, 
      text: "Inspección", 
      path: "/Inspeccion",
      section: "operaciones"
    },
    { 
      id: "approval", 
      icon: Handshake, 
      text: "Aprobación", 
      path: "/aprobacion",
      section: "operaciones"
    },
    { 
      id: "banck", 
      icon: Landmark, 
      text: "Crédito a Banco", 
      path: "/Bancarios",
      section: "financiero"
    },
    { 
      id: "contract", 
      icon: FileSignature, 
      text: "Contrato", 
      path: "/Contrato",
      section: "financiero"
    },
    { 
      id: "disbursement", 
      icon: DollarSign, 
      text: "Desembolso", 
      path: "/desembolso",
      section: "financiero"
    },
    { 
      id: "payment", 
      icon: CreditCard, 
      text: "Pago de Cuota", 
      path: "/pago",
      section: "financiero"
    },
    { 
      id: "portfolio", 
      icon: FileSearch, 
      text: "Cartera de Créditos", 
      path: "/Cartera",
      section: "financiero"
    }
  ];

  const settingsSubItems = [
    { id: "users", icon: Users, text: "Usuarios", path: "/Usuario" },
    { id: "entrepreneurships", icon: Building, text: "Emprendimientos", path: "/Clasificacion_emprendimiento" },
    { id: "contract-params", icon: FileText, text: "Contratos", path: "/Configuracion_contrato" },
    { id: "requirements", icon: FileText, text: "Requisitos", path: "/Configuracion_requisitos" }
  ];

  const handleMenuItemClick = (item) => {
    navigate(item.path);
    // Cerrar sidebar en móvil después de navegar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    if (sidebarOpen) {
      setSettingsOpen(!settingsOpen);
    } else {
      setSidebarOpen(true);
      setSettingsOpen(true);
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
    // Cerrar sidebar en móvil después de navegar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    // Cerrar sidebar en móvil después de navegar
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const isItemActive = (itemPath) => {
    if (itemPath === "/") return location.pathname === "/";
    return location.pathname.startsWith(itemPath);
  };

  const isSettingsActive = () => {
    return settingsSubItems.some(item => location.pathname === item.path);
  };

  const getSectionTitle = (section) => {
    const titles = {
      principal: "Principal",
      operaciones: "Operaciones",
      financiero: "Gestión Financiera"
    };
    return titles[section];
  };

  return (
    <>
      {/* Overlay para móvil - solo se muestra cuando sidebar está abierto */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={handleCloseSidebar}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out
          border-r shadow-xl
          ${darkMode 
            ? "bg-slate-900 border-slate-800 text-slate-300" 
            : "bg-white border-slate-200 text-slate-600"
          }
          ${sidebarOpen ? "w-64" : "w-20"}
          ${isMobile 
            ? sidebarOpen 
              ? "translate-x-0" // Abierto en móvil
              : "-translate-x-full" // Cerrado en móvil (fuera de pantalla)
            : "translate-x-0" // Siempre visible en desktop
          }
          overflow-hidden
        `}
        aria-label="Menú principal"
        aria-hidden={isMobile && !sidebarOpen}
      >
        {/* Logo section */}
        <div className={`
          h-16 flex items-center justify-between border-b
          ${darkMode ? 'border-slate-800' : 'border-slate-200'}
        `}>
          <button
            onClick={handleLogoClick}
            className="flex-1 h-full flex items-center px-4 hover:opacity-80 transition-opacity"
            aria-label="Ir al inicio"
          >
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <div className={`
                  w-9 h-9 rounded-md flex items-center justify-center
                  ${darkMode ? 'bg-slate-700' : 'bg-slate-800'}
                `}>
                  <span className="text-white font-semibold text-lg">I</span>
                </div>
                <div className="flex flex-col">
                  <span className={`text-lg font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    IADEY
                  </span>
                  <span className={`text-[10px] leading-tight ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Sistema de Créditos
                  </span>
                </div>
              </div>
            ) : (
              <div className={`
                w-9 h-9 rounded-md flex items-center justify-center mx-auto
                ${darkMode ? 'bg-slate-700' : 'bg-slate-800'}
              `}>
                <span className="text-white font-semibold text-lg">I</span>
              </div>
            )}
          </button>

          {/* Botón de cerrar en móvil */}
          {isMobile && sidebarOpen && (
            <button
              onClick={handleCloseSidebar}
              className={`
                mr-2 p-2 rounded-md transition-all duration-150
                ${darkMode 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' 
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                }
              `}
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 overflow-y-auto h-[calc(100%-4rem)] scrollbar-thin">
          {/* Versión expandida (sidebar abierto) */}
          {sidebarOpen ? (
            <>
              {['principal', 'operaciones', 'financiero'].map((section) => {
                const sectionItems = menuItems.filter(item => item.section === section);
                if (sectionItems.length === 0) return null;
                
                return (
                  <div key={section} className="mb-4">
                    <div className={`
                      px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider
                      ${darkMode ? 'text-slate-500' : 'text-slate-400'}
                    `}>
                      {getSectionTitle(section)}
                    </div>
                    {sectionItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuItemClick(item)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 mb-0.5 rounded-md transition-all duration-150
                          text-sm group
                          ${isItemActive(item.path)
                            ? `${darkMode 
                                ? 'bg-slate-800 text-slate-100' 
                                : 'bg-slate-100 text-slate-900'
                              } font-medium`
                            : `${darkMode 
                                ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              }`
                          }
                        `}
                        aria-label={item.text}
                        aria-current={isItemActive(item.path) ? "page" : undefined}
                      >
                        <item.icon 
                          size={18} 
                          className={`flex-shrink-0 ${isItemActive(item.path) ? 'opacity-100' : 'opacity-70'}`} 
                        />
                        <span className="flex-1 text-left">{item.text}</span>
                        {isItemActive(item.path) && (
                          <span className={`
                            w-1 h-1 rounded-full flex-shrink-0
                            ${darkMode ? 'bg-slate-400' : 'bg-slate-500'}
                          `} />
                        )}
                      </button>
                    ))}
                  </div>
                );
              })}

              {/* Separador */}
              <div className={`my-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />

              {/* Configuración */}
              <div>
                <div className={`
                  px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider
                  ${darkMode ? 'text-slate-500' : 'text-slate-400'}
                `}>
                  Sistema
                </div>
                <button
                  onClick={handleSettingsClick}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150
                    text-sm group
                    ${isSettingsActive()
                      ? `${darkMode 
                          ? 'bg-slate-800 text-slate-100' 
                          : 'bg-slate-100 text-slate-900'
                        } font-medium`
                      : `${darkMode 
                          ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`
                    }
                  `}
                  aria-label="Configuración"
                  aria-expanded={settingsOpen}
                  aria-haspopup="true"
                >
                  <Settings size={18} className={`flex-shrink-0 ${isSettingsActive() ? 'opacity-100' : 'opacity-70'}`} />
                  <span className="flex-1 text-left">Configuración</span>
                  <ChevronDown 
                    size={14} 
                    className={`
                      transition-transform duration-200 flex-shrink-0
                      ${settingsOpen ? 'rotate-180' : ''}
                      ${darkMode ? 'text-slate-600' : 'text-slate-400'}
                    `} 
                  />
                </button>

                {/* Submenu */}
                {settingsOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    {settingsSubItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(subItem)}
                        className={`
                          w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-150 text-sm
                          ${location.pathname === subItem.path
                            ? `${darkMode 
                                ? 'bg-slate-800/50 text-slate-200' 
                                : 'bg-slate-50 text-slate-800'
                              } font-medium`
                            : `${darkMode 
                                ? 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                              }`
                          }
                        `}
                        role="menuitem"
                        aria-current={location.pathname === subItem.path ? "page" : undefined}
                      >
                        <subItem.icon 
                          size={14} 
                          className={`flex-shrink-0 ${location.pathname === subItem.path ? 'opacity-100' : 'opacity-60'}`}
                        />
                        <span className="flex-1 text-left text-[13px]">{subItem.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Versión colapsada (sidebar cerrado en desktop) */
            <>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center justify-center p-2.5 mb-0.5 rounded-md transition-all duration-150
                    group relative
                    ${isItemActive(item.path)
                      ? `${darkMode 
                          ? 'bg-slate-800 text-slate-100' 
                          : 'bg-slate-100 text-slate-900'
                        }`
                      : `${darkMode 
                          ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300' 
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                        }`
                    }
                  `}
                  title={item.text}
                  aria-label={item.text}
                  aria-current={isItemActive(item.path) ? "page" : undefined}
                >
                  <item.icon size={20} className={isItemActive(item.path) ? 'opacity-100' : 'opacity-70'} />
                  
                  {/* Tooltip */}
                  {hoveredItem === item.id && (
                    <div className={`
                      absolute left-full ml-3 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
                      ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'}
                      shadow-lg border ${darkMode ? 'border-slate-700' : 'border-slate-200'}
                      z-50
                    `}>
                      {item.text}
                      <div className={`
                        absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2
                        w-2 h-2 rotate-45
                        ${darkMode ? 'bg-slate-800 border-l border-t border-slate-700' : 'bg-white border-l border-t border-slate-200'}
                      `} />
                    </div>
                  )}
                </button>
              ))}

              {/* Separador colapsado */}
              <div className={`my-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />

              {/* Configuración colapsado */}
              <div>
                <button
                  onClick={handleSettingsClick}
                  onMouseEnter={() => setHoveredItem('settings')}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center justify-center p-2.5 rounded-md transition-all duration-150
                    group relative
                    ${isSettingsActive()
                      ? `${darkMode 
                          ? 'bg-slate-800 text-slate-100' 
                          : 'bg-slate-100 text-slate-900'
                        }`
                      : `${darkMode 
                          ? 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300' 
                          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                        }`
                    }
                  `}
                  title="Configuración"
                  aria-label="Configuración"
                >
                  <Settings size={20} className={isSettingsActive() ? 'opacity-100' : 'opacity-70'} />
                  
                  {/* Tooltip */}
                  {hoveredItem === 'settings' && (
                    <div className={`
                      absolute left-full ml-3 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap
                      ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800'}
                      shadow-lg border ${darkMode ? 'border-slate-700' : 'border-slate-200'}
                      z-50
                    `}>
                      Configuración
                      <div className={`
                        absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2
                        w-2 h-2 rotate-45
                        ${darkMode ? 'bg-slate-800 border-l border-t border-slate-700' : 'bg-white border-l border-t border-slate-200'}
                      `} />
                    </div>
                  )}
                </button>
              </div>
            </>
          )}
        </nav>

        {/* Botón de colapso en desktop - oculto en móvil */}
        {!isMobile && (
          <div className={`
            absolute bottom-0 left-0 right-0 p-3 border-t
            ${darkMode ? 'border-slate-800' : 'border-slate-200'}
          `}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`
                w-full flex items-center justify-center p-2 rounded-md transition-all duration-200
                ${darkMode 
                  ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }
              `}
              aria-label={sidebarOpen ? "Colapsar menú" : "Expandir menú"}
            >
              <ChevronLeft 
                size={16} 
                className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;