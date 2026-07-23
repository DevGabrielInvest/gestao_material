import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';

const chartsSrc = fs.readFileSync(new URL('../public/charts.js', import.meta.url), 'utf-8');

const html = `
<!DOCTYPE html>
<html><body>
<canvas id="testCanvas" style="width:400px;height:200px;"></canvas>
</body></html>`;

const dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'dangerously', pretendToBeVisual: true });

dom.window.state = { inventory: [], requests: [], custody: [], movements: [], activity: [], dashboard: null };

const s = dom.window.document.createElement('script');
s.textContent = chartsSrc.replace(/^(const|let) /gm, 'var ');
dom.window.document.body.appendChild(s);

const { setupCanvas } = dom.window;

test('setupCanvas returns ctx, w, h from canvas element', () => {
  const canvas = dom.window.document.getElementById('testCanvas');
  Object.defineProperties(canvas, {
    offsetWidth: { value: 400 },
    offsetHeight: { value: 200 },
  });
  const mockCtx = { scale: () => {}, fillRect: () => {}, fillText: () => {} };
  canvas.getContext = () => mockCtx;

  const result = setupCanvas(canvas);
  assert.equal(result.ctx, mockCtx);
  assert.equal(result.w, 400);
  assert.equal(result.h, 200);
});

test('setupCanvas applies devicePixelRatio scaling', () => {
  dom.window.devicePixelRatio = 2;
  const canvas = dom.window.document.getElementById('testCanvas');
  Object.defineProperties(canvas, {
    offsetWidth: { value: 400 },
    offsetHeight: { value: 200 },
  });
  let scaleArgs;
  const mockCtx = { scale: (...args) => { scaleArgs = args; }, fillRect: () => {}, fillText: () => {} };
  canvas.getContext = () => mockCtx;

  setupCanvas(canvas);
  assert.deepEqual(scaleArgs, [2, 2]);
  assert.equal(canvas.width, 800);
  assert.equal(canvas.height, 400);
  dom.window.devicePixelRatio = 1;
});
