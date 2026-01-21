const { getBaseStyles, getHeader, getFooter } = require('./base-template');

const getInquiryTemplate = (inquiryData) => `
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Nueva Consulta de Plan</title>
      <style type="text/css">
        ${getBaseStyles(process.env.FORESTBLOCK_API_DOMAIN)}
      </style>
    </head>
    <body>
      <div class="container">
        ${getHeader()}
        <h2 style="color: #182D1F;">Nueva Consulta Recibida</h2>
        <p><strong>Plan seleccionado:</strong> ${inquiryData.plan}</p>
        <p><strong>Nombre:</strong> ${inquiryData.fullName}</p>
        <p><strong>Empresa:</strong> ${inquiryData.company || "N/A"}</p>
        <p><strong>Teléfono:</strong> ${inquiryData.phone}</p>
        <p><strong>Email:</strong> ${inquiryData.email}</p>
        <p><strong>Contacto por WhatsApp:</strong> ${inquiryData.contactViaWhatsApp ? "Sí" : "No"}</p>
        ${getFooter()}
      </div>
    </body>
  </html>
`;

module.exports = {
  getInquiryTemplate
}; 