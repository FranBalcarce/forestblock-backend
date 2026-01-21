const { getBaseStyles, getHeader, getFooter } = require('./base-template');

const getOTPTemplate = (domain, otp) => `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style type="text/css">
        ${getBaseStyles(domain)}
      </style>
    </head>
    <body>
      <div class="container">
        ${getHeader()}
        <h2 style="color: #182D1F; font-weight: 500;">¡Bienvenido a Forestblock!</h2>
        <p style="color: #31B73B; font-weight: bold;">Usa el siguiente código para iniciar sesión:</p>
        <p class="otp-code" style="font-size: 24px; font-weight: bold; color: #000;">${otp}</p>
        <p style="color: #182D1F;">¿Tienes preguntas o necesitas ayuda?</p>
        <p style="color: #182D1F;">
          Puedes enviar un correo electrónico a 
          <a href="mailto:hello@forestblock.tech" style="color: #007bff; text-decoration: none;">hello@forestblock.tech</a>
          o contactarnos por WhatsApp.
        </p>
        <a href="https://wa.me/5492995151567" style="background-color: #31B73B; color: white; text-decoration: none; display: inline-block; border-radius: 5px;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto; padding: 10px 20px;">
            <tr>
              <td style="text-align: center; font-weight: bold; color: white;">Contáctanos</td>
              <td style="text-align: center; padding-left: 10px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WhatsApp" width="16" style="display: block;">
              </td>
            </tr>
          </table>
        </a>
        ${getFooter()}
      </div>
    </body>
  </html>
`;

module.exports = {
  getOTPTemplate
}; 