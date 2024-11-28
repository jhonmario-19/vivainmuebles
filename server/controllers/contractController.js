const PDFDocument = require('pdfkit');
const db = require('../config/database');

const contractController = {
  generateContract: async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { contractType } = req.query; // 'sale' o 'rent'

      // Obtener datos de la transacción
      const [transaction] = await db.execute(
        `SELECT t.*, p.*, 
         buyer.name as buyer_name, buyer.address as buyer_address, buyer.phone as buyer_phone,
         seller.name as seller_name, seller.address as seller_address, seller.phone as seller_phone
         FROM payments t
         JOIN properties p ON t.property_id = p.id
         JOIN users buyer ON t.user_id = buyer.id
         JOIN users seller ON p.user_id = seller.id
         WHERE t.id = ?`,
        [transactionId]
      );

      if (!transaction.length) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contrato-${contractType}-${transactionId}.pdf`);
      
      doc.pipe(res);

      // Generar contenido del contrato
      doc.fontSize(20).text(`CONTRATO DE ${contractType === 'sale' ? 'COMPRAVENTA' : 'ARRENDAMIENTO'}`, {
        align: 'center'
      });
      doc.moveDown();

      // Fecha
      doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Datos de las partes
      doc.fontSize(14).text('PARTES DEL CONTRATO');
      doc.fontSize(12);
      doc.text(`PROPIETARIO: ${transaction[0].seller_name}`);
      doc.text(`DIRECCIÓN: ${transaction[0].seller_address}`);
      doc.text(`TELÉFONO: ${transaction[0].seller_phone}`);
      doc.moveDown();
      
      doc.text(`${contractType === 'sale' ? 'COMPRADOR' : 'ARRENDATARIO'}: ${transaction[0].buyer_name}`);
      doc.text(`DIRECCIÓN: ${transaction[0].buyer_address}`);
      doc.text(`TELÉFONO: ${transaction[0].buyer_phone}`);
      
      // Detalles de la propiedad y términos
      doc.moveDown();
      doc.fontSize(14).text('PROPIEDAD');
      doc.fontSize(12);
      doc.text(`DIRECCIÓN: ${transaction[0].location}`);
      doc.text(`PRECIO: $${transaction[0].amount.toLocaleString()}`);
      
      doc.end();
    } catch (error) {
      console.error('Error al generar contrato:', error);
      res.status(500).json({ error: 'Error al generar el contrato' });
    }
  }
};

module.exports = contractController;