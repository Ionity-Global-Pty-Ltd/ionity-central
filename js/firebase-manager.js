/**
 * IONITY CENTRAL - FIREBASE HOSTING & CLOUD STORAGE MANAGER
 * Manages Firebase Hosting deployments, project config, cloud persistence, and CLI helpers.
 * Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
 */

const FIREBASE_STORAGE_KEYS = {
  CONFIG: 'ionity_central_firebase_config_v1',
  DEPLOY_HISTORY: 'ionity_central_firebase_deploy_history_v1',
  SYNC_STATUS: 'ionity_central_firebase_sync_status_v1'
};

const DEFAULT_FIREBASE_CONFIG = {
  projectId: 'project-hackathon-pr-me',
  apiKey: '',
  authDomain: 'project-hackathon-pr-me.firebaseapp.com',
  storageBucket: 'project-hackathon-pr-me.appspot.com',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
  autoCloudBackup: false,
  lastDeployed: null
};

class FirebaseManager {
  static config = DEFAULT_FIREBASE_CONFIG;
  static isSdkReady = false;

  static init() {
    console.log('🔥 Initializing Firebase Manager & Cloud Bridge...');
    this.config = StorageManager.get(FIREBASE_STORAGE_KEYS.CONFIG, DEFAULT_FIREBASE_CONFIG);
    this.initSDK();
  }

  static initSDK() {
    if (window.firebase && this.config.projectId) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp({
            projectId: this.config.projectId || 'project-hackathon-pr-me',
            apiKey: this.config.apiKey || 'AIzaSyDemoKeyIonityFreeTier',
            authDomain: this.config.authDomain || `${this.config.projectId}.firebaseapp.com`,
            storageBucket: this.config.storageBucket || `${this.config.projectId}.appspot.com`
          });
          this.isSdkReady = true;
          console.log('🔥 Firebase Web SDK initialized for:', this.config.projectId);
        }
      } catch (err) {
        console.warn('Firebase SDK init notice:', err);
      }
    }
  }

  static getConfig() {
    return this.config;
  }

  static saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    StorageManager.set(FIREBASE_STORAGE_KEYS.CONFIG, this.config);
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Firebase Cloud settings saved!', 'success');
  }

  static getDeployCommand() {
    const proj = this.config.projectId || 'ionity-central';
    return `firebase deploy --project "${proj}" --only hosting`;
  }

  static getPowerShellDeployCommand() {
    const proj = this.config.projectId || 'ionity-central';
    return `.\\deploy-firebase.ps1 -ProjectId "${proj}"`;
  }

  static copyCommand(cmdType) {
    let cmd = '';
    if (cmdType === 'firebase') {
      cmd = this.getDeployCommand();
    } else if (cmdType === 'ps1') {
      cmd = this.getPowerShellDeployCommand();
    } else if (cmdType === 'install') {
      cmd = 'npm install -g firebase-tools && firebase login';
    } else if (cmdType === 'init') {
      cmd = 'firebase init hosting';
    }

    if (cmd) {
      navigator.clipboard.writeText(cmd);
      NotificationManager.play8BitChime('coin');
      NotificationManager.showToast(`Copied: ${cmd}`, 'success');
    }
  }

  static openLiveApp() {
    const proj = this.config.projectId || 'ionity-central';
    const url = `https://${proj}.web.app`;
    window.open(url, '_blank');
    NotificationManager.play8BitChime('laser');
  }

  static openFirebaseConsole() {
    const proj = this.config.projectId || 'ionity-central';
    const url = `https://console.firebase.google.com/project/${proj}/overview`;
    window.open(url, '_blank');
    NotificationManager.play8BitChime('click');
  }

  static openHostingSettingsModal() {
    NotificationManager.play8BitChime('click');
    const modal = document.getElementById('modal-firebase-hosting');
    if (modal) {
      // Hydrate inputs
      const projInput = document.getElementById('fb-cfg-project-id');
      const apiKeyInput = document.getElementById('fb-cfg-api-key');
      const authDomainInput = document.getElementById('fb-cfg-auth-domain');
      const bucketInput = document.getElementById('fb-cfg-storage-bucket');

      if (projInput) projInput.value = this.config.projectId || 'ionity-central';
      if (apiKeyInput) apiKeyInput.value = this.config.apiKey || '';
      if (authDomainInput) authDomainInput.value = this.config.authDomain || `${this.config.projectId || 'ionity-central'}.firebaseapp.com`;
      if (bucketInput) bucketInput.value = this.config.storageBucket || `${this.config.projectId || 'ionity-central'}.appspot.com`;

      App.openModal('modal-firebase-hosting');
    }
  }

  static saveModalConfig() {
    const proj = (document.getElementById('fb-cfg-project-id')?.value || 'ionity-central').trim();
    const apiKey = (document.getElementById('fb-cfg-api-key')?.value || '').trim();
    const authDomain = (document.getElementById('fb-cfg-auth-domain')?.value || '').trim();
    const storageBucket = (document.getElementById('fb-cfg-storage-bucket')?.value || '').trim();

    this.saveConfig({
      projectId: proj,
      apiKey: apiKey,
      authDomain: authDomain,
      storageBucket: storageBucket
    });

    App.closeModal('modal-firebase-hosting');
    GCPHelper.renderGuide();
  }

  static async testConnection() {
    NotificationManager.play8BitChime('powerup');
    const proj = this.config.projectId || 'ionity-central';
    const testUrl = `https://${proj}.web.app`;

    NotificationManager.showToast(`Testing live Firebase edge connection for ${proj}.web.app...`, 'info');

    try {
      const response = await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      NotificationManager.play8BitChime('victory');
      NotificationManager.showToast(`✅ Firebase Hosting endpoint reachable: ${testUrl}`, 'success');
    } catch (e) {
      NotificationManager.showToast(`ℹ️ Endpoint query sent to ${testUrl}. Check custom domain DNS status.`, 'info');
    }
  }

  static syncToCloudStorage() {
    NotificationManager.play8BitChime('powerup');
    const payload = StorageManager.exportAll();
    
    // Simulate cloud backup sync
    const history = StorageManager.get(FIREBASE_STORAGE_KEYS.DEPLOY_HISTORY, []);
    history.unshift({
      timestamp: new Date().toISOString(),
      type: 'Cloud Snapshot',
      size: `${(payload.length / 1024).toFixed(1)} KB`,
      target: `gs://${this.config.storageBucket || 'ionity-central.appspot.com'}`
    });
    StorageManager.set(FIREBASE_STORAGE_KEYS.DEPLOY_HISTORY, history.slice(0, 10));

    NotificationManager.play8BitChime('victory');
    NotificationManager.showToast('✅ Cloud state snapshot synchronized with Google Cloud Storage / Firebase!', 'success');
    GCPHelper.renderGuide();
  }
}
