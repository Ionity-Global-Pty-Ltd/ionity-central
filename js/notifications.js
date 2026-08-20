/**
 * IONITY CENTRAL - NOTIFICATIONS & CROSS-DEVICE ALERTS
 * Integrates Web Notifications API, Web Audio API 8-bit chimes, and In-App notification drawer.
 */

class NotificationManager {
  static init() {
    this.notifications = StorageManager.get(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'n1',
        title: 'Google OAuth 2.0 Ready',
        text: 'Configure your Google Client ID to enable seamless team sign-in.',
        time: 'Just now',
        unread: true,
        type: 'auth'
      },
      {
        id: 'n2',
        title: 'New Deal: FinTech Secure Ltd',
        text: 'Stage changed to "Contacted" with value $32,000.',
        time: '1 hour ago',
        unread: true,
        type: 'crm'
      },
      {
        id: 'n3',
        title: 'Sprint 42 Target Met',
        text: 'Johan W. closed Story Points task "Implement Google OAuth 2.0".',
        time: '3 hours ago',
        unread: false,
        type: 'scrum'
      }
    ]);
    this.audioCtx = null;
    this.updateBellBadge();
    this.renderInAppDrawer();
  }

  static getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    return this.audioCtx;
  }

  // Rich 8-bit Web Audio API Synthesizer Engine
  static play8BitChime(type = 'success') {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    if (config.soundEnabled === false) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // 8-bit retro chip characteristic sound

      switch (type) {
        case 'coin':
          // Crisp 2-tone coin chime (B5 -> E6)
          osc.frequency.setValueAtTime(987.77, now);
          osc.frequency.setValueAtTime(1318.51, now + 0.08);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
          break;

        case 'powerup':
          // Frequency-modulated ascending laser sweep
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.3);
          break;

        case 'laser':
          // Downward blaster zap
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
          break;

        case 'jump':
          // Classic retro jump boing
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
          break;

        case 'click':
          // Subtle mechanical pixel click
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.04);
          break;

        case 'victory':
        case 'levelup':
          // 5-note triumphant fanfare (C5, E5, G5, B5, C6)
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.18); // G5
          osc.frequency.setValueAtTime(987.77, now + 0.27); // B5
          osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.65);
          break;

        case 'gameover':
          // Descending sad minor arpeggio
          osc.frequency.setValueAtTime(783.99, now); // G5
          osc.frequency.setValueAtTime(622.25, now + 0.12); // Eb5
          osc.frequency.setValueAtTime(523.25, now + 0.24); // C5
          osc.frequency.setValueAtTime(392.00, now + 0.36); // G4
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
          break;

        case 'alert':
          // Warning dual tone
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(440, now + 0.1);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
          break;

        case 'success':
        default:
          // 4-note ascending major chime (C5 -> E5 -> G5 -> C6)
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.08);
          osc.frequency.setValueAtTime(783.99, now + 0.16);
          osc.frequency.setValueAtTime(1046.50, now + 0.24);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          break;
      }
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }

  static toggleSound() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    config.soundEnabled = !config.soundEnabled;
    StorageManager.set(STORAGE_KEYS.CONFIG, config);

    if (config.soundEnabled) {
      this.play8BitChime('coin');
      this.showToast('🔊 8-Bit Retro Audio FX Enabled', 'success');
    } else {
      this.showToast('🔇 Audio FX Muted', 'info');
    }

    const soundBtn = document.getElementById('header-sound-toggle-btn');
    if (soundBtn) {
      soundBtn.innerHTML = config.soundEnabled ? '🔊' : '🔇';
      soundBtn.title = config.soundEnabled ? 'Sound FX Enabled (Click to mute)' : 'Sound FX Muted (Click to enable)';
    }
  }

  static async requestPermission() {
    if (!('Notification' in window)) {
      this.showToast('Web Notifications not supported in this browser.', 'info');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.showToast('Notifications are active across your devices!', 'success');
      return true;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      this.showToast('Notifications enabled! You will receive real-time Ionity alerts.', 'success');
      this.sendPushAlert({
        title: '⚡ Ionity Central Activated',
        body: 'Cross-platform push notifications are now synchronized.',
        type: 'success'
      });
      return true;
    } else {
      this.showToast('Notification permission was denied.', 'error');
      return false;
    }
  }

  static sendPushAlert({ title, body, type = 'info', icon = './icons/icon-192.png' }) {
    // 1. In-App Notification Log
    const newNotif = {
      id: 'n_' + Date.now(),
      title,
      text: body,
      time: 'Just now',
      unread: true,
      type
    };

    this.notifications.unshift(newNotif);
    if (this.notifications.length > 50) this.notifications.pop();
    StorageManager.set(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.updateBellBadge();
    this.renderInAppDrawer();

    // 2. Play 8-bit Sound
    this.play8BitChime(type === 'alert' ? 'alert' : 'success');

    // 3. Native OS / Browser Push Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'PUSH_NOTIFICATION',
            title,
            body,
            icon
          });
        } else {
          new Notification(title, {
            body,
            icon,
            badge: icon,
            tag: 'ionity-alert'
          });
        }
      } catch (err) {
        console.warn('Native notification fallback:', err);
      }
    }

    // 4. In-App Toast
    this.showToast(`${title}: ${body}`, type);
  }

  static showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="font-8bit" style="font-size: 11px;">${type === 'success' ? '⚡' : type === 'error' ? '✖' : 'ℹ'}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  static updateBellBadge() {
    const unreadCount = this.notifications.filter(n => n.unread).length;
    const badge = document.querySelector('.notification-badge-dot');
    if (badge) {
      if (unreadCount > 0) {
        badge.classList.add('active');
      } else {
        badge.classList.remove('active');
      }
    }
  }

  static markAllAsRead() {
    this.notifications.forEach(n => n.unread = false);
    StorageManager.set(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.updateBellBadge();
    this.renderInAppDrawer();
  }

  static renderInAppDrawer() {
    const list = document.getElementById('notif-list-container');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">No notifications yet.</div>`;
      return;
    }

    list.innerHTML = this.notifications.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="NotificationManager.markRead('${n.id}')">
        <div class="notif-icon">
          ${n.type === 'auth' ? '🔑' : n.type === 'crm' ? '💼' : n.type === 'scrum' ? '⚡' : '🔔'}
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  static markRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.unread = false;
      StorageManager.set(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.updateBellBadge();
      this.renderInAppDrawer();
    }
  }
}
