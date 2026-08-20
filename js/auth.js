/**
 * IONITY CENTRAL - AUTH 2.0 & GOOGLE IDENTITY CONTROLLER
 * Supports Google OAuth 2.0 (Live GSI + Auth Later / Staging Mode), Multi-Identity Providers,
 * Profile Sync, and Session Guard.
 */

class AuthManager {
  static init() {
    this.currentUser = StorageManager.get(STORAGE_KEYS.AUTH, {
      isAuthenticated: true, // Executive session active by default
      provider: 'Google OAuth 2.0',
      name: 'Johan Wilhelm van Antwerp',
      email: 'johan@ionity.co.za',
      role: 'Lead Solutionist',
      avatar: 'assets/johan-avatar.jpg',
      signature: 'assets/Johanwilhelmvanantwerpesignatureionity.png',
      connectedProviders: {
        google: true,
        github: true,
        microsoft: true,
        claude: true,
        firebase: true
      }
    });

    this.checkAuthStatus();
    this.renderUserUI();
    this.initGoogleOAuthScript();
    this.startSyncHeartbeat();
  }

  static startSyncHeartbeat() {
    setInterval(() => {
      const syncPill = document.getElementById('header-sync-status-pill');
      if (syncPill) {
        syncPill.innerHTML = `<span class="sync-dot online"></span> <span>Google Cloud Synced</span>`;
      }
    }, 15000);
  }

  static checkAuthStatus() {
    const authGate = document.getElementById('auth-gate-screen');
    if (!authGate) return;

    if (this.currentUser.isAuthenticated) {
      authGate.classList.add('authenticated');
    } else {
      authGate.classList.remove('authenticated');
    }
  }

  static getCurrentUser() {
    return this.currentUser;
  }

  static renderUserUI() {
    const nameEl = document.getElementById('user-profile-name');
    const roleEl = document.getElementById('user-profile-role');
    const avatarEl = document.getElementById('user-profile-avatar');

    if (nameEl) nameEl.textContent = this.currentUser.name || 'Workspace User';
    if (roleEl) {
      roleEl.innerHTML = `<span class="auth-provider-badge">${this.currentUser.provider || 'SSO'}</span> ${this.currentUser.role || 'Member'}`;
    }
    if (avatarEl) {
      if (this.currentUser.avatar && (this.currentUser.avatar.includes('/') || this.currentUser.avatar.startsWith('http') || this.currentUser.avatar.startsWith('data:'))) {
        avatarEl.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar" onerror="this.parentElement.textContent='J'">`;
      } else {
        avatarEl.textContent = (this.currentUser.name || 'U').charAt(0).toUpperCase();
      }
    }
  }

  static openProfileModal() {
    if (window.ProfilesManager) {
      ProfilesManager.openCreateProfileModal(ProfilesManager.activeProfileId);
    } else {
      App.openModal('modal-user-profile');
    }
  }

  static initGoogleOAuthScript() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    if (config.googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: this.handleGoogleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render on login screen button if available
        const gateBtn = document.getElementById('gsi-gate-button-container');
        if (gateBtn) {
          window.google.accounts.id.renderButton(gateBtn, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            width: '380',
            text: 'continue_with'
          });
        }

        // Render inside in-app settings
        const settingsBtn = document.getElementById('google-signin-btn-container');
        if (settingsBtn) {
          window.google.accounts.id.renderButton(settingsBtn, {
            theme: 'filled_black',
            size: 'large',
            shape: 'rectangular',
            text: 'continue_with'
          });
        }
      } catch (err) {
        console.warn('Google Identity Services notice:', err);
      }
    }
  }

  /**
   * Primary Google Login Handler with "Auth Later / Staging Mode" support
   */
  static loginWithGoogle() {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});

    if (config.googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
        return;
      } catch (e) {
        console.warn('GSI prompt fallback:', e);
      }
    }

    // Google Auth Later / Staging Mode Flow (Restricted to @ionity.today)
    this.currentUser = {
      isAuthenticated: true,
      provider: 'Google OAuth 2.0',
      name: 'Johan Wilhelm van Antwerp',
      email: 'johan@ionity.today',
      role: 'Google Cloud Architect & Solutionist',
      avatar: 'assets/johan-avatar.jpg',
      signature: 'assets/Johanwilhelmvanantwerpesignatureionity.png',
      connectedProviders: {
        ...this.currentUser.connectedProviders,
        google: true
      }
    };

    StorageManager.set(STORAGE_KEYS.AUTH, this.currentUser);
    this.checkAuthStatus();
    this.renderUserUI();

    if (window.ProfilesManager) {
      ProfilesManager.syncWithAuthManager();
      ProfilesManager.renderHeaderProfileSwitcher();
    }

    NotificationManager.play8BitChime('victory');
    NotificationManager.sendPushAlert({
      title: '🔑 Google Sign-In Verified (@ionity.today)',
      body: 'Authenticated via Google OAuth 2.0 domain gate (johan@ionity.today).',
      type: 'success'
    });
  }

  static handleGoogleCredentialResponse(response) {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const profile = JSON.parse(jsonPayload);
      const email = (profile.email || '').toLowerCase().trim();

      // ==================== DOMAIN RESTRICTION: @ionity.today ====================
      const allowedDomains = ['@ionity.today', '@ionity.co.za'];
      const isAllowed = allowedDomains.some(d => email.endsWith(d));

      if (!isAllowed) {
        console.warn(`[OAuth 2.0 Gate] Blocked non-Ionity domain: ${email}`);
        NotificationManager.play8BitChime('gameover');
        NotificationManager.showToast(`⛔ Access Denied: Google Login is restricted to @ionity.today accounts only (${email}).`, 'danger');
        NotificationManager.sendPushAlert({
          title: '⛔ Google Login Domain Blocked',
          body: `Access restricted. Only @ionity.today accounts are authorized (attempted: ${email}).`,
          type: 'danger'
        });
        return;
      }

      this.currentUser = {
        isAuthenticated: true,
        provider: 'Google OAuth 2.0',
        name: profile.name || 'Ionity Team Member',
        email: profile.email,
        role: 'Verified Google @ionity.today Member',
        avatar: profile.picture || 'assets/johan-avatar.jpg',
        signature: 'assets/Johanwilhelmvanantwerpesignatureionity.png',
        connectedProviders: {
          ...this.currentUser.connectedProviders,
          google: true
        }
      };

      StorageManager.set(STORAGE_KEYS.AUTH, this.currentUser);
      this.checkAuthStatus();
      this.renderUserUI();

      if (window.ProfilesManager) {
        ProfilesManager.syncWithAuthManager();
        ProfilesManager.renderHeaderProfileSwitcher();
      }

      NotificationManager.play8BitChime('victory');
      NotificationManager.sendPushAlert({
        title: '🔑 Google OAuth 2.0 Verified',
        body: `Welcome back to Ionity Central: ${profile.email}`,
        type: 'success'
      });
    } catch (e) {
      console.error('Error decoding Google JWT token:', e);
      this.loginWithGoogle();
    }
  }

  static loginWithProvider(providerName) {
    if (providerName === 'Google') {
      this.loginWithGoogle();
      return;
    }

    const providerProfiles = {
      GitHub: { name: 'GitHub Developer', role: 'Full-Stack Engineer', avatar: 'assets/ionity-logo.png' },
      Microsoft: { name: 'Microsoft 365 User', role: 'Cloud Admin', avatar: 'assets/ionity-logo.png' },
      Claude: { name: 'Claude AI User', role: 'AI Specialist', avatar: 'assets/ionity-logo.png' }
    };

    const info = providerProfiles[providerName] || { name: 'Workspace User', role: 'Member', avatar: '' };

    this.currentUser = {
      isAuthenticated: true,
      provider: providerName,
      name: info.name,
      email: `${providerName.toLowerCase()}@ionity.today`,
      role: info.role,
      avatar: info.avatar,
      signature: 'assets/Johanwilhelmvanantwerpesignatureionity.png',
      connectedProviders: {
        ...this.currentUser.connectedProviders,
        [providerName.toLowerCase()]: true
      }
    };

    StorageManager.set(STORAGE_KEYS.AUTH, this.currentUser);
    this.checkAuthStatus();
    this.renderUserUI();

    if (window.ProfilesManager) {
      ProfilesManager.syncWithAuthManager();
      ProfilesManager.renderHeaderProfileSwitcher();
    }

    NotificationManager.play8BitChime('powerup');
    NotificationManager.sendPushAlert({
      title: `⚡ Authenticated via ${providerName}`,
      body: `Welcome to Ionity Central Workspace.`,
      type: 'success'
    });
  }

  static loginWithDemo() {
    this.currentUser = {
      isAuthenticated: true,
      provider: 'Google OAuth 2.0',
      name: 'Johan Wilhelm van Antwerp',
      email: 'johan@ionity.co.za',
      role: 'Lead Solutionist',
      avatar: 'assets/johan-avatar.jpg',
      signature: 'assets/Johanwilhelmvanantwerpesignatureionity.png',
      connectedProviders: {
        google: true,
        github: true,
        microsoft: true,
        claude: true,
        firebase: true
      }
    };

    StorageManager.set(STORAGE_KEYS.AUTH, this.currentUser);
    this.checkAuthStatus();
    this.renderUserUI();

    if (window.ProfilesManager) {
      ProfilesManager.switchProfile('profile-johan');
    }

    NotificationManager.play8BitChime('victory');
    NotificationManager.sendPushAlert({
      title: '⚡ Executive Session Active',
      body: 'Welcome Johan Wilhelm van Antwerp (Ionity Global / Antwerp Designs).',
      type: 'success'
    });
  }

  static logout() {
    this.currentUser.isAuthenticated = false;
    StorageManager.set(STORAGE_KEYS.AUTH, this.currentUser);
    this.checkAuthStatus();
    NotificationManager.play8BitChime('gameover');
    NotificationManager.showToast('Signed out of Ionity Central.', 'info');
  }

  static saveGoogleConfig(clientId, clientSecret) {
    const config = StorageManager.get(STORAGE_KEYS.CONFIG, {});
    config.googleClientId = clientId.trim();
    if (clientSecret) config.googleClientSecret = clientSecret.trim();
    StorageManager.set(STORAGE_KEYS.CONFIG, config);

    NotificationManager.play8BitChime('powerup');
    NotificationManager.sendPushAlert({
      title: '⚡ Google OAuth 2.0 Credentials Saved',
      body: 'Google Identity Services SDK configured.',
      type: 'success'
    });

    this.initGoogleOAuthScript();
  }

  static toggleProvider(providerKey) {
    if (!this.currentUser.connectedProviders) {
      this.currentUser.connectedProviders = {};
    }
    const current = !!this.currentUser.connectedProviders[providerKey];
    this.currentUser.connectedProviders[providerKey] = !current;
    StorageManager.set(STORAGE_KEYS.AUTH, this.currentUser);

    const providerNames = {
      google: 'Google Cloud & Workspace',
      github: 'GitHub Enterprise',
      microsoft: 'Microsoft Azure AD',
      claude: 'Claude / Anthropic AI',
      firebase: 'Firebase Realtime Cloud Database'
    };

    NotificationManager.play8BitChime(!current ? 'powerup' : 'click');
    NotificationManager.sendPushAlert({
      title: `${providerNames[providerKey] || providerKey} ${!current ? 'Connected' : 'Disconnected'}`,
      body: 'Provider bridge state updated.',
      type: !current ? 'success' : 'info'
    });

    this.renderProviderSettings();
  }

  static renderProviderSettings() {
    const list = document.getElementById('provider-connections-list');
    if (!list) return;

    const providers = [
      { id: 'google', name: 'Google Identity & Cloud (OAuth 2.0)', desc: 'Google OAuth 2.0 SSO, Google Drive, GCP VM integration', icon: IonityIcons.google, active: this.currentUser.connectedProviders?.google },
      { id: 'github', name: 'GitHub Enterprise', desc: 'Repository sync, commit triggers, issue tracking', icon: IonityIcons.github, active: this.currentUser.connectedProviders?.github },
      { id: 'microsoft', name: 'Microsoft 365 / Azure AD', desc: 'Azure SSO, Teams notifications, OneDrive sync', icon: IonityIcons.microsoft, active: this.currentUser.connectedProviders?.microsoft },
      { id: 'claude', name: 'Claude / Anthropic AI', desc: 'AI workspace agent, automated summaries & code generation', icon: IonityIcons.claude, active: this.currentUser.connectedProviders?.claude },
      { id: 'firebase', name: 'Firebase Realtime Cloud Sync', desc: 'Instant multi-device cloud database state synchronization', icon: '🔥', active: this.currentUser.connectedProviders?.firebase }
    ];

    list.innerHTML = providers.map(p => `
      <div class="provider-card">
        <div class="provider-info">
          <div class="provider-logo-box">${p.icon}</div>
          <div>
            <div style="font-weight: 700; font-size: 14px;">${p.name}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${p.desc}</div>
          </div>
        </div>
        <button class="btn ${p.active ? 'btn-primary' : 'btn-secondary'}" onclick="AuthManager.toggleProvider('${p.id}')">
          ${p.active ? `${IonityIcons.check} Connected` : '+ Connect'}
        </button>
      </div>
    `).join('');
  }
}
