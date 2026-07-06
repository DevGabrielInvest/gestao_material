import PDFDocument from 'pdfkit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { logError, serializeError } from './logger.js';

const LOGO_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'logo DF nova.png');

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_TOP = 146;
const CONTENT_BUDGET = 560;
const FOOTER_LINE_Y = 750;

const COLORS = {
  header: '#111111',
  accent: '#C79640',
  heading: '#B87526',
  text: '#262626',
  title: '#1A1A1A',
  subtitle: '#6B6B6B',
  footerLabel: '#1F1F1F',
  footerText: '#575757',
  footerNote: '#808080',
};

const OFFICES = [
  { x: 48, city: 'BELO HORIZONTE - MG', line: '+55 31 3201-2151 | R. Felipe dos Santos, 521 - Lourdes' },
  { x: 225, city: 'SÃO PAULO - SP', line: '+55 11 2770-1304 | Av. Cidade Jardim, 377 - Itaim Bibi' },
  { x: 432, city: 'BRASÍLIA - DF', line: '+55 61 3550-7517 | SHN, Quadra 02' },
];

function wrapText(doc, text, font, size, maxWidth) {
  doc.font(font).fontSize(size);
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (doc.widthOfString(candidate) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function drawHeader(doc, title, subtitle) {
  doc.rect(0, 0, PAGE_WIDTH, 88).fill(COLORS.header);
  doc.rect(0, 88, PAGE_WIDTH, 5).fill(COLORS.accent);
  try {
    doc.image(LOGO_PATH, 38, 8, { width: 280, height: 72 });
  } catch (err) {
    logError('pdf_logo_load_failed', { error: serializeError(err) });
  }
  doc.font('Times-Bold').fontSize(16).fillColor(COLORS.title).text(title, MARGIN_X, 118, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.subtitle).text(subtitle, MARGIN_X, 133, { lineBreak: false });
}

function drawFooter(doc, pageNum, totalPages) {
  doc.rect(0, FOOTER_LINE_Y, PAGE_WIDTH, 2).fill(COLORS.accent);
  OFFICES.forEach((office) => {
    doc.font('Times-Bold').fontSize(7).fillColor(COLORS.footerLabel).text(office.city, office.x, 771, { lineBreak: false });
    doc.font('Helvetica').fontSize(6.5).fillColor(COLORS.footerText).text(office.line, office.x, 783, { lineBreak: false });
  });
  doc.font('Helvetica').fontSize(6).fillColor(COLORS.footerNote).text('Documento gerado pelo sistema de gestão patrimonial', MARGIN_X, 804, { lineBreak: false });
  doc.font('Helvetica').fontSize(6).fillColor(COLORS.footerNote).text(`Página ${pageNum} de ${totalPages}`, 500, 804, { lineBreak: false });
}

/**
 * Envia um PDF com timbrado (cabeçalho, rodapé com os três escritórios e
 * paginação) diretamente na resposta HTTP. `rows` aceita
 * `{ heading?, bold?, text }` para linhas de texto ou `{ spacer: true, height? }`
 * para espaçamento vertical.
 */
export function streamLetterheadPdf(res, { filename, title, subtitle, rows }) {
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    bufferPages: true,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const normalized = [];
  rows.forEach((row) => {
    if (row.spacer) { normalized.push({ spacer: true, height: row.height || 8 }); return; }
    const font = row.heading || row.bold ? 'Times-Bold' : 'Helvetica';
    const size = row.heading ? 12 : row.bold ? 9.5 : 9;
    wrapText(doc, row.text, font, size, CONTENT_WIDTH).forEach((text) => normalized.push({ font, size, heading: row.heading, text }));
  });

  let y = CONTENT_TOP;
  let used = 0;
  drawHeader(doc, title, subtitle);

  normalized.forEach((row) => {
    const height = row.spacer ? row.height : row.heading ? 23 : 14;
    if (used + height > CONTENT_BUDGET) {
      doc.addPage();
      drawHeader(doc, title, subtitle);
      y = CONTENT_TOP;
      used = 0;
    }
    if (!row.spacer) {
      const color = row.heading ? COLORS.heading : COLORS.text;
      doc.font(row.font).fontSize(row.size).fillColor(color).text(row.text, MARGIN_X, y, { lineBreak: false });
    }
    y += height;
    used += height;
  });

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    drawFooter(doc, i - range.start + 1, range.count);
  }

  doc.end();
}
