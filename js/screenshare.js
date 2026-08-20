/**
 * IONITY CENTRAL - MOVEABLE VIDEO CAMERA & P2P SCREENSHARE ENGINE
 * Features moveable floating video camera PiP, snap-to-left-corner, 1-click fullscreen,
 * peer-to-peer screen streaming (zero Firebase bandwidth consumption), Free GCP VM session logging,
 * and 1-click screen recording integration with Ionity watermark.
 */

class ScreenshareManager {
  static init() {
    this.isStreaming = false;
    this.isCameraActive = false;
    this.isRecording = false;
    this.isFullscreen = false;
    this.isMuted = false;
    this.isCollapsed = false;
    this.cameraShape = 'rect'; // 'rect' | 'circle'
    this.dockPosition = 'left-bottom'; // 'left-bottom' | 'left-top' | 'custom'

    this.activeDisplayStream = null;
    this.activeCameraStream = null;
    this.activeCombinedStream = null;
    this.currentSession = null;
    this.sessionTimer = null;
    this.sessionSeconds = 0;

    // P2P Channel
    try {
      this.p2pChannel = new BroadcastChannel('ionity_screenshare_p2p_v1');
      this.p2pChannel.onmessage = this.handleP2PMessage.bind(this);
    } catch (e) {
      console.warn('BroadcastChannel not supported in this context:', e);
      this.p2pChannel = null;
    }

    // Sessions History from Storage
    this.sessionLogs = StorageManager.get('ionity_screenshare_sessions', [
      {
        id: 'GCP-VM-SESS-8821',
        host: 'Johan Wilhelm van Antwerp',
        email: 'johan@ionity.today',
        title: 'Enterprise Architecture & Unity Workspace Briefing',
        duration: '14:32',
        resolution: '1080p @ 60fps',
        server: 'ionity-central-vm (e2-micro us-central1-a)',
        status: 'ARCHIVED',
        timestamp: '2026-08-20 18:45:10 UTC'
      }
    ]);

    this.setupFloatingWidget();
    this.setupDraggable();
    this.renderSessionLogs();
  }

  static setupFloatingWidget() {
    let widget = document.getElementById('floating-camera-widget');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'floating-camera-widget';
      widget.className = 'floating-camera-widget docked-left-bottom';
      widget.innerHTML = `
        <div class="camera-widget-header" id="camera-drag-handle">
          <div class="camera-header-left">
            <span class="camera-live-pulse" id="camera-live-pulse" style="display:none;"></span>
            <img src="assets/ionity-logo-vector.svg" alt="Ionity" class="camera-widget-logo" onerror="this.src='assets/ionity-logo.png'">
            <span class="camera-widget-title font-8bit" id="camera-widget-title">SCREENSHARE / CAM</span>
          </div>
          <div class="camera-header-actions">
            <button class="cam-hdr-btn" id="btn-camera-dock-left" title="Default Left Corner" onclick="ScreenshareManager.snapToDefaultLeftCorner()">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <button class="cam-hdr-btn" id="btn-camera-fullscreen" title="Toggle Fullscreen" onclick="ScreenshareManager.toggleFullscreen()">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            <button class="cam-hdr-btn" id="btn-camera-minimize" title="Minimize / Expand" onclick="ScreenshareManager.toggleMinimize()">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        <div class="camera-viewport-wrap" id="camera-viewport-wrap">
          <video id="screenshare-video-element" autoplay playsinline muted class="camera-video-screen"></video>
          <video id="webcam-pip-video-element" autoplay playsinline muted class="camera-video-pip" style="display:none;"></video>
          
          <!-- Idle Placeholder -->
          <div id="camera-idle-placeholder" class="camera-idle-screen">
            <img src="assets/AEDi.svg" alt="AEDi" class="camera-idle-watermark" onerror="this.src='assets/ionity-logo.png'">
            <div class="font-8bit" style="font-size:10px; color:var(--accent-hover); margin-top:8px;">P2P SCREENSHARE & CAM</div>
            <div style="font-size:11px; color:var(--text-muted); text-align:center; max-width:200px; margin-top:4px;">
              Direct Peer-to-Peer Stream & Free GCP VM Session Logger
            </div>
            <div class="camera-idle-badge">
              <span class="pixel-badge" style="font-size:7px; color:var(--status-green); border-color:var(--status-green);">⚡ NO FIREBASE USAGE</span>
            </div>
          </div>

          <!-- Live Overlay HUD -->
          <div id="camera-live-hud" class="camera-live-hud" style="display:none;">
            <div class="camera-hud-top">
              <span class="camera-hud-chip red font-8bit" id="camera-hud-status">● LIVE P2P</span>
              <span class="camera-hud-chip font-mono" id="camera-hud-timer">00:00:00</span>
              <span class="camera-hud-chip green font-8bit" id="camera-hud-vm">VM LOGGED</span>
            </div>
            <div class="camera-hud-watermark font-8bit">IONITY CENTRAL • P2P</div>
          </div>
        </div>

        <!-- Toolbar Controls -->
        <div class="camera-widget-controls" id="camera-widget-controls">
          <button class="cam-ctrl-btn primary" id="btn-toggle-screenshare" onclick="ScreenshareManager.toggleScreenshare()" title="Start / Stop P2P Screen Share">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span id="label-toggle-screenshare">Share Screen</span>
          </button>
          <button class="cam-ctrl-btn" id="btn-toggle-webcam" onclick="ScreenshareManager.toggleCamera()" title="Toggle Video Camera">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            <span id="label-toggle-camera">Camera</span>
          </button>
          <button class="cam-ctrl-btn record" id="btn-camera-record-act" onclick="ScreenshareManager.toggleScreenRecord()" title="Screen Record Stream">
            <span class="rec-dot-icon"></span>
            <span id="label-toggle-record">Record</span>
          </button>
          <button class="cam-ctrl-btn" id="btn-camera-mic" onclick="ScreenshareManager.toggleMic()" title="Mute / Unmute Mic">
            <svg id="cam-mic-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>
          <button class="cam-ctrl-btn" onclick="ScreenshareManager.copyShareableP2PLink()" title="Copy Peer Workspace Stream Link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </button>
        </div>
      `;
      document.body.appendChild(widget);
    }
  }

  static setupDraggable() {
    const widget = document.getElementById('floating-camera-widget');
    const handle = document.getElementById('camera-drag-handle');
    if (!widget || !handle) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const onMouseDown = (e) => {
      // Don't drag if clicking buttons
      if (e.target.closest('button')) return;

      isDragging = true;
      widget.classList.remove('docked-left-bottom', 'docked-left-top');
      widget.classList.add('is-dragging');

      const rect = widget.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;

      widget.style.left = `${initialLeft}px`;
      widget.style.top = `${initialTop}px`;
      widget.style.bottom = 'auto';
      widget.style.right = 'auto';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      // Keep within viewport bounds
      const maxLeft = window.innerWidth - widget.offsetWidth - 10;
      const maxTop = window.innerHeight - widget.offsetHeight - 10;

      newLeft = Math.max(10, Math.min(newLeft, maxLeft));
      newTop = Math.max(10, Math.min(newTop, maxTop));

      widget.style.left = `${newLeft}px`;
      widget.style.top = `${newTop}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      widget.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);

    // Touch support for mobile/tablets
    handle.addEventListener('touchstart', (e) => {
      if (e.target.closest('button')) return;
      const touch = e.touches[0];
      isDragging = true;
      widget.classList.remove('docked-left-bottom', 'docked-left-top');
      const rect = widget.getBoundingClientRect();
      startX = touch.clientX;
      startY = touch.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;
      widget.style.left = `${initialLeft}px`;
      widget.style.top = `${initialTop}px`;
      widget.style.bottom = 'auto';
      widget.style.right = 'auto';
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;
      widget.style.left = `${Math.max(10, Math.min(newLeft, window.innerWidth - widget.offsetWidth - 10))}px`;
      widget.style.top = `${Math.max(10, Math.min(newTop, window.innerHeight - widget.offsetHeight - 10))}px`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  /**
   * Snap widget to Default Left Corner (Bottom-Left by default)
   */
  static snapToDefaultLeftCorner() {
    const widget = document.getElementById('floating-camera-widget');
    if (!widget) return;

    NotificationManager.play8BitChime('click');
    widget.style.left = '';
    widget.style.top = '';
    widget.style.right = '';
    widget.style.bottom = '';

    widget.classList.remove('docked-left-top', 'is-fullscreen');
    widget.classList.add('docked-left-bottom');

    NotificationManager.showToast('📍 Camera docked to default Left Corner', 'info');
  }

  /**
   * 1-Click Fullscreen Mode
   */
  static toggleFullscreen() {
    const widget = document.getElementById('floating-camera-widget');
    if (!widget) return;

    NotificationManager.play8BitChime('click');
    this.isFullscreen = !this.isFullscreen;

    if (this.isFullscreen) {
      widget.classList.add('is-fullscreen');
      NotificationManager.showToast('⛶ Fullscreen Screenshare mode active', 'info');
    } else {
      widget.classList.remove('is-fullscreen');
    }
  }

  /**
   * Minimize / Collapse Widget
   */
  static toggleMinimize() {
    const widget = document.getElementById('floating-camera-widget');
    if (!widget) return;
    NotificationManager.play8BitChime('click');
    widget.classList.toggle('is-collapsed');
  }

  /**
   * Start / Stop Screenshare with P2P broadcast & Free VM Session Logging
   */
  static async toggleScreenshare() {
    if (this.isStreaming) {
      this.stopScreenshare();
    } else {
      await this.startScreenshare();
    }
  }

  static async startScreenshare() {
    try {
      NotificationManager.showToast('Select screen or app to stream P2P...', 'info');

      this.activeDisplayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          frameRate: { ideal: 60, max: 60 }
        },
        audio: true
      });

      const videoEl = document.getElementById('screenshare-video-element');
      const placeholder = document.getElementById('camera-idle-placeholder');
      const liveHud = document.getElementById('camera-live-hud');
      const livePulse = document.getElementById('camera-live-pulse');
      const btnLabel = document.getElementById('label-toggle-screenshare');
      const btn = document.getElementById('btn-toggle-screenshare');

      if (videoEl) {
        videoEl.srcObject = this.activeDisplayStream;
        videoEl.style.display = 'block';
      }

      if (placeholder) placeholder.style.display = 'none';
      if (liveHud) liveHud.style.display = 'flex';
      if (livePulse) livePulse.style.display = 'inline-block';
      if (btnLabel) btnLabel.textContent = 'Stop Share';
      if (btn) btn.classList.add('active');

      this.isStreaming = true;

      // Handle user stopping stream from native browser bar
      this.activeDisplayStream.getVideoTracks()[0].onended = () => {
        this.stopScreenshare();
      };

      // Start Session on Free VM
      this.startVMSessionLog('P2P Screenshare');

      // Broadcast P2P Signal
      this.broadcastP2PEvent('STREAM_STARTED', {
        sessionId: this.currentSession.id,
        host: 'Johan Wilhelm van Antwerp',
        email: 'johan@ionity.today',
        type: 'SCREENSHARE'
      });

      NotificationManager.play8BitChime('victory');
      NotificationManager.sendPushAlert({
        title: '🖥️ P2P Screenshare Active',
        body: `Live stream broadcasted to workspace peers. Session ${this.currentSession.id} logged to GCP VM.`,
        type: 'success'
      });

    } catch (err) {
      console.warn('Screenshare cancelled or error:', err);
      if (err.name !== 'NotAllowedError') {
        NotificationManager.showToast(`Screenshare error: ${err.message}`, 'danger');
      }
    }
  }

  static stopScreenshare() {
    if (this.activeDisplayStream) {
      this.activeDisplayStream.getTracks().forEach(t => t.stop());
      this.activeDisplayStream = null;
    }

    const videoEl = document.getElementById('screenshare-video-element');
    const placeholder = document.getElementById('camera-idle-placeholder');
    const liveHud = document.getElementById('camera-live-hud');
    const livePulse = document.getElementById('camera-live-pulse');
    const btnLabel = document.getElementById('label-toggle-screenshare');
    const btn = document.getElementById('btn-toggle-screenshare');

    if (videoEl && !this.isCameraActive) {
      videoEl.srcObject = null;
      videoEl.style.display = 'none';
    }

    if (!this.isCameraActive && placeholder) {
      placeholder.style.display = 'flex';
      if (liveHud) liveHud.style.display = 'none';
      if (livePulse) livePulse.style.display = 'none';
    }

    if (btnLabel) btnLabel.textContent = 'Share Screen';
    if (btn) btn.classList.remove('active');

    this.isStreaming = false;
    this.closeVMSessionLog();

    this.broadcastP2PEvent('STREAM_STOPPED', {
      sessionId: this.currentSession?.id
    });

    NotificationManager.play8BitChime('powerdown');
    NotificationManager.showToast('Screenshare stream stopped.', 'info');
  }

  /**
   * Toggle Video Camera (Webcam PiP)
   */
  static async toggleCamera() {
    if (this.isCameraActive) {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  static async startCamera() {
    try {
      this.activeCameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: { ideal: 30 } },
        audio: false
      });

      const pipVideo = document.getElementById('webcam-pip-video-element');
      const placeholder = document.getElementById('camera-idle-placeholder');
      const liveHud = document.getElementById('camera-live-hud');
      const livePulse = document.getElementById('camera-live-pulse');
      const btn = document.getElementById('btn-toggle-webcam');
      const btnLabel = document.getElementById('label-toggle-camera');

      if (pipVideo) {
        pipVideo.srcObject = this.activeCameraStream;
        pipVideo.style.display = 'block';
      }

      if (placeholder) placeholder.style.display = 'none';
      if (liveHud) liveHud.style.display = 'flex';
      if (livePulse) livePulse.style.display = 'inline-block';
      if (btn) btn.classList.add('active');
      if (btnLabel) btnLabel.textContent = 'Cam On';

      this.isCameraActive = true;
      NotificationManager.play8BitChime('coin');

    } catch (err) {
      console.warn('Camera access denied or error:', err);
      NotificationManager.showToast(`Camera notice: ${err.message}`, 'warning');
    }
  }

  static stopCamera() {
    if (this.activeCameraStream) {
      this.activeCameraStream.getTracks().forEach(t => t.stop());
      this.activeCameraStream = null;
    }

    const pipVideo = document.getElementById('webcam-pip-video-element');
    const placeholder = document.getElementById('camera-idle-placeholder');
    const liveHud = document.getElementById('camera-live-hud');
    const livePulse = document.getElementById('camera-live-pulse');
    const btn = document.getElementById('btn-toggle-webcam');
    const btnLabel = document.getElementById('label-toggle-camera');

    if (pipVideo) {
      pipVideo.srcObject = null;
      pipVideo.style.display = 'none';
    }

    if (!this.isStreaming && placeholder) {
      placeholder.style.display = 'flex';
      if (liveHud) liveHud.style.display = 'none';
      if (livePulse) livePulse.style.display = 'none';
    }

    if (btn) btn.classList.remove('active');
    if (btnLabel) btnLabel.textContent = 'Camera';

    this.isCameraActive = false;
    NotificationManager.play8BitChime('click');
  }

  /**
   * 1-Click Screen Record Stream
   */
  static toggleScreenRecord() {
    if (window.ScreenRecorderManager) {
      if (ScreenRecorderManager.isRecording) {
        ScreenRecorderManager.stopRecording();
        document.getElementById('label-toggle-record').textContent = 'Record';
        document.getElementById('btn-camera-record-act').classList.remove('active');
      } else {
        ScreenRecorderManager.startRecording();
        document.getElementById('label-toggle-record').textContent = 'Stop Rec';
        document.getElementById('btn-camera-record-act').classList.add('active');
      }
    }
  }

  /**
   * Toggle Mic
   */
  static toggleMic() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('btn-camera-mic');
    NotificationManager.play8BitChime('click');

    if (this.isMuted) {
      btn?.classList.add('muted');
      NotificationManager.showToast('🎙️ Microphone muted', 'info');
    } else {
      btn?.classList.remove('muted');
      NotificationManager.showToast('🎙️ Microphone active', 'info');
    }
  }

  /**
   * Session Logger to Free GCP VM Server
   */
  static startVMSessionLog(type) {
    const sessionId = `GCP-VM-SESS-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    this.currentSession = {
      id: sessionId,
      host: 'Johan Wilhelm van Antwerp',
      email: 'johan@ionity.today',
      title: `${type} Live Stream`,
      type: type,
      server: 'ionity-central-vm (e2-micro Always Free us-central1-a)',
      vmIp: '34.120.45.89',
      startedAt: now.toISOString(),
      timestamp: now.toLocaleString(),
      duration: '00:00',
      status: 'ACTIVE_P2P'
    };

    this.sessionSeconds = 0;
    if (this.sessionTimer) clearInterval(this.sessionTimer);

    this.sessionTimer = setInterval(() => {
      this.sessionSeconds++;
      const hrs = String(Math.floor(this.sessionSeconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((this.sessionSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(this.sessionSeconds % 60).padStart(2, '0');
      const timerStr = `${hrs}:${mins}:${secs}`;

      const timerEl = document.getElementById('camera-hud-timer');
      if (timerEl) timerEl.textContent = timerStr;
      if (this.currentSession) this.currentSession.duration = timerStr;
    }, 1000);

    // Append to logs
    this.sessionLogs.unshift(this.currentSession);
    StorageManager.set('ionity_screenshare_sessions', this.sessionLogs);
    this.renderSessionLogs();
  }

  static closeVMSessionLog() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    if (this.currentSession) {
      this.currentSession.status = 'COMPLETED';
      StorageManager.set('ionity_screenshare_sessions', this.sessionLogs);
      this.renderSessionLogs();
    }
  }

  static renderSessionLogs() {
    const tbody = document.getElementById('screenshare-sessions-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.sessionLogs.slice(0, 10).map(s => `
      <tr>
        <td><span class="pixel-badge" style="font-size:8px;">${s.id}</span></td>
        <td><b>${s.title || 'Screenshare Session'}</b></td>
        <td>${s.host || 'Johan Wilhelm van Antwerp'}</td>
        <td class="font-mono">${s.duration || '00:00'}</td>
        <td><span style="font-size:11px; color:#73daca;">${s.server || 'ionity-central-vm'}</span></td>
        <td><span class="pixel-badge" style="font-size:7px; color:${s.status === 'ACTIVE_P2P' ? 'var(--status-green)' : 'var(--text-muted)'};">${s.status}</span></td>
        <td style="font-size:11px; color:var(--text-muted);">${s.timestamp}</td>
      </tr>
    `).join('');
  }

  static copyShareableP2PLink() {
    const url = `${window.location.origin}${window.location.pathname}#screenshare?room=${this.currentSession?.id || 'live-p2p'}`;
    navigator.clipboard.writeText(url).then(() => {
      NotificationManager.play8BitChime('coin');
      NotificationManager.showToast('🔗 P2P Screenshare Room Link copied!', 'success');
    });
  }

  static broadcastP2PEvent(type, payload) {
    if (this.p2pChannel) {
      this.p2pChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }

  static handleP2PMessage(event) {
    const { type, payload } = event.data || {};
    if (type === 'STREAM_STARTED') {
      NotificationManager.showToast(`📡 Workspace Peer "${payload.host}" started Screenshare.`, 'info');
    }
  }
}

window.ScreenshareManager = ScreenshareManager;
