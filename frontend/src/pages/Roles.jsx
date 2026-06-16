// pages/Roles.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit,
  Trash2,
  Save,
  X,
  Search
} from "lucide-react";

// Mantenemos los componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import rolAPI from "../services/api_rol";

const Roles = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Estados para la gestión de roles
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombre_rol: "",
    descripcion: ""
  });

  // Datos del usuario y notificaciones
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nuevo rol agregado", time: "5 min", read: false },
    { id: 2, text: "Rol actualizado correctamente", time: "1 hora", read: false },
  ]);

  const user = {
    name: "Analista IADEY",
    email: "analista@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Dirección de Fomento"
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarRoles();
  }, []);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notifications-menu') && !e.target.closest('.user-menu')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Función para cargar roles desde la API
  const cargarRoles = async () => {
    setLoading(true);
    try {
      const response = await rolAPI.getAllRoles();
      if (response.success) {
        setRoles(response.data);
      } else {
        console.error('Error al cargar roles:', response.error);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error en cargarRoles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear o actualizar rol
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre_rol || formData.nombre_rol.trim() === '') {
      alert('El nombre del rol es obligatorio');
      return;
    }

    try {
      if (editingId) {
        // Actualizar existente
        const response = await rolAPI.updateRol(editingId, formData);
        if (response.success) {
          await cargarRoles(); // Recargar la lista
          setNotifications([{
            id: Date.now(),
            text: `Rol "${formData.nombre_rol}" actualizado`,
            time: "ahora",
            read: false
          }, ...notifications]);
        } else {
          console.error('Error al actualizar:', response.error);
          alert(response.error || 'Error al actualizar el rol');
        }
      } else {
        // Crear nuevo
        const response = await rolAPI.createRol(formData);
        if (response.success) {
          await cargarRoles(); // Recargar la lista
          setNotifications([{
            id: Date.now(),
            text: `Nuevo rol "${formData.nombre_rol}" creado`,
            time: "ahora",
            read: false
          }, ...notifications]);
        } else {
          console.error('Error al crear:', response.error);
          alert(response.error || 'Error al crear el rol');
        }
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert(error.error || 'Error al procesar la solicitud');
    } finally {
      // Limpiar formulario
      setFormData({ nombre_rol: "", descripcion: "" });
      setEditingId(null);
    }
  };

  // Función para editar un rol
  const handleEdit = (rol) => {
    setEditingId(rol.id_rol);
    setFormData({
      nombre_rol: rol.nombre_rol,
      descripcion: rol.descripcion || ""
    });
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para eliminar un rol
  const handleDelete = async (id, nombre_rol) => {
    if (window.confirm(`¿Estás seguro de eliminar el rol "${nombre_rol}"?`)) {
      try {
        const response = await rolAPI.deleteRol(id);
        if (response.success) {
          await cargarRoles(); // Recargar la lista
          setNotifications([{
            id: Date.now(),
            text: `Rol "${nombre_rol}" eliminado`,
            time: "ahora",
            read: false
          }, ...notifications]);
        } else {
          console.error('Error al eliminar:', response.error);
          alert(response.error || 'Error al eliminar el rol');
        }
      } catch (error) {
        console.error('Error en handleDelete:', error);
        alert(error.error || 'Error al eliminar el rol');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ nombre_rol: "", descripcion: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Filtrar roles por búsqueda
  const filteredRoles = roles.filter(rol => 
    searchTerm === '' || 
    rol.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rol.descripcion && rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        user={user}
        handleLogout={handleLogout}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
      />

      <div className="flex flex-1">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="p-4 md:p-6 mt-16">
            {/* Título de la sección */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Gestión de Roles
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Administración de roles para el sistema
              </p>
            </div>

            {/* Estadísticas simples */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Roles</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {roles.length}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Última actualización</p>
                <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {roles.length > 0 ? formatDate(roles[0].updated_at || roles[0].created_at) : 'Sin datos'}
                </p>
              </div>
            </div>

            {/* Formulario */}
            <div className={`rounded-lg shadow-md p-6 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                {editingId ? "Editar Rol" : "Nuevo Rol"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre del Rol */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Rol *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre_rol}
                      onChange={(e) => setFormData({...formData, nombre_rol: e.target.value})}
                      className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="Ej: Administrador, Usuario, Analista"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={formData.descripcion || ""}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      placeholder="Descripción del rol (opcional)"
                    />
                  </div>
                </div>

                {/* Botones del formulario */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingId ? (
                      <>
                        <Save size={18} />
                        Actualizar
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Agregar
                      </>
                    )}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <X size={18} />
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full sm:w-96 pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Tabla de Roles */}
            <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Fecha Creación
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Cargando...
                          </div>
                        </td>
                      </tr>
                    ) : filteredRoles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {searchTerm ? 'No se encontraron resultados' : 'No hay roles registrados'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRoles.map((rol) => (
                        <tr key={rol.id_rol} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            #{rol.id_rol}
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
                              {rol.nombre_rol}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {rol.descripcion || 'Sin descripción'}
                          </td>
                          <td className={`px-6 py-4 text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {formatDate(rol.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(rol)}
                                className={`p-1 rounded transition-colors ${
                                  darkMode 
                                    ? 'text-blue-400 hover:bg-gray-600' 
                                    : 'text-blue-600 hover:bg-blue-50'
                                }`}
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(rol.id_rol, rol.nombre_rol)}
                                className={`p-1 rounded transition-colors ${
                                  darkMode 
                                    ? 'text-red-400 hover:bg-gray-600' 
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default Roles;