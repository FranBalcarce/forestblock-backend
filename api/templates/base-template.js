const getBaseStyles = (domain) => `
  /* Fuentes y estilos personalizados */
  @font-face {
    font-family: 'Aeonik';
    src: url("${domain}fonts/Aeonik-Medium.otf") format("opentype");
    font-weight: 500;
  }
  @font-face {
    font-family: 'Aeonik';
    src: url("${domain}fonts/Aeonik-Bold.otf") format("opentype");
    font-weight: bold;
  }
  @font-face {
    font-family: 'Aeonik';
    src: url("${domain}fonts/Aeonik-Regular.otf") format("opentype");
    font-weight: normal;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Aeonik', Arial, sans-serif;
    background-color: #f6f6f6;
  }
  .container {
    max-width: 600px;
    width: 100%;
    margin: auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    background-color: #ffffff;
    text-align: center;
  }
  img {
    max-width: 100%;
    height: auto;
    display: block;
    border: 0;
  }
  a.social-icon {
    display: table-cell;
    width: 50px;
    height: 50px;
    background-color: #000;
    border-radius: 50%;
    text-align: center;
    vertical-align: middle;
  }
  a.social-icon img {
    display: block;
    margin: auto;
  }
  @media only screen and (max-width: 600px) {
    .container {
      padding: 10px;
    }
    h2 {
      font-size: 20px;
    }
    p {
      font-size: 14px;
    }
    .otp-code {
      font-size: 28px;
    }
    a.social-icon {
      width: 40px !important;
      height: 40px !important;
    }
    a.social-icon img {
      width: 20px !important;
    }
  }
`;

const getHeader = () => `
  <table role="presentation" width="100%" style="margin-bottom: 20px;">
    <tr>
      <td style="text-align: left;">
        <img src="cid:logo" alt="Forestblock" style="max-width: 150px;">
      </td>
      <td style="text-align: right; font-size: 14px; color: #182D1F;">
        <a href="https://forestblock.app" style="color: #182D1F; text-decoration: none;">forestblock.app</a>
      </td>
    </tr>
  </table>
`;

const getFooter = () => `
  <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
  <p style="margin: 0; color: #0C0E27;">Saludos,</p>
  <p style="margin: 0; color: #0C0E27;">El equipo de Forestblock</p>
  <table role="presentation" width="30%" align="center" style="margin-top: 20px; margin-left: auto; margin-right: auto;" cellspacing="0">
    <tr>
      <td align="center">
        <a href="https://twitter.com/forestblock" class="social-icon">
          <img src="cid:x" alt="X (Twitter)" width="24" style="display: block; margin: auto;">
        </a>
      </td>
      <td align="center">
        <a href="https://instagram.com/forestblock" class="social-icon">
          <img src="cid:instagram" alt="Instagram" width="24" style="display: block; margin: auto;">
        </a>
      </td>
      <td align="center">
        <a href="https://linkedin.com/company/forestblock" class="social-icon">
          <img src="cid:linkedin" alt="LinkedIn" width="24" style="display: block; margin: auto;">
        </a>
      </td>
    </tr>
  </table>
  <p style="margin-top: 10px; text-align: center;">
    <a href="https://forestblock.tech/about.html" style="color: #0C0E27; text-decoration: none; margin: 0 10px;">About</a>
    <a href="https://forestblock.tech/terms.html" style="color: #0C0E27; text-decoration: none; margin: 0 10px;">Terms</a>
    <a href="https://forestblock.tech/contact.html" style="color: #0C0E27; text-decoration: none; margin: 0 10px;">Contact</a>
  </p>
  <p style="font-size: 12px; color: #777; margin-top: 20px;">©Forestblock</p>
`;

module.exports = {
  getBaseStyles,
  getHeader,
  getFooter
}; 