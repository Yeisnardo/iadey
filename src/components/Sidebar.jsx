// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home,
  FileSearch , 
  Briefcase,
  FileCheck,
  ClipboardCheck,
  Handshake,
  FileSignature,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Building,
  FileText,
  Landmark 
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Abrir submenú de configuración si estamos en una ruta de configuración
  useEffect(() => {
    if (location.pathname.startsWith("/configuracion") && sidebarOpen) {
      setSettingsOpen(true);
    }
  }, [location.pathname, sidebarOpen]);

  // Configuración de items del menú principal
  const menuItems = [
    { id: "overview", icon: Home, text: "Inicio", path: "/Dashboard" },
    { id: "credit-request", icon: FileCheck , text: "Solicitud de crédito", path: "/Solicitud" },
    { id: "entrepreneur-file", icon: Briefcase, text: "Expediente de emprendedor", path: "/Expediente" },
    { id: "inspection", icon: ClipboardCheck, text: "Inspección de emprendimiento", path: "/Inspeccion" },
    { id: "approval", icon: Handshake, text: "Aprobación solicitud de crédito", path: "/aprobacion" },
    { id: "contract", icon: FileSignature, text: "Gestión de contrato", path: "/contrato" },
    { id: "disbursement", icon: CreditCard, text: "Desembolso y cuota", path: "/desembolso" },
    { id: "payment", icon: Landmark , text: "Pago de cuota", path: "/pago" },
    { id: "credit-request", icon: FileSearch , text: "Cartera", path: "/Cartera" }
  ];

  // Subopciones de configuración
  const settingsSubItems = [
    { id: "users", icon: UserPlus, text: "Registrar usuario", path: "/Usuario" },
    { id: "entrepreneurships", icon: Building, text: "Emprendimientos", path: "/Clasificacion_emprendimiento" },
    { id: "contract-params", icon: FileText, text: "Parametrización de contrato", path: "/Configuracion_contrato" }
  ];

  // Manejadores de eventos
  const handleMenuItemClick = (item) => {
    navigate(item.path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    
    if (sidebarOpen) {
      // SOLO alternar el submenú, sin redireccionar
      setSettingsOpen(!settingsOpen);
    } else {
      // Si el sidebar está cerrado, lo abrimos y también abrimos el submenú
      setSidebarOpen(true);
      setSettingsOpen(true);
    }
  };

  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Utilidades de estilos
  const isItemActive = (itemPath) => {
    if (itemPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(itemPath);
  };

  const getMenuItemClasses = (itemPath, isSettings = false) => {
    const isActive = isSettings ? location.pathname.startsWith("/configuracion") : isItemActive(itemPath);
    
    const baseClasses = "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer";
    const activeClasses = "bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white shadow-md";
    const inactiveClasses = darkMode
      ? "text-gray-400 hover:bg-gray-700 hover:text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    
    const justifyClass = !sidebarOpen ? "justify-center" : "";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${justifyClass}`;
  };

  const getSubItemClasses = (subItemPath) => {
    const isActive = location.pathname === subItemPath;
    
    const baseClasses = "w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm cursor-pointer";
    const activeClasses = "bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white shadow-md";
    const inactiveClasses = darkMode
      ? "text-gray-400 hover:bg-gray-700 hover:text-white"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-full z-50 transition-all duration-300 
          border-r overflow-y-auto overflow-x-hidden
          ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}
          ${sidebarOpen ? "w-64" : "w-20"}
          ${isMobile ? "shadow-xl" : ""}
        `}
        aria-label="Menú principal"
      >
        {/* Logo */}
        <div 
          className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          aria-label="Ir al inicio"
        >
          {sidebarOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-transparent bg-clip-text">
              IADEY
            </span>
          ) : (
            <span className="text-xl font-bold text-[#2A9D8F] mx-auto">
              I
            </span>
          )}
        </div>

        {/* Menú de navegación */}
        <nav className="p-4 space-y-1" aria-label="Navegación">
          {/* Items principales */}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item)}
              className={getMenuItemClasses(item.path)}
              title={!sidebarOpen ? item.text : ""}
              aria-label={item.text}
              aria-current={isItemActive(item.path) ? "page" : undefined}
            >
              <item.icon size={20} aria-hidden="true" />
              {sidebarOpen && (
                <span className="text-sm font-medium flex-1 text-left">
                  {item.text}
                </span>
              )}
            </button>
          ))}

          {/* Separador */}
          {sidebarOpen && (
            <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
          )}

          {/* Configuración con submenú */}
          <div>
            <button
              onClick={handleSettingsClick}
              className={getMenuItemClasses("/configuracion", true)}
              title={!sidebarOpen ? "Configuración" : ""}
              aria-label="Configuración"
              aria-expanded={settingsOpen}
              aria-haspopup="true"
            >
              <Settings size={20} aria-hidden="true" />
              {sidebarOpen && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">
                    Configuración
                  </span>
                  {settingsOpen ? (
                    <ChevronUp size={16} className="text-gray-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" aria-hidden="true" />
                  )}
                </>
              )}
            </button>

            {/* Submenú de configuración */}
            {sidebarOpen && settingsOpen && (
              <div 
                className="ml-8 mt-1 space-y-1 animate-slideDown"
                role="menu"
                aria-label="Submenú de configuración"
              >
                {settingsSubItems.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => handleSubItemClick(subItem)}
                    className={getSubItemClasses(subItem.path)}
                    role="menuitem"
                    aria-current={location.pathname === subItem.path ? "page" : undefined}
                  >
                    <subItem.icon size={16} aria-hidden="true" />
                    <span className="text-sm flex-1 text-left">
                      {subItem.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;