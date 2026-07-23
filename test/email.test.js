import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAcceptanceEmail, buildPdfEmail, sendEmail } from '../server/email.js';

test('buildAcceptanceEmail generates correct structure', () => {
  const result = buildAcceptanceEmail({
    holderName: 'João Silva',
    custodyId: 42,
    token: 'abc123token',
    baseUrl: 'https://app.dfa.adv.br',
  });

  assert.equal(result.subject, 'Termo de Responsabilidade - Confirmação de Aceite');
  assert.match(result.html, /João Silva/);
  assert.match(result.html, /abc123token/);
  assert.match(result.html, /42/);
  assert.match(result.html, /https:\/\/app\.dfa\.adv\.br/);
});

test('buildAcceptanceEmail handles empty holder name', () => {
  const result = buildAcceptanceEmail({
    holderName: '',
    custodyId: 0,
    token: 'tok',
    baseUrl: 'http://localhost',
  });

  assert.match(result.html, />.*\n/);
});

test('buildPdfEmail generates email with attachment', () => {
  const buffer = Buffer.from('fake-pdf-content');
  const result = buildPdfEmail({
    holderName: 'Maria Souza',
    custodyId: 7,
    pdfBuffer: buffer,
    filename: 'termo-aceito-7.pdf',
  });

  assert.equal(result.subject, 'Termo de Responsabilidade - Cópia do Documento');
  assert.match(result.html, /Maria Souza/);
  assert.equal(result.attachments.length, 1);
  assert.equal(result.attachments[0].filename, 'termo-aceito-7.pdf');
  assert.equal(result.attachments[0].content, buffer);
  assert.equal(result.attachments[0].contentType, 'application/pdf');
});

test('buildPdfEmail without pdfBuffer produces empty attachments', () => {
  const result = buildPdfEmail({
    holderName: 'Carlos',
    custodyId: 10,
    pdfBuffer: null,
  });

  assert.equal(result.attachments.length, 0);
});

test('sendEmail skips sending in test environment', async () => {
  const result = await sendEmail({
    to: 'test@test.com',
    subject: 'Test',
    html: '<p>test</p>',
  });

  assert.deepEqual(result, { delivered: false, skipped: true });
});
