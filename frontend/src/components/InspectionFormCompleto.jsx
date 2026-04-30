// frontend/src/components/InspectionFormCompleto.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  ClipboardCheck,
  Building,
  User,
  Calendar,
  Clock,
  FileText,
  Home,
  Phone,
  Zap,
  Trash2,
  Plus,
  ShoppingBag,
  Package,
  Users
} from 'lucide-react';

const InspectionFormCompleto = ({ 
  isOpen, 
  onClose, 
  onSave, 
  emprendimientoData = {},
  sector = 'industria_comercio',
  darkMode = false
}) => {
  const [activeSection, setActiveSection] = useState('identificacion');
  const [loading, setLoading] = useState(false);
  
  // Estado inicial del formulario
  const initialState = {
    identificacion: {
      nombres: '',
      ci: '',
      nacionalidad: 'Venezolana',
      edad: '',
      actividad: '',
      anos_experiencia: '',
      direccion_habitacion: '',
      direccion_unidad: '',
      municipio: '',
      localidad: '',
      telefono: '',
      correo: ''
    },
    estudioMercado: {
      descripcion_producto: '',
      descripcion_proceso: '',
      usuarios: '',
      productos: [],
      ventas: [],
      materia_prima: []
    },
    aspectosTecnicos: {
      descripcion_local: '',
      tenencia_local: 'propio',
      maquinaria_existente: [],
      maquinaria_solicitada: [],
      recurso_humano: {
        empleados: 0,
        obreros: 0,
        salario_empleados: 0,
        salario_obreros: 0
      },
      servicios_basicos: {
        electricidad: false,
        agua: false,
        telefono: false,
        aseo_urbano: false,
        cloacas: false,
        gas: false
      }
    },
    agricola: {
      nombre_unidad: '',
      tipo_explotacion: [],
      superficie_total: '',
      tenencia: 'propia',
      linderos: { norte: '', sur: '', este: '', oeste: '' },
      topografia: {
        planas: { ha: '', uso: '', observaciones: '' },
        onduladas: { ha: '', uso: '', observaciones: '' },
        quebradas: { ha: '', uso: '', observaciones: '' },
        anegadizas: { ha: '', uso: '', observaciones: '' }
      },
      pastizales: { tiene: false, pastos: [], n_potreros: '', manejo_pasto: '' },
      produccion: [],
      practicas_agronomicas: '',
      costos_produccion: [],
      ingresos: [],
      flujo_caja: [],
      parametros_financieros: {
        rentabilidad_estatica: '',
        empleos_generar: '',
        importancia_economica: ''
      }
    },
    gastosMensuales: {
      mano_obra: { actual: 0, futuro: 0 },
      materia_prima: { actual: 0, futuro: 0 },
      servicios_basicos: { actual: 0, futuro: 0 },
      alquiler: { actual: 0, futuro: 0 },
      otros: { actual: 0, futuro: 0 }
    },
    planInversion: {
      construccion: { aportes_propios: 0, monto_solicitado: 0 },
      maquinaria_equipo: { aportes_propios: 0, monto_solicitado: 0 },
      materia_prima: { aportes_propios: 0, monto_solicitado: 0 },
      mano_obra: { aportes_propios: 0, monto_solicitado: 0 },
      otros_gastos: { aportes_propios: 0, monto_solicitado: 0 }
    },
    organizacionComunidad: {
      tipo_organizacion: '',
      necesidades_comunidad: '',
      aporta_comunidad: false,
      aporte_descripcion: '',
      garantia_ofrecida: 'fianza'
    },
    evaluacionFinal: {
      observaciones_generales: '',
      recomendaciones: '',
      calificacion: 0,
      estatus: 'Pendiente',
      fecha_inspeccion: new Date().toISOString().split('T')[0],
      duracion_minutos: '',
      inspector: ''
    }
  };

  const [formData, setFormData] = useState(initialState);

  // Cargar datos del emprendimiento
  useEffect(() => {
    if (isOpen && emprendimientoData && Object.keys(emprendimientoData).length > 0) {
      try {
        setFormData(prev => ({
          ...prev,
          identificacion: {
            ...prev.identificacion,
            nombres: emprendimientoData.nombre_emprendedor || '',
            ci: emprendimientoData.cedula_emprendedor || '',
            actividad: emprendimientoData.actividad || '',
            anos_experiencia: emprendimientoData.anos_experiencia || '',
            direccion_unidad: emprendimientoData.direccion_empredimiento || '',
            telefono: emprendimientoData.telefono || '',
            correo: emprendimientoData.correo || ''
          }
        }));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    }
  }, [isOpen, emprendimientoData]);

  // Manejadores de cambio
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // Funciones para productos
  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      estudioMercado: {
        ...prev.estudioMercado,
        productos: [...prev.estudioMercado.productos, {
          descripcion: '', unidad_medida: '', costo_produccion: 0, cantidad: 0
        }]
      }
    }));
  };

  const updateProducto = (index, field, value) => {
    setFormData(prev => {
      const nuevosProductos = [...prev.estudioMercado.productos];
      nuevosProductos[index] = { ...nuevosProductos[index], [field]: value };
      return {
        ...prev,
        estudioMercado: { ...prev.estudioMercado, productos: nuevosProductos }
      };
    });
  };

  const removeProducto = (index) => {
    setFormData(prev => ({
      ...prev,
      estudioMercado: {
        ...prev.estudioMercado,
        productos: prev.estudioMercado.productos.filter((_, i) => i !== index)
      }
    }));
  };

  // Funciones para ventas
  const addVenta = () => {
    setFormData(prev => ({
      ...prev,
      estudioMercado: {
        ...prev.estudioMercado,
        ventas: [...prev.estudioMercado.ventas, {
          descripcion: '', unidad_medida: '', cantidad: 0, precio_venta: 0
        }]
      }
    }));
  };

  const updateVenta = (index, field, value) => {
    setFormData(prev => {
      const nuevasVentas = [...prev.estudioMercado.ventas];
      nuevasVentas[index] = { ...nuevasVentas[index], [field]: value };
      return {
        ...prev,
        estudioMercado: { ...prev.estudioMercado, ventas: nuevasVentas }
      };
    });
  };

  const removeVenta = (index) => {
    setFormData(prev => ({
      ...prev,
      estudioMercado: {
        ...prev.estudioMercado,
        ventas: prev.estudioMercado.ventas.filter((_, i) => i !== index)
      }
    }));
  };

  // Calcular calificación
  const calcularCalificacion = () => {
    try {
      let puntaje = 0;
      let maxPuntaje = 0;
      
      if (sector === 'industria_comercio') {
        if (formData.estudioMercado?.descripcion_producto) puntaje += 5;
        maxPuntaje += 5;
        if (formData.estudioMercado?.usuarios) puntaje += 5;
        maxPuntaje += 5;
        if (formData.estudioMercado?.productos?.length > 0) puntaje += 5;
        maxPuntaje += 5;
        if (formData.aspectosTecnicos?.descripcion_local) puntaje += 5;
        maxPuntaje += 5;
      } else {
        if (formData.agricola?.superficie_total) puntaje += 10;
        maxPuntaje += 10;
        if (formData.agricola?.produccion?.length > 0) puntaje += 10;
        maxPuntaje += 10;
      }
      
      if (formData.organizacionComunidad?.tipo_organizacion) puntaje += 5;
      maxPuntaje += 5;
      if (formData.organizacionComunidad?.aporta_comunidad) puntaje += 5;
      maxPuntaje += 5;
      
      if (maxPuntaje === 0) return 0;
      
      const porcentaje = (puntaje / maxPuntaje) * 100;
      return Math.round((porcentaje / 20) * 10) / 10;
    } catch (error) {
      return 0;
    }
  };

  const determinarEstatus = (calificacion) => {
    if (calificacion >= 4) return 'Aprobado';
    if (calificacion >= 3) return 'Aprobado con observaciones';
    return 'Rechazado';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const calificacion = calcularCalificacion();
      const estatus = determinarEstatus(calificacion);
      
      const resultados = {
        ...formData,
        evaluacionFinal: {
          ...formData.evaluacionFinal,
          calificacion,
          estatus,
          sector
        }
      };
      
      await onSave(resultados);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar la inspección');
    } finally {
      setLoading(false);
    }
  };

  // Si no está abierto, no renderizar
  if (!isOpen) return null;

  // Determinar secciones según sector
  const sections = sector === 'agricola' 
    ? ['identificacion', 'agricola', 'organizacionComunidad', 'evaluacionFinal']
    : ['identificacion', 'estudioMercado', 'aspectosTecnicos', 'gastosMensuales', 'planInversion', 'organizacionComunidad', 'evaluacionFinal'];

  const sectionTitles = {
    identificacion: '1. Identificación',
    estudioMercado: '2. Estudio de Mercado',
    aspectosTecnicos: '3. Aspectos Técnicos',
    gastosMensuales: '4. Gastos Mensuales',
    planInversion: '5. Plan de Inversión',
    organizacionComunidad: '6. Organización y Comunidad',
    agricola: 'Información Agrícola',
    evaluacionFinal: 'Evaluación Final'
  };

  // Estilos comunes
  const inputClass = `w-full px-3 py-2 rounded-lg border ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`;

  const labelClass = `block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative rounded-lg shadow-xl max-w-6xl w-full ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`px-6 py-4 border-b flex items-center justify-between ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="text-[#2A9D8F]" size={28} />
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Formulario de Inspección Técnica
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sector: {sector === 'agricola' ? 'Agrícola' : 'Industria y Comercio'}
                  {emprendimientoData?.nombre_emprendimiento && ` - ${emprendimientoData.nombre_emprendimiento}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              type="button"
            >
              <X size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>

          {/* Navegación por pestañas */}
          <div className={`px-6 pt-4 border-b overflow-x-auto ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex gap-1">
              {sections.map(section => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeSection === section
                      ? `text-[#2A9D8F] border-b-2 border-[#2A9D8F] ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`
                      : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {sectionTitles[section]}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido del formulario */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              
              {/* SECCIÓN: Identificación */}
              {activeSection === 'identificacion' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}><User size={16} className="inline mr-2" />Nombre y Apellido</label>
                    <input type="text" value={formData.identificacion.nombres}
                      onChange={(e) => handleInputChange('identificacion', 'nombres', e.target.value)}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>C.I. / RIF</label>
                    <input type="text" value={formData.identificacion.ci}
                      onChange={(e) => handleInputChange('identificacion', 'ci', e.target.value)}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Nacionalidad</label>
                    <select value={formData.identificacion.nacionalidad}
                      onChange={(e) => handleInputChange('identificacion', 'nacionalidad', e.target.value)}
                      className={inputClass}>
                      <option value="Venezolana">Venezolana</option>
                      <option value="Extranjera">Extranjera</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Edad</label>
                    <input type="number" value={formData.identificacion.edad}
                      onChange={(e) => handleInputChange('identificacion', 'edad', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Actividad</label>
                    <input type="text" value={formData.identificacion.actividad}
                      onChange={(e) => handleInputChange('identificacion', 'actividad', e.target.value)}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Años de Experiencia</label>
                    <input type="text" value={formData.identificacion.anos_experiencia}
                      onChange={(e) => handleInputChange('identificacion', 'anos_experiencia', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}><Home size={16} className="inline mr-2" />Dirección de Habitación</label>
                    <input type="text" value={formData.identificacion.direccion_habitacion}
                      onChange={(e) => handleInputChange('identificacion', 'direccion_habitacion', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}><Building size={16} className="inline mr-2" />Dirección de la Unidad</label>
                    <input type="text" value={formData.identificacion.direccion_unidad}
                      onChange={(e) => handleInputChange('identificacion', 'direccion_unidad', e.target.value)}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Municipio</label>
                    <input type="text" value={formData.identificacion.municipio}
                      onChange={(e) => handleInputChange('identificacion', 'municipio', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Localidad</label>
                    <input type="text" value={formData.identificacion.localidad}
                      onChange={(e) => handleInputChange('identificacion', 'localidad', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}><Phone size={16} className="inline mr-2" />Teléfono</label>
                    <input type="tel" value={formData.identificacion.telefono}
                      onChange={(e) => handleInputChange('identificacion', 'telefono', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Correo Electrónico</label>
                    <input type="email" value={formData.identificacion.correo}
                      onChange={(e) => handleInputChange('identificacion', 'correo', e.target.value)}
                      className={inputClass} />
                  </div>
                </div>
              )}

              {/* SECCIÓN: Estudio de Mercado */}
              {activeSection === 'estudioMercado' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Descripción del Producto o Servicio</label>
                    <textarea rows="3" value={formData.estudioMercado.descripcion_producto}
                      onChange={(e) => handleInputChange('estudioMercado', 'descripcion_producto', e.target.value)}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Descripción del Proceso Productivo</label>
                    <textarea rows="3" value={formData.estudioMercado.descripcion_proceso}
                      onChange={(e) => handleInputChange('estudioMercado', 'descripcion_proceso', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Usuarios del Producto</label>
                    <textarea rows="2" value={formData.estudioMercado.usuarios}
                      onChange={(e) => handleInputChange('estudioMercado', 'usuarios', e.target.value)}
                      className={inputClass} />
                  </div>

                  {/* Productos */}
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Package size={18} className="inline mr-2" />Producción Mensual
                      </h4>
                      <button type="button" onClick={addProducto}
                        className="px-3 py-1 text-sm bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] flex items-center gap-1">
                        <Plus size={16} /> Agregar
                      </button>
                    </div>
                    
                    {formData.estudioMercado.productos.map((producto, idx) => (
                      <div key={idx} className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} relative`}>
                        <button type="button" onClick={() => removeProducto(idx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <input type="text" placeholder="Descripción" value={producto.descripcion}
                            onChange={(e) => updateProducto(idx, 'descripcion', e.target.value)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          <input type="text" placeholder="Unidad" value={producto.unidad_medida}
                            onChange={(e) => updateProducto(idx, 'unidad_medida', e.target.value)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          <input type="number" placeholder="Cantidad" value={producto.cantidad || ''}
                            onChange={(e) => updateProducto(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          <input type="number" placeholder="Costo USD" value={producto.costo_produccion || ''}
                            onChange={(e) => updateProducto(idx, 'costo_produccion', parseFloat(e.target.value) || 0)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ventas */}
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <ShoppingBag size={18} className="inline mr-2" />Ventas Mensuales
                      </h4>
                      <button type="button" onClick={addVenta}
                        className="px-3 py-1 text-sm bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] flex items-center gap-1">
                        <Plus size={16} /> Agregar
                      </button>
                    </div>
                    
                    {formData.estudioMercado.ventas.map((venta, idx) => (
                      <div key={idx} className={`mb-3 p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} relative`}>
                        <button type="button" onClick={() => removeVenta(idx)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <input type="text" placeholder="Descripción" value={venta.descripcion}
                            onChange={(e) => updateVenta(idx, 'descripcion', e.target.value)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          <input type="text" placeholder="Unidad" value={venta.unidad_medida}
                            onChange={(e) => updateVenta(idx, 'unidad_medida', e.target.value)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          <input type="number" placeholder="Cantidad" value={venta.cantidad || ''}
                            onChange={(e) => updateVenta(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          <input type="number" placeholder="Precio USD" value={venta.precio_venta || ''}
                            onChange={(e) => updateVenta(idx, 'precio_venta', parseFloat(e.target.value) || 0)}
                            className={`px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-700 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN: Aspectos Técnicos */}
              {activeSection === 'aspectosTecnicos' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}><Building size={16} className="inline mr-2" />Descripción del Local</label>
                    <textarea rows="3" value={formData.aspectosTecnicos.descripcion_local}
                      onChange={(e) => handleInputChange('aspectosTecnicos', 'descripcion_local', e.target.value)}
                      className={inputClass} />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Tenencia del Local</label>
                    <div className="flex gap-4">
                      {['propio', 'alquilado', 'otro'].map(tipo => (
                        <label key={tipo} className="flex items-center gap-2">
                          <input type="radio" name="tenencia_local" value={tipo}
                            checked={formData.aspectosTecnicos.tenencia_local === tipo}
                            onChange={(e) => handleInputChange('aspectosTecnicos', 'tenencia_local', e.target.value)}
                            className="text-[#2A9D8F]" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tipo.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}><Zap size={16} className="inline mr-2" />Servicios Básicos</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['electricidad', 'agua', 'telefono', 'aseo_urbano', 'cloacas', 'gas'].map(servicio => (
                        <label key={servicio} className="flex items-center gap-2">
                          <input type="checkbox"
                            checked={formData.aspectosTecnicos.servicios_basicos[servicio]}
                            onChange={(e) => handleNestedChange('aspectosTecnicos', 'servicios_basicos', servicio, e.target.checked)}
                            className="rounded text-[#2A9D8F]" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {servicio.replace('_', ' ').toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Users size={18} className="inline mr-2" />Recurso Humano
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Empleados</label>
                        <input type="number" value={formData.aspectosTecnicos.recurso_humano.empleados || ''}
                          onChange={(e) => handleNestedChange('aspectosTecnicos', 'recurso_humano', 'empleados', parseInt(e.target.value) || 0)}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Salario Empleados (USD)</label>
                        <input type="number" value={formData.aspectosTecnicos.recurso_humano.salario_empleados || ''}
                          onChange={(e) => handleNestedChange('aspectosTecnicos', 'recurso_humano', 'salario_empleados', parseFloat(e.target.value) || 0)}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Obreros</label>
                        <input type="number" value={formData.aspectosTecnicos.recurso_humano.obreros || ''}
                          onChange={(e) => handleNestedChange('aspectosTecnicos', 'recurso_humano', 'obreros', parseInt(e.target.value) || 0)}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Salario Obreros (USD)</label>
                        <input type="number" value={formData.aspectosTecnicos.recurso_humano.salario_obreros || ''}
                          onChange={(e) => handleNestedChange('aspectosTecnicos', 'recurso_humano', 'salario_obreros', parseFloat(e.target.value) || 0)}
                          className={inputClass} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN: Gastos Mensuales */}
              {activeSection === 'gastosMensuales' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-right">Actual (USD)</th>
                        <th className="px-4 py-2 text-right">Futuro (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['mano_obra', 'materia_prima', 'servicios_basicos', 'alquiler', 'otros'].map(gasto => (
                        <tr key={gasto}>
                          <td className="px-4 py-2 capitalize">{gasto.replace('_', ' ')}</td>
                          <td className="px-4 py-2">
                            <input type="number" value={formData.gastosMensuales[gasto].actual || ''}
                              onChange={(e) => handleNestedChange('gastosMensuales', gasto, 'actual', parseFloat(e.target.value) || 0)}
                              className={`w-28 px-2 py-1 rounded border text-right text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={formData.gastosMensuales[gasto].futuro || ''}
                              onChange={(e) => handleNestedChange('gastosMensuales', gasto, 'futuro', parseFloat(e.target.value) || 0)}
                              className={`w-28 px-2 py-1 rounded border text-right text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECCIÓN: Plan de Inversión */}
              {activeSection === 'planInversion' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-right">Aportes Propios (USD)</th>
                        <th className="px-4 py-2 text-right">Monto Solicitado (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['construccion', 'maquinaria_equipo', 'materia_prima', 'mano_obra', 'otros_gastos'].map(item => (
                        <tr key={item}>
                          <td className="px-4 py-2 capitalize">{item.replace('_', ' ')}</td>
                          <td className="px-4 py-2">
                            <input type="number" value={formData.planInversion[item].aportes_propios || ''}
                              onChange={(e) => handleNestedChange('planInversion', item, 'aportes_propios', parseFloat(e.target.value) || 0)}
                              className={`w-36 px-2 py-1 rounded border text-right text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={formData.planInversion[item].monto_solicitado || ''}
                              onChange={(e) => handleNestedChange('planInversion', item, 'monto_solicitado', parseFloat(e.target.value) || 0)}
                              className={`w-36 px-2 py-1 rounded border text-right text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-200'}`} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECCIÓN: Agrícola */}
              {activeSection === 'agricola' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nombre de la Unidad</label>
                      <input type="text" value={formData.agricola.nombre_unidad}
                        onChange={(e) => handleInputChange('agricola', 'nombre_unidad', e.target.value)}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Superficie Total (ha)</label>
                      <input type="number" step="0.01" value={formData.agricola.superficie_total}
                        onChange={(e) => handleInputChange('agricola', 'superficie_total', e.target.value)}
                        className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Tenencia de la Tierra</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['propia', 'comunero', 'arrendatario', 'uso_goce', 'ejidos', 'inti', 'otros'].map(tipo => (
                        <label key={tipo} className="flex items-center gap-2">
                          <input type="radio" name="tenencia" value={tipo}
                            checked={formData.agricola.tenencia === tipo}
                            onChange={(e) => handleInputChange('agricola', 'tenencia', e.target.value)}
                            className="text-[#2A9D8F]" />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {tipo.replace('_', ' ').toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN: Organización y Comunidad */}
              {activeSection === 'organizacionComunidad' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Tipo de Organización</label>
                    <textarea rows="2" value={formData.organizacionComunidad.tipo_organizacion}
                      onChange={(e) => handleInputChange('organizacionComunidad', 'tipo_organizacion', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Necesidades de la Comunidad</label>
                    <textarea rows="2" value={formData.organizacionComunidad.necesidades_comunidad}
                      onChange={(e) => handleInputChange('organizacionComunidad', 'necesidades_comunidad', e.target.value)}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>¿Realiza aporte a la comunidad?</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="aporta_comunidad" checked={formData.organizacionComunidad.aporta_comunidad === true}
                          onChange={() => handleInputChange('organizacionComunidad', 'aporta_comunidad', true)}
                          className="text-[#2A9D8F]" /> <span>Sí</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="aporta_comunidad" checked={formData.organizacionComunidad.aporta_comunidad === false}
                          onChange={() => handleInputChange('organizacionComunidad', 'aporta_comunidad', false)}
                          className="text-[#2A9D8F]" /> <span>No</span>
                      </label>
                    </div>
                    {formData.organizacionComunidad.aporta_comunidad && (
                      <textarea rows="2" placeholder="Describa el aporte"
                        value={formData.organizacionComunidad.aporte_descripcion}
                        onChange={(e) => handleInputChange('organizacionComunidad', 'aporte_descripcion', e.target.value)}
                        className={inputClass} />
                    )}
                  </div>
                </div>
              )}

              {/* SECCIÓN: Evaluación Final */}
              {activeSection === 'evaluacionFinal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><Calendar size={16} className="inline mr-2" />Fecha de Inspección</label>
                      <input type="date" value={formData.evaluacionFinal.fecha_inspeccion}
                        onChange={(e) => handleInputChange('evaluacionFinal', 'fecha_inspeccion', e.target.value)}
                        className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}><Clock size={16} className="inline mr-2" />Duración (minutos)</label>
                      <input type="number" value={formData.evaluacionFinal.duracion_minutos}
                        onChange={(e) => handleInputChange('evaluacionFinal', 'duracion_minutos', e.target.value)}
                        className={inputClass} placeholder="Ej: 120" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}><FileText size={16} className="inline mr-2" />Observaciones Generales</label>
                    <textarea rows="3" value={formData.evaluacionFinal.observaciones_generales}
                      onChange={(e) => handleInputChange('evaluacionFinal', 'observaciones_generales', e.target.value)}
                      className={inputClass} placeholder="Observaciones importantes..." />
                  </div>
                  <div>
                    <label className={labelClass}>Recomendaciones</label>
                    <textarea rows="3" value={formData.evaluacionFinal.recomendaciones}
                      onChange={(e) => handleInputChange('evaluacionFinal', 'recomendaciones', e.target.value)}
                      className={inputClass} placeholder="Recomendaciones..." />
                  </div>
                  
                  {/* Resumen de calificación */}
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Calificación</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Se calcula automáticamente</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-3xl font-bold ${
                          calcularCalificacion() >= 4 ? 'text-green-500' : 
                          calcularCalificacion() >= 3 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {calcularCalificacion()}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex justify-between ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex gap-2">
                {sections.map((section, idx) => {
                  const currentIdx = sections.indexOf(activeSection);
                  if (idx === currentIdx - 1) {
                    return (
                      <button key={`prev`} type="button"
                        onClick={() => setActiveSection(sections[currentIdx - 1])}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>← Anterior</button>
                    );
                  }
                  if (idx === currentIdx + 1) {
                    return (
                      <button key={`next`} type="button"
                        onClick={() => setActiveSection(sections[currentIdx + 1])}
                        className={`px-4 py-2 rounded-lg text-sm ${
                          darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>Siguiente →</button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>Cancelar</button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2 bg-[#2A9D8F] text-white rounded-lg hover:bg-[#264653] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm">
                  {loading ? 'Guardando...' : <><Save size={18} /> Guardar Inspección</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InspectionFormCompleto;