// backend/services/pdfService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  static async generarPDFExpediente(expediente) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        // Colores
        const colors = {
          primary: '#264653',
          secondary: '#2A9D8F',
          text: '#333333',
          lightText: '#666666'
        };
        
        // Cabecera
        doc.fontSize(20)
           .fillColor(colors.primary)
           .text('IADEY - Instituto Autónomo de Desarrollo Empresarial', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(16)
           .fillColor(colors.secondary)
           .text('EXPEDIENTE DE EMPRENDEDOR', { align: 'center' });
        
        doc.moveDown(0.5);
        doc.fontSize(10)
           .fillColor(colors.lightText)
           .text(`Fecha de generación: ${new Date().toLocaleString()}`, { align: 'center' });
        
        doc.moveDown(1);
        
        // Línea separadora
        doc.strokeColor(colors.secondary)
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke();
        
        doc.moveDown(1);
        
        // Información del expediente
        doc.fontSize(14)
           .fillColor(colors.primary)
           .text('INFORMACIÓN DEL EXPEDIENTE', { underline: true });
        
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor(colors.text);
        
        const infoExpediente = [
          ['Código Expediente:', expediente.codigo_expediente || 'N/A'],
          ['Fecha Registro:', expediente.created_at ? new Date(expediente.created_at).toLocaleDateString() : 'N/A'],
          ['Estado:', expediente.estatus || 'N/A'],
          ['Inspector Asignado:', expediente.usuario_nombre || 'No asignado']
        ];
        
        infoExpediente.forEach(([label, value]) => {
          doc.text(label, { continued: true, width: 150 })
             .text(` ${value}`, { indent: 0 });
          doc.moveDown(0.3);
        });
        
        doc.moveDown(1);
        
        // Información del emprendedor
        doc.fontSize(14)
           .fillColor(colors.primary)
           .text('DATOS DEL EMPRENDEDOR', { underline: true });
        
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor(colors.text);
        
        const infoEmprendedor = [
          ['Nombre Completo:', `${expediente.nombres || ''} ${expediente.apellidos || ''}`.trim() || 'N/A'],
          ['Cédula:', expediente.cedula || 'N/A'],
          ['Teléfono:', expediente.telefono || 'N/A'],
          ['Correo Electrónico:', expediente.correo || 'N/A'],
          ['Dirección:', expediente.direccion || 'N/A']
        ];
        
        infoEmprendedor.forEach(([label, value]) => {
          doc.text(label, { continued: true, width: 150 })
             .text(` ${value}`, { indent: 0 });
          doc.moveDown(0.3);
        });
        
        doc.moveDown(1);
        
        // Información de la solicitud
        doc.fontSize(14)
           .fillColor(colors.primary)
           .text('DATOS DE LA SOLICITUD', { underline: true });
        
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor(colors.text);
        
        const infoSolicitud = [
          ['Descripción:', expediente.solicitud || 'N/A'],
          ['Monto Solicitado:', expediente.monto_solicitado ? `$${parseFloat(expediente.monto_solicitado).toLocaleString()}` : '$0'],
          ['Fecha Solicitud:', expediente.fecha_solicitud ? new Date(expediente.fecha_solicitud).toLocaleDateString() : 'N/A']
        ];
        
        infoSolicitud.forEach(([label, value]) => {
          doc.text(label, { continued: true, width: 150 })
             .text(` ${value}`, { indent: 0 });
          doc.moveDown(0.3);
        });
        
        doc.moveDown(1);
        
        // Documentos adjuntos
        doc.fontSize(14)
           .fillColor(colors.primary)
           .text('DOCUMENTOS ADJUNTOS', { underline: true });
        
        doc.moveDown(0.5);
        
        // Mostrar documentos de verificación
        let documentos = [];
        if (expediente.verificacion_requisitos) {
          try {
            const verificacion = JSON.parse(expediente.verificacion_requisitos);
            documentos = verificacion.documentos || [];
          } catch(e) {}
        }
        
        if (documentos.length > 0) {
          documentos.forEach((docum, index) => {
            doc.fontSize(10)
               .fillColor(colors.secondary)
               .text(`${index + 1}. ${docum.nombre_requisito || 'Documento'}`, { underline: false });
            doc.fontSize(9)
               .fillColor(colors.text)
               .text(`   Tipo: ${docum.tipo || 'Imagen'}`, { indent: 10 })
               .text(`   Fecha: ${new Date(docum.fecha).toLocaleString()}`, { indent: 10 });
            doc.moveDown(0.5);
          });
        } else {
          doc.fontSize(10)
             .fillColor(colors.lightText)
             .text('No hay documentos adjuntos en este expediente');
        }
        
        doc.moveDown(2);
        
        // Pie de página
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fontSize(8)
             .fillColor(colors.lightText)
             .text(
               `Documento generado electrónicamente por IADEY - Página ${i + 1} de ${pageCount}`,
               50,
               doc.page.height - 50,
               { align: 'center' }
             );
        }
        
        doc.end();
        
      } catch (error) {
        console.error('Error generando PDF:', error);
        reject(error);
      }
    });
  }
}

module.exports = PDFService;