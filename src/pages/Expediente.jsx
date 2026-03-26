// pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Grid, 
  List,
  Briefcase,
  DollarSign,
  ShoppingCart,
  Star,
  Edit,
  MessageCircle,
  Upload,
  CheckCircle,
  ClipboardCheck,
  Handshake,
  CreditCard,
  FileSignature,
  Users,
  FileText,
  Building,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Download,
  Printer,
  Filter,
  ArrowUpDown,
  MoreVertical,
  X,
  Save
} from "lucide-react";

// Importamos nuestros componentes personalizados
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

// Componente Modal del Formulario de Inspección
const InspectionFormModal = ({ isOpen, onClose, darkMode, onSubmit }) => {
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
                  Formulario de inspeccion de emprendimiento
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

const Expediente = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Nuevo expediente de emprendedor pendiente", time: "5 min", read: false },
    { id: 2, text: "Inspección de emprendimiento programada", time: "1 hora", read: false },
    { id: 3, text: "Solicitud de crédito en revisión", time: "3 horas", read: true },
    { id: 4, text: "Contrato listo para firma", time: "1 día", read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Estados para la DataTable
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    prioridad: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Datos de ejemplo para los expedientes
  const [expedientes, setExpedientes] = useState([
    {
      id: 1,
      codigo: "EXP-2024-001",
      nombre: "María González",
      tipo: "Nuevo Emprendimiento",
      fecha: "2024-03-12",
      estado: "Pendiente",
      prioridad: "Alta",
      monto: "$25,000",
      inspector: "Ing. Martínez",
      documentos: 8,
      ultimaActualizacion: "2024-03-12"
    },
    {
      id: 2,
      codigo: "EXP-2024-002",
      nombre: "Juan Pérez",
      tipo: "Ampliación",
      fecha: "2024-03-11",
      estado: "En Proceso",
      prioridad: "Media",
      monto: "$45,000",
      inspector: "Ing. López",
      documentos: 12,
      ultimaActualizacion: "2024-03-11"
    },
    {
      id: 3,
      codigo: "EXP-2024-003",
      nombre: "Carlos Rodríguez",
      tipo: "Renovación",
      fecha: "2024-03-10",
      estado: "Completado",
      prioridad: "Baja",
      monto: "$15,000",
      inspector: "Ing. García",
      documentos: 6,
      ultimaActualizacion: "2024-03-10"
    },
    {
      id: 4,
      codigo: "EXP-2024-004",
      nombre: "Ana Martínez",
      tipo: "Nuevo Emprendimiento",
      fecha: "2024-03-09",
      estado: "Revisión",
      prioridad: "Alta",
      monto: "$75,000",
      inspector: "Ing. Pérez",
      documentos: 10,
      ultimaActualizacion: "2024-03-09"
    },
    {
      id: 5,
      codigo: "EXP-2024-005",
      nombre: "Luis Torres",
      tipo: "Crédito",
      fecha: "2024-03-08",
      estado: "Documentación Pendiente",
      prioridad: "Media",
      monto: "$120,000",
      inspector: "Ing. Sánchez",
      documentos: 5,
      ultimaActualizacion: "2024-03-08"
    },
    {
      id: 6,
      codigo: "EXP-2024-006",
      nombre: "Carmen Flores",
      tipo: "Inspección",
      fecha: "2024-03-07",
      estado: "Programado",
      prioridad: "Alta",
      monto: "$35,000",
      inspector: "Ing. Ramírez",
      documentos: 15,
      ultimaActualizacion: "2024-03-07"
    },
    {
      id: 7,
      codigo: "EXP-2024-007",
      nombre: "Roberto Sánchez",
      tipo: "Nuevo Emprendimiento",
      fecha: "2024-03-06",
      estado: "Aprobado",
      prioridad: "Baja",
      monto: "$50,000",
      inspector: "Ing. Díaz",
      documentos: 9,
      ultimaActualizacion: "2024-03-06"
    },
    {
      id: 8,
      codigo: "EXP-2024-008",
      nombre: "Patricia Gómez",
      tipo: "Crédito",
      fecha: "2024-03-05",
      estado: "Rechazado",
      prioridad: "Media",
      monto: "$85,000",
      inspector: "Ing. Torres",
      documentos: 7,
      ultimaActualizacion: "2024-03-05"
    }
  ]);

  // Datos del usuario
  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Gestión de Créditos",
    joinDate: "Enero 2024",
    pendingTasks: 8,
    completedTasks: 45,
    performance: "98%"
  };

  // Datos específicos por sección
  const sectionData = {
    overview: {
      title: "Gestión de Expedientes",
      description: "Resumen general de los expedientes archivados en el IADEY",
      stats: [
        { id: 1, title: "Expedientes Activos", value: "156", change: "+12", icon: Briefcase, color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-600" },
        { id: 2, title: "Inspecciones Pendientes", value: "23", change: "+5", icon: ClipboardCheck, color: "orange", bgColor: "bg-orange-50", textColor: "text-orange-600" },
        { id: 3, title: "Solicitudes Crédito", value: "45", change: "+8", icon: Handshake, color: "green", bgColor: "bg-green-50", textColor: "text-green-600" },
        { id: 4, title: "Contratos Activos", value: "89", change: "+15", icon: FileSignature, color: "purple", bgColor: "bg-purple-50", textColor: "text-purple-600" },
      ],
      pendingItems: [
        { id: 1, name: "María González", type: "Nuevo expediente", date: "2024-03-12", status: "Pendiente", priority: "Alta" },
        { id: 2, name: "Juan Pérez", type: "Actualización documentos", date: "2024-03-11", status: "En proceso", priority: "Media" },
        { id: 3, name: "Carlos Rodríguez", type: "Revisión inicial", date: "2024-03-10", status: "Pendiente", priority: "Alta" },
      ],
      actionButton: "Nuevo Registro",
      pendingTitle: "Actividad Reciente"
    },
    projects: {
      title: "Expedientes de Emprendedores",
      description: "Gestión de expedientes de emprendedores",
      stats: [
        { id: 1, title: "Total Expedientes", value: "245", icon: Briefcase, color: "blue" },
        { id: 2, title: "En Revisión", value: "38", icon: Clock, color: "yellow" },
        { id: 3, title: "Documentación Pendiente", value: "52", icon: FileText, color: "orange" },
        { id: 4, title: "Completados", value: "155", icon: CheckCircle, color: "green" },
      ],
      pendingItems: [
        { id: 1, name: "María González", type: "Nuevo expediente", date: "2024-03-12", status: "Pendiente", priority: "Alta" },
        { id: 2, name: "Juan Pérez", type: "Actualización documentos", date: "2024-03-11", status: "En proceso", priority: "Media" },
        { id: 3, name: "Carlos Rodríguez", type: "Revisión inicial", date: "2024-03-10", status: "Pendiente", priority: "Alta" },
      ],
      actionButton: "Nuevo Expediente",
      pendingTitle: "Expedientes Pendientes"
    },
    insp: {
      title: "Inspecciones de Emprendimiento",
      description: "Programación y seguimiento de inspecciones",
      stats: [
        { id: 1, title: "Inspecciones Programadas", value: "18", icon: Calendar, color: "blue" },
        { id: 2, title: "Pendientes de Realizar", value: "12", icon: Clock, color: "yellow" },
        { id: 3, title: "En Proceso", value: "5", icon: Users, color: "purple" },
        { id: 4, title: "Completadas Mes", value: "34", icon: CheckCircle, color: "green" },
      ],
      pendingItems: [
        { id: 1, name: "Restaurante El Sazón", type: "Inspección inicial", date: "2024-03-15", inspector: "Ing. Martínez", status: "Programada" },
        { id: 2, name: "Taller Mecánico Rápido", type: "Re-inspección", date: "2024-03-14", inspector: "Ing. López", status: "Pendiente" },
        { id: 3, name: "Tienda de Ropa Moda", type: "Inspección final", date: "2024-03-13", inspector: "Ing. García", status: "En proceso" },
      ],
      actionButton: "Programar Inspección",
      pendingTitle: "Inspecciones Programadas"
    },
    team: {
      title: "Aprobación de Solicitudes de Crédito",
      description: "Evaluación y aprobación de solicitudes de crédito",
      stats: [
        { id: 1, title: "Solicitudes Pendientes", value: "28", icon: Clock, color: "yellow" },
        { id: 2, title: "En Análisis", value: "15", icon: Search, color: "blue" },
        { id: 3, title: "Aprobadas Mes", value: "42", icon: CheckCircle, color: "green" },
        { id: 4, title: "Rechazadas", value: "8", icon: AlertCircle, color: "red" },
      ],
      pendingItems: [
        { id: 1, name: "Comercializadora ABC", monto: "$50,000", fecha: "2024-03-12", riesgo: "Bajo", estado: "En análisis" },
        { id: 2, name: "Industrias del Valle", monto: "$120,000", fecha: "2024-03-11", riesgo: "Medio", estado: "Pendiente documentos" },
        { id: 3, name: "Servicios Generales GH", monto: "$35,000", fecha: "2024-03-10", riesgo: "Bajo", estado: "Aprobación final" },
      ],
      actionButton: "Nueva Solicitud",
      pendingTitle: "Solicitudes en Análisis"
    },
    documents: {
      title: "Gestión de Contratos",
      description: "Administración de contratos y convenios",
      stats: [
        { id: 1, title: "Contratos Activos", value: "89", icon: FileSignature, color: "green" },
        { id: 2, title: "Por Firmar", value: "23", icon: Clock, color: "yellow" },
        { id: 3, title: "Vencimiento Próximo", value: "12", icon: AlertCircle, color: "red" },
        { id: 4, title: "Renovaciones", value: "8", icon: TrendingUp, color: "blue" },
      ],
      pendingItems: [
        { id: 1, name: "Contrato Servicios TI", empresa: "TecnoSolutions", vencimiento: "2024-04-15", estado: "Activo" },
        { id: 2, name: "Convenio Mantenimiento", empresa: "ServiTotal", vencimiento: "2024-03-30", estado: "Por renovar" },
        { id: 3, name: "Acuerdo Comercial", empresa: "Distribuidora del Sur", vencimiento: "2024-03-25", estado: "Firma pendiente" },
      ],
      actionButton: "Nuevo Contrato",
      pendingTitle: "Contratos por Revisar"
    },
    analytics: {
      title: "Desembolsos y Cuotas",
      description: "Control de desembolsos y seguimiento de cuotas",
      stats: [
        { id: 1, title: "Desembolsos Mes", value: "$2.5M", icon: CreditCard, color: "green" },
        { id: 2, title: "Cuotas por Cobrar", value: "$850K", icon: Clock, color: "yellow" },
        { id: 3, title: "Mora >30 días", value: "$125K", icon: AlertCircle, color: "red" },
        { id: 4, title: "Recuperación", value: "95%", icon: TrendingUp, color: "blue" },
      ],
      pendingItems: [
        { id: 1, name: "Inversiones del Centro", monto: "$25,000", vencimiento: "2024-03-15", estado: "Pendiente", dias: "5" },
        { id: 2, name: "Constructora Moderna", monto: "$45,000", vencimiento: "2024-03-10", estado: "Vencido", dias: "-2" },
        { id: 3, name: "Agroindustrias Unidas", monto: "$32,000", vencimiento: "2024-03-20", estado: "Programado", dias: "10" },
      ],
      actionButton: "Registrar Desembolso",
      pendingTitle: "Próximos Vencimientos"
    }
  };

  // Configuración para submenús
  const settingsData = {
    title: "Configuración del Sistema",
    description: "Administración de usuarios, emprendimientos y parámetros",
    stats: [
      { id: 1, title: "Usuarios Activos", value: "24", icon: Users, color: "blue" },
      { id: 2, title: "Emprendimientos Registrados", value: "156", icon: Building, color: "green" },
      { id: 3, title: "Parámetros Configurados", value: "89", icon: FileText, color: "purple" },
    ],
    pendingItems: [],
    actionButton: "Nueva Configuración",
    pendingTitle: "Configuraciones Recientes"
  };

  // Obtener datos según la pestaña activa con validación segura
  const getCurrentSectionData = () => {
    if (activeTab.startsWith("settings-")) {
      return settingsData;
    }
    
    if (sectionData[activeTab]) {
      return sectionData[activeTab];
    }
    
    return sectionData.overview;
  };

  const currentData = getCurrentSectionData();

  // Notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Funciones de filtrado y ordenamiento para la DataTable
  const filteredExpedientes = expedientes.filter(exp => {
    // Filtro por búsqueda general
    const matchesSearch = searchTerm === '' || 
      Object.values(exp).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Filtros específicos
    const matchesTipo = filters.tipo === '' || exp.tipo === filters.tipo;
    const matchesEstado = filters.estado === '' || exp.estado === filters.estado;
    const matchesPrioridad = filters.prioridad === '' || exp.prioridad === filters.prioridad;
    
    // Filtro por fecha
    let matchesFecha = true;
    if (filters.fechaDesde && filters.fechaHasta) {
      const expDate = new Date(exp.fecha);
      const desde = new Date(filters.fechaDesde);
      const hasta = new Date(filters.fechaHasta);
      matchesFecha = expDate >= desde && expDate <= hasta;
    }
    
    return matchesSearch && matchesTipo && matchesEstado && matchesPrioridad && matchesFecha;
  });

  // Ordenamiento
  const sortedExpedientes = [...filteredExpedientes].sort((a, b) => {
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
  const totalPages = Math.ceil(sortedExpedientes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedExpedientes = sortedExpedientes.slice(startIndex, startIndex + rowsPerPage);

  // Funciones de manejo
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedExpedientes.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedExpedientes.map(exp => exp.id));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleViewExpediente = (id) => {
    console.log('Ver expediente:', id);
  };

  const handleEditExpediente = (id) => {
    console.log('Editar expediente:', id);
  };

  const handleDownloadExpediente = (id) => {
    console.log('Descargar expediente:', id);
  };

  const handleOpenInspectionForm = () => {
    setShowInspectionModal(true);
  };

  const handleCloseInspectionForm = () => {
    setShowInspectionModal(false);
  };

  const handleSaveInspection = (data) => {
    console.log('Datos de inspección guardados:', data);
    // Aquí puedes enviar los datos a tu API
    // Por ejemplo: await api.post('/inspections', data);
    
    // Mostrar mensaje de éxito
    alert('Inspección guardada exitosamente');
    handleCloseInspectionForm();
  };

  const resetFilters = () => {
    setFilters({
      tipo: '',
      estado: '',
      prioridad: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Funciones auxiliares para estilos
  const getPriorityBadge = (priority) => {
    const styles = {
      'Alta': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Media': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Baja': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return styles[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'En Proceso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Revisión': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Documentación Pendiente': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Programado': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'Aprobado': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'Rechazado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
                {currentData?.title || "Panel de Control"}
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {currentData?.description || "Bienvenido al sistema IADEY"}
              </p>
            </div>

            {/* Barra de búsqueda y acciones */}
            <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar expedientes..."
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
                <button
                  onClick={handleOpenInspectionForm}
                  className="px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  {currentData?.actionButton || "Nuevo Registro"}
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <select
                    value={filters.tipo}
                    onChange={(e) => setFilters({...filters, tipo: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Nuevo Emprendimiento">Nuevo Emprendimiento</option>
                    <option value="Ampliación">Ampliación</option>
                    <option value="Renovación">Renovación</option>
                    <option value="Crédito">Crédito</option>
                    <option value="Inspección">Inspección</option>
                  </select>

                  <select
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Completado">Completado</option>
                    <option value="Revisión">Revisión</option>
                    <option value="Aprobado">Aprobado</option>
                    <option value="Rechazado">Rechazado</option>
                  </select>

                  <select
                    value={filters.prioridad}
                    onChange={(e) => setFilters({...filters, prioridad: e.target.value})}
                    className={`px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="">Todas las prioridades</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
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

            {/* DataTable de Expedientes */}
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
                          checked={selectedRows.length === paginatedExpedientes.length && paginatedExpedientes.length > 0}
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
                          onClick={() => handleSort('nombre')}>
                        <div className="flex items-center gap-2">
                          Emprendedor
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('tipo')}>
                        <div className="flex items-center gap-2">
                          Tipo
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('fecha')}>
                        <div className="flex items-center gap-2">
                          Fecha
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('monto')}>
                        <div className="flex items-center gap-2">
                          Monto
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inspector
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documentos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {paginatedExpedientes.map((expediente) => (
                      <tr key={expediente.id} className={`${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(expediente.id)}
                            onChange={() => handleSelectRow(expediente.id)}
                            className="rounded border-gray-300 text-[#2A9D8F] focus:ring-[#2A9D8F]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {expediente.codigo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.nombre}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {new Date(expediente.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(expediente.estado)}`}>
                            {expediente.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(expediente.prioridad)}`}>
                            {expediente.prioridad}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {expediente.monto}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.inspector}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {expediente.documentos}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewExpediente(expediente.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Ver detalles"
                            >
                              <Eye size={18} className="text-[#2A9D8F]" />
                            </button>
                            <button
                              onClick={() => handleEditExpediente(expediente.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Editar"
                            >
                              <Edit size={18} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDownloadExpediente(expediente.id)}
                              className={`p-1 rounded-lg ${
                                darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              } transition-colors`}
                              title="Descargar"
                            >
                              <Download size={18} className="text-purple-500" />
                            </button>
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
                    {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedExpedientes.length)} de {sortedExpedientes.length}
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
      />
    </div>
  );
};

// Componente para estadísticas específicas de sección
const SectionStatCard = ({ stat, darkMode }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      yellow: "bg-yellow-50 text-yellow-600",
      red: "bg-red-50 text-red-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
      cyan: "bg-cyan-50 text-cyan-600"
    };
    return colors[color] || colors.blue;
  };

  const Icon = stat.icon;
  
  return (
    <div className={`p-6 rounded-xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${getColorClasses(stat.color).split(' ')[0]}`}>
          <Icon className={getColorClasses(stat.color).split(' ')[1]} size={24} />
        </div>
      </div>
      <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        {stat.value}
      </h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {stat.title}
      </p>
    </div>
  );
};

// Componente para elementos pendientes
const PendingItem = ({ item, darkMode }) => {
  const getStatusColor = (status) => {
    const colors = {
      'Pendiente': 'bg-yellow-500',
      'En proceso': 'bg-blue-500',
      'Completado': 'bg-green-500',
      'Urgente': 'bg-red-500',
      'Programada': 'bg-purple-500',
      'Vencido': 'bg-red-500',
      'Activo': 'bg-green-500',
      'Por renovar': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className={`p-4 rounded-lg border ${
      darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
    } transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {item.name}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(item).map(([key, value]) => {
              if (key !== 'id' && key !== 'name' && key !== 'status') {
                return (
                  <div key={key}>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {key}: 
                    </span>
                    <span className={`ml-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {value}
                    </span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <button className="text-[#2A9D8F] hover:text-[#264653] text-sm">
          Ver detalles
        </button>
      </div>
    </div>
  );
};

export default Expediente;