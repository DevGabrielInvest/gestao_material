import { Router } from 'express';
import crypto from 'node:crypto';
import sql from '../db.js';
import { handleRouteError, logInfo } from '../logger.js';
import { authMiddleware, roleMiddleware } from '../middleware.js';
import { parsePositiveId, logActivity } from '../validation.js';
import { ACCEPTANCE_TOKEN_EXPIRY_MINUTES, BASE_URL, NODE_ENV } from '../config.js';
import { notifyChange } from '../events.js';
import { sendEmail, buildAcceptanceEmail, buildPdfEmail } from '../email.js';
import { streamAcceptancePdf, streamAcceptancePreviewPdf } from '../pdf.js';

const router = Router();
const adminManager = roleMiddleware('admin', 'manager');

function detectBrowser(ua) {
  if (!ua) return { browser: 'Desconhecido', os: 'Desconhecido' };
  let browser = 'Desconhecido';
  let os = 'Desconhecido';

  if (ua.includes('Firefox') && !ua.includes('Seamonkey')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';

  if (ua.includes('Windows NT 10')) os = 'Windows 10';
  else if (ua.includes('Windows NT 11')) os = 'Windows 11';
  else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
  else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

async function findValidToken(custodyId, token) {
  if (!token || typeof token !== 'string') return null;
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const tokens = await sql`
    SELECT * FROM acceptance_tokens
    WHERE custody_id = ${custodyId}
      AND token_hash = ${tokenHash}
      AND used_at IS NULL
      AND expires_at > NOW()
    ORDER BY id DESC
    LIMIT 1
  `;
  return tokens[0] || null;
}

router.post('/api/acceptance/:id/send-token', authMiddleware, adminManager, async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;

    const records = await sql`SELECT * FROM custody WHERE id = ${id}`;
    if (!records.length) return res.status(404).json({ error: 'Termo não encontrado' });

    const record = records[0];
    if (record.acceptance_status === 'completed') {
      return res.status(409).json({ error: 'Este termo já foi aceito pelo responsável.' });
    }

    const email = record.holder_email;
    if (!email) {
      return res.status(400).json({ error: 'Este termo não possui e-mail do responsável. Cadastre um antes de enviar.' });
    }

    const token = generateToken();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + ACCEPTANCE_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    const insertedToken = (await sql`
      INSERT INTO acceptance_tokens (custody_id, token_hash, holder_email, expires_at)
      VALUES (${id}, ${tokenHash}, ${email}, ${expiresAt})
      RETURNING id
    `)[0];

    const emailContent = buildAcceptanceEmail({
      holderName: record.holder,
      custodyId: id,
      token,
      baseUrl: BASE_URL,
    });
    let emailResult;
    try {
      emailResult = await sendEmail({ to: email, ...emailContent });
    } catch (emailError) {
      await sql`DELETE FROM acceptance_tokens WHERE id = ${insertedToken.id}`;
      throw emailError;
    }

    await sql.begin(async (trx) => {
      await trx`
        UPDATE acceptance_tokens SET used_at = NOW()
        WHERE custody_id = ${id} AND id <> ${insertedToken.id} AND used_at IS NULL
      `;
      await trx`
        UPDATE custody SET acceptance_status = 'token_sent', updated_at = NOW()
        WHERE id = ${id}
      `;
    });

    await logActivity('Token de aceitação enviado', `Token enviado para ${email} referente a ${record.item}`, req);

    if (NODE_ENV !== 'production') {
      logInfo('acceptance_token_dev', { custodyId: id, token, email: record.holder_email });
    }

    notifyChange('custody', 'updated', { id });

    const message = emailResult?.developmentFallback
      ? `SMTP nao configurado: token gerado apenas no log de desenvolvimento. Expira em ${ACCEPTANCE_TOKEN_EXPIRY_MINUTES} minutos.`
      : `Token enviado para ${email}. O token expira em ${ACCEPTANCE_TOKEN_EXPIRY_MINUTES} minutos.`;
    res.json({ ok: true, delivered: Boolean(emailResult?.delivered), message });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/acceptance/:id/preview', async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;

    const validToken = await findValidToken(id, req.body?.token);
    if (!validToken) return res.status(401).json({ error: 'Token invalido ou expirado.' });

    const records = await sql`
      SELECT c.*, i.name AS inventory_name, i.code AS inventory_code,
             i.serial_number, i.brand, i.conservation_state, i.value AS inventory_value
      FROM custody c
      JOIN inventory i ON i.id = c.inventory_id
      WHERE c.id = ${id}
    `;
    if (!records.length) return res.status(404).json({ error: 'Termo nao encontrado' });

    const record = records[0];
    streamAcceptancePreviewPdf(res, {
      record,
      inventory: {
        name: record.inventory_name,
        code: record.inventory_code,
        serial_number: record.serial_number,
        brand: record.brand,
        conservation_state: record.conservation_state,
        value: record.inventory_value,
      },
    });
  } catch (err) { handleRouteError(err, req, res); }
});

router.post('/api/acceptance/:id/verify', async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;

    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token é obrigatório.' });
    }

    const records = await sql`SELECT * FROM custody WHERE id = ${id}`;
    if (!records.length) return res.status(404).json({ error: 'Termo não encontrado' });

    const record = records[0];
    if (record.acceptance_status === 'completed') {
      return res.status(409).json({ error: 'Este termo já foi aceito anteriormente.' });
    }

    const validToken = await findValidToken(id, token);

    if (!validToken) {
      await sql`
        INSERT INTO audit_trail (custody_id, event, ip, user_agent, metadata)
        VALUES (${id}, 'token_rejected', ${req.ip || ''}, ${req.headers['user-agent'] || ''},
          ${JSON.stringify({ reason: 'Token inválido ou expirado' })})
      `;
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    const ip = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os } = detectBrowser(userAgent);

    await sql.begin(async (trx) => {
      await trx`
        UPDATE acceptance_tokens SET used_at = NOW()
        WHERE id = ${validToken.id}
      `;

      await trx`
        UPDATE custody SET
          acceptance_status = 'completed',
          accepted_at = NOW(),
          acceptance_ip = ${ip},
          acceptance_user_agent = ${userAgent},
          acceptance_os = ${os},
          acceptance_browser = ${browser},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      await trx`
        INSERT INTO audit_trail (custody_id, event, ip, user_agent, os, browser, metadata)
        VALUES (${id}, 'token_accepted', ${ip}, ${userAgent}, ${os}, ${browser},
          ${JSON.stringify({ acceptedAt: new Date().toISOString() })})
      `;
    });

    const updated = (await sql`SELECT * FROM custody WHERE id = ${id}`)[0];

    const inv = await sql`SELECT * FROM inventory WHERE id = ${record.inventory_id}`;

    const acceptanceResult = await new Promise((resolve, reject) => {
      streamAcceptancePdf(res, {
        record: updated,
        inventory: inv[0] || {},
        userAgent,
        ip,
        browser,
        os,
        callback: (result) => resolve(result),
        error: (err) => reject(err),
      });
    });

    if (acceptanceResult?.hash) {
      const pdfBuffer = acceptanceResult.buffer;
      await sql`
        INSERT INTO term_hashes (custody_id, pdf_hash, pdf_size, algorithm)
        VALUES (${id}, ${acceptanceResult.hash}, ${pdfBuffer.length}, 'SHA-256')
      `;

      await sql`
        UPDATE custody SET pdf_hash = ${acceptanceResult.hash}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }

    if (record.holder_email) {
      const pdfEmailContent = buildPdfEmail({
        holderName: record.holder,
        custodyId: id,
        pdfBuffer: acceptanceResult?.buffer,
        filename: `termo-aceito-${String(record.code || id).toLowerCase()}.pdf`,
      });
      await sendEmail({ to: record.holder_email, ...pdfEmailContent });
    }

    await logActivity('Termo aceito e registrado', `${record.item} aceito por ${record.holder} · Hash: ${(acceptanceResult?.hash || '').slice(0, 16)}…`, req);
    notifyChange('custody', 'updated', { id });
  } catch (err) { handleRouteError(err, req, res); }
});

router.get('/api/acceptance/:id/status', authMiddleware, adminManager, async (req, res) => {
  try {
    const id = parsePositiveId(req, res);
    if (!id) return;

    const records = await sql`
      SELECT id, holder, holder_email, acceptance_status, accepted_at,
             acceptance_ip, acceptance_os, acceptance_browser, pdf_hash
      FROM custody WHERE id = ${id}
    `;
    if (!records.length) return res.status(404).json({ error: 'Termo não encontrado' });

    const record = records[0];
    const hashes = await sql`
      SELECT pdf_hash, pdf_size, algorithm, generated_at
      FROM term_hashes WHERE custody_id = ${id}
      ORDER BY id DESC
    `;

    const audit = await sql`
      SELECT event, ip, os, browser, created_at
      FROM audit_trail WHERE custody_id = ${id}
      ORDER BY id DESC
    `;

    res.json({ custody: record, hashes, audit });
  } catch (err) { handleRouteError(err, req, res); }
});

export default router;
