/**
 * IQBAL STUDY CENTRE (ISC) — CELESTIAL COSMIC & SACRED GEOMETRY MOTION ENGINE
 * Theme: Awakening Khudi, Cosmic Constellations, and Sacred Islamic Geometry
 * High-performance, GPU hardware-accelerated, 60-120 FPS, full Dark/Light theme adaptation
 */

class CelestialMotionEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.geometricStars = [];
    this.maxParticles = window.innerWidth < 768 ? 28 : 55;
    this.maxGeoStars = window.innerWidth < 768 ? 3 : 6;
    
    // Mouse interaction tracking
    this.mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 140,
      active: false
    };

    this.isScrolling = false;
    this.scrollTimer = null;
    this.scrollY = window.scrollY;
    this.lastScrollY = window.scrollY;
    this.scrollVelocity = 0;
    this.animFrameId = null;
    this.lastTime = performance.now();
    this.isTabVisible = true;

    this.init();
    this.bindEvents();
    this.animate(this.lastTime);
  }

  init() {
    this.resize();
    this.createStardust();
    this.createGeometricStars();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.scale(dpr, dpr);

    this.maxParticles = this.width < 768 ? 28 : 55;
    this.maxGeoStars = this.width < 768 ? 3 : 6;
  }

  createStardust() {
    this.particles = [];
    const isLight = document.body && document.body.classList.contains('light-mode');

    for (let i = 0; i < this.maxParticles; i++) {
      const z = Math.random() * 0.85 + 0.15; // 3D depth factor
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        baseVx: (Math.random() - 0.5) * 0.35 * z,
        baseVy: -(Math.random() * 0.35 + 0.15) * z, // gentle upward cosmic drift
        vx: 0,
        vy: 0,
        radius: (Math.random() * 1.6 + 0.8) * z,
        z: z,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        baseAlpha: Math.random() * 0.35 + 0.25,
        type: Math.random() > 0.3 ? 'gold' : 'teal'
      });
    }
  }

  createGeometricStars() {
    this.geometricStars = [];
    for (let i = 0; i < this.maxGeoStars; i++) {
      this.geometricStars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -(Math.random() * 0.25 + 0.08), // slow majestic ascent
        radius: Math.random() * 14 + 10,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.006,
        alpha: Math.random() * 0.2 + 0.12,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02
      });
    }
  }

  bindEvents() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.createStardust();
        this.createGeometricStars();
      }, 150);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });

    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      const currentScroll = window.scrollY;
      this.scrollVelocity = (currentScroll - this.lastScrollY) * 0.4;
      this.lastScrollY = currentScroll;

      clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(() => {
        this.isScrolling = false;
        this.scrollVelocity = 0;
      }, 70);
    }, { passive: true });

    // Battery & CPU optimization: pause when user changes tab
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible) {
        this.lastTime = performance.now();
        this.animate(this.lastTime);
      } else if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }
    });
  }

  /**
   * Draw Sacred 8-Pointed Star (Khatam-e-Sulaiman geometry)
   * A hallmark of classical Islamic architecture and Iqbalian civilizational aesthetics
   */
  draw8PointStar(cx, cy, radius, angle, color, alpha) {
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(angle);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = Math.max(0.04, Math.min(alpha, 0.45));

    // Outer 8-pointed star from two overlapping rotated squares
    const r = radius;
    this.ctx.beginPath();
    this.ctx.rect(-r / 2, -r / 2, r, r);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.rotate(Math.PI / 4);
    this.ctx.rect(-r / 2, -r / 2, r, r);
    this.ctx.stroke();

    // Central core focal jewel
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.restore();
  }

  animate(now) {
    if (!this.isTabVisible) return;

    const delta = Math.min((now - this.lastTime) / 16.666, 2.0); // normalize for 60Hz
    this.lastTime = now;

    // Smooth mouse easing
    if (this.mouse.active) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;
    } else {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    }

    const w = this.width;
    const h = this.height;
    this.ctx.clearRect(0, 0, w, h);

    const isLight = document.body && document.body.classList.contains('light-mode');

    // Dynamic color palettes
    const goldColor = isLight ? 'rgba(180, 83, 9, ' : 'rgba(212, 175, 55, ';
    const tealColor = isLight ? 'rgba(15, 118, 110, ' : 'rgba(45, 212, 191, ';
    const starColor = isLight ? '#b45309' : '#d4af37';

    // 1. UPDATE & DRAW SACRED GEOMETRIC STARS
    for (let i = 0; i < this.geometricStars.length; i++) {
      const star = this.geometricStars[i];

      star.x += star.vx * delta;
      star.y += (star.vy - this.scrollVelocity * 0.08) * delta;
      star.angle += star.rotSpeed * delta;
      star.pulsePhase += star.pulseSpeed * delta;

      // Wrap-around
      if (star.y < -star.radius * 2) star.y = h + star.radius * 2;
      if (star.y > h + star.radius * 2) star.y = -star.radius * 2;
      if (star.x < -star.radius * 2) star.x = w + star.radius * 2;
      if (star.x > w + star.radius * 2) star.x = -star.radius * 2;

      // Interactive mouse deflection
      if (this.mouse.active) {
        const dx = star.x - this.mouse.x;
        const dy = star.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 1) {
          const force = (1 - dist / 180) * 0.8;
          star.x += (dx / dist) * force;
          star.y += (dy / dist) * force;
        }
      }

      const pulseAlpha = star.alpha + Math.sin(star.pulsePhase) * 0.05;
      const finalAlpha = isLight ? pulseAlpha * 0.85 : pulseAlpha;
      this.draw8PointStar(star.x, star.y, star.radius, star.angle, starColor, finalAlpha);
    }

    // 2. UPDATE & DRAW CELESTIAL STARDUST PARTICLES
    const pLen = this.particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];

      // Natural movement + scroll parallax
      p.x += (p.baseVx + p.vx) * delta;
      p.y += (p.baseVy + p.vy - this.scrollVelocity * (p.z * 0.25)) * delta;
      p.phase += p.twinkleSpeed * delta;

      // Friction to return to ambient drift
      p.vx *= 0.94;
      p.vy *= 0.94;

      // Wrap around bounds
      if (p.x < 0) p.x = w;
      else if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      else if (p.y > h) p.y = 0;

      // Mouse interactive celestial gravity
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distSq = dx * dx + dy * dy;
        const maxDist = this.mouse.radius * p.z;
        if (distSq < maxDist * maxDist && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxDist) * 1.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }

      // Sinusoidal Twinkle
      const twinkle = Math.sin(p.phase) * 0.18;
      const alpha = Math.max(0.08, Math.min(p.baseAlpha + twinkle, 0.85));
      const colorPrefix = p.type === 'gold' ? goldColor : tealColor;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = colorPrefix + (isLight ? alpha * 0.75 : alpha) + ')';
      this.ctx.fill();

      // 3. CONSTELLATION HARMONIC CONNECTIONS (BEKHUDI MESH)
      // Only check connections if not aggressively scrolling for silky 120 FPS
      if (!this.isScrolling) {
        for (let j = i + 1; j < pLen; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          const maxConn = 8500; // ~92px
          if (distSq < maxConn) {
            const lineAlpha = (1 - distSq / maxConn) * (isLight ? 0.13 : 0.18) * Math.min(p.z, p2.z);
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = goldColor + lineAlpha + ')';
            this.ctx.lineWidth = 0.55;
            this.ctx.stroke();
          }
        }
      }
    }

    this.animFrameId = requestAnimationFrame((t) => this.animate(t));
  }
}

// Instantiate engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CelestialMotionEngine('particles-canvas');
});
