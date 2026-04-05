export class InkLandscape {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.handleResize = this.handleResize.bind(this);

    this.resize();
    this.init();

    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.resize();
    this.init();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  init() {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#f5f1e8';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawMountains();
    this.addInkSplatters();
    this.drawMist();
    this.drawBirds();
  }

  drawMountains() {
    const layers = [
      { y: this.height * 0.85, opacity: 0.08, height: 0.4 },
      { y: this.height * 0.75, opacity: 0.12, height: 0.35 },
      { y: this.height * 0.65, opacity: 0.06, height: 0.25 }
    ];

    layers.forEach((layer, index) => {
      this.drawMountainLayer(layer, index);
    });
  }

  drawMountainLayer(layer, seed) {
    const ctx = this.ctx;
    const { y, opacity, height } = layer;

    ctx.save();
    ctx.globalAlpha = opacity;

    const gradient = ctx.createLinearGradient(0, y - this.height * height, 0, y);
    gradient.addColorStop(0, 'rgba(26, 26, 26, 0.1)');
    gradient.addColorStop(0.5, 'rgba(26, 26, 26, 0.6)');
    gradient.addColorStop(1, 'rgba(26, 26, 26, 0.2)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, this.height);

    let x = 0;
    const step = 5;
    const baseY = y;

    while (x <= this.width) {
      const noise1 = Math.sin(x * 0.003 + seed) * this.height * height * 0.3;
      const noise2 = Math.sin(x * 0.008 + seed * 2) * this.height * height * 0.2;
      const noise3 = Math.sin(x * 0.02 + seed * 3) * this.height * height * 0.1;
      const noise4 = Math.sin(x * 0.05 + seed * 5) * this.height * height * 0.05;

      const peakY = baseY - Math.abs(noise1 + noise2 + noise3 + noise4);

      ctx.lineTo(x, peakY);
      x += step;
    }

    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    this.addInkEdge(ctx, seed);

    ctx.restore();
  }

  addInkEdge(ctx, seed) {
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;

    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      let x = 0;
      const offsetY = (Math.random() - 0.5) * 20;

      while (x <= this.width) {
        const y = this.height * 0.7 + Math.sin(x * 0.01 + seed + i) * 50 + offsetY;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += 10;
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  addInkSplatters() {
    const ctx = this.ctx;
    const numSplatters = Math.floor(this.width / 100);

    for (let i = 0; i < numSplatters; i += 1) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height * 0.6;
      const radius = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.05 + 0.02;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#1a1a1a';

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      if (Math.random() > 0.7) {
        const splashCount = Math.floor(Math.random() * 4) + 2;
        for (let j = 0; j < splashCount; j += 1) {
          const angle = Math.random() * Math.PI * 2;
          const dist = radius * (2 + Math.random() * 3);
          const splashX = x + Math.cos(angle) * dist;
          const splashY = y + Math.sin(angle) * dist;
          const splashR = radius * (0.2 + Math.random() * 0.3);

          ctx.beginPath();
          ctx.arc(splashX, splashY, splashR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  drawMist() {
    const ctx = this.ctx;

    for (let i = 0; i < 5; i += 1) {
      const y = this.height * (0.4 + Math.random() * 0.3);
      const width = this.width * (0.3 + Math.random() * 0.4);
      const x = Math.random() * this.width;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, width / 2);
      gradient.addColorStop(0, 'rgba(245, 241, 232, 0.8)');
      gradient.addColorStop(0.5, 'rgba(245, 241, 232, 0.3)');
      gradient.addColorStop(1, 'rgba(245, 241, 232, 0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, width / 2, width / 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawBirds() {
    const ctx = this.ctx;
    const birdCount = Math.floor(Math.random() * 4) + 3;
    const startX = this.width * (0.1 + Math.random() * 0.3);
    const startY = this.height * (0.15 + Math.random() * 0.2);

    ctx.save();
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    for (let i = 0; i < birdCount; i += 1) {
      const x = startX + i * (30 + Math.random() * 20);
      const y = startY + (Math.random() - 0.5) * 40;
      const size = 8 + Math.random() * 6;
      const opacity = 0.15 + Math.random() * 0.15;

      ctx.globalAlpha = opacity;
      this.drawBird(ctx, x, y, size);
    }

    ctx.restore();
  }

  drawBird(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x - size, y + size * 0.3);
    ctx.quadraticCurveTo(x - size * 0.3, y - size * 0.2, x, y);
    ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.2, x + size, y + size * 0.3);
    ctx.stroke();
  }

  refresh() {
    this.init();
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
  }
}
