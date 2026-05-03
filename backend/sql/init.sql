-- =============================================
-- TABLA: persona
-- =============================================
CREATE TABLE persona (
    nacionalidad VARCHAR(1) NOT NULL,
    cedula VARCHAR(20) NOT NULL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    estado_civil VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    parroquia VARCHAR(100) NOT NULL,
    tipo_persona VARCHAR(20) NOT NULL,
    email VARCHAR(100), -- Correo para login (opcional en persona)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20) NOT NULL,
    clave VARCHAR(255) NOT NULL, -- Contraseña hasheada
    rol VARCHAR(20) NOT NULL,
    estatus VARCHAR(20),
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLA: clasificacion_emprendimiento
-- =============================================
CREATE TABLE clasificacion_emprendimiento ( 
    id_clasificacion SERIAL PRIMARY KEY,
    sector TEXT NOT NULL,
    actividad TEXT NOT NULL,
    n_ins_asig INT NOT NULL, -- Opciones (1 o 2)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: solicitud
-- =============================================
CREATE TABLE solicitud (
    id_solicitud SERIAL PRIMARY KEY,
    cedula_persona VARCHAR(20) NOT NULL,
    solicitud TEXT NOT NULL,
    fecha_solicitud VARCHAR(20),
    monto_solicitado VARCHAR(100),
    estatus VARCHAR(20),
    motivo_rechazo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cedula_persona) REFERENCES persona(cedula) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLA: emprendimiento
-- =============================================
CREATE TABLE emprendimiento (
    id_emprendimiento SERIAL PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_clasificacion INT NOT NULL,
    cedula_emprendimiento VARCHAR(20) NOT NULL,
    anos_experiencia VARCHAR (100) NOT null,
    nombre_emprendimiento TEXT NOT NULL,
    direccion_empredimiento TEXT NOT NULL,
    FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    FOREIGN KEY (id_clasificacion) REFERENCES clasificacion_emprendimiento(id_clasificacion),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================
-- TABLA: requisitos
-- =============================================
CREATE TABLE requisitos ( 
    id_requisitos SERIAL PRIMARY KEY,
    nombre_requisito TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: expediente
-- =============================================
CREATE TABLE expediente ( 
    id_expediente SERIAL PRIMARY KEY,
    id_solicitud int NOT NULL,
    id_usuario int NOT NULL,
    id_requisitos TEXT NOT NULL DEFAULT '',
    codigo_expediente VARCHAR NOT NULL,
    observaciones TEXT,
    estatus VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES solicitud(id_solicitud),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    FOREIGN KEY (id_expediente) REFERENCES requisitos(id_requisitos)
);

-- =============================================
-- TABLA: inspeccion
-- =============================================
CREATE TABLE inspeccion(
    id_inspeccion SERIAL PRIMARY KEY,
    id_codigo_exp INT NOT NULL,
    id_tipo_insp_clas INT NOT NULL,
    estatus_inspeccion VARCHAR (20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_codigo_exp) REFERENCES expediente(id_expediente)
);


-- =============================================
-- TABLA: aprobacion
-- =============================================
CREATE TABLE aprobacion (
    id_aprobacion SERIAL PRIMARY KEY,
    id_expediente INT NOT NULL,
    estatus_aprobacion VARCHAR (20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_expediente) REFERENCES expediente(id_expediente)
);




-- INSPECCION INTUSTRIA Y COMERCIO
--------------------------------------------------------------------------------------------------------
-- =============================================
-- 1. ESTUDIO DE MERCADO (principal)
-- =============================================
CREATE TABLE estudio_mercado (
    id_estudio SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    descripcion_producto TEXT,
    descripcion_proceso TEXT,
    usuarios TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 2. PRODUCCION MENSUAL (Volumen de producción)
-- =============================================
CREATE TABLE produccion_mensual (
    id_produccion SERIAL PRIMARY KEY,
    id_estudio INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    descripcion_producto VARCHAR(255),
    unidad_medida VARCHAR(50),
    costo_produccion_usd DECIMAL(12,2),
    cantidad DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estudio) REFERENCES estudio_mercado(id_estudio) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 3. VENTAS ESTIMADAS (Mensual)
-- =============================================
CREATE TABLE ventas_estimadas (
    id_venta SERIAL PRIMARY KEY,
    id_estudio INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    descripcion_producto VARCHAR(255),
    unidad_medida VARCHAR(50),
    cantidad DECIMAL(12,2),
    precio_venta_usd DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estudio) REFERENCES estudio_mercado(id_estudio) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 4. MATERIA PRIMA (a utilizar mensual)
-- =============================================
CREATE TABLE materia_prima (
    id_materia SERIAL PRIMARY KEY,
    id_estudio INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    descripcion VARCHAR(255),
    unidad_medida VARCHAR(50),
    cantidad DECIMAL(12,2),
    precio_compra_usd DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_estudio) REFERENCES estudio_mercado(id_estudio) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 5. ASPECTOS TECNICOS
-- =============================================
CREATE TABLE aspectos_tecnicos (
    id_tecnico SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    descripcion_local TEXT,
    tenencia_local VARCHAR(20) DEFAULT 'propio', -- propio, alquilado, otro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 6. MAQUINARIA Y EQUIPO QUE POSEE (existente)
-- =============================================
CREATE TABLE maquinaria_existente (
    id_maquinaria SERIAL PRIMARY KEY,
    id_tecnico INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    cantidad INTEGER,
    descripcion VARCHAR(255),
    precio_unitario_usd DECIMAL(12,2),
    total_usd DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tecnico) REFERENCES aspectos_tecnicos(id_tecnico) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 7. MAQUINARIA Y EQUIPO QUE SOLICITA
-- =============================================
CREATE TABLE maquinaria_solicitada (
    id_solicitud SERIAL PRIMARY KEY,
    id_tecnico INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    cantidad INTEGER,
    descripcion VARCHAR(255),
    precio_unitario_usd DECIMAL(12,2),
    total_usd DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tecnico) REFERENCES aspectos_tecnicos(id_tecnico) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 8. RECURSO HUMANO (MANO DE OBRA)
-- =============================================
CREATE TABLE recurso_humano (
    id_recurso SERIAL PRIMARY KEY,
    id_tecnico INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    tipo_trabajador VARCHAR(20), -- 'EMPLEADOS' o 'OBREROS'
    cantidad INTEGER DEFAULT 0,
    salario_mensual_usd DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tecnico) REFERENCES aspectos_tecnicos(id_tecnico) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 9. SERVICIOS BASICOS
-- =============================================
CREATE TABLE servicios_basicos (
    id_servicio SERIAL PRIMARY KEY,
    id_tecnico INTEGER NOT NULL,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    electricidad BOOLEAN DEFAULT FALSE,
    agua BOOLEAN DEFAULT FALSE,
    telefono BOOLEAN DEFAULT FALSE,
    aseo_urbano BOOLEAN DEFAULT FALSE,
    cloacas BOOLEAN DEFAULT FALSE,
    gas BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tecnico) REFERENCES aspectos_tecnicos(id_tecnico) ON DELETE CASCADE,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 10. GASTOS MENSUALES
-- =============================================
CREATE TABLE gastos_mensuales (
    id_gasto SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    concepto VARCHAR(50), -- 'MANO DE OBRA', 'MATERIA PRIMA', 'SERVICIOS BASICOS', 'ALQUILER', 'OTROS'
    monto_actual_usd DECIMAL(12,2) DEFAULT 0,
    monto_futuro_usd DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 11. PLAN DE INVERSION
-- =============================================
CREATE TABLE plan_inversion (
    id_plan SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    concepto VARCHAR(50), -- 'CONSTRUCCION', 'MAQUINARIA Y EQUIPO', 'MATERIA PRIMA', 'MANO DE OBRA', 'OTROS GASTOS'
    aportes_propios_usd DECIMAL(12,2) DEFAULT 0,
    monto_solicitado_usd DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 12. ORGANIZACION EN LA COMUNIDAD
-- =============================================
CREATE TABLE organizacion_comunidad (
    id_organizacion SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    tipo_organizacion TEXT,
    necesidades_comunidad TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 13. APORTE A LA COMUNIDAD
-- =============================================
CREATE TABLE aporte_comunidad (
    id_aporte SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    realiza_aporte BOOLEAN DEFAULT FALSE,
    descripcion_aporte TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =============================================
-- 14. GARANTIA OFRECIDA
-- =============================================
CREATE TABLE garantia (
    id_garantia SERIAL PRIMARY KEY,
    id_inspeccion INTEGER NOT NULL, -- Relación directa con inspección
    tipo_garantia VARCHAR(20) DEFAULT 'FIANZA', -- 'HIPOTECA', 'FIANZA'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_inspeccion) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);
--------------------------------------------------------------------------------------------------------

-- =============================================
-- TABLA: configuracion_contrato
-- =============================================
CREATE TABLE configuracion_contrato (
    id_configuracion SERIAL PRIMARY KEY,
    interes_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 12.50,
    morosidad_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 3.00,
    flat_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 2.50,
    cuotas_obligatorias INTEGER NOT NULL DEFAULT 12,
    cuotas_gracia INTEGER NOT NULL DEFAULT 2,
    frecuencia_pago VARCHAR(20) NOT NULL DEFAULT 'mensual',
    cedula_pago VARCHAR(20),
    banco_pago VARCHAR(100),
    cuenta_pago VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);