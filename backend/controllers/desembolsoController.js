const DesembolsoModel = require('../models/desembolsoModel');

const desembolsoController = {
    // Obtener todos los desembolsos
    async getAll(req, res) {
        try {
            const desembolsos = await DesembolsoModel.getAll();
            res.json({ 
                success: true, 
                data: desembolsos 
            });
        } catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    },

    // Obtener desembolsos por cédula
    async getByCedula(req, res) {
        try {
            const { cedula } = req.params;
            
            if (!cedula) {
                return res.status(400).json({
                    success: false,
                    error: 'La cédula es requerida'
                });
            }

            const desembolsos = await DesembolsoModel.getByCedula(cedula);
            
            if (desembolsos.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: `No se encontraron desembolsos para la cédula: ${cedula}`
                });
            }

            res.json({
                success: true,
                data: desembolsos
            });
        } catch (error) {
            console.error('Error en getByCedula:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al obtener desembolsos por cédula'
            });
        }
    },

    // Obtener contratos pendientes por desembolso
    async getContratosPendientes(req, res) {
        try {
            const contratos = await DesembolsoModel.getContratosPendientes();
            res.json({
                success: true,
                data: contratos
            });
        } catch (error) {
            console.error('Error en getContratosPendientes:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Verificar si un contrato tiene desembolso
    async verificarDesembolso(req, res) {
        try {
            const { id_cont } = req.params;
            const existe = await DesembolsoModel.verificarDesembolso(id_cont);
            res.json({
                success: true,
                existe: existe
            });
        } catch (error) {
            console.error('Error en verificarDesembolso:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Crear nuevo desembolso
    async create(req, res) {
        try {
            const desembolsoData = req.body;
            
            // Validar campos requeridos
            if (!desembolsoData.id_cont) {
                return res.status(400).json({
                    success: false,
                    error: 'El ID del contrato es requerido'
                });
            }
            
            if (!desembolsoData.capture_desembolso) {
                return res.status(400).json({
                    success: false,
                    error: 'La captura del comprobante es requerida'
                });
            }
            
            if (!desembolsoData.fecha_desembolso) {
                return res.status(400).json({
                    success: false,
                    error: 'La fecha de desembolso es requerida'
                });
            }
            
            // Verificar que el contrato existe y obtener sus datos
            const contrato = await DesembolsoModel.getById(desembolsoData.id_cont);
            
            if (!contrato) {
                return res.status(404).json({
                    success: false,
                    error: `No se encontró un contrato con ID #${desembolsoData.id_cont}`
                });
            }
            
            // Verificar estado del contrato
            if (contrato.estatus !== 'Pendiente por desembolso') {
                return res.status(400).json({
                    success: false,
                    error: `El contrato debe estar en estado "Pendiente por desembolso". Estado actual: ${contrato.estatus}`
                });
            }
            
            // Crear el desembolso con la cédula del contrato
            const resultado = await DesembolsoModel.create({
                id_cont: desembolsoData.id_cont,
                capture_desembolso: desembolsoData.capture_desembolso,
                fecha_desembolso: desembolsoData.fecha_desembolso,
                estatus_desembolso: 'Pendiente',
                cedula_desembolso: contrato.id_cedula_aprob // Tomar la cédula del contrato
            });
            
            res.json({
                success: true,
                message: 'Desembolso registrado exitosamente',
                data: resultado
            });
            
        } catch (error) {
            console.error('Error en create:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al realizar el desembolso'
            });
        }
    },

    // Confirmar pago de desembolso
    async confirmarPago(req, res) {
        try {
            const { id } = req.params;
            const { fecha_confirmacion, capture_confirmacion } = req.body;

            if (!fecha_confirmacion) {
                return res.status(400).json({
                    success: false,
                    error: 'La fecha de confirmación es requerida'
                });
            }

            // Verificar que el desembolso existe
            const desembolsoExistente = await DesembolsoModel.getDesembolsoById(id);
            if (!desembolsoExistente) {
                return res.status(404).json({
                    success: false,
                    error: 'Desembolso no encontrado'
                });
            }

            // Verificar que el desembolso está en estado "Pendiente"
            if (desembolsoExistente.estatus_desembolso !== 'Pendiente') {
                return res.status(400).json({
                    success: false,
                    error: `El desembolso debe estar en estado "Pendiente" para confirmar el pago. Estado actual: ${desembolsoExistente.estatus_desembolso}`
                });
            }

            const pagoData = {
                fecha_confirmacion,
                capture_confirmacion: capture_confirmacion || null
            };

            const resultado = await DesembolsoModel.confirmarPago(id, pagoData);

            res.json({
                success: true,
                message: 'Pago confirmado exitosamente',
                data: resultado
            });
        } catch (error) {
            console.error('Error en confirmarPago:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Error al confirmar el pago'
            });
        }
    }
};

module.exports = desembolsoController;