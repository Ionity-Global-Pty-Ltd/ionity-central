/**
 * IONITY CENTRAL - MAIN CONTROLLER & APPLICATION ENGINE
 * Orchestrates routing, command palette, PWA lifecycle, sound controls, and component interactions.
 */

let deferredInstallPrompt = null;

class App {
  static init() {
    console.log('⚡ Ionity Central initializing...');

    // Initialize Subsystems
    StorageManager.initDefaults();
    NotificationManager.init();
    WatermarkManager.init();
    ProfilesManager.init();
    ScreenRecorderManager.init();
    ScreenshareManager.init();
    AuthManager.init();
    FirebaseManager.init();
    LocalRAGService.init();
    GeminiService.init();
    WorkspaceManager.init();
    CRMManager.init();
    ScrumManager.init();
    TabSyncManager.init();
    OcrInspector.init();

    this.bindEvents();
    this.setupPWA();
    this.handleRouteFromUrl();
  }

  static bindEvents() {
    // Navigation items click
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) {
          this.switchView(view);
        }
      });
    });

    // Keyboard Shortcuts (Ctrl+K for Command Palette, Ctrl+Shift+R for Screen Record, Ctrl+Shift+S for Screenshare)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        ScreenRecorderManager.openRecordStudioModal();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        ScreenshareManager.snapToDefaultLeftCorner();
      }
      if (e.key === 'Escape') {
        this.closeAllModals();
        WorkspaceManager.hideSlashMenu();
        this.closeNotificationCenter();
        ProfilesManager.closeProfileSwitcherDropdown();
      }
    });

    // Close slash menu, notification center, and profile dropdown on outside click
    document.addEventListener('click', (e) => {
      const slashMenu = document.getElementById('slash-command-menu');
      if (slashMenu && !slashMenu.contains(e.target) && !e.target.closest('.block-handle')) {
        WorkspaceManager.hideSlashMenu();
      }
      const notifDrawer = document.getElementById('notification-center-drawer');
      if (notifDrawer && !notifDrawer.contains(e.target) && !e.target.closest('.notification-bell-btn')) {
        this.closeNotificationCenter();
      }
      const profDropdown = document.getElementById('header-profile-dropdown');
      if (profDropdown && !profDropdown.contains(e.target) && !e.target.closest('#header-profile-btn-wrap')) {
        ProfilesManager.closeProfileSwitcherDropdown();
      }
    });
  }

  static switchView(viewName) {
    NotificationManager.play8BitChime('click');

    // Deactivate all sections and nav items
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const targetSection = document.getElementById(`view-${viewName}`);
    const targetNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    const breadcrumbCurrent = document.getElementById('header-breadcrumb-current');

    if (targetSection) targetSection.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    const viewTitles = {
      workspace: 'Unity Workspace Docs',
      crm: 'CRM Pipeline & Financial Forecast',
      scrum: 'SCRUM Sprint & Burndown Trajectory',
      recorder: 'Screen Recorder Studio & Capture Engine',
      watermark: 'Logo Watermark Upload & Brand Studio',
      profiles: 'Executive Identity & Multi-Profile Hub',
      auth: 'Google & OAuth Providers Hub',
      gcp: 'Google Cloud VM & Firebase Hosting',
      settings: 'App & Theme Settings'
    };


    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = viewTitles[viewName] || 'Workspace';
    }

    // Refresh view specific components
    if (viewName === 'recorder') ScreenRecorderManager.renderRecorderView();
    if (viewName === 'watermark') WatermarkManager.renderStudioView();
    if (viewName === 'profiles') ProfilesManager.renderProfilesView();
    if (viewName === 'auth') AuthManager.renderProviderSettings();
    if (viewName === 'gcp') GCPHelper.renderGuide();
    if (viewName === 'crm') { CRMManager.renderStats(); CRMManager.renderPipeline(); }
    if (viewName === 'scrum') { ScrumManager.renderSprintHeader(); ScrumManager.renderBoard(); }

    // Close mobile sidebar if open
    document.querySelector('.sidebar')?.classList.remove('open');
  }

  static handleRouteFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'workspace';
    this.switchView(view);
  }

  static toggleSidebar() {
    NotificationManager.play8BitChime('click');
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  static toggleNotificationCenter() {
    NotificationManager.play8BitChime('click');
    const drawer = document.getElementById('notification-center-drawer');
    if (drawer) {
      drawer.classList.toggle('active');
      if (drawer.classList.contains('active')) {
        NotificationManager.renderInAppDrawer();
      }
    }
  }

  static closeNotificationCenter() {
    const drawer = document.getElementById('notification-center-drawer');
    if (drawer) drawer.classList.remove('active');
  }

  /* Command Palette (Ctrl+K) */
  static openCommandPalette() {
    NotificationManager.play8BitChime('click');
    const modal = document.getElementById('modal-command-palette');
    const input = document.getElementById('command-palette-input');
    if (modal) {
      modal.classList.add('active');
      if (input) {
        input.value = '';
        input.focus();
        this.filterCommands('');
      }
    }
  }

  static filterCommands(query) {
    const list = document.getElementById('command-results-list');
    if (!list) return;

    const commands = [
      { category: 'Screenshare & Cam', icon: renderIcon('screenRecord', '', 16), title: 'Start P2P Screenshare (Direct Stream to VM)', action: () => ScreenshareManager.startScreenshare() },
      { category: 'Screenshare & Cam', icon: renderIcon('user', '', 16), title: 'Toggle Moveable Video Camera (Default Left Corner)', action: () => ScreenshareManager.toggleCamera() },
      { category: 'Screenshare & Cam', icon: renderIcon('crop', '', 16), title: 'Dock Camera to Default Left Corner (Ctrl+Shift+S)', action: () => ScreenshareManager.snapToDefaultLeftCorner() },
      { category: 'Studio & Media', icon: renderIcon('screenRecord', '', 16), title: 'Launch Screen Recorder Studio (Ctrl+Shift+R)', action: () => ScreenRecorderManager.openRecordStudioModal() },
      { category: 'Studio & Media', icon: renderIcon('watermark', '', 16), title: 'Open Logo Watermark Studio & Upload Custom Logo', action: () => this.switchView('watermark') },
      { category: 'Studio & Media', icon: renderIcon('gallery', '', 16), title: 'Open Screen Recordings Gallery', action: () => this.switchView('recorder') },
      { category: 'Profiles & Identity', icon: renderIcon('profiles', '', 16), title: 'Manage Workspace Profiles & Executive Signatures', action: () => this.switchView('profiles') },
      { category: 'Profiles & Identity', icon: renderIcon('userSwitch', '', 16), title: 'Switch Active Profile (Johan Wilhelm van Antwerp)', action: () => ProfilesManager.switchProfile('profile-johan') },
      { category: 'Profiles & Identity', icon: renderIcon('userAdd', '', 16), title: 'Create New Team / Client Profile', action: () => ProfilesManager.openCreateProfileModal() },
      { category: 'Cloud & Auth', icon: renderIcon('google', '', 16), title: 'Continue with Google OAuth 2.0 (@ionity.today Domain Lock)', action: () => AuthManager.loginWithGoogle() },
      { category: 'Cloud & Auth', icon: renderIcon('auth', '', 16), title: 'Configure Google OAuth 2.0 Web Client ID', action: () => this.openModal('modal-google-auth') },
      { category: 'Navigation', icon: renderIcon('workspace', '', 16), title: 'Go to Unity Workspace Docs', action: () => this.switchView('workspace') },
      { category: 'Navigation', icon: renderIcon('crm', '', 16), title: 'Go to CRM Pipeline & Forecast (Check-in ➔ Paid)', action: () => this.switchView('crm') },
      { category: 'Navigation', icon: renderIcon('scrum', '', 16), title: 'Go to SCRUM Sprint & Burndown Chart (Busy With ➔ Completed)', action: () => this.switchView('scrum') },
      { category: 'Navigation', icon: renderIcon('gcp', '', 16), title: 'Open Google Cloud VM Setup & Terminal', action: () => this.switchView('gcp') },
      { category: 'Unity Workspace', icon: renderIcon('plus', '', 16), title: 'Create New Unity Document', action: () => WorkspaceManager.createNewDoc() },
      { category: 'Unity Workspace', icon: renderIcon('videoBlock', '', 16), title: 'Insert Embedded Screen Recording / Video Block', action: () => WorkspaceManager.insertVideoBlock('assets/ionity-card-electric.gif', 'Ionity Feature Demo', '01:30') },
      { category: 'Unity Workspace', icon: renderIcon('upload', '', 16), title: 'Import Markdown File (.md) to Unity', action: () => WorkspaceManager.triggerMarkdownImport() },
      { category: 'Unity Workspace', icon: renderIcon('crop', '', 16), title: 'Change Unity Document Cover / Gradient', action: () => WorkspaceManager.openCoverPicker() },
      { category: 'Unity Workspace', icon: renderIcon('timerBlock', '', 16), title: 'Insert 8-Bit Focus Sprint Timer', action: () => WorkspaceManager.insertBlock(WorkspaceManager.getActiveDoc()?.blocks?.length || 0, 'timer') },
      { category: 'Unity Workspace', icon: renderIcon('tableBlock', '', 16), title: 'Insert Dynamic Table Block', action: () => WorkspaceManager.insertBlock(WorkspaceManager.getActiveDoc()?.blocks?.length || 0, 'table') },
      { category: 'Unity Workspace', icon: renderIcon('soundboardBlock', '', 16), title: 'Insert 8-Bit Soundboard Block', action: () => WorkspaceManager.insertBlock(WorkspaceManager.getActiveDoc()?.blocks?.length || 0, 'soundboard') },
      { category: 'Quick Actions', icon: renderIcon('crm', '', 16), title: 'Add New CRM Deal', action: () => this.openModal('modal-add-deal') },
      { category: 'Quick Actions', icon: renderIcon('user', '', 16), title: 'Add New Client Contact', action: () => this.openModal('modal-add-contact') },
      { category: 'Quick Actions', icon: renderIcon('scrum', '', 16), title: 'Add New Scrum Story / Task', action: () => this.openModal('modal-add-task') },
      { category: 'Quick Actions', icon: renderIcon('badge', '', 16), title: 'Complete Sprint & Velocity Fanfare', action: () => ScrumManager.completeSprint() },
      { category: 'Quick Actions', icon: renderIcon('aiBlock', '', 16), title: 'Run Gemini AI Generator & Cache AUC', action: () => WorkspaceManager.triggerAiAssistant() },
      { category: 'Audio & Preferences', icon: renderIcon('soundboardBlock', '', 16), title: 'Toggle 8-Bit Audio Sound FX', action: () => NotificationManager.toggleSound() },
      { category: 'Export & Backup', icon: renderIcon('download', '', 16), title: 'Export CRM Deals to CSV', action: () => CRMManager.exportCSV() },
      { category: 'Export & Backup', icon: renderIcon('download', '', 16), title: 'Export Active Doc as Markdown (.md)', action: () => WorkspaceManager.exportMarkdown() },
      { category: 'Export & Backup', icon: renderIcon('download', '', 16), title: 'Download Full Workspace Backup (JSON)', action: () => this.downloadBackup() }
    ];

    const filtered = query.trim() === '' ? commands : commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

    list.innerHTML = filtered.map((cmd, idx) => `
      <div class="command-result-item" onclick="App.runCommand(${idx})">
        <span class="cmd-icon-box">${cmd.icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600;">${cmd.title}</div>
          <div style="font-size: 10px; color: var(--text-subtle);">${cmd.category}</div>
        </div>
      </div>
    `).join('');

    this._currentFilteredCommands = filtered;
  }

  static runCommand(index) {
    if (this._currentFilteredCommands && this._currentFilteredCommands[index]) {
      this.closeAllModals();
      this._currentFilteredCommands[index].action();
    }
  }

  /* Modals */
  static openModal(modalId) {
    this.closeAllModals();
    NotificationManager.play8BitChime('click');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  static closeModal(modalId) {
    NotificationManager.play8BitChime('click');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  static closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  /* PWA Setup & Install Prompt */
  static setupPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('⚡ Ionity Service Worker Registered:', reg.scope))
          .catch((err) => console.warn('Service Worker registration issue:', err));
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) installBtn.style.display = 'inline-flex';
    });
  }

  static triggerPwaInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          NotificationManager.play8BitChime('victory');
          NotificationManager.sendPushAlert({
            title: '📱 PWA Installed',
            body: 'Ionity Central has been installed on your device.',
            type: 'success'
          });
        }
        deferredInstallPrompt = null;
      });
    } else {
      NotificationManager.showToast('Ionity Central is ready for installation or already running standalone.', 'info');
    }
  }

  static downloadBackup() {
    const json = StorageManager.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ionity_Central_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Full workspace backup downloaded.', 'success');
  }
}

// Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
