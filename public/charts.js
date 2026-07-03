function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w, h };
}

function renderCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  const emptyEl = document.getElementById('categoryEmpty');
  if (!canvas || !canvas.offsetWidth) return;
  const catMap = new Map();
  state.inventory.forEach((item) => catMap.set(item.category, (catMap.get(item.category) || 0) + Number(item.quantity)));
  const items = [...catMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 7);
  if (!items.length) {
    canvas.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  canvas.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';
  const { ctx, w, h } = setupCanvas(canvas);
  const maxVal = Math.max(...items.map((i) => i.value));
  const padL = 106, padR = 36, padT = 10, padB = 10;
  const barH = Math.min(20, (h - padT - padB) / items.length - 5);
  const gap = ((h - padT - padB) - items.length * barH) / (items.length + 1);
  items.forEach((item, i) => {
    const y = padT + gap * (i + 1) + barH * i;
    const availW = w - padL - padR;
    const barW = maxVal > 0 ? (availW * item.value) / maxVal : 0;
    ctx.fillStyle = 'rgba(255,255,255,0.48)';
    ctx.font = '10px Mulish, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(item.label.length > 13 ? item.label.slice(0, 12) + '…' : item.label, padL - 8, y + barH / 2);
    ctx.fillStyle = 'rgba(219,164,81,0.1)';
    ctx.fillRect(padL, y, availW, barH);
    if (barW > 0) {
      const grad = ctx.createLinearGradient(padL, 0, padL + barW, 0);
      grad.addColorStop(0, 'rgba(219,164,81,0.65)'); grad.addColorStop(1, '#F5B458');
      ctx.fillStyle = grad;
      ctx.fillRect(padL, y, barW, barH);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = 'bold 9px Mulish, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(String(item.value), padL + barW + 5, y + barH / 2);
  });
}

function renderMovementChart() {
  const canvas = document.getElementById('movementChart');
  if (!canvas || !canvas.offsetWidth) return;
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').slice(0, 3).toUpperCase(), entries: 0, exits: 0 };
  });
  state.movements.forEach((m) => {
    const month = months.find((mo) => mo.key === (m.date || '').slice(0, 7));
    if (month) { if (m.type === 'entry') month.entries += Number(m.quantity); else month.exits += Number(m.quantity); }
  });
  const { ctx, w, h } = setupCanvas(canvas);
  const maxVal = Math.max(...months.flatMap((m) => [m.entries, m.exits]), 1);
  const padL = 30, padR = 10, padT = 10, padB = 28;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH * i) / 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    if (i < 4) {
      const val = Math.round(maxVal * (1 - i / 4));
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = '8px Mulish, sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(String(val), padL - 3, y);
    }
  }
  const colW = chartW / months.length;
  const barW = Math.min(13, colW * 0.3);
  months.forEach((month, i) => {
    const x = padL + colW * i + colW / 2;
    if (month.entries > 0) { const bh = (chartH * month.entries) / maxVal; ctx.fillStyle = '#3a9e74'; ctx.fillRect(x - barW - 1.5, padT + chartH - bh, barW, bh); }
    if (month.exits > 0) { const bh = (chartH * month.exits) / maxVal; ctx.fillStyle = '#DBA451'; ctx.fillRect(x + 1.5, padT + chartH - bh, barW, bh); }
    ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.font = '8px Mulish, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(month.label, x, padT + chartH + 8);
  });
}

function renderRequestChart() {
  const canvas = document.getElementById('requestChart');
  if (!canvas || !canvas.offsetWidth) return;
  const segments = [
    { label: 'Pendentes', key: 'pending', color: '#DBA451' },
    { label: 'Aprovadas', key: 'approved', color: '#4a9dcc' },
    { label: 'Entregues', key: 'delivered', color: '#3a9e74' },
    { label: 'Recusadas', key: 'rejected', color: '#d8624e' },
  ].map((s) => ({ ...s, count: state.requests.filter((r) => r.status === s.key).length })).filter((s) => s.count > 0);
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const { ctx, w, h } = setupCanvas(canvas);
  if (!total) {
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = '11px Mulish, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Nenhuma solicitação registrada', w / 2, h / 2);
    return;
  }
  const legendW = 112;
  const donutD = Math.min(w - legendW - 20, h) - 14;
  const cx = donutD / 2 + 7, cy = h / 2;
  const outerR = donutD / 2, innerR = outerR * 0.58;
  let angle = -Math.PI / 2;
  segments.forEach((seg) => {
    const slice = (2 * Math.PI * seg.count) / total;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, outerR, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = seg.color; ctx.fill();
    angle += slice;
  });
  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, 2 * Math.PI); ctx.fillStyle = '#1b1b1b'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 20px Manrope, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(total), cx, cy - 7);
  ctx.fillStyle = 'rgba(255,255,255,0.36)'; ctx.font = '8.5px Mulish, sans-serif';
  ctx.fillText('total', cx, cy + 10);
  const legendX = donutD + 20;
  const startY = cy - (segments.length * 22) / 2;
  segments.forEach((seg, i) => {
    const y = startY + i * 22;
    ctx.fillStyle = seg.color; ctx.beginPath(); ctx.arc(legendX + 5, y + 5, 4, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.58)'; ctx.font = '9.5px Mulish, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(seg.label, legendX + 14, y);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = 'bold 10.5px Mulish, sans-serif';
    ctx.fillText(String(seg.count), legendX + 14, y + 12);
  });
}

function renderCharts() {
  renderCategoryChart();
  renderMovementChart();
  renderRequestChart();
}
