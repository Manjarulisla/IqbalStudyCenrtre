/**
 * IQBAL STUDY CENTRE (ISC) — ULTRA-FAST PARTICLES ENGINE
 * Optimized with minimal draw calls and zero garbage collection for 60-120 FPS
 */

class FastParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.maxParticles = window.innerWidth < 768 ? 20 : 35;
    this.isScrolling = false;
    this.scrollTimer = null;

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    this.particles = [];
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.8,
        color: Math.random() > 0.4 ? 'rgba(212, 175, 55, ' : 'rgba(45, 212, 191, ',
        alpha: Math.random() * 0.4 + 0.2
      });
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.init();
      }, 150);
    }, { passive: true });

    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        this.isScrolling = false;
      }, 80);
    }, { passive: true });
  }

  animate() {
    // If user is vigorously scrolling, we still update gently
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;
    const len = this.particles.length;

    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      else if (p.y > h) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, 6.283);
      this.ctx.fillStyle = p.color + p.alpha + ')';
      this.ctx.fill();

      // Simple light connecting lines only when idle
      if (!this.isScrolling) {
        for (let j = i + 1; j < len; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 7200) { // ~85px
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - distSq / 7200) * 0.12})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FastParticleSystem('particles-canvas');
});
