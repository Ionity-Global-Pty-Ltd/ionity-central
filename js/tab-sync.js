/**
 * IONITY CENTRAL - TAB & KEYPOINT REAL-TIME SYNC MANAGER
 * Synchronizes open browser tabs, active view keypoints, document blocks,
 * and workspace states across tabs without network overhead using BroadcastChannel.
 * Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
 */

class TabSyncManager {
  static channel = null;
  static tabId = `tab_${Math.random().toString(36).slice(2, 8)}`;
  static openTabsCount = 1;
  static lastKeypoint = null;

  static init() {
    console.log(`🔄 Initializing TabSyncManager [${this.tabId}]...`);
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('ionity_tab_sync_v1');
      this.channel.onmessage = (event) => this.handleSyncMessage(event.data);

      // Announce tab presence
      this.broadcast('tab_joined', { tabId: this.tabId, time: Date.now() });

      // Handle tab unload
      window.addEventListener('beforeunload', () => {
        this.broadcast('tab_left', { tabId: this.tabId });
      });

      // Periodic heartbeat for active tabs
      setInterval(() => {
        this.broadcast('tab_ping', { tabId: this.tabId });
      }, 15000);
    }
  }

  static broadcast(type, payload = {}) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type: type,
        sender: this.tabId,
        timestamp: Date.now(),
        payload: payload
      });
    } catch (e) {
      console.warn('TabSync broadcast notice:', e);
    }
  }

  static syncKeypoint(name, data = {}) {
    this.lastKeypoint = { name, data, timestamp: Date.now() };
    this.broadcast('keypoint_sync', { name, data });
  }

  static handleSyncMessage(msg) {
    if (!msg || msg.sender === this.tabId) return;

    switch (msg.type) {
      case 'tab_joined':
      case 'tab_ping':
        this.updatePeerCount(1);
        break;

      case 'tab_left':
        this.updatePeerCount(-1);
        break;

      case 'doc_updated':
        if (window.WorkspaceManager) {
          WorkspaceManager.renderDocTree();
          if (WorkspaceManager.activeDocId === msg.payload.docId) {
            WorkspaceManager.loadDocument(msg.payload.docId, false);
          }
        }
        break;

      case 'crm_updated':
        if (window.CRMManager) {
          CRMManager.render();
        }
        break;

      case 'scrum_updated':
        if (window.ScrumManager) {
          ScrumManager.render();
        }
        break;

      case 'keypoint_sync':
        this.onRemoteKeypoint(msg.payload);
        break;

      default:
        break;
    }
  }

  static onRemoteKeypoint({ name, data }) {
    console.log(`📍 [TabSync] Remote Keypoint received: ${name}`, data);
    const syncBadge = document.getElementById('tab-sync-indicator');
    if (syncBadge) {
      syncBadge.classList.add('pulse-glow');
      setTimeout(() => syncBadge.classList.remove('pulse-glow'), 1200);
    }
  }

  static updatePeerCount(delta) {
    const el = document.getElementById('tab-sync-count');
    if (el) {
      this.openTabsCount = Math.max(1, this.openTabsCount + delta);
      el.textContent = `${this.openTabsCount} tabs synced`;
    }
  }
}

window.TabSyncManager = TabSyncManager;
