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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: roles 
-- =============================================
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    cedula_usuario VARCHAR(20) NOT NULL,
    clave VARCHAR(255) NOT NULL, 
    id_rol_usu INT NOT NULL,
    estatus VARCHAR(20),
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cedula_usuario) REFERENCES persona(cedula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_rol_usu) REFERENCES roles(id_rol) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- TABLA: Permisos
-- =============================================
CREATE TABLE Permisos (
    id_permisos SERIAL PRIMARY KEY,
    id_usu INT NOT NULL,
    menu_item_id VARCHAR(50) NOT NULL,
    acciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usu) REFERENCES usuario(id) ON DELETE CASCADE
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
    urls_imagenes TEXT,
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
    id_inspeccion INT NOT NULL,
    id_expediente INT NOT NULL,
    cedula_persona_id TEXT NOT NULL,
    verificacion_requisitos TEXT NOT NULL,
    estatus_aprobacion VARCHAR (20) NOT NULL,
    seleccion_manejo VARCHAR (10) NOT NULL,
    opbervaciones TEXT,
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








--INSPECCION DE AGRICULTURA
--------------------------------------------------------------------------------------------------------

-- =====================================================
-- II. DESCRIPCIÓN DE LA UNIDAD DE PRODUCCIÓN
-- =====================================================

-- Tabla: unidad_produccion (1:1 con inspeccion)
CREATE TABLE unidad_produccion (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    ubicacion_practica TEXT,
    vias_acceso TEXT,
    tenencia VARCHAR(20) DEFAULT 'propia',
    otro_tenencia VARCHAR(255),
    vive_en_unidad_produccion BOOLEAN,
    CONSTRAINT check_tenencia CHECK (tenencia IN ('propia', 'comunero', 'arrendatario', 'uso_gocce', 'ejidos', 'inti', 'otro')),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: linderos (1:1 con unidad_produccion)
CREATE TABLE linderos (
    id SERIAL PRIMARY KEY,
    unidad_produccion_id INTEGER NOT NULL,
    norte VARCHAR(255),
    este VARCHAR(255),
    sur VARCHAR(255),
    oeste VARCHAR(255),
    FOREIGN KEY (unidad_produccion_id) REFERENCES unidad_produccion(id) ON DELETE CASCADE
);

-- Tabla: topografia_superficie (1:1 con unidad_produccion)
CREATE TABLE topografia_superficie (
    id SERIAL PRIMARY KEY,
    unidad_produccion_id INTEGER NOT NULL,
    planas_ha DECIMAL(10,2),
    planas_uso VARCHAR(255),
    planas_observaciones TEXT,
    onduladas_ha DECIMAL(10,2),
    onduladas_uso VARCHAR(255),
    onduladas_observaciones TEXT,
    quebradas_ha DECIMAL(10,2),
    quebradas_uso VARCHAR(255),
    quebradas_observaciones TEXT,
    anegadizas_ha DECIMAL(10,2),
    anegadizas_uso VARCHAR(255),
    anegadizas_observaciones TEXT,
    FOREIGN KEY (unidad_produccion_id) REFERENCES unidad_produccion(id) ON DELETE CASCADE
);

-- =====================================================
-- III. CONDICIONES DE LA EXPLOTACIÓN
-- =====================================================

-- Tabla: condiciones_administracion (1:1 con inspeccion)
CREATE TABLE condiciones_administracion (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    tipo VARCHAR(20) DEFAULT 'directa',
    nombre_administrador VARCHAR(255),
    experiencia_anos INTEGER,
    lleva_registro_fisico BOOLEAN DEFAULT FALSE,
    lleva_registro_economico BOOLEAN DEFAULT FALSE,
    especificacion_fisico VARCHAR(255),
    especificacion_economico VARCHAR(255),
    observaciones TEXT,
    CONSTRAINT check_tipo_administracion CHECK (tipo IN ('directa', 'delegada')),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: personal (1:N con inspeccion)
CREATE TABLE personal (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    cargo VARCHAR(100),
    fijos INTEGER DEFAULT 0,
    eventuales INTEGER DEFAULT 0,
    familiar BOOLEAN DEFAULT FALSE,
    otro_descripcion VARCHAR(255),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- IV. USO ACTUAL DE LA TIERRA
-- =====================================================

-- Tabla: uso_agricultura (1:N con inspeccion)
CREATE TABLE uso_agricultura (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    cultivo VARCHAR(255),
    superficie_ha DECIMAL(10,2),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: uso_pecuario (1:N con inspeccion)
CREATE TABLE uso_pecuario (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    tipo VARCHAR(255),
    superficie_ha DECIMAL(10,2),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: uso_otros (1:N con inspeccion)
CREATE TABLE uso_otros (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    descripcion VARCHAR(255),
    superficie_ha DECIMAL(10,2),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- V. INFRAESTRUCTURA EXISTENTE
-- =====================================================

-- Tabla: infraestructura (1:1 con inspeccion)
CREATE TABLE infraestructura (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    vivienda BOOLEAN DEFAULT FALSE,
    deposito_insumos BOOLEAN DEFAULT FALSE,
    galpon BOOLEAN DEFAULT FALSE,
    establo BOOLEAN DEFAULT FALSE,
    corral BOOLEAN DEFAULT FALSE,
    otro BOOLEAN DEFAULT FALSE,
    otros_especificar VARCHAR(255),
    electricidad BOOLEAN DEFAULT FALSE,
    telefonia BOOLEAN DEFAULT FALSE,
    internet BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: fuentes_agua (1:1 con infraestructura)
CREATE TABLE fuentes_agua (
    id SERIAL PRIMARY KEY,
    infraestructura_id INTEGER NOT NULL,
    pozo BOOLEAN DEFAULT FALSE,
    riego BOOLEAN DEFAULT FALSE,
    acueducto BOOLEAN DEFAULT FALSE,
    rio_quebrada BOOLEAN DEFAULT FALSE,
    otro VARCHAR(255),
    FOREIGN KEY (infraestructura_id) REFERENCES infraestructura(id) ON DELETE CASCADE
);

-- =====================================================
-- VI. MAQUINARIA Y EQUIPO
-- =====================================================

-- Tabla: maquinaria_equipo (1:N con inspeccion)
CREATE TABLE maquinaria_equipo (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    tipo VARCHAR(20), -- 'existente' o 'solicitado'
    descripcion VARCHAR(255),
    cantidad INTEGER DEFAULT 0,
    estado VARCHAR(100), -- Para equipos existentes
    precio_unitario DECIMAL(12,2), -- Para equipos solicitados
    CONSTRAINT check_tipo_maquinaria CHECK (tipo IN ('existente', 'solicitado')),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- VII. PRODUCCIÓN AGRÍCOLA/PECUARIA
-- =====================================================

-- Tabla: produccion_tipo_explotacion (1:N con inspeccion)
CREATE TABLE produccion_tipo_explotacion (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    tipo VARCHAR(20),
    CONSTRAINT check_tipo_explotacion CHECK (tipo IN ('agricola', 'pecuaria', 'mixta', 'forestal', 'agroindustrial')),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: produccion_ultimos_2_anos (1:N con inspeccion)
CREATE TABLE produccion_ultimos_2_anos (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    rubro VARCHAR(255),
    ano VARCHAR(4),
    cantidad VARCHAR(100),
    valor_bs DECIMAL(12,2),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- VIII. PRÁCTICAS AGRONÓMICAS
-- =====================================================

-- Tabla: practicas_agronomicas (1:1 con inspeccion)
CREATE TABLE practicas_agronomicas (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    preparacion_suelo TEXT,
    siembra TEXT,
    fertilizacion TEXT,
    control_plagas TEXT,
    control_malezas TEXT,
    riego TEXT,
    cosecha TEXT,
    observaciones TEXT,
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- IX. PASTIZALES
-- =====================================================

-- Tabla: pastizales (1:1 con inspeccion)
CREATE TABLE pastizales (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    numero_potreros VARCHAR(50),
    manejo_pasto TEXT,
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: pastizales_pastos (1:N con pastizales)
CREATE TABLE pastizales_pastos (
    id SERIAL PRIMARY KEY,
    pastizales_id INTEGER NOT NULL,
    nombre VARCHAR(255),
    forma_uso VARCHAR(255),
    superficie_ha DECIMAL(10,2),
    carga_ua_ha DECIMAL(10,2),
    aprovechamiento DECIMAL(5,2),
    FOREIGN KEY (pastizales_id) REFERENCES pastizales(id) ON DELETE CASCADE
);

-- =====================================================
-- X. SERVICIOS
-- =====================================================

-- Tabla: servicios (1:1 con inspeccion)
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    mercadeo_comercializacion TEXT,
    personal_tecnico TEXT,
    servicios_produccion TEXT,
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- XI. COSTOS DE PRODUCCIÓN
-- =====================================================

-- Tabla: costos_produccion (1:1 con inspeccion)
CREATE TABLE costos_produccion (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    total_bs DECIMAL(12,2),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: costos_produccion_rubros (1:N con costos_produccion)
CREATE TABLE costos_produccion_rubros (
    id SERIAL PRIMARY KEY,
    costos_produccion_id INTEGER NOT NULL,
    concepto VARCHAR(255),
    monto_bs DECIMAL(12,2),
    FOREIGN KEY (costos_produccion_id) REFERENCES costos_produccion(id) ON DELETE CASCADE
);

-- =====================================================
-- XII. ASPECTOS FINANCIEROS
-- =====================================================

-- Tabla: flujo_caja (1:1 con inspeccion)
CREATE TABLE flujo_caja (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    ano_1 INTEGER,
    ano_2 INTEGER,
    ano_3 INTEGER,
    ano_4 INTEGER,
    ano_5 INTEGER,
    ingresos_1 DECIMAL(12,2),
    ingresos_2 DECIMAL(12,2),
    ingresos_3 DECIMAL(12,2),
    ingresos_4 DECIMAL(12,2),
    ingresos_5 DECIMAL(12,2),
    costos_directos_1 DECIMAL(12,2),
    costos_directos_2 DECIMAL(12,2),
    costos_directos_3 DECIMAL(12,2),
    costos_directos_4 DECIMAL(12,2),
    costos_directos_5 DECIMAL(12,2),
    costos_financieros_1 DECIMAL(12,2),
    costos_financieros_2 DECIMAL(12,2),
    costos_financieros_3 DECIMAL(12,2),
    costos_financieros_4 DECIMAL(12,2),
    costos_financieros_5 DECIMAL(12,2),
    otros_costos_1 DECIMAL(12,2),
    otros_costos_2 DECIMAL(12,2),
    otros_costos_3 DECIMAL(12,2),
    otros_costos_4 DECIMAL(12,2),
    otros_costos_5 DECIMAL(12,2),
    utilidad_1 DECIMAL(12,2),
    utilidad_2 DECIMAL(12,2),
    utilidad_3 DECIMAL(12,2),
    utilidad_4 DECIMAL(12,2),
    utilidad_5 DECIMAL(12,2),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: financieros (1:1 con inspeccion)
CREATE TABLE financieros (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    rentabilidad_estatica VARCHAR(50),
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- XIII. CRÉDITO SOLICITADO
-- =====================================================

-- Tabla: credito (1:1 con inspeccion)
CREATE TABLE credito (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    monto_solicitado DECIMAL(12,2),
    monto_recomendado DECIMAL(12,2),
    uso_credito TEXT,
    empleos_generar VARCHAR(255),
    importancia_economica_social TEXT,
    recomendaciones TEXT,
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- =====================================================
-- XIV. ANEXOS
-- =====================================================

-- Tabla: anexos (1:1 con inspeccion)
CREATE TABLE anexos (
    id SERIAL PRIMARY KEY,
    inspeccion_id INTEGER NOT NULL,
    croquis_url TEXT,
    FOREIGN KEY (inspeccion_id) REFERENCES inspeccion(id_inspeccion) ON DELETE CASCADE
);

-- Tabla: anexos_fotografias (1:N con anexos)
CREATE TABLE anexos_fotografias (
    id SERIAL PRIMARY KEY,
    anexos_id INTEGER NOT NULL,
    foto_url TEXT,
    descripcion VARCHAR(255),
    FOREIGN KEY (anexos_id) REFERENCES anexos(id) ON DELETE CASCADE
);
----------------------------------------------------------------------------------------------------------------













-- =============================================
-- TABLA: configuracion_contrato
-- =============================================
CREATE TABLE configuracion_contrato (
    id_configuracion SERIAL PRIMARY KEY,
    tipo_moneda VARCHAR (50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS configuracion_contrato_historial (
    id_historial SERIAL PRIMARY KEY,
    id_configuracion INTEGER NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    usuario VARCHAR(100),
    motivo TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contrato (
    id_contrato SERIAL PRIMARY KEY,
    id_aprob INT NOT NULL,
    id_config INT NOT NULL,
    id_cedula_aprob TEXT,
    numero_contrato VARCHAR (30) NOT NULL,
    moneda VARCHAR (50) NOT NULL,
    monto_moneda VARCHAR (50) NOT NULL,
    cambio  VARCHAR (50) NOT NULL,
    flat  VARCHAR (50) NOT NULL,
    interes  VARCHAR (50) NOT NULL,
    devolvimiento VARCHAR (50) NOT NULL,
    numero_cuotas VARCHAR (50) NOT NULL,
    numero_gracias VARCHAR (20) NOT NULL,
    frecuencia_pago_contrato VARCHAR(50),
    inicio VARCHAR (50) NOT NULL,
    cierre VARCHAR (50) NOT NULL,
    estatus  VARCHAR (50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_aprob) REFERENCES aprobacion(id_aprobacion),
    FOREIGN KEY (id_config) REFERENCES configuracion_contrato(id_configuracion)
);

CREATE TABLE desembolso (
    id_desembolso SERIAL PRIMARY KEY,
    id_cont INT NOT NULL,
    fecha_desembolso VARCHAR (15) NOT NULL,
    fecha_confirmacion VARCHAR (15),
    capture_desembolso TEXT NOT NULL,
    estatus_desembolso VARCHAR (100) NOT NULL,
    FOREIGN KEY (id_cont) REFERENCES contrato(id_contrato)
);


CREATE TABLE cuota (
    id_cuota INT PRIMARY KEY,
    id_cuota_cont INT NOT NULL, 
    num_cuota VARCHAR(255) NOT NULL,
    --Frecuencia de la cuota
    fecha_desde TEXT,
    fecha_hasta TEXT,
    --Frecuencia de la cuota
    --Monto segun la frecuencia y el numero de cuotas
    monto_cuota VARCHAR(255) NOT NULL,
    monte_bs VARCHAR(255),
    --Monto segun la frecuencia y el numero de cuotas
    
    fecha_pagada TEXT,
    estado_cuota VARCHAR(50) NOT NULL,
    tipo_cuota VARCHAR(20) , 

    --Segun los dias de mora se calcula el monto_morosidad calculado segun los dias
    dias_mora_cuota INT,
    monto_morosidad TEXT,
    --Segun los dias de mora se calcula el monto_morosidad calculado segun los dias

    comprobante TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuota_cont) REFERENCES contrato (id_contrato)
);


-- =============================================
-- 1. INSERT ROLES
-- =============================================
INSERT INTO roles (nombre_rol) 
VALUES ('Emprendedor'), ('Inspector'), ('Presidente(a)');

-- =============================================
-- 2. INSERT PERSONA
-- =============================================
INSERT INTO persona (
    nacionalidad,
    cedula,
    nombres,
    apellidos,
    fecha_nacimiento,
    telefono,
    correo,
    estado_civil,
    direccion,
    estado,
    municipio,
    parroquia,
    tipo_persona
) VALUES (
    'V',
    'V-30608696',
    'Yeisnardo Eliander',
    'Bravo Colina',
    '2004-10-18',        -- Formato YYYY-MM-DD
    '0412-1234567',
    'Yeisnardo30@email.com',
    'Soltero',
    'Calle Principal, Casa #123',
    'Distrito Capital',
    'Libertador',
    'El Recreo',
    'Presidente(a)'
);

-- =============================================
-- 3. INSERT USUARIO
-- =============================================
INSERT INTO usuario (
    cedula_usuario,
    clave,
    id_rol_usu,
    estatus
) VALUES (
    'V-30608696',
    '$2b$12$eJ4RTGqH9z8mKvXwP5n3LO7yBfZa6cQrU0sVdWxYtNmAk8jR4hFpS',  -- ✅ Hash bcrypt de "Yb1810.."
    3,
    'Activo'
);

-- =============================================
-- 4. INSERT PERMISOS
-- =============================================
INSERT INTO Permisos (id_usu, menu_item_id, acciones) VALUES
(1, 'dashboard', '["ver", "estadisticas", "graficos"]'),
(1, 'solicitudes', '["ver", "crear", "editar", "eliminar", "aprobar", "rechazar"]'),
(1, 'expedientes', '["ver", "crear", "editar", "eliminar", "gestionar_documentos"]'),
(1, 'inspecciones', '["ver", "crear", "editar", "eliminar", "asignar"]'),
(1, 'aprobaciones', '["ver", "evaluar", "aprobar", "rechazar", "ver_historial"]'),
(1, 'creditos_banco', '["ver", "crear", "editar", "eliminar", "cambiar_estado"]'),
(1, 'contratos', '["ver", "crear", "editar", "eliminar", "firmar", "generar"]'),
(1, 'desembolsos', '["ver", "crear", "editar", "eliminar", "aprobar", "ejecutar"]'),
(1, 'pagos_cuota', '["ver", "registrar", "editar", "eliminar", "historial", "reporte"]'),
(1, 'config_usuarios', '["ver", "crear", "editar", "eliminar", "gestionar_permisos", "gestionar_roles"]'),
(1, 'config_emprendimientos', '["ver", "crear", "editar", "eliminar"]'),
(1, 'config_roles', '["ver", "crear", "editar", "eliminar"]'),
(1, 'config_contratos', '["ver", "editar"]'),
(1, 'config_requisitos', '["ver", "crear", "editar", "eliminar"]');