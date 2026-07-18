// ============================================================
// FUNCIONES DE CÁLCULO DE MORA
// ============================================================

const calcularDiasMora = (fechaVencimiento, fechaPago, estado, fechaCierre = null) => {
    if (estado === 'pagado' && fechaPago) {
        const vencimiento = new Date(fechaVencimiento);
        const pago = new Date(fechaPago);
        vencimiento.setHours(0, 0, 0, 0);
        pago.setHours(0, 0, 0, 0);
        
        if (pago <= vencimiento) {
            return 0;
        }
        
        const diffTime = pago - vencimiento;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
    
    if (estado !== 'pagado') {
        const vencimiento = new Date(fechaVencimiento);
        vencimiento.setHours(0, 0, 0, 0);
        
        let fechaReferencia;
        if (fechaCierre) {
            fechaReferencia = new Date(fechaCierre);
        } else {
            fechaReferencia = new Date();
        }
        fechaReferencia.setHours(0, 0, 0, 0);
        
        if (fechaReferencia <= vencimiento) {
            return 0;
        }
        
        const diffTime = fechaReferencia - vencimiento;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 5) {
            return 0;
        }
        
        return diffDays;
    }
    
    return 0;
};

const calcularTasaMoraDiaria = (tasaMensual) => {
    return Math.pow(1 + tasaMensual, 1/30) - 1;
};

const calcularMontoMorosidadDiario = (montoCuota, diasMora, tasaMoraDiaria, montoAbonado = 0) => {
    if (diasMora <= 0 || montoCuota <= 0) {
        return 0;
    }
    
    const factor = Math.pow(1 + tasaMoraDiaria, diasMora);
    const montoMora = montoCuota * (factor - 1);
    const montoFinal = Math.max(0, montoMora - montoAbonado);
    
    return Math.round(montoFinal * 100) / 100;
};

// ============================================================
// IMPORTS
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, CreditCard, Clock, AlertCircle,
  TrendingUp, Calendar, CheckCircle, XCircle, Eye, Download,
  Wallet, Receipt, PhoneCall, User, FileText,
  LayoutGrid, List, Settings, Lock, Loader, Image as ImageIcon
} from "lucide-react";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CuotaAPI from '../services/api_cuota';
import usuarioAPI from '../services/api_usuario';
import { uploadToImgBB } from '../services/imgbbService';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const Cuota = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuota, setSelectedCuota] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentReceiptModal, setShowPaymentReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const [allPrestamos, setAllPrestamos] = useState([]);
  const [myPrestamos, setMyPrestamos] = useState([]);
  const [allCuotas, setAllCuotas] = useState([]);
  const [myCuotas, setMyCuotas] = useState([]);
  
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [activeView, setActiveView] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [fechaCierre, setFechaCierre] = useState(new Date().toISOString().split('T')[0]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPrestamoForGeneration, setSelectedPrestamoForGeneration] = useState(null);
  const [generationConfig, setGenerationConfig] = useState({
    cantidadCuotas: 0,
    montoPorCuota: 0,
    frecuencia: "mensual",
    fechaPrimeraCuota: "",
    incluirMora: false
  });

  const user = {
    name: "Administrador IADEY",
    email: "admin@iadey.gob.ve",
    role: "Administrador",
    avatar: null,
    department: "Gestión de Cuotas",
    joinDate: "Enero 2024"
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Pago de cuota registrado", time: "5 min", read: false },
    { id: 2, text: "Nuevo vencimiento próximo", time: "1 hora", read: false },
    { id: 3, text: "Actualización de tasas", time: "3 horas", read: true },
  ]);

  // ============================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================
  
  const isCuotaVigente = (fechaDesde, fechaHasta) => {
    if (!fechaDesde || !fechaHasta) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const desde = new Date(fechaDesde);
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59, 999);
    return hoy >= desde && hoy <= hasta;
  };

  const getCuotaStatus = (fechaVencimiento, fechaPago, estadoBase, fechaDesde, fechaHasta) => {
    if (estadoBase === "pagado") return "pagado";
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      desde.setHours(0, 0, 0, 0);
      if (hoy < desde) return "proxima";
    }
    
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);
    
    if (estadoBase === "pendiente") {
      const diffDays = Math.floor((hoy - vencimiento) / (1000 * 60 * 60 * 24));
      
      if (hoy > vencimiento) {
        if (diffDays <= 5) return "en_gracia";
        if (diffDays > 30) return "vencido";
        return "en_mora";
      }
      
      if (isCuotaVigente(fechaDesde, fechaHasta)) return "vigente";
      return "pendiente";
    }
    
    return estadoBase;
  };

  const canPayCuota = (cuota) => {
    if (cuota.estado === "pagado") return false;
    const estado = getCuotaStatus(
      cuota.fechaVencimiento, 
      cuota.fechaPago, 
      cuota.estado,
      cuota.fechaDesde,
      cuota.fechaHasta
    );
    return ["vigente", "pendiente", "en_gracia", "en_mora", "vencido"].includes(estado);
  };

  const getEstadoConfig = (cuota) => {
    const status = getCuotaStatus(cuota.fechaVencimiento, cuota.fechaPago, cuota.estado, cuota.fechaDesde, cuota.fechaHasta);
    
    switch(status) {
      case "pagado":
        return { text: "Pagado", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle };
      case "vigente":
        return { text: "Vigente", color: "text-blue-600", bg: "bg-blue-100", icon: CreditCard };
      case "en_gracia":
        return { text: "En Gracia", color: "text-teal-600", bg: "bg-teal-100", icon: Clock };
      case "vencido":
        return { text: "Vencido", color: "text-red-600", bg: "bg-red-100", icon: XCircle };
      case "en_mora":
        return { text: "En Mora", color: "text-orange-600", bg: "bg-orange-100", icon: AlertCircle };
      case "proxima":
        return { text: "Próxima", color: "text-gray-600", bg: "bg-gray-100", icon: Lock };
      default:
        return { text: "Pendiente", color: "text-yellow-600", bg: "bg-yellow-100", icon: Clock };
    }
  };

  // ============================================================
  // FUNCIONES PARA FORMATEAR CONTRATOS
  // ============================================================
  
  const formatearContratos = (data, fechaActual) => {
    return data.map(contrato => {
      const tasaMoraMensual = parseFloat(contrato.interes_mora) || 0.05;
      const tasaDiaria = calcularTasaMoraDiaria(tasaMoraMensual);
      
      const cuotasConMora = (contrato.cuotas || []).map(cuota => {
        const fechaVencimiento = cuota.fecha_hasta ? cuota.fecha_hasta.split('T')[0] : 
                                cuota.fecha_vencimiento ? cuota.fecha_vencimiento.split('T')[0] : '';
        
        const diasMora = calcularDiasMora(
          fechaVencimiento,
          cuota.fecha_pago ? cuota.fecha_pago.split('T')[0] : null,
          cuota.estado_cuota,
          fechaActual
        );
        
        const montoMorosidad = calcularMontoMorosidadDiario(
          parseFloat(cuota.monto_cuota) || 0,
          diasMora,
          tasaDiaria,
          parseFloat(cuota.monto_mora) || 0
        );
        
        return {
          id: cuota.id_cuota,
          numero: cuota.num_cuota,
          fechaDesde: cuota.fecha_desde ? cuota.fecha_desde.split('T')[0] : '',
          fechaHasta: cuota.fecha_hasta ? cuota.fecha_hasta.split('T')[0] : '',
          fechaVencimiento: fechaVencimiento,
          monto: parseFloat(cuota.monto_cuota) || 0,
          estado: cuota.estado_cuota,
          fechaPago: cuota.fecha_pago ? cuota.fecha_pago.split('T')[0] : null,
          comprobante: cuota.comprobante_pago,
          montoPagado: parseFloat(cuota.monto_pagado) || 0,
          moraPagada: parseFloat(cuota.monto_mora) || 0,
          dias_mora_cuota: diasMora,
          monto_morosidad: montoMorosidad,
          tasa_mora_diaria: tasaDiaria,
          metodoPago: cuota.metodo_pago,
          referencia: cuota.referencia_pago,
          tipo_cuota: cuota.tipo_cuota || cuota.tipo || 'Obligatoria',
          usuario_asignado: cuota.usuario_asignado || null
        };
      });
      
      return {
        id: contrato.id_contrato,
        id_cedula_aprob: contrato.id_cedula_aprob,
        numero_contrato: contrato.numero_contrato,
        cliente: `${contrato.aprobacion?.cliente_nombre || 'Cliente'}`,
        cedula: contrato.aprobacion?.cliente_cedula || '',
        telefono: contrato.aprobacion?.cliente_telefono || '',
        email: contrato.aprobacion?.cliente_email || '',
        direccion: contrato.aprobacion?.cliente_direccion || '',
        montoTotal: parseFloat(contrato.devolvimiento) || 0,
        montoPagado: 0,
        saldoPendiente: parseFloat(contrato.monto_moneda) || 0,
        tasaInteres: parseFloat(contrato.interes) || 0,
        tasaInteresMora: tasaMoraMensual,
        plazo: contrato.numero_cuotas || 0,
        cuotasPagadas: 0,
        numero_gracias: contrato.numero_gracias || 0,
        devolvimiento: contrato.devolvimiento,
        monto_moneda: contrato.monto_moneda,
        cuotasPendientes: contrato.numero_cuotas || 0,
        estado: contrato.estatus === 'En espera de cuotas' ? 'pendiente' : 
                contrato.estatus === 'Activo' ? 'activo' : 'pagado',
        fechaInicio: contrato.inicio ? contrato.inicio.split('T')[0] : '',
        fechaCierre: contrato.cierre ? contrato.cierre.split('T')[0] : null,
        montoCuota: cuotasConMora.length > 0 ? cuotasConMora[0].monto : 0,
        cuotas: cuotasConMora,
        totalMorosidad: cuotasConMora.reduce((sum, c) => sum + (c.monto_morosidad || 0), 0)
      };
    });
  };

  // ============================================================
  // CARGAR TODOS LOS CONTRATOS (getAll)
  // ============================================================
  const cargarTodosLosContratos = async () => {
    try {
      setLoadingAll(true);
      console.log('📋 Cargando TODOS los contratos con CuotaAPI.getAll()');
      
      const response = await CuotaAPI.getAll();
      
      if (response.success) {
        const fechaActual = new Date().toISOString().split('T')[0];
        const contratosFormateados = formatearContratos(response.data, fechaActual);
        
        contratosFormateados.forEach(contrato => {
          const pagadas = contrato.cuotas.filter(c => c.estado === 'pagado');
          contrato.cuotasPagadas = pagadas.length;
          contrato.cuotasPendientes = contrato.plazo - pagadas.length;
          contrato.montoPagado = pagadas.reduce((sum, c) => sum + c.monto, 0);
          contrato.saldoPendiente = contrato.montoTotal - contrato.montoPagado;
        });
        
        setAllPrestamos(contratosFormateados);
        
        const todasLasCuotas = [];
        contratosFormateados.forEach(contrato => {
          contrato.cuotas.forEach(cuota => {
            todasLasCuotas.push({
              ...cuota,
              contratoId: contrato.id,
              id_cedula_aprob: contrato.id_cedula_aprob,
              numero_contrato: contrato.numero_contrato,
              cliente: contrato.cliente,
              cedula: contrato.cedula,
              montoTotal: contrato.montoTotal,
              plazo: contrato.plazo,
              estadoContrato: contrato.estado,
              totalMorosidad: contrato.totalMorosidad
            });
          });
        });
        setAllCuotas(todasLasCuotas);
        
        console.log('✅ Total contratos:', contratosFormateados.length);
        console.log('✅ Total cuotas:', todasLasCuotas.length);
      }
    } catch (error) {
      console.error('Error al cargar todos los contratos:', error);
    } finally {
      setLoadingAll(false);
    }
  };

  // ============================================================
  // CARGAR MIS CONTRATOS (getByCedulaAprob)
  // ============================================================
  const cargarMisContratos = async () => {
    try {
      setLoadingMine(true);
      
      const userData = usuarioAPI.getCurrentUser();
      const cedula = userData?.cedula_usuario || userData?.cedula;
      
      if (!cedula) {
        console.warn('⚠️ Usuario sin cédula, no se pueden cargar "Mis Cuotas"');
        setMyPrestamos([]);
        setMyCuotas([]);
        return;
      }
      
      console.log(`👤 Cargando MIS contratos para cédula: ${cedula}`);
      console.log('🔗 Usando CuotaAPI.getByCedulaAprob()');
      
      const response = await CuotaAPI.getByCedulaAprob(cedula);
      
      if (response.success) {
        const fechaActual = new Date().toISOString().split('T')[0];
        const contratosFormateados = formatearContratos(response.data, fechaActual);
        
        contratosFormateados.forEach(contrato => {
          const pagadas = contrato.cuotas.filter(c => c.estado === 'pagado');
          contrato.cuotasPagadas = pagadas.length;
          contrato.cuotasPendientes = contrato.plazo - pagadas.length;
          contrato.montoPagado = pagadas.reduce((sum, c) => sum + c.monto, 0);
          contrato.saldoPendiente = contrato.montoTotal - contrato.montoPagado;
        });
        
        setMyPrestamos(contratosFormateados);
        
        const misCuotas = [];
        contratosFormateados.forEach(contrato => {
          contrato.cuotas.forEach(cuota => {
            misCuotas.push({
              ...cuota,
              contratoId: contrato.id,
              id_cedula_aprob: contrato.id_cedula_aprob,
              numero_contrato: contrato.numero_contrato,
              cliente: contrato.cliente,
              cedula: contrato.cedula,
              montoTotal: contrato.montoTotal,
              plazo: contrato.plazo,
              estadoContrato: contrato.estado,
              totalMorosidad: contrato.totalMorosidad
            });
          });
        });
        setMyCuotas(misCuotas);
        
        console.log('✅ Mis contratos:', contratosFormateados.length);
        console.log('✅ Mis cuotas:', misCuotas.length);
      }
    } catch (error) {
      console.error('Error al cargar mis contratos:', error);
      setMyPrestamos([]);
      setMyCuotas([]);
    } finally {
      setLoadingMine(false);
    }
  };

  // ============================================================
  // ACTUALIZAR MOROSIDAD
  // ============================================================
  const actualizarMorosidadDiaria = useCallback(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    
    setAllPrestamos(prev => prev.map(prestamo => {
      const tasaMoraMensual = prestamo.tasaInteresMora || 0.05;
      const tasaDiaria = calcularTasaMoraDiaria(tasaMoraMensual);
      
      const cuotasActualizadas = prestamo.cuotas.map(cuota => {
        if (cuota.estado !== 'pagado') {
          const diasMora = calcularDiasMora(
            cuota.fechaVencimiento,
            cuota.fechaPago,
            cuota.estado,
            fechaActual
          );
          const montoMorosidad = calcularMontoMorosidadDiario(
            cuota.monto,
            diasMora,
            tasaDiaria,
            cuota.moraPagada || 0
          );
          return { ...cuota, dias_mora_cuota: diasMora, monto_morosidad: montoMorosidad };
        }
        return cuota;
      });
      
      return { ...prestamo, cuotas: cuotasActualizadas };
    }));
    
    setMyPrestamos(prev => prev.map(prestamo => {
      const tasaMoraMensual = prestamo.tasaInteresMora || 0.05;
      const tasaDiaria = calcularTasaMoraDiaria(tasaMoraMensual);
      
      const cuotasActualizadas = prestamo.cuotas.map(cuota => {
        if (cuota.estado !== 'pagado') {
          const diasMora = calcularDiasMora(
            cuota.fechaVencimiento,
            cuota.fechaPago,
            cuota.estado,
            fechaActual
          );
          const montoMorosidad = calcularMontoMorosidadDiario(
            cuota.monto,
            diasMora,
            tasaDiaria,
            cuota.moraPagada || 0
          );
          return { ...cuota, dias_mora_cuota: diasMora, monto_morosidad: montoMorosidad };
        }
        return cuota;
      });
      
      return { ...prestamo, cuotas: cuotasActualizadas };
    }));
  }, []);

  // ============================================================
  // REGISTRAR PAGO
  // ============================================================
  const handleRegisterPayment = async (prestamoId, cuotaNumero, pagoData) => {
    try {
      const { montoPagado, comprobante, metodoPago, referencia, mora, diasMora } = pagoData;
      const fecha_pagada = new Date().toISOString().split('T')[0];
      
      const cuotaEncontrada = allCuotas.find(
        c => c.contratoId === prestamoId && c.numero === cuotaNumero
      );
      
      if (!cuotaEncontrada) {
        throw new Error('Cuota no encontrada');
      }
      
      let comprobanteUrl = comprobante;
      if (comprobante instanceof File) {
        try {
          const uploadResult = await uploadToImgBB(comprobante);
          comprobanteUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('Error al subir comprobante:', uploadError);
          throw new Error('Error al subir el comprobante de pago');
        }
      }
      
      const response = await CuotaAPI.registrarPago(cuotaEncontrada.id, {
        fecha_pagada: fecha_pagada,
        comprobante: comprobanteUrl,
        monto_pagado: montoPagado,
        metodo_pago: metodoPago,
        referencia: referencia,
        monto_morosidad: mora || 0,
        dias_mora_cuota: diasMora || 0
      });
      
      if (response.success) {
        const mensajeExito = response.data.cuotas_gracia_actualizadas?.length > 0
          ? `✅ Pago registrado. Se recalcularon ${response.data.cuotas_gracia_actualizadas.length} cuotas de gracia.`
          : `✅ Pago de cuota ${cuotaNumero} registrado exitosamente.`;
        
        await cargarTodosLosContratos();
        await cargarMisContratos();
        
        setShowPaymentModal(false);
        setSelectedCuota(null);
        
        setNotifications([
          { id: Date.now(), text: mensajeExito, time: "Justo ahora", read: false },
          ...notifications
        ]);
      }
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago: ' + (error.message || 'Error desconocido'));
    }
  };

  // ============================================================
  // VER COMPROBANTE
  // ============================================================
  const handleViewReceipt = (prestamoId, cuota) => {
    const prestamo = allPrestamos.find(p => p.id === prestamoId) || 
                     myPrestamos.find(p => p.id === prestamoId);
    setSelectedPayment({ prestamoId, cuota, prestamo });
    setShowPaymentReceiptModal(true);
  };

  // ============================================================
  // GENERAR CUOTAS
  // ============================================================
  const handleGenerateCuotas = (prestamoId) => {
    const prestamo = allPrestamos.find(p => p.id === prestamoId) || 
                     myPrestamos.find(p => p.id === prestamoId);
    if (prestamo) {
      const cuotasRestantes = prestamo.plazo - prestamo.cuotas.length;
      const montoPorCuota = prestamo.montoCuota || (prestamo.montoTotal / prestamo.plazo);
      
      setGenerationConfig({
        cantidadCuotas: cuotasRestantes > 0 ? cuotasRestantes : prestamo.plazo,
        montoPorCuota: montoPorCuota,
        frecuencia: "mensual",
        fechaPrimeraCuota: new Date().toISOString().split('T')[0],
        incluirMora: false
      });
      
      setSelectedPrestamoForGeneration(prestamo);
      setShowGenerateModal(true);
    }
  };

  const confirmGenerateCuotas = async (configuracion) => {
    if (!selectedPrestamoForGeneration) return;
    
    const config = {
      cantidadCuotas: configuracion.cantidadCuotas,
      frecuencia: configuracion.frecuencia,
      fechaPrimeraCuota: configuracion.fechaPrimeraCuota,
      cuotasGracia: configuracion.cuotasGracia || 0,
      montoObligatorio: configuracion.montoObligatorio || 0,
      montoGracia: configuracion.montoGracia || 0
    };
    
    try {
      const response = await CuotaAPI.generarCuotasManual(selectedPrestamoForGeneration.id, config);
      
      if (response.success) {
        await cargarTodosLosContratos();
        await cargarMisContratos();
        alert(response.message || 'Cuotas generadas exitosamente');
        setShowGenerateModal(false);
        setSelectedPrestamoForGeneration(null);
      }
    } catch (error) {
      console.error('Error al generar cuotas:', error);
      alert(error.response?.data?.error || 'Error al generar las cuotas');
    }
  };

  // ============================================================
  // EFECTOS
  // ============================================================
  useEffect(() => {
    const userData = usuarioAPI.getCurrentUser();
    setCurrentUser(userData);
    
    cargarTodosLosContratos();
    cargarMisContratos();
    
    const interval = setInterval(() => {
      const nuevaFecha = new Date().toISOString().split('T')[0];
      if (nuevaFecha !== fechaCierre) {
        setFechaCierre(nuevaFecha);
        actualizarMorosidadDiaria();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter, activeView]);

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

  // ============================================================
  // ESTADÍSTICAS Y FILTROS
  // ============================================================
  const getStats = () => {
    const cuotas = activeView === "all" ? allCuotas : myCuotas;
    const prestamos = activeView === "all" ? allPrestamos : myPrestamos;
    
    return [
      {
        id: 1,
        title: "Total Préstamos",
        value: prestamos.length,
        icon: CreditCard,
        bgColor: "bg-blue-50",
        textColor: "text-blue-600"
      },
      {
        id: 2,
        title: "Cuotas Vigentes",
        value: cuotas.filter(c => {
          const status = getCuotaStatus(c.fechaVencimiento, c.fechaPago, c.estado, c.fechaDesde, c.fechaHasta);
          return status === "vigente";
        }).length,
        icon: Clock,
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-600"
      },
      {
        id: 3,
        title: "Cuotas Pagadas",
        value: cuotas.filter(c => c.estado === "pagado").length,
        icon: CheckCircle,
        bgColor: "bg-green-50",
        textColor: "text-green-600"
      },
      {
        id: 4,
        title: "Monto Total en Mora",
        value: `$${cuotas.reduce((sum, c) => sum + (c.monto_morosidad || 0), 0).toFixed(2)}`,
        icon: AlertCircle,
        bgColor: "bg-red-50",
        textColor: "text-red-600"
      }
    ];
  };

  const stats = getStats();
  const getPrestamos = () => activeView === "all" ? allPrestamos : myPrestamos;
  const getCuotas = () => activeView === "all" ? allCuotas : myCuotas;
  const isLoading = activeView === "all" ? loadingAll : loadingMine;

  const filteredPrestamos = getPrestamos().filter(prestamo => {
    const matchesSearch = prestamo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prestamo.cedula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "sin_cuotas" && prestamo.cuotas.length === 0) ||
                         prestamo.estado === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredCuotas = getCuotas().filter(cuota => {
    const matchesSearch = cuota.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cuota.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cuota.contratoId.toString().includes(searchTerm);
    const cuotaStatus = getCuotaStatus(cuota.fechaVencimiento, cuota.fechaPago, cuota.estado, cuota.fechaDesde, cuota.fechaHasta);
    const matchesFilter = selectedFilter === "all" || cuotaStatus === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredCuotas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCuotas = filteredCuotas.slice(startIndex, startIndex + itemsPerPage);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rememberToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  // ============================================================
  // RENDER
  // ============================================================
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
          activeTab="cuotas"
          setActiveTab={() => {}}
          darkMode={darkMode}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="p-4 md:p-6 mt-16">
            {/* Título */}
            <div className="mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Gestión de Cuotas
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Control de pagos, seguimiento de morosidad y gestión de cartera
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Última actualización de mora: {fechaCierre}
              </p>
              {currentUser && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Usuario: {currentUser.nombre_completo || currentUser.nombres || 'N/A'} 
                  ({currentUser.nombre_rol || currentUser.rol || 'Usuario'})
                  {currentUser.cedula_usuario && ` - Cédula: ${currentUser.cedula_usuario}`}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className={`flex gap-2 p-1 rounded-lg shadow-sm w-fit ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  onClick={() => {
                    setActiveView("all");
                    setSelectedFilter("all");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeView === "all"
                      ? "bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white shadow-md"
                      : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <List size={16} />
                  Todas las Cuotas
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeView === "all" 
                      ? "bg-white/20" 
                      : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  }`}>
                    {allPrestamos.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveView("mine");
                    setSelectedFilter("all");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeView === "mine"
                      ? "bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white shadow-md"
                      : `${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <Wallet size={16} />
                  Mis Cuotas
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeView === "mine" 
                      ? "bg-white/20" 
                      : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                  }`}>
                    {myCuotas.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div key={stat.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={stat.textColor} size={24} />
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {stat.value}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={activeView === "all" ? "Buscar por cliente o cédula..." : "Buscar en mis cuotas..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                />
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className={`px-4 py-2.5 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                >
                  {activeView === "all" ? (
                    <>
                      <option value="all">Todos los préstamos</option>
                      <option value="activo">Activos</option>
                      <option value="pagado">Pagados</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="sin_cuotas">Sin cuotas generadas</option>
                    </>
                  ) : (
                    <>
                      <option value="all">Todos los estados</option>
                      <option value="vigente">Vigentes</option>
                      <option value="proxima">Próximas</option>
                      <option value="pagado">Pagadas</option>
                      <option value="en_mora">En Mora</option>
                      <option value="vencido">Vencidas</option>
                    </>
                  )}
                </select>
                
                <button 
                  onClick={() => {
                    actualizarMorosidadDiaria();
                    alert('Morosidad actualizada correctamente');
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <TrendingUp size={20} />
                  Actualizar Mora
                </button>
                
                <button className="px-4 py-2.5 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                  <Download size={20} />
                  Exportar
                </button>
              </div>
            </div>

            {/* ============================================================
                VISTA: TODAS LAS CUOTAS (getAll)
                ============================================================ */}
            {activeView === "all" && (
              <div className="space-y-6">
                {loadingAll ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader className="animate-spin text-[#2A9D8F]" size={48} />
                  </div>
                ) : filteredPrestamos.length === 0 ? (
                  <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-12 text-center`}>
                    <CreditCard size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      No se encontraron préstamos
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No hay préstamos que coincidan con los filtros seleccionados
                    </p>
                  </div>
                ) : (
                  filteredPrestamos.map((prestamo) => (
                    <div key={prestamo.id} className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
                      {/* Cabecera del préstamo */}
                      <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              prestamo.estado === 'activo' ? 'bg-green-100' : 
                              prestamo.estado === 'pagado' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Wallet className={
                                prestamo.estado === 'activo' ? 'text-green-600' : 
                                prestamo.estado === 'pagado' ? 'text-blue-600' : 'text-gray-600'
                              } size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  {prestamo.cliente}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  prestamo.estado === 'activo' ? 'bg-green-100 text-green-700' : 
                                  prestamo.estado === 'pagado' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {prestamo.estado === 'activo' ? 'ACTIVO' : 
                                   prestamo.estado === 'pagado' ? 'PAGADO' : 'PENDIENTE'}
                                </span>
                                {prestamo.totalMorosidad > 0 && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    Mora: ${prestamo.totalMorosidad.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <User size={14} className="text-gray-400" />
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cédula: {prestamo.cedula}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-gray-400" />
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Contrato #{prestamo.numero_contrato || prestamo.id}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar size={14} className="text-gray-400" />
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Inicio: {prestamo.fechaInicio}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText size={14} className="text-gray-400" />
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    Cédula Aprob: {prestamo.id_cedula_aprob || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Monto Total</p>
                                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                  ${prestamo.montoTotal.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Saldo</p>
                                <p className={`text-lg font-bold ${prestamo.saldoPendiente > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  ${prestamo.saldoPendiente.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mora Total</p>
                                <p className={`text-lg font-bold ${prestamo.totalMorosidad > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ${prestamo.totalMorosidad?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex justify-center gap-2 mt-2">
                              <button
                                onClick={() => handleGenerateCuotas(prestamo.id)}
                                className="px-6 py-2.5 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                              >
                                <Settings size={18} />
                                Generar Cuotas
                              </button>
                              <button
                                onClick={() => {
                                  const moraTotal = prestamo.cuotas.reduce((sum, c) => sum + (c.monto_morosidad || 0), 0);
                                  alert(`Mora total del contrato: $${moraTotal.toFixed(2)}\nCuotas en mora: ${prestamo.cuotas.filter(c => c.monto_morosidad > 0).length}`);
                                }}
                                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                              >
                                <AlertCircle size={18} />
                                Ver Mora
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progreso de pago</span>
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {prestamo.cuotasPagadas} de {prestamo.plazo} cuotas
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-gradient-to-r from-[#264653] to-[#2A9D8F] h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${prestamo.plazo > 0 ? (prestamo.cuotasPagadas / prestamo.plazo) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Tabla de cuotas */}
                      {prestamo.cuotas.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">N°</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Período Desde</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Período Hasta</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Monto</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Días Mora</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Monto Mora</th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Pago</th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                              {prestamo.cuotas.map((cuota) => {
                                const estadoConfig = getEstadoConfig(cuota);
                                const mora = cuota.monto_morosidad || 0;
                                const totalPagar = cuota.monto + mora;
                                const Icon = estadoConfig.icon;
                                const puedePagar = canPayCuota(cuota);
                                
                                return (
                                  <tr key={cuota.numero} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                    <td className="px-4 py-3 text-sm font-medium">{cuota.numero}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        cuota.tipo_cuota === 'Obligatoria' 
                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                          : cuota.tipo_cuota === 'Gracias' 
                                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                      }`}>
                                        {cuota.tipo_cuota || 'Obligatoria'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{cuota.fechaDesde || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{cuota.fechaHasta || cuota.fechaVencimiento || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-right">${cuota.monto.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                      {cuota.dias_mora_cuota > 0 ? (
                                        <span className="text-red-600 font-medium">{cuota.dias_mora_cuota} días</span>
                                      ) : (
                                        <span className="text-gray-400">0</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                      {mora > 0 ? (
                                        <span className="text-red-600 font-medium">${mora.toFixed(2)}</span>
                                      ) : (
                                        <span className="text-gray-400">$0.00</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                      ${totalPagar.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.color}`}>
                                        <Icon size={12} />
                                        {estadoConfig.text}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{cuota.fechaPago || '-'}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center gap-1">
                                        {puedePagar ? (
                                          <button
                                            onClick={() => {
                                              setSelectedCuota({ 
                                                prestamoId: prestamo.id, 
                                                cuotaNumero: cuota.numero, 
                                                monto: cuota.monto, 
                                                mora: mora,
                                                fechaVencimiento: cuota.fechaVencimiento,
                                                fechaDesde: cuota.fechaDesde,
                                                fechaHasta: cuota.fechaHasta,
                                                diasMora: cuota.dias_mora_cuota,
                                                tipo_cuota: cuota.tipo_cuota
                                              });
                                              setShowPaymentModal(true);
                                            }}
                                            className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs hover:bg-[#264653] transition-colors flex items-center gap-1"
                                          >
                                            <Receipt size={14} />
                                            Pagar
                                          </button>
                                        ) : cuota.estado !== "pagado" ? (
                                          <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg text-xs flex items-center gap-1 cursor-not-allowed">
                                            <Lock size={14} />
                                            Bloqueado
                                          </span>
                                        ) : null}
                                        {cuota.estado === "pagado" && (
                                          <button
                                            onClick={() => handleViewReceipt(prestamo.id, cuota)}
                                            className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors flex items-center gap-1"
                                          >
                                            <Eye size={14} />
                                            Ver
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Settings size={48} className="mx-auto text-gray-400 mb-3" />
                          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No se han generado cuotas para este préstamo
                          </p>
                          <button
                            onClick={() => handleGenerateCuotas(prestamo.id)}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#E9C46A] to-[#F4A261] text-white rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium"
                          >
                            <Plus size={18} />
                            Generar Cuotas Ahora
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ============================================================
                VISTA: MIS CUOTAS (getByCedulaAprob)
                ============================================================ */}
            {activeView === "mine" && (
              <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Mis Cuotas
                      </h2>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cuotas asociadas a tu cédula de aprobación
                      </p>
                      {currentUser && (
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Cédula: {currentUser.cedula_usuario || currentUser.cedula || 'No disponible'}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        Mora Total: ${myCuotas.reduce((sum, c) => sum + (c.monto_morosidad || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Cuota</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Tipo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Cliente</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Contrato</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Período</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Monto</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Días Mora</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Monto Mora</th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Fecha Pago</th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {loadingMine ? (
                        <tr>
                          <td colSpan={12} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <Loader className="animate-spin text-[#2A9D8F]" size={40} />
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Cargando mis cuotas...
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : paginatedCuotas.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <FileText size={48} className="text-gray-400" />
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                No se encontraron cuotas
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                No tienes cuotas asociadas a tu cédula de aprobación
                              </p>
                              {currentUser && (
                                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                  Cédula: {currentUser.cedula_usuario || currentUser.cedula || 'No disponible'}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedCuotas.map((cuota) => {
                          const estadoConfig = getEstadoConfig(cuota);
                          const mora = cuota.monto_morosidad || 0;
                          const totalPagar = cuota.monto + mora;
                          const Icon = estadoConfig.icon;
                          const puedePagar = canPayCuota(cuota);
                          
                          return (
                            <tr 
                              key={`${cuota.contratoId}-${cuota.numero}`} 
                              className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                            >
                              <td className="px-4 py-3 text-sm text-center font-medium">
                                {cuota.numero}
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  cuota.tipo_cuota === 'Obligatoria' 
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                    : cuota.tipo_cuota === 'Gracias' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {cuota.tipo_cuota || 'Obligatoria'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <p className="font-medium dark:text-white">{cuota.cliente}</p>
                                  <p className="text-xs text-gray-500">Cédula: {cuota.cedula}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <p className="font-medium dark:text-white">#{cuota.numero_contrato || cuota.contratoId}</p>
                                  <p className="text-xs text-gray-500">ID: {cuota.contratoId}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} className="text-gray-400" />
                                    <span className="text-xs text-gray-500">Desde:</span>
                                    <span>{cuota.fechaDesde || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar size={12} className="text-gray-400" />
                                    <span className="text-xs text-gray-500">Hasta:</span>
                                    <span>{cuota.fechaHasta || cuota.fechaVencimiento || '-'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-right">${cuota.monto.toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-center">
                                {cuota.dias_mora_cuota > 0 ? (
                                  <span className="text-red-600 font-medium">{cuota.dias_mora_cuota} días</span>
                                ) : (
                                  <span className="text-gray-400">0</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                {mora > 0 ? (
                                  <span className="text-red-600 font-medium">${mora.toFixed(2)}</span>
                                ) : (
                                  <span className="text-gray-400">$0.00</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-right font-medium">
                                ${totalPagar.toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${estadoConfig.bg} ${estadoConfig.color}`}>
                                  <Icon size={12} />
                                  {estadoConfig.text}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {cuota.fechaPago || <span className="text-gray-400">-</span>}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-1">
                                  {puedePagar ? (
                                    <button
                                      onClick={() => {
                                        setSelectedCuota({ 
                                          prestamoId: cuota.contratoId, 
                                          cuotaNumero: cuota.numero, 
                                          monto: cuota.monto, 
                                          mora: mora,
                                          fechaVencimiento: cuota.fechaVencimiento,
                                          fechaDesde: cuota.fechaDesde,
                                          fechaHasta: cuota.fechaHasta,
                                          diasMora: cuota.dias_mora_cuota,
                                          tipo_cuota: cuota.tipo_cuota
                                        });
                                        setShowPaymentModal(true);
                                      }}
                                      className="px-3 py-1.5 bg-[#2A9D8F] text-white rounded-lg text-xs hover:bg-[#264653] transition-colors flex items-center gap-1"
                                    >
                                      <Receipt size={14} />
                                      Pagar
                                    </button>
                                  ) : cuota.estado !== "pagado" ? (
                                    <span className="px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg text-xs flex items-center gap-1 cursor-not-allowed">
                                      <Lock size={14} />
                                      Bloqueado
                                    </span>
                                  ) : null}
                                  {cuota.estado === "pagado" && (
                                    <button
                                      onClick={() => handleViewReceipt(cuota.contratoId, cuota)}
                                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors flex items-center gap-1"
                                    >
                                      <Eye size={14} />
                                      Ver
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Paginación */}
                {filteredCuotas.length > itemsPerPage && (
                  <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCuotas.length)} de {filteredCuotas.length}
                      </p>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm rounded border ${
                            currentPage === 1 
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                              : `${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm rounded ${
                              currentPage === page
                                ? 'bg-[#2A9D8F] text-white'
                                : `${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm rounded border ${
                            currentPage === totalPages 
                              ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                              : `${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`
                          }`}
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Footer darkMode={darkMode} />
        </main>
      </div>

      {/* Modal de pago */}
      {showPaymentModal && selectedCuota && (
        <PaymentModal
          selectedCuota={selectedCuota}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedCuota(null);
          }}
          onConfirm={handleRegisterPayment}
          darkMode={darkMode}
        />
      )}

      {/* Modal de comprobante */}
      {showPaymentReceiptModal && selectedPayment && (
        <ReceiptModal
          selectedPayment={selectedPayment}
          onClose={() => {
            setShowPaymentReceiptModal(false);
            setSelectedPayment(null);
          }}
          darkMode={darkMode}
        />
      )}

      {/* Modal de generar cuotas */}
      {showGenerateModal && selectedPrestamoForGeneration && (
        <GenerateCuotasModal
          prestamo={selectedPrestamoForGeneration}
          config={generationConfig}
          onConfigChange={setGenerationConfig}
          onConfirm={confirmGenerateCuotas}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedPrestamoForGeneration(null);
          }}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// ============================================================
// MODAL DE PAGO
// ============================================================

const PaymentModal = ({ selectedCuota, onClose, onConfirm, darkMode }) => {
  const [comprobante, setComprobante] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [referencia, setReferencia] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const totalPagar = selectedCuota.monto + (selectedCuota.mora || 0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, seleccione una imagen válida (JPG, PNG, GIF, WEBP)');
        return;
      }
      
      if (file.size > 32 * 1024 * 1024) {
        alert('La imagen no debe superar los 32MB');
        return;
      }
      
      setComprobante(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!comprobante && metodoPago !== "efectivo") {
      alert("Por favor, adjunte el comprobante de pago");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);
    
    try {
      setUploadProgress(50);
      
      await onConfirm(selectedCuota.prestamoId, selectedCuota.cuotaNumero, {
        montoPagado: totalPagar,
        comprobante: comprobante || {
          name: `pago_${Date.now()}_sin_comprobante`,
          size: 0,
          type: "application/pdf"
        },
        metodoPago: metodoPago,
        referencia: referencia,
        mora: selectedCuota.mora || 0,
        diasMora: selectedCuota.diasMora || 0
      });
      
      setUploadProgress(100);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Registrar Pago - Cuota N° {selectedCuota.cuotaNumero}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Detalle del Pago
            </h4>
            
            {selectedCuota.tipo_cuota && (
              <div className="flex justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tipo de cuota:</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedCuota.tipo_cuota}
                </span>
              </div>
            )}
            
            <div className="flex justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fecha vencimiento:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedCuota.fechaVencimiento || selectedCuota.fechaHasta}
              </span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Días de mora:</span>
              <span className={`font-semibold ${selectedCuota.diasMora > 0 ? 'text-red-600' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedCuota.diasMora || 0} días
              </span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto de cuota:</span>
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                ${selectedCuota.monto.toLocaleString()}
              </span>
            </div>
            
            {selectedCuota.mora > 0 && (
              <div className="flex justify-between mb-2">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto de mora:</span>
                <span className="font-semibold text-red-600">
                  ${selectedCuota.mora.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="font-semibold">Total a pagar:</span>
              <span className="text-xl font-bold text-[#2A9D8F]">
                ${totalPagar.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="pago_movil">Pago Móvil</option>
              <option value="punto_venta">Punto de Venta</option>
            </select>
          </div>

          {(metodoPago === "transferencia" || metodoPago === "pago_movil") && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Número de referencia
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ingrese el número de referencia"
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Comprobante de pago {metodoPago !== "efectivo" && <span className="text-red-500">*</span>}
            </label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
              darkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              {previewUrl ? (
                <div className="space-y-2">
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                  <p className="text-sm text-gray-600">{comprobante?.name}</p>
                  <button
                    onClick={() => {
                      setComprobante(null);
                      setPreviewUrl(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                    }}
                    className="text-red-600 text-sm hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <ImageIcon size={40} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Haga clic para subir el comprobante</p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WEBP (max. 32MB)</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {uploadProgress < 100 ? 'Procesando pago...' : '¡Pago registrado!'}
                </span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#264653] to-[#2A9D8F] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Confirmar Pago
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MODAL PARA VER COMPROBANTE
// ============================================================

const ReceiptModal = ({ selectedPayment, onClose, darkMode }) => {
  const { cuota, prestamo } = selectedPayment;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Comprobante de Pago
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Información del Préstamo
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cliente:</span>
                <p className="font-medium dark:text-white">{prestamo?.cliente || 'N/A'}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Cédula:</span>
                <p className="font-medium dark:text-white">{prestamo?.cedula || 'N/A'}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>N° Cuota:</span>
                <p className="font-medium dark:text-white">{cuota.numero}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Tipo:</span>
                <p className="font-medium dark:text-white">{cuota.tipo_cuota || 'Obligatoria'}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto cuota:</span>
                <p className="font-medium dark:text-white">${cuota.monto.toLocaleString()}</p>
              </div>
              {cuota.monto_morosidad > 0 && (
                <div>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Monto mora:</span>
                  <p className="font-medium text-red-600">${cuota.monto_morosidad.toFixed(2)}</p>
                </div>
              )}
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total pagado:</span>
                <p className="font-medium text-green-600">
                  ${(cuota.monto + (cuota.monto_morosidad || 0)).toFixed(2)}
                </p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Fecha de pago:</span>
                <p className="font-medium dark:text-white">{cuota.fechaPago}</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Días de mora:</span>
                <p className="font-medium dark:text-white">{cuota.dias_mora_cuota || 0} días</p>
              </div>
              <div>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Método de pago:</span>
                <p className="font-medium dark:text-white">
                  {cuota.metodoPago === 'efectivo' ? 'Efectivo' :
                   cuota.metodoPago === 'transferencia' ? 'Transferencia Bancaria' :
                   cuota.metodoPago === 'pago_movil' ? 'Pago Móvil' :
                   cuota.metodoPago === 'punto_venta' ? 'Punto de Venta' : 'No especificado'}
                </p>
              </div>
              {cuota.referencia && (
                <div>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Referencia:</span>
                  <p className="font-medium dark:text-white">{cuota.referencia}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Comprobante
            </h4>
            {cuota.comprobante && cuota.comprobante.startsWith('http') ? (
              <div className="bg-white p-4 rounded border border-gray-200 text-center">
                <img 
                  src={cuota.comprobante} 
                  alt="Comprobante de pago" 
                  className="max-h-96 mx-auto rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4eiI+PC9wYXRoPjxwb2x5bGluZSBwb2ludHM9IjE0IDIgMTQgOCAyMCA4Ij48L3BvbHlsaW5lPjwvc3ZnPg==';
                  }}
                />
                <a 
                  href={cuota.comprobante} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[#2A9D8F] hover:text-[#264653] text-sm"
                >
                  <Download size={14} />
                  Ver en tamaño completo
                </a>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border border-gray-200 text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {cuota.comprobante || 'No hay comprobante disponible'}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MODAL PARA GENERAR CUOTAS
// ============================================================

const GenerateCuotasModal = ({ 
  prestamo, 
  config, 
  onConfigChange, 
  onConfirm, 
  onClose, 
  darkMode 
}) => {
  const [cuotasGeneradas, setCuotasGeneradas] = useState([]);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [montosCalculados, setMontosCalculados] = useState({
    montoObligatorio: 0,
    montoGracia: 0
  });
  
  const handleChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value
    });
  };
  
  const calcularVistaPrevia = () => {
    const { cantidadCuotas, frecuencia, fechaPrimeraCuota } = config;
    
    if (!cantidadCuotas || !fechaPrimeraCuota) return;
    
    const cuotasGracia = parseInt(prestamo.numero_gracias) || 0;
    const cuotasObligatorias = parseInt(cantidadCuotas) || 0;
    const totalCuotas = cuotasObligatorias + cuotasGracia;
    
    const montoTotal = parseFloat(prestamo.devolvimiento || prestamo.montoTotal);
    const montoObligatorio = cuotasObligatorias > 0 ? montoTotal / cuotasObligatorias : 0;
    const montoGracia = cuotasGracia > 0 ? montoTotal / cuotasGracia : 0;
    
    setMontosCalculados({ montoObligatorio, montoGracia });
    
    const cuotasPrevias = [];
    let fechaActual = new Date(fechaPrimeraCuota);
    
    for (let i = 0; i < totalCuotas; i++) {
      const numeroCuota = i + 1;
      let tipoCuota = '';
      let monto = 0;
      
      if (numeroCuota <= cuotasObligatorias) {
        tipoCuota = 'Obligatoria';
        monto = montoObligatorio;
      } else {
        tipoCuota = 'Gracias';
        monto = montoGracia;
      }
      
      let fechaDesde = new Date(fechaActual);
      let fechaHasta = new Date(fechaActual);
      
      switch(frecuencia) {
        case 'mensual':
          fechaHasta.setMonth(fechaHasta.getMonth() + 1);
          fechaHasta.setDate(fechaHasta.getDate() - 1);
          break;
        case 'quincenal':
          fechaHasta.setDate(fechaHasta.getDate() + 14);
          break;
        case 'semanal':
          fechaHasta.setDate(fechaHasta.getDate() + 6);
          break;
        default:
          fechaHasta.setMonth(fechaHasta.getMonth() + 1);
          fechaHasta.setDate(fechaHasta.getDate() - 1);
      }
      
      cuotasPrevias.push({
        numero: numeroCuota,
        tipo: tipoCuota,
        fecha_desde: fechaDesde.toISOString().split('T')[0],
        fecha_hasta: fechaHasta.toISOString().split('T')[0],
        monto: monto
      });
      
      switch(frecuencia) {
        case 'mensual':
          fechaActual.setMonth(fechaActual.getMonth() + 1);
          break;
        case 'quincenal':
          fechaActual.setDate(fechaActual.getDate() + 15);
          break;
        case 'semanal':
          fechaActual.setDate(fechaActual.getDate() + 7);
          break;
      }
    }
    
    setCuotasGeneradas(cuotasPrevias);
    setMostrarVistaPrevia(true);
  };
  
  const totalObligatorias = cuotasGeneradas
    .filter(c => c.tipo === 'Obligatoria')
    .reduce((sum, cuota) => sum + cuota.monto, 0);
  const totalGracias = cuotasGeneradas
    .filter(c => c.tipo === 'Gracias')
    .reduce((sum, cuota) => sum + cuota.monto, 0);
  
  const cuotasGraciaContrato = parseInt(prestamo.numero_gracias) || 0;
  const cuotasObligatoriasIngresadas = parseInt(config.cantidadCuotas) || 0;
  const totalCuotasGenerar = cuotasObligatoriasIngresadas + cuotasGraciaContrato;
  const montoTotalPrestamo = parseFloat(prestamo.devolvimiento || prestamo.montoTotal || 0);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Generar Cuotas - {prestamo.cliente}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Información del Contrato
              </h4>
              <div className="space-y-2 text-sm">
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Contrato N°: {prestamo.numero_contrato || prestamo.id}
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Monto Total: <span className="font-semibold">${montoTotalPrestamo.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Cuotas de Gracia: <span className="font-semibold">{cuotasGraciaContrato}</span>
                </p>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Tasa de Mora Mensual: <span className="font-semibold">{(prestamo.tasaInteresMora || 0.05) * 100}%</span>
                </p>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Número de Cuotas Obligatorias *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={config.cantidadCuotas}
                onChange={(e) => handleChange('cantidadCuotas', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
                placeholder="Ej: 10"
              />
            </div>
            
            {config.cantidadCuotas > 0 && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                  Distribución de Cuotas
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-blue-600'}>Obligatorias:</span>
                    <span className={`font-bold ml-1 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                      {cuotasObligatoriasIngresadas}
                    </span>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-blue-600'}>Gracias:</span>
                    <span className={`font-bold ml-1 ${darkMode ? 'text-white' : 'text-blue-800'}`}>
                      {cuotasGraciaContrato}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs font-semibold">
                  ➕ Total: {totalCuotasGenerar} cuotas
                </div>
              </div>
            )}
            
            {montosCalculados.montoObligatorio > 0 && (
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-green-800'}`}>
                  Montos Calculados
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-green-600'}>Cuota Obligatoria:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>
                      ${montosCalculados.montoObligatorio.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                  {montosCalculados.montoGracia > 0 && (
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-400' : 'text-green-600'}>Cuota Gracia:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-green-800'}`}>
                        ${montosCalculados.montoGracia.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Frecuencia de pago
              </label>
              <select
                value={config.frecuencia}
                onChange={(e) => handleChange('frecuencia', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              >
                <option value="mensual">Mensual</option>
                <option value="quincenal">Quincenal</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha de primera cuota *
              </label>
              <input
                type="date"
                value={config.fechaPrimeraCuota}
                onChange={(e) => handleChange('fechaPrimeraCuota', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]`}
              />
            </div>
            
            <button
              onClick={calcularVistaPrevia}
              disabled={!config.cantidadCuotas || !config.fechaPrimeraCuota}
              className="w-full px-4 py-2 bg-[#264653] text-white rounded-lg hover:bg-[#1d3a4a] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Eye size={18} />
              Calcular Vista Previa
            </button>
          </div>
          
          <div>
            {mostrarVistaPrevia && cuotasGeneradas.length > 0 && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Vista Previa de Cuotas
                </h4>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total cuotas:</span>
                    <span className="font-bold">{cuotasGeneradas.length}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="font-semibold">Total a pagar:</span>
                    <span className="font-bold text-[#2A9D8F]">
                      ${(totalObligatorias + totalGracias).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-200'}>
                      <tr>
                        <th className="px-2 py-1 text-left">N°</th>
                        <th className="px-2 py-1 text-left">Tipo</th>
                        <th className="px-2 py-1 text-left">Desde</th>
                        <th className="px-2 py-1 text-left">Hasta</th>
                        <th className="px-2 py-1 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuotasGeneradas.map((cuota) => (
                        <tr key={cuota.numero} className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <td className="px-2 py-1">{cuota.numero}</td>
                          <td className="px-2 py-1">
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              cuota.tipo === 'Obligatoria' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {cuota.tipo}
                            </span>
                          </td>
                          <td className="px-2 py-1">{cuota.fecha_desde}</td>
                          <td className="px-2 py-1">{cuota.fecha_hasta}</td>
                          <td className="px-2 py-1 text-right font-medium">
                            ${cuota.monto.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 pt-6 mt-4 border-t dark:border-gray-700">
          <button
            onClick={() => onConfirm({
              ...config,
              totalCuotas: totalCuotasGenerar,
              cuotasObligatorias: cuotasObligatoriasIngresadas,
              cuotasGracia: cuotasGraciaContrato,
              montoObligatorio: montosCalculados.montoObligatorio,
              montoGracia: montosCalculados.montoGracia
            })}
            disabled={!mostrarVistaPrevia || cuotasGeneradas.length === 0}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#264653] to-[#2A9D8F] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={20} />
            Generar {cuotasGeneradas.length} Cuotas
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cuota;