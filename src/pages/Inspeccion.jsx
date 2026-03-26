// pages/InspeccionRealizada.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Building,
  FileText,
  Star,
  Eye,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  Home,
  Users,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Camera,
  FileSignature,
  X,
  Save,
  ClipboardList
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

// ============================================
// COMPONENTE MODAL DEL FORMULARIO DE INSPECCIÓN
// ============================================
const InspectionFormModal = ({ isOpen, onClose, darkMode, onSubmit, emprendimientoData = null }) => {
  const [formData, setFormData] = useState({
    // 1. IDENTIFICACION DEL EMPRENDIMIENTO
    nombresApellidos: "",
    ci: "",
    nacionalidad: "",
    edad: "",
    actividad: "",
    añosExperiencia: "",
    direccionHabitacion: "",
    direccionUnidadProduccion: "",
    municipio: "",
    localidad: "",
    telefono: "",
    
    // 2. ESTUDIO DEL MERCADO
    descripcionProducto: "",
    descripcionProcesoProductivo: "",
    usuariosProduccion: "",
    volumenProduccion: [],
    ventasEstimadas: [],
    materiaPrima: [],
    
    // 3. ASPECTOS TECNICOS
    localDescripcion: "",
    tenenciaLocal: "propio",
    alquilerBs: "",
    maquinariaPosee: [],
    maquinariaSolicita: [],
    recursoHumano: { empleados: 0, obreros: 0, salarioEmpleados: 0, salarioObreros: 0 },
    serviciosBasicos: {
      electricidad: false,
      agua: false,
      telefono: false,
      aseoUrbano: false,
      cloacas: false,
      gas: false
    },
    
    // 4. GASTOS MENSUALES
    gastosMensuales: {
      manoObra: { actual: 0, futuro: 0 },
      materiaPrima: { actual: 0, futuro: 0 },
      serviciosBasicos: { actual: 0, futuro: 0 },
      alquiler: { actual: 0, futuro: 0 },
      otros: { actual: 0, futuro: 0 }
    },
    
    // 5. PLAN DE INVERSION
    planInversion: {
      construccion: { aportesPropios: 0, montoSolicitado: 0 },
      maquinariaEquipo: { aportesPropios: 0, montoSolicitado: 0 },
      materiaPrima: { aportesPropios: 0, montoSolicitado: 0 },
      manoObra: { aportesPropios: 0, montoSolicitado: 0 },
      otrosGastos: { aportesPropios: 0, montoSolicitado: 0 }
    },
    
    // 6-8. COMUNIDAD Y GARANTIA
    organizacionComunidad: "",
    necesidadesComunidad: "",
    realizaAporte: false,
    descripcionAporte: "",
    garantiaOfrecida: "fianza"
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Cargar datos del emprendimiento si se proporciona
  useEffect(() => {
    if (emprendimientoData) {
      setFormData(prev => ({
        ...prev,
        nombresApellidos: emprendimientoData.emprendedor || "",
        actividad: emprendimientoData.actividad || "",
        direccionUnidadProduccion: emprendimientoData.direccion || "",
        telefono: emprendimientoData.telefono || "",
      }));
    }
  }, [emprendimientoData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (section, field, subField, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          [subField]: value
        }
      }
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`relative w-full max-w-6xl rounded-xl shadow-xl ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } max-h-[90vh] overflow-y-auto`}>
          
          {/* Header del Modal */}
          <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Planilla de Inspección - IADEY
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Formulario de inspección de emprendimiento
                  {emprendimientoData && ` - ${emprendimientoData.emprendimiento}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </button>
            </div>
            
            {/* Stepper */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <React.Fragment key={step}>
                  <button
                    onClick={() => setCurrentStep(step)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      currentStep >= step
                        ? 'bg-[#2A9D8F] text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </button>
                  {step < totalSteps && (
                    <div className={`flex-1 h-0.5 ${
                      currentStep > step
                        ? 'bg-[#2A9D8F]'
                        : darkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Identificación y Estudio de Mercado */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  1. IDENTIFICACION DEL EMPRENDIMIENTO
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombres y Apellidos *
                    </label>
                    <input
                      type="text"
                      name="nombresApellidos"
                      value={formData.nombresApellidos}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      C.I. *
                    </label>
                    <input
                      type="text"
                      name="ci"
                      value={formData.ci}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nacionalidad
                    </label>
                    <select
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    >
                      <option value="">Seleccionar</option>
                      <option value="Venezolana">Venezolana</option>
                      <option value="Extranjera">Extranjera</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Edad
                    </label>
                    <input
                      type="number"
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Actividad
                    </label>
                    <input
                      type="text"
                      name="actividad"
                      value={formData.actividad}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Años de Experiencia
                    </label>
                    <input
                      type="number"
                      name="añosExperiencia"
                      value={formData.añosExperiencia}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dirección de habitación
                    </label>
                    <textarea
                      name="direccionHabitacion"
                      value={formData.direccionHabitacion}
                      onChange={handleChange}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dirección de la Unidad de Producción
                    </label>
                    <textarea
                      name="direccionUnidadProduccion"
                      value={formData.direccionUnidadProduccion}
                      onChange={handleChange}
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Municipio
                    </label>
                    <input
                      type="text"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Localidad
                    </label>
                    <input
                      type="text"
                      name="localidad"
                      value={formData.localidad}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    2. ESTUDIO DEL MERCADO
                  </h3>
                  
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descripción del Producto o Servicio
                      </label>
                      <textarea
                        name="descripcionProducto"
                        value={formData.descripcionProducto}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Descripción del Proceso Productivo (Tecnología)
                      </label>
                      <textarea
                        name="descripcionProcesoProductivo"
                        value={formData.descripcionProcesoProductivo}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Usuarios de Producción o Servicios (Clientes actuales y/o potenciales)
                      </label>
                      <textarea
                        name="usuariosProduccion"
                        value={formData.usuariosProduccion}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Volumen Producción, Ventas y Materia Prima */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  4. VOLUMEN DE PRODUCCION MENSUAL
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-3 py-2 text-left text-sm">Descripción del Producto</th>
                        <th className="px-3 py-2 text-left text-sm">Unidad de Medida</th>
                        <th className="px-3 py-2 text-left text-sm">Costo Producción USD</th>
                        <th className="px-3 py-2 text-left text-sm">Cantidad</th>
                        <th className="px-3 py-2 text-center text-sm w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.volumenProduccion.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.descripcion || ''}
                              onChange={(e) => handleArrayChange('volumenProduccion', index, 'descripcion', e.target.value)}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.unidad || ''}
                              onChange={(e) => handleArrayChange('volumenProduccion', index, 'unidad', e.target.value)}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.costo || ''}
                              onChange={(e) => handleArrayChange('volumenProduccion', index, 'costo', parseFloat(e.target.value))}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.cantidad || ''}
                              onChange={(e) => handleArrayChange('volumenProduccion', index, 'cantidad', parseFloat(e.target.value))}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeArrayItem('volumenProduccion', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={() => addArrayItem('volumenProduccion', { descripcion: '', unidad: '', costo: 0, cantidad: 0 })}
                    className="mt-2 text-sm text-[#2A9D8F] hover:text-[#264653]"
                  >
                    + Agregar producto
                  </button>
                </div>

                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mt-6`}>
                  5. VENTAS ESTIMADAS (MENSUAL)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-3 py-2 text-left text-sm">Descripción del Producto</th>
                        <th className="px-3 py-2 text-left text-sm">Unidad de Medida</th>
                        <th className="px-3 py-2 text-left text-sm">Cantidad</th>
                        <th className="px-3 py-2 text-left text-sm">Precio Venta USD</th>
                        <th className="px-3 py-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.ventasEstimadas.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.descripcion || ''}
                              onChange={(e) => handleArrayChange('ventasEstimadas', index, 'descripcion', e.target.value)}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.unidad || ''}
                              onChange={(e) => handleArrayChange('ventasEstimadas', index, 'unidad', e.target.value)}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.cantidad || ''}
                              onChange={(e) => handleArrayChange('ventasEstimadas', index, 'cantidad', parseFloat(e.target.value))}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.precio || ''}
                              onChange={(e) => handleArrayChange('ventasEstimadas', index, 'precio', parseFloat(e.target.value))}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeArrayItem('ventasEstimadas', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={() => addArrayItem('ventasEstimadas', { descripcion: '', unidad: '', cantidad: 0, precio: 0 })}
                    className="mt-2 text-sm text-[#2A9D8F] hover:text-[#264653]"
                  >
                    + Agregar venta
                  </button>
                </div>

                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mt-6`}>
                  2.6 MATERIA PRIMA A UTILIZAR MENSUAL
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-3 py-2 text-left text-sm">Descripción</th>
                        <th className="px-3 py-2 text-left text-sm">Unidad</th>
                        <th className="px-3 py-2 text-left text-sm">Cantidad</th>
                        <th className="px-3 py-2 text-left text-sm">Precio Compra USD</th>
                        <th className="px-3 py-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.materiaPrima.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.descripcion || ''}
                              onChange={(e) => handleArrayChange('materiaPrima', index, 'descripcion', e.target.value)}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.unidad || ''}
                              onChange={(e) => handleArrayChange('materiaPrima', index, 'unidad', e.target.value)}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.cantidad || ''}
                              onChange={(e) => handleArrayChange('materiaPrima', index, 'cantidad', parseFloat(e.target.value))}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.precio || ''}
                              onChange={(e) => handleArrayChange('materiaPrima', index, 'precio', parseFloat(e.target.value))}
                              className={`w-full px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeArrayItem('materiaPrima', index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={() => addArrayItem('materiaPrima', { descripcion: '', unidad: '', cantidad: 0, precio: 0 })}
                    className="mt-2 text-sm text-[#2A9D8F] hover:text-[#264653]"
                  >
                    + Agregar materia prima
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Aspectos Técnicos */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  3. ASPECTOS TECNICOS
                </h3>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    3.1.1 LOCAL DONDE FUNCIONA LA EMPRESA (DESCRIPCION)
                  </label>
                  <textarea
                    name="localDescripcion"
                    value={formData.localDescripcion}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      3.1.2 TENENCIA DEL LOCAL
                    </label>
                    <select
                      name="tenenciaLocal"
                      value={formData.tenenciaLocal}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    >
                      <option value="propio">PROPIO</option>
                      <option value="alquilado">ALQUILADO</option>
                      <option value="otro">OTRO</option>
                    </select>
                  </div>
                  
                  {formData.tenenciaLocal === 'alquilado' && (
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Monto Alquiler (Bs)
                      </label>
                      <input
                        type="number"
                        name="alquilerBs"
                        value={formData.alquilerBs}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    3.1.5 RECURSO HUMANO (MANO DE OBRA)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Empleados (Cantidad)
                      </label>
                      <input
                        type="number"
                        value={formData.recursoHumano.empleados}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recursoHumano: { ...prev.recursoHumano, empleados: parseInt(e.target.value) || 0 }
                        }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Obreros (Cantidad)
                      </label>
                      <input
                        type="number"
                        value={formData.recursoHumano.obreros}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          recursoHumano: { ...prev.recursoHumano, obreros: parseInt(e.target.value) || 0 }
                        }))}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    3.1.6 SERVICIOS BASICOS
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['electricidad', 'agua', 'telefono', 'aseoUrbano', 'cloacas', 'gas'].map(service => (
                      <label key={service} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.serviciosBasicos[service]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            serviciosBasicos: { ...prev.serviciosBasicos, [service]: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-[#2A9D8F]"
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {service.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Gastos Mensuales y Plan de Inversión */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  4. GASTOS MENSUALES (USD)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-2 text-left">DESCRIPCION</th>
                        <th className="px-4 py-2 text-center">ACTUAL</th>
                        <th className="px-4 py-2 text-center">FUTURO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['manoObra', 'materiaPrima', 'serviciosBasicos', 'alquiler', 'otros'].map((gasto) => (
                        <tr key={gasto}>
                          <td className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            {gasto === 'manoObra' ? 'MANO DE OBRA' :
                             gasto === 'materiaPrima' ? 'MATERIA PRIMA' :
                             gasto === 'serviciosBasicos' ? 'SERVICIOS BASICOS' :
                             gasto === 'alquiler' ? 'ALQUILER' : 'OTROS'}
                           </td>
                          <td className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.gastosMensuales[gasto].actual}
                              onChange={(e) => handleNestedChange('gastosMensuales', gasto, 'actual', parseFloat(e.target.value) || 0)}
                              className={`w-32 px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                           </td>
                          <td className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.gastosMensuales[gasto].futuro}
                              onChange={(e) => handleNestedChange('gastosMensuales', gasto, 'futuro', parseFloat(e.target.value) || 0)}
                              className={`w-32 px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mt-6`}>
                  5. PLAN DE INVERSION (USD)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-2 text-left">DESCRIPCION</th>
                        <th className="px-4 py-2 text-center">APORTES PROPIOS</th>
                        <th className="px-4 py-2 text-center">MONTO SOLICITADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['construccion', 'maquinariaEquipo', 'materiaPrima', 'manoObra', 'otrosGastos'].map((item) => (
                        <tr key={item}>
                          <td className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            {item === 'construccion' ? 'CONSTRUCCION' :
                             item === 'maquinariaEquipo' ? 'MAQ. Y EQUIPO' :
                             item === 'materiaPrima' ? 'MATERIA PRIMA' :
                             item === 'manoObra' ? 'MANO DE OBRA' : 'OTROS GASTOS'}
                           </td>
                          <td className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.planInversion[item].aportesPropios}
                              onChange={(e) => handleNestedChange('planInversion', item, 'aportesPropios', parseFloat(e.target.value) || 0)}
                              className={`w-32 px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                           </td>
                          <td className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.planInversion[item].montoSolicitado}
                              onChange={(e) => handleNestedChange('planInversion', item, 'montoSolicitado', parseFloat(e.target.value) || 0)}
                              className={`w-32 px-2 py-1 rounded border ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                              }`}
                            />
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 5: Comunidad y Garantía */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  6. ORGANIZACIÓN COMUNITARIA
                </h3>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ¿Qué tipo de organización existe en la comunidad?
                  </label>
                  <textarea
                    name="organizacionComunidad"
                    value={formData.organizacionComunidad}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    7. ¿Cuáles son las necesidades principales de la comunidad?
                  </label>
                  <textarea
                    name="necesidadesComunidad"
                    value={formData.necesidadesComunidad}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    8. ¿Realiza algún aporte a su comunidad?
                  </label>
                  <div className="flex gap-4 mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="realizaAporte"
                        value="true"
                        checked={formData.realizaAporte === true}
                        onChange={() => setFormData(prev => ({ ...prev, realizaAporte: true }))}
                        className="text-[#2A9D8F]"
                      />
                      <span>SI</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="realizaAporte"
                        value="false"
                        checked={formData.realizaAporte === false}
                        onChange={() => setFormData(prev => ({ ...prev, realizaAporte: false }))}
                        className="text-[#2A9D8F]"
                      />
                      <span>NO</span>
                    </label>
                  </div>
                  
                  {formData.realizaAporte && (
                    <textarea
                      name="descripcionAporte"
                      value={formData.descripcionAporte}
                      onChange={handleChange}
                      placeholder="Describa en qué consiste el aporte"
                      rows={2}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                    />
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    GARANTIA OFRECIDA
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="garantiaOfrecida"
                        value="hipoteca"
                        checked={formData.garantiaOfrecida === 'hipoteca'}
                        onChange={handleChange}
                        className="text-[#2A9D8F]"
                      />
                      <span>HIPOTECA</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="garantiaOfrecida"
                        value="fianza"
                        checked={formData.garantiaOfrecida === 'fianza'}
                        onChange={handleChange}
                        className="text-[#2A9D8F]"
                      />
                      <span>FIANZA</span>
                    </label>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        FIRMA DEL SOLICITANTE
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        C.I.
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      FECHA
                    </label>
                    <input
                      type="date"
                      className={`w-full md:w-64 px-3 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer con botones de navegación */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentStep === 1
                    ? 'bg-gray-300 cursor-not-allowed'
                    : darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Anterior
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                  className="px-4 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] transition-colors"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  Guardar Inspección
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const InspeccionRealizada = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedEmprendimiento, setSelectedEmprendimiento] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nueva inspección programada", time: "5 min", read: false },
    { id: 2, text: "Informe de inspección listo para revisión", time: "1 hora", read: false },
    { id: 3, text: "Emprendimiento aprobado después de inspección", time: "3 horas", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("inspRealizadas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fechaInspeccion', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipoInspeccion: '',
    resultado: '',
    calificacion: '',
    fechaDesde: '',
    fechaHasta: '',
    inspector: ''
  });

  // Datos de ejemplo para inspecciones realizadas - AGREGADO NUEVO REGISTRO PENDIENTE
  const [inspecciones, setInspecciones] = useState([
    {
      id: 1,
      codigo: "INSP-2024-001",
      emprendimiento: "Restaurante El Sazón",
      emprendedor: "María González",
      tipoInspeccion: "Inicial",
      fechaInspeccion: "2024-03-12",
      inspector: "Ing. Martínez",
      resultado: "Aprobado",
      calificacion: 4.5,
      observaciones: "Cumple con todos los requisitos sanitarios y de infraestructura",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Fotos de instalaciones", url: "#" },
        { nombre: "Certificado de cumplimiento", url: "#" }
      ],
      recomendaciones: "Mejorar sistema de ventilación",
      proximaInspeccion: "2024-09-12",
      duracion: "2 horas 30 min",
      actividad: "Gastronomía",
      direccion: "Av. Principal, Local 5, Caracas",
      telefono: "0412-1234567"
    },
    {
      id: 2,
      codigo: "INSP-2024-002",
      emprendimiento: "Taller Mecánico Rápido",
      emprendedor: "Juan Pérez",
      tipoInspeccion: "Re-inspección",
      fechaInspeccion: "2024-03-11",
      inspector: "Ing. López",
      resultado: "Aprobado con observaciones",
      calificacion: 3.5,
      observaciones: "Se requiere mejorar área de almacenamiento de residuos",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Lista de verificación", url: "#" }
      ],
      recomendaciones: "Implementar sistema de gestión de residuos",
      proximaInspeccion: "2024-06-11",
      duracion: "1 hora 45 min",
      actividad: "Mecánica Automotriz",
      direccion: "Calle Bolívar, Quinta 23, Maracaibo",
      telefono: "0414-7654321"
    },
    {
      id: 3,
      codigo: "INSP-2024-003",
      emprendimiento: "Tienda de Ropa Moda",
      emprendedor: "Carlos Rodríguez",
      tipoInspeccion: "Inicial",
      fechaInspeccion: "2024-03-10",
      inspector: "Ing. García",
      resultado: "Rechazado",
      calificacion: 2.0,
      observaciones: "No cumple con normas de seguridad contra incendios",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Informe de no conformidades", url: "#" }
      ],
      recomendaciones: "Instalar sistema de extinción de incendios",
      proximaInspeccion: "2024-04-10",
      duracion: "3 horas",
      actividad: "Comercio Textil",
      direccion: "Centro Comercial Plaza, Nivel 2, Valencia",
      telefono: "0426-9876543"
    },
    // NUEVO REGISTRO - Emprendimiento pendiente de inspección
    {
      id: 4,
      codigo: "PEND-2024-001",
      emprendimiento: "Panadería y Pastelería Dulce Sabor",
      emprendedor: "Ana Martínez",
      tipoInspeccion: "Pendiente",
      fechaInspeccion: "-",
      inspector: "Por asignar",
      resultado: "Pendiente",
      calificacion: 0,
      observaciones: "Emprendimiento registrado, pendiente de primera inspección",
      documentos: [],
      recomendaciones: "Programar visita de inspección inicial",
      proximaInspeccion: "Por definir",
      duracion: "-",
      actividad: "Panadería y Pastelería",
      direccion: "Calle 5, Urb. Los Olivos, Barquisimeto",
      telefono: "0251-1234567"
    }
  ]);

  // Estadísticas de inspecciones
  const estadisticas = {
    total: inspecciones.length,
    aprobadas: inspecciones.filter(i => i.resultado === "Aprobado").length,
    aprobadasObs: inspecciones.filter(i => i.resultado === "Aprobado con observaciones").length,
    rechazadas: inspecciones.filter(i => i.resultado === "Rechazado").length,
    pendientes: inspecciones.filter(i => i.resultado === "Pendiente").length,
    promedioCalificacion: (() => {
      const inspeccionesConCalificacion = inspecciones.filter(i => i.calificacion > 0);
      if (inspeccionesConCalificacion.length === 0) return "0.0";
      return (inspeccionesConCalificacion.reduce((sum, i) => sum + i.calificacion, 0) / inspeccionesConCalificacion.length).toFixed(1);
    })(),
    tiposInspeccion: {
      inicial: inspecciones.filter(i => i.tipoInspeccion === "Inicial").length,
      reinpeccion: inspecciones.filter(i => i.tipoInspeccion === "Re-inspección").length,
      periodica: inspecciones.filter(i => i.tipoInspeccion === "Periódica").length,
      pendiente: inspecciones.filter(i => i.tipoInspeccion === "Pendiente").length
    }
  };

  // Datos del usuario
  const user = {
    name: "Inspector IADEY",
    email: "inspector@iadey.gob.ve",
    role: "Inspector de Campo",
    avatar: null,
    department: "Dirección de Inspecciones",
    joinDate: "Enero 2024",
    pendingTasks: 5,
    completedTasks: 48,
    performance: "96%"
  };

  // Datos específicos por sección
  const sectionData = {
    inspRealizadas: {
      title: "Inspecciones Realizadas",
      description: "Historial de inspecciones completadas y sus resultados",
      actionButton: "Nueva Inspección",
      pendingTitle: "Inspecciones Recientes"
    }
  };

  const getCurrentSectionData = () => {
    return sectionData.inspRealizadas;
  };

  const currentData = getCurrentSectionData();

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado y ordenamiento
  const filteredInspecciones = inspecciones.filter(ins => {
    const matchesSearch = searchTerm === '' || 
      Object.values(ins).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesTipo = filters.tipoInspeccion === '' || ins.tipoInspeccion === filters.tipoInspeccion;
    const matchesResultado = filters.resultado === '' || ins.resultado === filters.resultado;
    
    let matchesCalificacion = true;
    if (filters.calificacion && ins.calificacion > 0) {
      const calif = parseFloat(filters.calificacion);
      matchesCalificacion = ins.calificacion >= calif;
    }
    
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta && ins.fechaInspeccion !== '-') {
      const insDate = new Date(ins.fechaInspeccion);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = insDate >= desde && insDate <= hasta;
    }
    
    const matchesInspector = filters.inspector === '' || 
      ins.inspector.toLowerCase().includes(filters.inspector.toLowerCase());
    
    return matchesSearch && matchesTipo && matchesResultado && matchesCalificacion && matchesFecha && matchesInspector;
  });

  // Ordenamiento
  const sortedInspecciones = [...filteredInspecciones].sort((a, b) => {
    if (sortConfig.key) {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedInspecciones.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedInspecciones = sortedInspecciones.slice(startIndex, startIndex + rowsPerPage);

  // Funciones de manejo
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedInspecciones.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedInspecciones.map(ins => ins.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleViewDetalle = (id) => {
    console.log('Ver detalle de inspección:', id);
    navigate(`/inspeccion/${id}`);
  };

  const handleDownloadInforme = (id) => {
    console.log('Descargar informe de inspección:', id);
  };

  const handleGenerarCertificado = (id) => {
    console.log('Generar certificado para inspección:', id);
  };

  // Funciones para el modal de inspección
  const handleOpenInspectionForm = (emprendimiento = null) => {
    setSelectedEmprendimiento(emprendimiento);
    setShowInspectionModal(true);
  };

  const handleCloseInspectionForm = () => {
    setShowInspectionModal(false);
    setSelectedEmprendimiento(null);
  };

  const handleSaveInspection = (data) => {
    console.log('Datos de inspección guardados:', data);
    
    // Crear nueva inspección con los datos del formulario
    const nuevaInspeccion = {
      id: inspecciones.length + 1,
      codigo: `INSP-2024-${String(inspecciones.length + 1).padStart(3, '0')}`,
      emprendimiento: data.nombresApellidos || selectedEmprendimiento?.emprendimiento || "Nuevo Emprendimiento",
      emprendedor: data.nombresApellidos,
      tipoInspeccion: "Inicial",
      fechaInspeccion: new Date().toISOString().split('T')[0],
      inspector: user.name,
      resultado: "Aprobado",
      calificacion: 4.0,
      observaciones: "Inspección completada exitosamente. Cumple con todos los requisitos.",
      documentos: [
        { nombre: "Acta de Inspección", url: "#" },
        { nombre: "Fotos de instalaciones", url: "#" }
      ],
      recomendaciones: "Mantener buenas prácticas de higiene y seguridad",
      proximaInspeccion: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
      duracion: "2 horas",
      actividad: data.actividad || selectedEmprendimiento?.actividad || "No especificada",
      direccion: data.direccionUnidadProduccion || selectedEmprendimiento?.direccion || "Por definir",
      telefono: data.telefono || selectedEmprendimiento?.telefono || "No especificado"
    };
    
    setInspecciones([nuevaInspeccion, ...inspecciones]);
    
    // Mostrar mensaje de éxito
    alert(`✅ Inspección registrada exitosamente para: ${nuevaInspeccion.emprendedor}\n\nCódigo: ${nuevaInspeccion.codigo}\nFecha: ${nuevaInspeccion.fechaInspeccion}\nResultado: ${nuevaInspeccion.resultado}`);
    
    handleCloseInspectionForm();
  };

  const resetFilters = () => {
    setFilters({
      tipoInspeccion: '',
      resultado: '',
      calificacion: '',
      fechaDesde: '',
      fechaHasta: '',
      inspector: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getResultadoBadge = (resultado) => {
    const styles = {
      'Aprobado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Aprobado con observaciones': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Pendiente': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return styles[resultado] || 'bg-gray-100 text-gray-800';
  };

  const getTipoInspeccionBadge = (tipo) => {
    const styles = {
      'Inicial': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Re-inspección': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Periódica': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Pendiente': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return styles[tipo] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    if (rating === 0) {
      return <div className="flex items-center gap-0.5 text-gray-300">Sin calificar</div>;
    }
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300 dark:text-gray-600" />);
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // Marcar notificaciones como leídas
  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

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
                {currentData?.title || "Inspecciones Realizadas"}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentData?.description || "Historial completo de inspecciones realizadas en emprendimientos"}
              </p>
            </div>

            {/* Tarjetas de estadísticas - Actualizado con pendientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ClipboardCheck className="text-[#2A9D8F]" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.total}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Inspecciones</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Clock className="text-blue-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.pendientes}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pendientes</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ThumbsUp className="text-green-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.aprobadas}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aprobadas</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="text-yellow-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.aprobadasObs}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Aprobadas con Obs.</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <ThumbsDown className="text-red-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.rechazadas}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rechazadas</p>
              </div>
              
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <Star className="text-yellow-500" size={24} />
                  <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {estadisticas.promedioCalificacion}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Calificación Promedio</p>
              </div>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por emprendimiento, emprendedor o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    darkMode 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={20} />
                  Filtros
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <select
                    value={filters.tipoInspeccion}
                    onChange={(e) => setFilters({...filters, tipoInspeccion: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Inicial">Inicial</option>
                    <option value="Re-inspección">Re-inspección</option>
                    <option value="Periódica">Periódica</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>

                  <select
                    value={filters.resultado}
                    onChange={(e) => setFilters({...filters, resultado: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los resultados</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Aprobado con observaciones">Aprobado con observaciones</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>

                  <select
                    value={filters.calificacion}
                    onChange={(e) => setFilters({...filters, calificacion: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Calificación mínima</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4+ estrellas</option>
                    <option value="3">3+ estrellas</option>
                    <option value="2">2+ estrellas</option>
                  </select>

                  <input
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                    placeholder="Fecha desde"
                  />

                  <input
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                    placeholder="Fecha hasta"
                  />

                  <input
                    type="text"
                    value={filters.inspector}
                    onChange={(e) => setFilters({...filters, inspector: e.target.value})}
                    placeholder="Inspector"
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-200 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-[#2A9D8F] hover:text-[#264653]"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            {/* DataTable de Inspecciones */}
            <div className={`rounded-xl border ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            } overflow-hidden`}>
              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={selectedRows.length === paginatedInspecciones.length && paginatedInspecciones.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('codigo')}>
                        <div className="flex items-center gap-2">
                          Código
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('emprendimiento')}>
                        <div className="flex items-center gap-2">
                          Emprendimiento
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('tipoInspeccion')}>
                        <div className="flex items-center gap-2">
                          Tipo
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fechaInspeccion')}>
                        <div className="flex items-center gap-2">
                          Fecha
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resultado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspector
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedInspecciones.map((inspeccion) => (
                      <tr key={inspeccion.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(inspeccion.id)}
                            onChange={() => handleSelectRow(inspeccion.id)}
                            className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {inspeccion.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {inspeccion.emprendimiento}
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {inspeccion.emprendedor}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTipoInspeccionBadge(inspeccion.tipoInspeccion)}`}>
                            {inspeccion.tipoInspeccion}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {inspeccion.fechaInspeccion !== '-' ? (
                            <div>
                              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {new Date(inspeccion.fechaInspeccion).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Duración: {inspeccion.duracion}
                              </div>
                            </div>
                          ) : (
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              No realizada
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getResultadoBadge(inspeccion.resultado)}`}>
                            {inspeccion.resultado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {renderStars(inspeccion.calificacion)}
                            {inspeccion.calificacion > 0 && (
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {inspeccion.calificacion}/5.0
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {inspeccion.inspector}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {/* Botón para realizar inspección - Aparece cuando el estado es Pendiente */}
                            {inspeccion.resultado === "Pendiente" && (
                              <button
                                onClick={() => handleOpenInspectionForm({
                                  emprendimiento: inspeccion.emprendimiento,
                                  emprendedor: inspeccion.emprendedor,
                                  actividad: inspeccion.actividad,
                                  direccion: inspeccion.direccion,
                                  telefono: inspeccion.telefono
                                })}
                                className={`p-1.5 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors group relative`}
                                title="Realizar Inspección"
                              >
                                <ClipboardList size={18} className="text-[#2A9D8F]" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Realizar Inspección
                                </span>
                              </button>
                            )}
                            
                            {/* Botón ver detalles - Siempre visible */}
                            <button
                              onClick={() => handleViewDetalle(inspeccion.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors group relative`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-blue-500" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Ver Detalles
                              </span>
                            </button>
                            
                            {/* Botón descargar informe - Solo para inspecciones realizadas */}
                            {inspeccion.resultado !== "Pendiente" && (
                              <button
                                onClick={() => handleDownloadInforme(inspeccion.id)}
                                className={`p-1 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors group relative`}
                                title="Descargar informe"
                              >
                                <Download size={18} className="text-purple-500" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Descargar Informe
                                </span>
                              </button>
                            )}
                            
                            {/* Botón generar certificado - Solo para inspecciones aprobadas */}
                            {inspeccion.resultado === "Aprobado" && (
                              <button
                                onClick={() => handleGenerarCertificado(inspeccion.id)}
                                className={`p-1 rounded-lg ${
                                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                                } transition-colors group relative`}
                                title="Generar certificado"
                              >
                                <FileSignature size={18} className="text-green-500" />
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Generar Certificado
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className={`px-4 py-3 flex items-center justify-between border-t ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    Mostrar
                  </span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-2 py-1 rounded border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    registros
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedInspecciones.length)} de {sortedInspecciones.length}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronsLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <span className={`px-3 py-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronsRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Si no hay resultados */}
            {sortedInspecciones.length === 0 && (
              <div className={`text-center py-12 rounded-xl border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <ClipboardCheck size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No se encontraron inspecciones
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay inspecciones que coincidan con los filtros aplicados.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-[#2A9D8F] hover:text-[#264653]"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Modal del Formulario de Inspección */}
      <InspectionFormModal
        isOpen={showInspectionModal}
        onClose={handleCloseInspectionForm}
        darkMode={darkMode}
        onSubmit={handleSaveInspection}
        emprendimientoData={selectedEmprendimiento}
      />
    </div>
  );
};

export default InspeccionRealizada;