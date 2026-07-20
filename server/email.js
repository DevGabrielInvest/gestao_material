import nodemailer from 'nodemailer';
import { logError, serializeError } from './logger.js';
import { NODE_ENV, EMAIL_CONFIG } from './config.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (EMAIL_CONFIG.host && EMAIL_CONFIG.user) {
    transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, attachments = [] }) {
  if (NODE_ENV === 'test') {
    return { delivered: false, skipped: true };
  }

  const transport = getTransporter();

  if (!transport) {
    logError('email_no_transporter', {
      message: 'Email não foi enviado porque não há configuração SMTP. Defina EMAIL_HOST e EMAIL_USER no .env.',
      to,
      subject,
    });
    if (NODE_ENV !== 'production') {
      console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    }
    return { delivered: false, developmentFallback: true };
  }

  try {
    await transport.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      attachments,
    });
    return { delivered: true };
  } catch (err) {
    logError('email_send_failed', {
      error: serializeError(err),
      to,
      subject,
    });
    throw err;
  }
}

export function buildAcceptanceEmail({ holderName, custodyId, token, baseUrl }) {
  const link = `${baseUrl}/?acceptance=${custodyId}&token=${token}`;
  return {
    subject: 'Termo de Responsabilidade - Confirmação de Aceite',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Termo de Responsabilidade</h2>
        <p>Olá, <strong>${holderName}</strong>.</p>
        <p>Foi registrado um termo de responsabilidade em seu nome. Para formalizar a aceitação, clique no link abaixo ou copie o token manualmente no sistema.</p>
        <p><a href="${link}" style="display: inline-block; padding: 12px 24px; background: #C79640; color: #fff; text-decoration: none; border-radius: 6px;">Acessar termo e aceitar</a></p>
        <p>Se o botão não funcionar, copie e cole o endereço abaixo no navegador:</p>
        <p style="font-size: 13px; color: #666;">${link}</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">Se você não espera este e-mail, ignore-o. Nenhuma ação será tomada sem a sua confirmação.<br />Gestão Patrimonial - Daniel Frederighi Advogados Associados</p>
      </div>
    `,
  };
}

export function buildPdfEmail({ holderName, custodyId, pdfBuffer, filename }) {
  return {
    subject: 'Termo de Responsabilidade - Cópia do Documento',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Cópia do Termo de Responsabilidade</h2>
        <p>Olá, <strong>${holderName}</strong>.</p>
        <p>O termo de responsabilidade referente ao equipamento sob sua posse foi finalizado e registrado no sistema.</p>
        <p>A copia do PDF aceito esta anexada a este e-mail.</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">Gestão Patrimonial - Daniel Frederighi Advogados Associados</p>
      </div>
    `,
    attachments: pdfBuffer ? [{
      filename: filename || `termo-aceito-${custodyId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }] : [],
  };
}
