/**
 * GokKalkan High-Performance Canvas Map & Radar Engine
 * Çanakkale Boğazı, Marmara & Kuzey Ege Topografyası
 * Yağış radarı, Rüzgar vektör partikülleri, Sismik fay hatları simülasyonu.
 */

class GokMapEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.currentLayer = 'rain'; // 'rain', 'wind', 'seismic', 'fire'
    this.timelineStep = 8; // 0 to 12 (represents -2h to +1h)
    this.isPlaying = false;
    this.playInterval = null;
    
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    
    // Wind particles
    this.particles = [];
    this.initWindParticles(70);
    
    this.initCanvasSize();
    this.bindEvents();
    this.startRenderLoop();
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Fallback if tab is currently hidden (display: none)
    const w = rect.width > 0 ? rect.width : (this.canvas.parentElement?.clientWidth || 370);
    const h = rect.height > 0 ? rect.height : (this.canvas.parentElement?.clientHeight || 480);

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale before reapplying
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
  }

  initWindParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * 400,
        y: Math.random() * 500,
        len: 12 + Math.random() * 18,
        speed: 1.5 + Math.random() * 2.2,
        opacity: 0.2 + Math.random() * 0.7,
        angle: Math.PI * 0.75 + (Math.random() - 0.5) * 0.2 // North-East flow
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.initCanvasSize());
  }

  setLayer(layer) {
    this.currentLayer = layer;
  }

  setTimelineStep(step) {
    this.timelineStep = parseInt(step, 10);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playInterval = setInterval(() => {
        this.timelineStep = (this.timelineStep + 1) % 13;
        const slider = document.getElementById('mapTimelineSlider');
        if (slider) slider.value = this.timelineStep;
      }, 700);
    } else {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    return this.isPlaying;
  }

  adjustZoom(delta) {
    this.zoom = Math.max(0.8, Math.min(2.0, this.zoom + delta));
  }

  resetCenter() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  startRenderLoop() {
    const loop = () => {
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    
    // Transform
    ctx.translate(w / 2 + this.panX, h / 2 + this.panY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-w / 2, -h / 2);

    // 1. Water background (Aegean & Marmara)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Landmasses (Gelibolu Peninsula & Anatolian Side)
    this.drawGeography(ctx, w, h);

    // 3. Draw Active Layer
    if (this.currentLayer === 'rain') {
      this.drawPrecipitationRadar(ctx, w, h);
    } else if (this.currentLayer === 'wind') {
      this.drawWindParticles(ctx, w, h);
    } else if (this.currentLayer === 'seismic') {
      this.drawSeismicFaults(ctx, w, h);
    } else if (this.currentLayer === 'fire') {
      this.drawFireRisk(ctx, w, h);
    }

    // 4. City markers & Points of Interest
    this.drawMarkers(ctx, w, h);

    ctx.restore();
  }

  drawGeography(ctx, w, h) {
    // Land styling
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;

    // Gelibolu (European side)
    ctx.beginPath();
    ctx.moveTo(w * 0.1, 0);
    ctx.bezierCurveTo(w * 0.25, h * 0.15, w * 0.35, h * 0.3, w * 0.3, h * 0.52);
    ctx.bezierCurveTo(w * 0.25, h * 0.56, w * 0.15, h * 0.45, w * 0.05, h * 0.4);
    ctx.lineTo(0, h * 0.4);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Anatolian side (Çanakkale, Ezine, Biga)
    ctx.beginPath();
    ctx.moveTo(w * 0.48, 0);
    ctx.bezierCurveTo(w * 0.45, h * 0.2, w * 0.42, h * 0.35, w * 0.46, h * 0.48);
    ctx.bezierCurveTo(w * 0.48, h * 0.55, w * 0.42, h * 0.75, w * 0.35, h * 0.9);
    ctx.lineTo(w, h);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bozcaada Island
    ctx.beginPath();
    ctx.ellipse(w * 0.2, h * 0.72, 16, 11, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gökçeada Island
    ctx.beginPath();
    ctx.ellipse(w * 0.12, h * 0.28, 24, 14, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dardanelles Strait label
    ctx.font = '500 10px -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('ÇANAKKALE BOĞAZI', w * 0.28, h * 0.42);
  }

  drawPrecipitationRadar(ctx, w, h) {
    const timeOffset = (this.timelineStep - 8) * 15; // cloud movement based on time
    
    // Radar rain clouds
    const clouds = [
      { x: w * 0.35 + timeOffset, y: h * 0.25 + timeOffset * 0.5, r: 60, intensity: 0.65 },
      { x: w * 0.55 + timeOffset, y: h * 0.18 + timeOffset * 0.4, r: 80, intensity: 0.8 },
      { x: w * 0.25 + timeOffset, y: h * 0.48 + timeOffset * 0.3, r: 45, intensity: 0.4 }
    ];

    clouds.forEach(c => {
      const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
      grad.addColorStop(0, 'rgba(56, 189, 248, ' + (0.7 * c.intensity) + ')');
      grad.addColorStop(0.5, 'rgba(16, 185, 129, ' + (0.5 * c.intensity) + ')');
      grad.addColorStop(0.8, 'rgba(245, 158, 11, ' + (0.35 * c.intensity) + ')');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawWindParticles(ctx, w, h) {
    ctx.lineWidth = 1.8;
    this.particles.forEach(p => {
      ctx.strokeStyle = `rgba(56, 189, 248, ${p.opacity})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const targetX = p.x + Math.cos(p.angle) * p.len;
      const targetY = p.y + Math.sin(p.angle) * p.len;
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Move particle
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;

      // Wrap around
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
    });
  }

  drawSeismicFaults(ctx, w, h) {
    // North Anatolian Fault (Marmara - Saros segment)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(w * 0.9, h * 0.1);
    ctx.quadraticCurveTo(w * 0.5, h * 0.22, w * 0.1, h * 0.15);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Biga epicenter (2.9 Magnitude)
    const epicX = w * 0.65;
    const epicY = h * 0.32;
    
    // Wave ripple
    const t = Date.now() / 1000;
    const ring1 = (t % 2) * 20;
    const ring2 = ((t + 1) % 2) * 20;

    ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(epicX, epicY, ring1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(epicX, epicY, ring2, 0, Math.PI * 2);
    ctx.stroke();

    // Epicenter dot
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(epicX, epicY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Badge
    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(epicX + 8, epicY - 14, 88, 22);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.strokeRect(epicX + 8, epicY - 14, 88, 22);

    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.fillStyle = '#fb7185';
    ctx.fillText('M 2.9 (Biga)', epicX + 14, epicY + 1);
  }

  drawFireRisk(ctx, w, h) {
    // Kaz Mountains & Gelibolu forest fire index
    const zones = [
      { x: w * 0.7, y: h * 0.75, r: 65, color: 'rgba(239, 68, 68, 0.4)' },
      { x: w * 0.25, y: h * 0.35, r: 40, color: 'rgba(245, 158, 11, 0.35)' }
    ];

    zones.forEach(z => {
      const grad = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r);
      grad.addColorStop(0, z.color);
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawMarkers(ctx, w, h) {
    const locs = [
      { name: 'Barbaros (Siz)', x: w * 0.43, y: h * 0.44, isUser: true },
      { name: 'Bozcaada', x: w * 0.2, y: h * 0.72, isUser: false },
      { name: 'Ezine', x: w * 0.52, y: h * 0.62, isUser: false }
    ];

    locs.forEach(l => {
      if (l.isUser) {
        // Glowing GPS radar dot
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = l.isUser ? 'bold 11px -apple-system, sans-serif' : '500 10px -apple-system, sans-serif';
      ctx.fillStyle = l.isUser ? '#38bdf8' : '#cbd5e1';
      ctx.fillText(l.name, l.x + 8, l.y + 4);
    });
  }
}

if (typeof window !== 'undefined') {
  window.GokMapEngine = GokMapEngine;
}
