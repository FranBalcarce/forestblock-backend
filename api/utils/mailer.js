require('dotenv').config();
const { Resend } = require('resend');
const { getOTPTemplate } = require('../templates/otp-template');
const { getInquiryTemplate } = require('../templates/inquiry-template');

const resend = new Resend(process.env.RESEND_API_KEY);
console.log('✅ Resend Email SDK inicializado');

const sendEmail = async ({ from, to, subject, html, attachments = [] }) => {
  if (!to) {
    throw new Error("No se definió ningún destinatario en el campo 'to'.");
  }

  try {
    const resendAttachments = attachments.map(att => ({
      filename: att.filename,
      path: att.path
    }));

    const { data, error } = await resend.emails.send({
      from: from || `Forestblock <${process.env.MAIL_FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments: resendAttachments.length > 0 ? resendAttachments : undefined
    });

    if (error) {
      console.error('❌ Error enviando email con Resend:', error);
      throw error;
    }

    console.log('✅ Email enviado exitosamente:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error en sendEmail:', error);
    throw new Error(`Error enviando email: ${error.message}`);
  }
};

exports.sendOTP = async (email, otp) => {
  const domain = process.env.FORESTBLOCK_API_DOMAIN;
  const htmlContent = getOTPTemplate(domain, otp);
  return await sendEmail({
    to: email,
    subject: "Tu código de verificación - Forestblock",
    html: htmlContent
  });
};

exports.sendInquiryMail = async (inquiryData) => {
  const htmlContent = getInquiryTemplate(inquiryData);
  const recipient = process.env.CONTACT_EMAIL;
  return await sendEmail({
    to: recipient,
    subject: "Nueva Consulta de Plan - Forestblock",
    html: htmlContent
  });
};
