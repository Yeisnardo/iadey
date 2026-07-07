const pool = require('../config/db');

class DesembolsoModel {
    // Obtener todos los desembolsos con información completa
    static async getAll() {
        const query = `
        SELECT 
            a.id_aprobacion,
            a.id_inspeccion,
            a.id_expediente,
            a.verificacion_requisitos,
            a.estatus_aprobacion,
            a.seleccion_manejo,
            a.created_at as aprobacion_created_at,
            a.updated_at as aprobacion_updated_at,
            c.id_contrato,
            c.id_cedula_aprob,
            c.numero_contrato,
            c.moneda,
            c.monto_moneda,
            c.cambio,
            c.flat,
            c.interes,
            c.devolvimiento,
            c.numero_cuotas,
            c.numero_gracias,
            c.inicio,
            c.cierre,
            c.estatus,
            c.updated_at as contrato_updated_at,
            d.id_desembolso,
            d.fecha_desembolso,
            d.capture_desembolso,
            d.estatus_desembolso,
            d.fecha_confirmacion,
            d.cedula_desembolso
        FROM aprobacion a
        LEFT JOIN contrato c ON a.id_aprobacion = c.id_aprob
        LEFT JOIN desembolso d ON c.id_contrato = d.id_cont
        WHERE c.estatus IN ('Pendiente por desembolso', 'Pendiente por confirmar desembolso', 'En espera de cuotas')
        ORDER BY a.id_aprobacion DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Obtener desembolsos por cédula de desembolso
    static async getByCedula(cedula) {
        const query = `
        SELECT 
            d.id_desembolso,
            d.id_cont,
            d.fecha_desembolso,
            d.capture_desembolso,
            d.estatus_desembolso,
            d.fecha_confirmacion,
            d.cedula_desembolso,
            c.numero_contrato,
            c.moneda,
            c.monto_moneda as monto,
            c.estatus as estatus_contrato,
            c.id_cedula_aprob,
            a.id_aprobacion,
            a.estatus_aprobacion
        FROM desembolso d
        INNER JOIN contrato c ON d.id_cont = c.id_contrato
        INNER JOIN aprobacion a ON c.id_aprob = a.id_aprobacion
        WHERE d.cedula_desembolso = $1
        `;
        const result = await pool.query(query, [cedula]);
        return result.rows;
    }

    // Obtener contratos pendientes por desembolso
    static async getContratosPendientes() {
        const query = `
        SELECT 
            c.id_contrato,
            c.numero_contrato,
            c.moneda,
            c.monto_moneda,
            c.estatus,
            c.id_cedula_aprob
        FROM contrato c
        INNER JOIN aprobacion a ON c.id_aprob = a.id_aprobacion
        LEFT JOIN expediente e ON a.id_expediente = e.id_expediente
        WHERE c.estatus = 'Pendiente por desembolso'
        AND NOT EXISTS (
            SELECT 1 FROM desembolso d 
            WHERE d.id_cont = c.id_contrato
        )
        ORDER BY c.id_contrato DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Obtener contrato por ID
    static async getById(id_contrato) {
        const query = `
        SELECT 
            c.*
        FROM contrato c
        INNER JOIN aprobacion a ON c.id_aprob = a.id_aprobacion
        LEFT JOIN expediente e ON a.id_expediente = e.id_expediente
        WHERE c.id_contrato = $1
        `;
        const result = await pool.query(query, [id_contrato]);
        return result.rows[0];
    }

    // Verificar si existe desembolso para un contrato
    static async verificarDesembolso(id_cont) {
        const query = `
        SELECT id_desembolso, estatus_desembolso 
        FROM desembolso 
        WHERE id_cont = $1
        `;
        const result = await pool.query(query, [id_cont]);
        return result.rows.length > 0;
    }

    // Crear desembolso
    static async create(desembolsoData) {
        const {
            id_cont,
            capture_desembolso,
            fecha_desembolso,
            estatus_desembolso,
            cedula_desembolso
        } = desembolsoData;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Verificar si ya existe desembolso para este contrato
            const existe = await client.query(
                'SELECT id_desembolso FROM desembolso WHERE id_cont = $1',
                [id_cont]
            );
            
            if (existe.rows.length > 0) {
                throw new Error('Este contrato ya tiene un desembolso registrado');
            }
            
            // Crear el desembolso
            const insertQuery = `
            INSERT INTO desembolso (
                id_cont,
                fecha_desembolso,
                capture_desembolso,
                estatus_desembolso,
                cedula_desembolso
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `;

            const values = [
                id_cont,
                fecha_desembolso,
                capture_desembolso,
                'Pendiente',
                cedula_desembolso || null
            ];

            const desembolsoResult = await client.query(insertQuery, values);
            
            // Actualizar el estatus del contrato
            const updateContratoQuery = `
            UPDATE contrato 
            SET estatus = 'Pendiente por confirmar desembolso', 
                updated_at = CURRENT_TIMESTAMP
            WHERE id_contrato = $1 
            RETURNING *
            `;
            
            await client.query(updateContratoQuery, [id_cont]);
            
            await client.query('COMMIT');
            
            // Obtener el desembolso con datos completos
            const desembolsoCompleto = await this.getDesembolsoCompleto(
                desembolsoResult.rows[0].id_desembolso
            );
            
            return desembolsoCompleto;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en create:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Obtener desembolso por ID
    static async getDesembolsoById(id_desembolso) {
        const query = `
        SELECT * FROM desembolso 
        WHERE id_desembolso = $1
        `;
        const result = await pool.query(query, [id_desembolso]);
        return result.rows[0];
    }

    // Obtener desembolso completo con datos relacionados
    static async getDesembolsoCompleto(id_desembolso) {
        const query = `
        SELECT 
            d.*,
            c.numero_contrato,
            c.moneda,
            c.monto_moneda as monto,
            c.estatus as estatus_contrato,
            c.id_cedula_aprob
        FROM desembolso d
        INNER JOIN contrato c ON d.id_cont = c.id_contrato
        INNER JOIN aprobacion a ON c.id_aprob = a.id_aprobacion
        LEFT JOIN expediente e ON a.id_expediente = e.id_expediente
        WHERE d.id_desembolso = $1
        `;
        const result = await pool.query(query, [id_desembolso]);
        return result.rows[0];
    }

    // Confirmar pago de desembolso
    static async confirmarPago(id_desembolso, pagoData) {
        const {
            fecha_confirmacion
        } = pagoData;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // 1. Actualizar el desembolso
            const updateDesembolsoQuery = `
            UPDATE desembolso 
            SET 
                fecha_confirmacion = $1,
                estatus_desembolso = 'Confirmado'
            WHERE id_desembolso = $2
            RETURNING *
            `;

            const desembolsoValues = [
                fecha_confirmacion,
                id_desembolso
            ];

            const desembolsoResult = await client.query(updateDesembolsoQuery, desembolsoValues);
            
            if (!desembolsoResult.rows[0]) {
                throw new Error('Desembolso no encontrado');
            }

            // 2. Actualizar el estatus del contrato a "En espera de cuotas"
            const updateContratoQuery = `
            UPDATE contrato 
            SET estatus = 'En espera de cuotas', 
                updated_at = CURRENT_TIMESTAMP
            WHERE id_contrato = $1 
            RETURNING *
            `;
            
            await client.query(
                updateContratoQuery, 
                [desembolsoResult.rows[0].id_cont]
            );
            
            await client.query('COMMIT');
            
            // Obtener datos completos del desembolso actualizado
            const desembolsoCompleto = await this.getDesembolsoCompleto(id_desembolso);
            
            return desembolsoCompleto;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error en confirmarPago:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = DesembolsoModel;