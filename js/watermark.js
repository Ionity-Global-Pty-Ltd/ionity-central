/**
 * IONITY CENTRAL - LOGO WATERMARK STUDIO & REAL-TIME STAMPER
 * Handles custom logo uploads, Ionity brand assets, 9-point grid alignment, opacity/scale,
 * and real-time 2D canvas watermarking for screen recordings and exported assets.
 */

class WatermarkManager {
  static init() {
    this.DEFAULT_CONFIG = {
      enabled: true,
      activeLogo: 'assets/ionity-logo-vector.svg',
      customLogoData: null,
      position: 'bottom-right',
      opacity: 0.85,
      scale: 140, // width in px
      textStamp: 'IONITY CENTRAL • Antwerp Designs',
      showText: true,
      blendMode: 'normal',
      margin: 24
    };

    this.config = StorageManager.get(STORAGE_KEYS.WATERMARK || 'ionity_central_watermark_v1', this.DEFAULT_CONFIG);
    this._loadedImageCache = {};

    this.preloadImages();
  }

  static preloadImages() {
    const assets = [
      'assets/ionity-logo-vector.svg',
      'assets/ionity-logo.png',
      'assets/AEDi-AntwerpDesigns-Ionityglobal.png',
      'assets/aedi.svg',
      'assets/Johanwilhelmvanantwerpesignatureionity.png'
    ];

    assets.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => { this._loadedImageCache[src] = img; };
    });

    if (this.config.customLogoData) {
      const img = new Image();
      img.src = this.config.customLogoData;
      img.onload = () => { this._loadedImageCache['custom'] = img; };
    }
  }

  static getConfig() {
    return this.config;
  }

  static saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    StorageManager.set(STORAGE_KEYS.WATERMARK || 'ionity_central_watermark_v1', this.config);
    this.renderStudioView();
    this.updateLivePreview();
  }

  static setLogoPreset(presetSrc) {
    this.saveConfig({ activeLogo: presetSrc });
    NotificationManager.play8BitChime('click');
    NotificationManager.showToast('Watermark logo preset selected.', 'info');
  }

  static handleLogoUpload(file) {
    if (!file) return;

    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml|gif|webp)/)) {
      NotificationManager.showToast('Please upload a valid image (PNG, SVG, JPG, WebP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      const img = new Image();
      img.onload = () => {
        this._loadedImageCache['custom'] = img;
        this.saveConfig({
          activeLogo: 'custom',
          customLogoData: base64
        });
        NotificationManager.play8BitChime('victory');
        NotificationManager.sendPushAlert({
          title: '✨ Custom Logo Watermark Uploaded',
          body: `Uploaded: ${file.name} (${img.naturalWidth}x${img.naturalHeight}px)`,
          type: 'success'
        });
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  }

  static getActiveImage() {
    if (this.config.activeLogo === 'custom' && this.config.customLogoData) {
      if (!this._loadedImageCache['custom']) {
        const img = new Image();
        img.src = this.config.customLogoData;
        this._loadedImageCache['custom'] = img;
      }
      return this._loadedImageCache['custom'];
    }

    const src = this.config.activeLogo || 'assets/ionity-logo-vector.svg';
    if (!this._loadedImageCache[src]) {
      const img = new Image();
      img.src = src;
      this._loadedImageCache[src] = img;
    }
    return this._loadedImageCache[src];
  }

  /**
   * Stamp watermark onto any HTML5 2D Canvas context in real time.
   */
  static stampOnCanvas(ctx, width, height) {
    if (!this.config.enabled) return;

    const img = this.getActiveImage();
    const targetScale = Math.min(this.config.scale, width * 0.4);
    const aspect = (img && img.naturalWidth && img.naturalHeight) ? (img.naturalHeight / img.naturalWidth) : 0.35;
    const logoW = targetScale;
    const logoH = targetScale * aspect;
    const margin = this.config.margin || 24;

    let x = margin;
    let y = margin;

    switch (this.config.position) {
      case 'top-left':
        x = margin;
        y = margin;
        break;
      case 'top-center':
        x = (width - logoW) / 2;
        y = margin;
        break;
      case 'top-right':
        x = width - logoW - margin;
        y = margin;
        break;
      case 'center-left':
        x = margin;
        y = (height - logoH) / 2;
        break;
      case 'center':
        x = (width - logoW) / 2;
        y = (height - logoH) / 2;
        break;
      case 'center-right':
        x = width - logoW - margin;
        y = (height - logoH) / 2;
        break;
      case 'bottom-left':
        x = margin;
        y = height - logoH - margin - (this.config.showText ? 24 : 0);
        break;
      case 'bottom-center':
        x = (width - logoW) / 2;
        y = height - logoH - margin - (this.config.showText ? 24 : 0);
        break;
      case 'bottom-right':
      default:
        x = width - logoW - margin;
        y = height - logoH - margin - (this.config.showText ? 24 : 0);
        break;
    }

    ctx.save();
    ctx.globalAlpha = parseFloat(this.config.opacity) || 0.85;
    ctx.globalCompositeOperation = this.config.blendMode || 'normal';

    // Draw backing subtle glow for dark canvas visibility
    ctx.shadowColor = 'rgba(51, 102, 255, 0.45)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, logoW, logoH);
    } else {
      // Fallback geometric Ionity vector badge if image is still loading
      ctx.fillStyle = '#3366FF';
      ctx.beginPath();
      ctx.moveTo(x + 13, y + 2);
      ctx.lineTo(x + 3, y + 14);
      ctx.lineTo(x + 12, y + 14);
      ctx.lineTo(x + 11, y + 22);
      ctx.lineTo(x + 21, y + 10);
      ctx.lineTo(x + 12, y + 10);
      ctx.closePath();
      ctx.fill();
    }

    // Text Sub-Badge / Stamp
    if (this.config.showText && this.config.textStamp) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = (this.config.position.includes('center')) ? 'center' : (this.config.position.includes('right') ? 'right' : 'left');

      const textX = (this.config.position.includes('center')) ? (x + logoW / 2) : (this.config.position.includes('right') ? (x + logoW) : x);
      const textY = y + logoH + 14;

      // Draw subtle dark pill behind text for ultra-clear legibility
      const textMetrics = ctx.measureText(this.config.textStamp);
      const pillW = textMetrics.width + 12;
      const pillX = (this.config.position.includes('center')) ? (textX - pillW / 2) : (this.config.position.includes('right') ? (textX - pillW) : textX);
      
      ctx.fillStyle = 'rgba(26, 26, 26, 0.75)';
      ctx.fillRect(pillX, textY - 11, pillW, 15);
      
      ctx.fillStyle = '#3366FF';
      ctx.fillRect(pillX, textY - 11, 2, 15); // blue accent tag

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(this.config.textStamp, pillX + 6, textY);
    }

    ctx.restore();
  }

  static renderStudioView() {
    const container = document.getElementById('watermark-studio-viewport');
    if (!container) return;

    const brandPresets = [
      { id: 'assets/ionity-logo-vector.svg', name: 'Ionity Vector (SVG)', type: 'Vector' },
      { id: 'assets/AEDi-AntwerpDesigns-Ionityglobal.png', name: 'AEDi Antwerp Stamp', type: 'Emblem' },
      { id: 'assets/ionity-logo.png', name: 'Ionity Core Mark', type: 'Raster' },
      { id: 'assets/aedi.svg', name: 'AEDi Monogram (SVG)', type: 'Monogram' },
      { id: 'assets/Johanwilhelmvanantwerpesignatureionity.png', name: 'Executive Signature', type: 'Signature' }
    ];

    const isCustomActive = this.config.activeLogo === 'custom';

    container.innerHTML = `
      <div class="watermark-studio-grid">
        <!-- Left: Configuration Controls -->
        <div class="watermark-controls-panel">
          <div class="stat-card" style="margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="pixel-badge">LOGO WATERMARK ENGINE</span>
                <h3 style="font-size:18px; font-weight:800; margin-top:6px;">Brand Watermark Studio</h3>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${this.config.enabled ? 'checked' : ''} onchange="WatermarkManager.saveConfig({ enabled: this.checked })">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <p style="font-size:12px; color:var(--text-muted); margin-top:6px;">
              Upload custom brand marks or select Ionity presets. Watermarks automatically composite into real-time screen recordings and document exports.
            </p>
          </div>

          <!-- Upload Dropzone -->
          <div class="watermark-upload-dropzone" id="watermark-dropzone" onclick="document.getElementById('watermark-file-input').click()">
            <input type="file" id="watermark-file-input" accept="image/*" style="display:none;" onchange="WatermarkManager.handleLogoUpload(this.files[0])">
            <div style="font-size:28px; margin-bottom:6px;">${renderIcon('upload', '', 28)}</div>
            <div style="font-weight:700; font-size:13px;">Upload Custom Brand Logo</div>
            <div style="font-size:11px; color:var(--text-muted);">Drop PNG, SVG, JPG, or WebP here • Stored in Ionity Cloud LocalState</div>
            ${isCustomActive ? `<div class="pixel-badge" style="margin-top:8px; color:var(--status-green); border-color:var(--status-green);">Active: Custom Uploaded Mark</div>` : ''}
          </div>

          <!-- Official Brand Presets -->
          <div style="margin-top: 16px;">
            <label class="form-label" style="margin-bottom:8px;">Ionity Brand Asset Presets:</label>
            <div class="watermark-preset-grid">
              ${brandPresets.map(preset => `
                <div class="watermark-preset-card ${this.config.activeLogo === preset.id ? 'active' : ''}" onclick="WatermarkManager.setLogoPreset('${preset.id}')">
                  <div class="preset-preview-box">
                    <img src="${preset.id}" alt="${preset.name}" onerror="this.src='assets/ionity-logo.png'">
                  </div>
                  <div class="preset-info">
                    <div style="font-weight:700; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${preset.name}</div>
                    <span class="pixel-badge" style="font-size:8px; padding:2px 4px;">${preset.type}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 9-Point Alignment Grid -->
          <div style="margin-top: 16px;">
            <label class="form-label" style="margin-bottom:8px;">Watermark Screen Position (9-Point Grid):</label>
            <div class="watermark-position-grid">
              ${['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => `
                <button class="btn-pos-grid ${this.config.position === pos ? 'active' : ''}" onclick="WatermarkManager.saveConfig({ position: '${pos}' })" title="${pos}">
                  <span class="pos-dot"></span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Sliders: Opacity, Scale, Margins -->
          <div style="display:flex; flex-direction:column; gap:12px; margin-top:16px;">
            <div class="form-group">
              <div style="display:flex; justify-content:space-between;">
                <label class="form-label">Watermark Opacity</label>
                <span style="font-size:12px; font-family:var(--font-mono); color:var(--accent-hover);">${Math.round(this.config.opacity * 100)}%</span>
              </div>
              <input type="range" class="form-range" min="0.1" max="1.0" step="0.05" value="${this.config.opacity}" oninput="WatermarkManager.saveConfig({ opacity: parseFloat(this.value) })">
            </div>

            <div class="form-group">
              <div style="display:flex; justify-content:space-between;">
                <label class="form-label">Logo Scale Width</label>
                <span style="font-size:12px; font-family:var(--font-mono); color:var(--accent-hover);">${this.config.scale}px</span>
              </div>
              <input type="range" class="form-range" min="40" max="280" step="5" value="${this.config.scale}" oninput="WatermarkManager.saveConfig({ scale: parseInt(this.value) })">
            </div>

            <div class="form-group">
              <label class="form-label">Watermark Text Stamp</label>
              <input type="text" class="form-input" value="${this.config.textStamp || ''}" placeholder="e.g., IONITY CENTRAL • Antwerp Designs" oninput="WatermarkManager.saveConfig({ textStamp: this.value })">
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
              <span style="font-size:12px; color:var(--text-muted);">Include Text Banner Tag</span>
              <label class="toggle-switch">
                <input type="checkbox" ${this.config.showText ? 'checked' : ''} onchange="WatermarkManager.saveConfig({ showText: this.checked })">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Right: Live Canvas Preview -->
        <div class="watermark-preview-panel">
          <div class="preview-header">
            <div style="font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('eye', '', 16)}
              <span>Live Compositor Preview (1920x1080 Real-time Ratio)</span>
            </div>
            <div class="preview-backdrop-toggles">
              <button class="btn btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="WatermarkManager.setPreviewBackdrop('cyber')">Cyber Dark</button>
              <button class="btn btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="WatermarkManager.setPreviewBackdrop('code')">Code Editor</button>
              <button class="btn btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="WatermarkManager.setPreviewBackdrop('grid')">Neon Grid</button>
            </div>
          </div>

          <div class="preview-canvas-wrapper">
            <canvas id="watermark-live-preview-canvas" width="800" height="450"></canvas>
          </div>

          <div class="preview-footer-tips">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="sync-dot online"></span>
              <span style="font-size:11px; color:var(--text-muted);">Composited in 60 FPS recording pipeline • Screen Recorder, Doc Exports & Video Blocks.</span>
            </div>
            <button class="btn btn-primary" onclick="ScreenRecorderManager.openRecordStudioModal()">
              ${renderIcon('screenRecord', '', 14)} Start Recording With Logo
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindDropzone();
    this.updateLivePreview();
  }

  static bindDropzone() {
    const dropzone = document.getElementById('watermark-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        this.handleLogoUpload(files[0]);
      }
    });
  }

  static _previewBackdropMode = 'cyber';

  static setPreviewBackdrop(mode) {
    this._previewBackdropMode = mode;
    this.updateLivePreview();
  }

  static updateLivePreview() {
    const canvas = document.getElementById('watermark-live-preview-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Draw Mock Background
    ctx.clearRect(0, 0, w, h);

    if (this._previewBackdropMode === 'code') {
      ctx.fillStyle = '#141414';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#1E1E1E';
      ctx.fillRect(0, 0, w, 28);
      ctx.fillStyle = '#FF5F56'; ctx.beginPath(); ctx.arc(16, 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFBD2E'; ctx.beginPath(); ctx.arc(28, 14, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#27C93F'; ctx.beginPath(); ctx.arc(40, 14, 4, 0, Math.PI * 2); ctx.fill();

      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#73DACA';
      ctx.fillText('// Ionity Central - Live Screen Recorder Active', 20, 60);
      ctx.fillStyle = '#7AA2F7';
      ctx.fillText('const recorder = new ScreenRecorderManager({ watermark: true });', 20, 85);
      ctx.fillStyle = '#BB9AF7';
      ctx.fillText('await recorder.startCapture({ resolution: "1080p", fps: 60 });', 20, 110);
      ctx.fillStyle = '#9ECE6A';
      ctx.fillText('// Brand: Antwerp Designs | Johan Wilhelm van Antwerp', 20, 135);
    } else if (this._previewBackdropMode === 'grid') {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(51, 102, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    } else {
      // Cyber Dark (Default)
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1A1A1A');
      grad.addColorStop(0.5, '#222222');
      grad.addColorStop(1, '#151515');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Subtle Ionity geometric pattern
      ctx.strokeStyle = 'rgba(51, 102, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 120, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stamp Watermark onto preview canvas
    this.stampOnCanvas(ctx, w, h);
  }
}
