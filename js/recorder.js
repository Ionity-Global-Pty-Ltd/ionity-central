/**
 * IONITY CENTRAL - SCREEN RECORDING CAPACITY & COMPOSITOR ENGINE
 * Real-time 60fps/30fps canvas compositor, logo watermark stamping, microphone audio mixing,
 * webcam PIP overlay, floating HUD controls, Notion video block embedding, and gallery.
 */

class ScreenRecorderManager {
  static init() {
    this.isRecording = false;
    this.isPaused = false;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.recordedChunks = [];
    this.mediaRecorder = null;
    this.activeStream = null;
    this.audioContext = null;
    this.compositorCanvas = document.createElement('canvas');
    this.compositorCtx = this.compositorCanvas.getContext('2d');
    this.screenVideoElement = document.createElement('video');
    this.screenVideoElement.autoplay = true;
    this.screenVideoElement.muted = true;
    this.screenVideoElement.playsInline = true;

    this.webcamVideoElement = document.createElement('video');
    this.webcamVideoElement.autoplay = true;
    this.webcamVideoElement.muted = true;
    this.webcamVideoElement.playsInline = true;

    this.webcamStream = null;
    this.micStream = null;
    this.displayStream = null;
    this.animFrameId = null;

    this.activeVideoBlob = null;
    this.activeVideoUrl = null;
    this.activeVideoThumbnail = null;

    this.options = {
      resolution: '1080p', // '720p', '1080p', '4k'
      fps: 60,
      withMic: true,
      withWebcam: false,
      withWatermark: true
    };

    this.savedCaptures = StorageManager.get(STORAGE_KEYS.RECORDINGS || 'ionity_central_recordings_v1', [
      {
        id: 'rec-demo-1',
        title: 'Ionity Central 2.0 Feature Walkthrough',
        duration: '02:45',
        date: '2026-08-20',
        size: '18.4 MB',
        thumbnail: 'assets/AEDi-AntwerpDesigns-Ionityglobal.png',
        url: 'assets/ionity-card-electric.gif',
        author: 'Johan Wilhelm van Antwerp'
      }
    ]);
  }

  static getOptions() {
    return this.options;
  }

  static updateOptions(newOpts) {
    this.options = { ...this.options, ...newOpts };
  }

  static openRecordStudioModal() {
    App.openModal('modal-screen-recorder');
  }

  static async startRecordingFromUI() {
    const res = document.getElementById('rec-opt-resolution')?.value || '1080p';
    const fps = parseInt(document.getElementById('rec-opt-fps')?.value || '60', 10);
    const withMic = document.getElementById('rec-opt-mic')?.checked ?? true;
    const withWebcam = document.getElementById('rec-opt-webcam')?.checked ?? false;
    const withWatermark = document.getElementById('rec-opt-watermark')?.checked ?? true;

    this.options = { resolution: res, fps, withMic, withWebcam, withWatermark };
    App.closeModal('modal-screen-recorder');

    await this.startRecording();
  }

  static async startRecording() {
    if (this.isRecording) return;

    try {
      NotificationManager.showToast('Select screen, window, or browser tab to record...', 'info');

      // 1. Request Display Stream
      const displayConstraints = {
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
          frameRate: { ideal: this.options.fps, max: 60 }
        },
        audio: true // capture system audio if supported
      };

      this.displayStream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);

      // Listen for browser native stop share button
      this.displayStream.getVideoTracks()[0].onended = () => {
        if (this.isRecording) {
          this.stopRecording();
        }
      };

      // 2. Request Microphone Stream if enabled
      if (this.options.withMic) {
        try {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
        } catch (e) {
          console.warn('Microphone access denied or unavailable:', e);
          NotificationManager.showToast('Microphone not available, recording system audio only.', 'warning');
        }
      }

      // 3. Request Webcam Stream if enabled
      if (this.options.withWebcam) {
        try {
          this.webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
          });
          this.webcamVideoElement.srcObject = this.webcamStream;
          await this.webcamVideoElement.play();
        } catch (e) {
          console.warn('Webcam access denied or unavailable:', e);
          NotificationManager.showToast('Webcam PIP unavailable, continuing screen capture.', 'warning');
        }
      }

      // 4. Attach display stream to decoder video element
      this.screenVideoElement.srcObject = this.displayStream;
      await this.screenVideoElement.play();

      // 5. Configure Canvas Compositor Dimensions
      let targetWidth = 1920;
      let targetHeight = 1080;
      if (this.options.resolution === '720p') {
        targetWidth = 1280; targetHeight = 720;
      } else if (this.options.resolution === '4k') {
        targetWidth = 3840; targetHeight = 2160;
      } else {
        // Match actual source aspect ratio if 1080p
        const srcTrack = this.displayStream.getVideoTracks()[0];
        const settings = srcTrack.getSettings ? srcTrack.getSettings() : {};
        if (settings.width && settings.height) {
          targetWidth = settings.width;
          targetHeight = settings.height;
        }
      }

      this.compositorCanvas.width = targetWidth;
      this.compositorCanvas.height = targetHeight;

      // 6. Setup Web Audio API Mixer (Display Audio + Microphone Audio)
      const audioTracks = [];
      const displayAudioTracks = this.displayStream.getAudioTracks();
      const micAudioTracks = this.micStream ? this.micStream.getAudioTracks() : [];

      if (displayAudioTracks.length > 0 || micAudioTracks.length > 0) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContextClass();
          const dest = this.audioContext.createMediaStreamDestination();

          if (displayAudioTracks.length > 0) {
            const displaySource = this.audioContext.createMediaStreamSource(new MediaStream(displayAudioTracks));
            displaySource.connect(dest);
          }

          if (micAudioTracks.length > 0) {
            const micSource = this.audioContext.createMediaStreamSource(new MediaStream(micAudioTracks));
            micSource.connect(dest);
          }

          dest.stream.getAudioTracks().forEach(t => audioTracks.push(t));
        } catch (err) {
          console.warn('Audio mixer fallback:', err);
          if (micAudioTracks.length > 0) audioTracks.push(micAudioTracks[0]);
          else if (displayAudioTracks.length > 0) audioTracks.push(displayAudioTracks[0]);
        }
      }

      // 7. Start Real-Time Canvas Rendering Loop
      this.startCompositorLoop();

      // 8. Capture Stream from Compositor Canvas
      const canvasStream = this.compositorCanvas.captureStream(this.options.fps || 60);
      audioTracks.forEach(track => canvasStream.addTrack(track));
      this.activeStream = canvasStream;

      // 9. Initialize MediaRecorder
      this.recordedChunks = [];
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      this.mediaRecorder = new MediaRecorder(this.activeStream, {
        mimeType,
        videoBitsPerSecond: this.options.resolution === '4k' ? 12000000 : (this.options.resolution === '1080p' ? 6000000 : 3000000)
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      this.mediaRecorder.start(1000); // 1-second timeslices for safety
      this.isRecording = true;
      this.isPaused = false;
      this.elapsedSeconds = 0;

      // 10. Start Timer & HUD
      this.startTimer();
      this.showHUD();

      NotificationManager.play8BitChime('victory');
      NotificationManager.sendPushAlert({
        title: '🔴 Screen Recording Active',
        body: `Recording at ${this.options.resolution} ${this.options.fps}FPS with Logo Watermarking.`,
        type: 'info'
      });

    } catch (err) {
      console.error('Error starting screen recording:', err);
      NotificationManager.showToast('Screen recording was cancelled or not supported in this browser.', 'warning');
      this.cleanupStreams();
    }
  }

  static startCompositorLoop() {
    const ctx = this.compositorCtx;
    const canvas = this.compositorCanvas;
    const screen = this.screenVideoElement;
    const webcam = this.webcamVideoElement;

    const render = () => {
      if (!this.isRecording) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Primary Display Video Frame
      if (screen.readyState >= 2) {
        ctx.drawImage(screen, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Draw Webcam PIP Bubble if active
      if (this.options.withWebcam && webcam.srcObject && webcam.readyState >= 2) {
        const pipW = Math.round(w * 0.18);
        const pipH = Math.round(pipW * 0.75);
        const pipX = 24;
        const pipY = h - pipH - 24;

        ctx.save();
        ctx.shadowColor = 'rgba(51, 102, 255, 0.6)';
        ctx.shadowBlur = 12;

        // Draw neon border box
        ctx.strokeStyle = '#3366FF';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipX, pipY, pipW, pipH);

        ctx.drawImage(webcam, pipX, pipY, pipW, pipH);

        // Webcam Author Stamp
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';
        ctx.fillRect(pipX, pipY + pipH - 16, pipW, 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('LIVE CAM • ' + (ProfilesManager.getActiveProfile().name.split(' ')[0]), pipX + 6, pipY + pipH - 4);

        ctx.restore();
      }

      // 3. Draw Logo Watermark in Real-Time
      if (this.options.withWatermark && window.WatermarkManager) {
        WatermarkManager.stampOnCanvas(ctx, w, h);
      }

      // 4. Draw Real-Time 8-Bit Recording Timestamp Header Pill
      ctx.save();
      const timeStr = this.formatDuration(this.elapsedSeconds);
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
      ctx.fillRect(16, 16, 120, 24);

      // Blinking red dot
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = '#FF3D71';
        ctx.beginPath();
        ctx.arc(28, 28, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`REC ${timeStr}`, 38, 32);
      ctx.restore();

      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  static pauseRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;

    if (!this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      clearInterval(this.timerInterval);
      this.updateHUDState();
      NotificationManager.play8BitChime('click');
      NotificationManager.showToast('Recording paused.', 'info');
    } else {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.startTimer();
      this.updateHUDState();
      NotificationManager.play8BitChime('click');
      NotificationManager.showToast('Recording resumed.', 'info');
    }
  }

  static stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.isPaused = false;
    clearInterval(this.timerInterval);

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.hideHUD();
    this.cleanupStreams();

    NotificationManager.play8BitChime('powerup');
  }

  static cleanupStreams() {
    if (this.displayStream) {
      this.displayStream.getTracks().forEach(t => t.stop());
      this.displayStream = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(t => t.stop());
      this.webcamStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  static handleRecordingComplete() {
    const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
    this.activeVideoBlob = blob;
    this.activeVideoUrl = URL.createObjectURL(blob);

    // Generate snapshot thumbnail from canvas
    try {
      this.activeVideoThumbnail = this.compositorCanvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {
      this.activeVideoThumbnail = 'assets/AEDi-AntwerpDesigns-Ionityglobal.png';
    }

    const durationStr = this.formatDuration(this.elapsedSeconds);
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(1) + ' MB';
    const activeAuthor = ProfilesManager.getActiveProfile().name;

    const newCapture = {
      id: 'rec-' + Date.now(),
      title: `Ionity Capture ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      duration: durationStr,
      date: new Date().toISOString().slice(0, 10),
      size: sizeMb,
      thumbnail: this.activeVideoThumbnail,
      url: this.activeVideoUrl,
      author: activeAuthor
    };

    this.savedCaptures.unshift(newCapture);
    StorageManager.set(STORAGE_KEYS.RECORDINGS || 'ionity_central_recordings_v1', this.savedCaptures);

    this.openRecordingPreviewModal(newCapture);
  }

  static openRecordingPreviewModal(capture) {
    App.openModal('modal-recording-preview');

    const videoEl = document.getElementById('rec-preview-video-player');
    const titleEl = document.getElementById('rec-preview-title');
    const metaEl = document.getElementById('rec-preview-meta');

    if (videoEl) {
      videoEl.src = capture.url || this.activeVideoUrl;
      videoEl.load();
    }
    if (titleEl) {
      titleEl.textContent = capture.title;
    }
    if (metaEl) {
      metaEl.innerHTML = `
        <span>⏱️ Duration: <b>${capture.duration}</b></span>
        <span>📦 Size: <b>${capture.size}</b></span>
        <span>👤 Author: <b>${capture.author}</b></span>
        <span class="pixel-badge" style="font-size:8px;">LOGO WATERMARKED</span>
      `;
    }

    this._currentPreviewCapture = capture;
  }

  static downloadActiveRecording(format = 'webm') {
    if (!this.activeVideoUrl && !this._currentPreviewCapture?.url) return;

    const url = this.activeVideoUrl || this._currentPreviewCapture?.url;
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ionity_Recording_${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Recording downloaded successfully!', 'success');
  }

  static embedRecordingInActiveDoc() {
    const capture = this._currentPreviewCapture;
    if (!capture) return;

    const activeDoc = WorkspaceManager.getActiveDoc();
    if (!activeDoc) {
      NotificationManager.showToast('No active document to embed recording.', 'warning');
      return;
    }

    const videoBlock = {
      id: 'b_rec_' + Date.now(),
      type: 'video',
      url: capture.url || this.activeVideoUrl,
      title: capture.title,
      duration: capture.duration,
      author: capture.author,
      thumbnail: capture.thumbnail,
      timestamp: new Date().toISOString()
    };

    activeDoc.blocks.push(videoBlock);
    StorageManager.set(STORAGE_KEYS.DOCS, WorkspaceManager.docs);
    WorkspaceManager.loadDoc(activeDoc.id);

    App.closeModal('modal-recording-preview');
    App.switchView('workspace');

    NotificationManager.play8BitChime('victory');
    NotificationManager.sendPushAlert({
      title: '🎥 Video Embedded in Document',
      body: `"${capture.title}" embedded into "${activeDoc.title}".`,
      type: 'success'
    });
  }

  /* Floating HUD Controls */
  static showHUD() {
    const hud = document.getElementById('screen-recorder-hud');
    if (hud) {
      hud.style.display = 'flex';
      this.updateHUDState();
    }
  }

  static hideHUD() {
    const hud = document.getElementById('screen-recorder-hud');
    if (hud) hud.style.display = 'none';
  }

  static updateHUDState() {
    const timeEl = document.getElementById('rec-hud-timer');
    const pauseBtn = document.getElementById('rec-hud-pause-btn');

    if (timeEl) timeEl.textContent = this.formatDuration(this.elapsedSeconds);
    if (pauseBtn) {
      pauseBtn.innerHTML = this.isPaused ? `${renderIcon('recordPlay', '', 14)} Resume` : `${renderIcon('recordPause', '', 14)} Pause`;
    }
  }

  static startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateHUDState();
    }, 1000);
  }

  static formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  static renderRecorderView() {
    const container = document.getElementById('recorder-studio-container');
    if (!container) return;

    container.innerHTML = `
      <div class="recorder-studio-layout">
        <!-- Hero Studio Banner -->
        <div class="stat-card" style="background: linear-gradient(135deg, #182030, #141720); border-color: rgba(51, 102, 255, 0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
              <span class="pixel-badge">SCREEN CAPTURE STUDIO & ENGINE</span>
              <h2 style="font-size:22px; font-weight:800; margin-top:6px;">High-FPS Screen Recording & Live Watermarking</h2>
              <p style="color:var(--text-muted); font-size:13px; max-width:640px; margin-top:4px;">
                Record displays, browser windows, or applications at 60 FPS. Automatically composites your official Ionity or custom uploaded logo watermark, microphone audio, and webcam PIP into the stream.
              </p>
            </div>
            <button class="btn btn-primary" style="padding:10px 20px; font-size:14px; display:flex; align-items:center; gap:8px;" onclick="ScreenRecorderManager.openRecordStudioModal()">
              ${renderIcon('screenRecord', '', 18)}
              <span>Launch Recorder Studio</span>
            </button>
          </div>
        </div>

        <!-- Quick Capture Configuration Card -->
        <div class="recorder-config-cards-grid">
          <div class="rec-cfg-card">
            <div class="rec-cfg-icon">${renderIcon('resolution', '', 24)}</div>
            <div style="font-weight:700; font-size:14px;">Resolution & Framerate</div>
            <div style="font-size:12px; color:var(--text-muted);">1080p Full HD @ 60 FPS with hardware WebCodecs VP9 acceleration.</div>
          </div>
          <div class="rec-cfg-card">
            <div class="rec-cfg-icon" style="color:var(--accent-hover);">${renderIcon('watermark', '', 24)}</div>
            <div style="font-weight:700; font-size:14px;">Live Logo Watermark</div>
            <div style="font-size:12px; color:var(--text-muted);">Real-time canvas alpha blending with active Antwerp Designs stamp.</div>
          </div>
          <div class="rec-cfg-card">
            <div class="rec-cfg-icon" style="color:var(--status-green);">${renderIcon('mic', '', 24)}</div>
            <div style="font-weight:700; font-size:14px;">Multi-Source Audio Mixer</div>
            <div style="font-size:12px; color:var(--text-muted);">Studio noise suppression combining system audio & condenser mic.</div>
          </div>
          <div class="rec-cfg-card">
            <div class="rec-cfg-icon" style="color:var(--status-yellow);">${renderIcon('cameraPip', '', 24)}</div>
            <div style="font-weight:700; font-size:14px;">Webcam PIP Overlay</div>
            <div style="font-size:12px; color:var(--text-muted);">Picture-in-picture presenter face bubble with Ionity neon border.</div>
          </div>
        </div>

        <!-- Saved Captures Gallery -->
        <div style="margin-top: 24px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div>
              <span class="pixel-badge">CAPTURES ARCHIVE</span>
              <h3 style="font-size:16px; font-weight:800; margin-top:4px;">Workspace Screen Captures (${this.savedCaptures.length})</h3>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" onclick="ScreenRecorderManager.openRecordStudioModal()">+ New Recording</button>
            </div>
          </div>

          <div class="captures-gallery-grid" id="captures-gallery-list">
            ${this.savedCaptures.map((cap, idx) => `
              <div class="capture-card-item">
                <div class="capture-thumbnail-wrapper" onclick="ScreenRecorderManager.openRecordingPreviewModal(ScreenRecorderManager.savedCaptures[${idx}])">
                  <img src="${cap.thumbnail}" alt="${cap.title}" onerror="this.src='assets/AEDi-AntwerpDesigns-Ionityglobal.png'">
                  <div class="capture-play-overlay">
                    <span class="capture-play-btn">${renderIcon('recordPlay', '', 20)}</span>
                  </div>
                  <span class="capture-duration-badge">${cap.duration}</span>
                  <span class="capture-watermark-pill">WATERMARKED</span>
                </div>
                <div class="capture-info">
                  <div class="capture-title">${cap.title}</div>
                  <div class="capture-meta-row">
                    <span>${cap.date} • ${cap.size}</span>
                    <span style="color:var(--accent-hover);">${cap.author}</span>
                  </div>
                  <div class="capture-actions-row">
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px; flex:1;" onclick="ScreenRecorderManager.openRecordingPreviewModal(ScreenRecorderManager.savedCaptures[${idx}])">
                      ${renderIcon('eye', '', 12)} Preview
                    </button>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px; flex:1;" onclick="ScreenRecorderManager.embedCaptureDirectly(${idx})">
                      ${renderIcon('workspace', '', 12)} Embed in Doc
                    </button>
                    <button class="btn-icon" style="padding:4px; color:var(--status-red);" title="Delete Capture" onclick="ScreenRecorderManager.deleteCapture(${idx})">
                      ${renderIcon('trash', '', 12)}
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- P2P Screenshare & Free GCP VM Session Logger Section -->
        <div style="margin-top: 32px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="pixel-badge" style="color:var(--status-green); border-color:var(--status-green);">P2P SCREENSHARE & EDGE VM LOGS</span>
                <span style="font-size:11px; color:var(--text-muted);">Zero Firebase Bandwidth • Direct WebRTC Mesh</span>
              </div>
              <h3 style="font-size:16px; font-weight:800; margin-top:4px;">Workspace Peer Streaming & Server Session Archive</h3>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" onclick="ScreenshareManager.snapToDefaultLeftCorner(); ScreenshareManager.toggleCamera();">
                📹 Moveable Camera (Left Corner)
              </button>
              <button class="btn btn-primary" onclick="ScreenshareManager.startScreenshare()">
                🖥️ Launch P2P Screenshare
              </button>
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table class="crm-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Session Title</th>
                  <th>Host Member</th>
                  <th>Duration</th>
                  <th>GCP VM Edge Server</th>
                  <th>Status</th>
                  <th>Logged At (UTC)</th>
                </tr>
              </thead>
              <tbody id="screenshare-sessions-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (window.ScreenshareManager) {
      ScreenshareManager.renderSessionLogs();
    }
  }

  static embedCaptureDirectly(index) {
    const cap = this.savedCaptures[index];
    if (!cap) return;
    this._currentPreviewCapture = cap;
    this.embedRecordingInActiveDoc();
  }

  static deleteCapture(index) {
    this.savedCaptures.splice(index, 1);
    StorageManager.set(STORAGE_KEYS.RECORDINGS || 'ionity_central_recordings_v1', this.savedCaptures);
    this.renderRecorderView();
    NotificationManager.play8BitChime('click');
    NotificationManager.showToast('Recording removed from archive.', 'info');
  }
}
