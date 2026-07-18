// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        // Verificar credenciales
        console.log('🔍 Configuración SMTP:');
    console.log(`   Usuario: ${user || 'NO CONFIGURADO'}`);
    console.log(`   Contraseña: ${pass ? '******** (configurada)' : 'NO CONFIGURADA'}`);

        // Configuración para Gmail
        const config = {
            service: 'gmail', // Usar service en lugar de host/puerto
            auth: {
                user: user,
                pass: pass.replace(/\s/g, '') // Eliminar espacios por si acaso
            }
        };

        try {
            this.transporter = nodemailer.createTransport(config);
            
            // Verificar conexión
            await this.transporter.verify();
            console.log('✅ Conexión SMTP exitosa');
            console.log(`📧 Correo: ${user}`);
        } catch (error) {
            console.error('\n❌ Error de autenticación Gmail:', error.message);
            console.log('\n🔍 Posibles soluciones:');
            console.log('   1. Usa una contraseña de aplicación (16 caracteres)');
            console.log('   2. No uses tu contraseña normal de Gmail');
            console.log('   3. Verifica que no haya espacios en la contraseña');
            console.log('   4. Asegúrate de tener activa la verificación en 2 pasos');
            console.log('   5. Si usas cuenta corporativa (Google Workspace), contacta a tu admin\n');
            
            this.createDummyTransporter();
        }
    }

    createDummyTransporter() {
        this.transporter = {
            sendMail: async (mailOptions) => {
                console.log('\n📧 ========================================');
                console.log('📧 CORREO (MODO PRUEBA)');
                console.log('📧 ========================================');
                console.log(`📧 Para: ${mailOptions.to}`);
                console.log(`📧 Asunto: ${mailOptions.subject}`);
                
                // Extraer y mostrar código
                if (mailOptions.html) {
                    const codeMatch = mailOptions.html.match(/class="code">(\d+)<\/div>/);
                    if (codeMatch) {
                        console.log(`📧 CÓDIGO: ${codeMatch[1]}`);
                        console.log('📧 ⚠️ USA ESTE CÓDIGO PARA PROBAR');
                    }
                }
                console.log('📧 ========================================\n');
                
                return { 
                    messageId: 'test-' + Date.now(),
                    response: 'Test email'
                };
            }
        };
    }

    async sendRecoveryEmail(email, nombre, codigo, token) {
        try {
            if (!this.transporter) {
                await this.initializeTransporter();
            }

            const mailOptions = {
                from: `"IADEY" <${process.env.SMTP_USER}>`,
                to: email,
                subject: '🔐 Código de Recuperación - IADEY',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #264653; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">🔐 Recuperación de Contraseña</h1>
                        </div>
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2>Hola ${nombre},</h2>
                            <p>Has solicitado restablecer tu contraseña.</p>
                            
                            <div style="background: #ffeaa7; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                                <p style="margin: 0; color: #d63031; font-weight: bold;">⏱️ Este código expira en 1 minuto</p>
                            </div>
                            
                            <div style="background: #f8f9fa; border: 2px dashed #264653; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
                                <p style="color: #666;">Tu código de verificación es:</p>
                                <div style="font-size: 48px; font-weight: bold; color: #264653; letter-spacing: 10px; font-family: monospace;">${codigo}</div>
                            </div>
                            
                            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0; color: #856404;"><strong>⚠️ No compartas este código con nadie</strong></p>
                            </div>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Correo enviado exitosamente');
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando correo:', error.message);
            throw error;
        }
    }

    async sendPasswordChangedEmail(email, nombre) {
        try {
            if (!this.transporter) {
                await this.initializeTransporter();
            }

            const mailOptions = {
                from: `"IADEY" <${process.env.SMTP_USER}>`,
                to: email,
                subject: '✅ Contraseña Actualizada - IADEY',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                            <h1 style="margin: 0;">✅ Contraseña Actualizada</h1>
                        </div>
                        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                            <h2>Hola ${nombre},</h2>
                            <p>Tu contraseña ha sido actualizada exitosamente.</p>
                        </div>
                    </div>
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando correo:', error.message);
            throw error;
        }
    }
}

module.exports = new EmailService();