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
  X,
  Banknote  // Added for desembolso
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

  const menuItems = [
    { id: "overview", icon: LayoutDashboard, text: "Panel General", path: "/Dashboard", section: "principal" },
    { id: "credit-request", icon: FileCheck, text: "Solicitud de Crédito", path: "/Solicitud", section: "operaciones" },
    { id: "entrepreneur-file", icon: FolderOpen, text: "Expediente", path: "/Expediente", section: "operaciones" },
    { id: "inspection", icon: ClipboardCheck, text: "Inspección", path: "/Inspeccion", section: "operaciones" },
    { id: "approval", icon: Handshake, text: "Aprobación", path: "/aprobacion", section: "operaciones" },
    { id: "banck", icon: Landmark, text: "Crédito a Banco", path: "/Bancarios", section: "financiero" },
    
    { id: "contract", icon: FileSignature, text: "Contrato", path: "/Contrato", section: "financiero" },
    { id: "disbursement", icon: Banknote, text: "Desembolso", path: "/Desembolso", section: "financiero" },
    { id: "payment", icon: CreditCard, text: "Pago de Cuota", path: "/Cuota", section: "financiero" }
  ];

  const settingsSubItems = [
    { id: "users", icon: Users, text: "Usuarios, roles y permisos", path: "/Usuario" },
    { id: "entrepreneurships", icon: Building, text: "Emprendimientos", path: "/Clasificacion_emprendimiento" },
    { id: "contract-params", icon: FileText, text: "Contratos", path: "/Configuracion_contrato" },
    { id: "requirements", icon: FileText, text: "Requisitos", path: "/Configuracion_requisitos" }
  ];

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

  const isItemActive = (itemPath) => {
    if (itemPath === "/") return location.pathname === "/";
    return location.pathname === itemPath;
  };

  const isSettingsActive = () => {
    return settingsSubItems.some(item => location.pathname === item.path);
  };

  const getSectionTitle = (section) => {
    const titles = {
      principal: "PRINCIPAL",
      operaciones: "OPERACIONES",
      financiero: "GESTIÓN FINANCIERA"
    };
    return titles[section];
  };

  const sidebarStyles = darkMode
    ? "bg-gray-900 border-gray-800 text-gray-300"
    : "bg-white border-gray-200 text-gray-600";

  const itemActiveStyles = darkMode
    ? "bg-gray-800 text-white"
    : "bg-gray-100 text-gray-900";

  const itemHoverStyles = darkMode
    ? "hover:bg-gray-800 hover:text-gray-200"
    : "hover:bg-gray-50 hover:text-gray-800";

  return (
    <>
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
          <button
            onClick={handleLogoClick}
            className="flex-1 h-full flex items-center px-4"
          >
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

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {sidebarOpen ? (
            /* Expanded mode */
            <>
              {['principal', 'operaciones', 'financiero'].map((section) => {
                const sectionItems = menuItems.filter(item => item.section === section);
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

              <div className={`my-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`} />

              {/* Settings */}
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
                    {settingsSubItems.map((subItem) => (
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
          ) : (
            /* Collapsed mode */
            <>
              {menuItems.map((item) => (
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
        </nav>

        {/* Collapse button - Desktop only */}
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