/**
 * IONITY CENTRAL - MULTI-PROFILE & EXECUTIVE IDENTITY SYSTEM
 * Manage multiple user profiles, instant profile switching, custom avatar uploads,
 * executive digital signature stamps, and author attribution across documents & sprints.
 */

class ProfilesManager {
  static init() {
    this.DEFAULT_PROFILES = [
      {
        id: 'profile-johan',
        name: 'Johan Wilhelm van Antwerp',
        role: 'Lead Solutionist',
        org: 'Ionity Global & Antwerp Designs',
        email: 'johan@ionity.co.za',
        avatar: 'assets/johan-avatar.jpg',
        signature: 'assets/Johanwilhelmvanantwerpesignatureionity.png',
        bio: 'Lead Solutionist & Founder of Antwerp Designs. Solutionist for Ionity Global. Precision 8-bit & modern structured layouts.',
        provider: 'Google OAuth 2.0',
        website: 'https://www.ionity.today',
        isExecutive: true
      },
      {
        id: 'profile-devops',
        name: 'Ionity Cloud DevOps',
        role: 'Principal Cloud Architect',
        org: 'Ionity Global Infrastructure',
        email: 'devops@ionity.today',
        avatar: 'assets/ionity-logo.png',
        signature: 'assets/AEDi-AntwerpDesigns-Ionityglobal.png',
        bio: 'Google Cloud Compute Engine, Nginx edge routing, PWA service worker pipelines, and automated SSL provisioning.',
        provider: 'Google Cloud',
        website: 'https://www.ionity.today',
        isExecutive: false
      },
      {
        id: 'profile-studio',
        name: 'Antwerp Designs Studio',
        role: 'Creative Design Director',
        org: 'Antwerp Designs',
        email: 'studio@antwerpdesigns.com',
        avatar: 'assets/AEDi-AntwerpDesigns-Ionityglobal.png',
        signature: 'assets/aedi.svg',
        bio: 'Design systems, 8-bit retro accents, high-contrast dark mode interfaces, and vector branding frameworks.',
        provider: 'Ionity SSO',
        website: 'https://www.ionity.today',
        isExecutive: false
      }
    ];

    this.profiles = StorageManager.get(STORAGE_KEYS.PROFILES || 'ionity_central_profiles_v1', this.DEFAULT_PROFILES);
    this.activeProfileId = StorageManager.get(STORAGE_KEYS.ACTIVE_PROFILE_ID || 'ionity_central_active_profile_v1', 'profile-johan');

    // Verify active profile exists
    if (!this.profiles.find(p => p.id === this.activeProfileId)) {
      this.activeProfileId = this.profiles[0]?.id || 'profile-johan';
    }

    this.syncWithAuthManager();
  }

  static getActiveProfile() {
    return this.profiles.find(p => p.id === this.activeProfileId) || this.profiles[0] || this.DEFAULT_PROFILES[0];
  }

  static getAllProfiles() {
    return this.profiles;
  }

  static switchProfile(profileId) {
    const target = this.profiles.find(p => p.id === profileId);
    if (!target) return;

    this.activeProfileId = target.id;
    StorageManager.set(STORAGE_KEYS.ACTIVE_PROFILE_ID || 'ionity_central_active_profile_v1', this.activeProfileId);

    this.syncWithAuthManager();
    this.renderHeaderProfileSwitcher();
    this.renderProfilesView();

    NotificationManager.play8BitChime('victory');
    NotificationManager.sendPushAlert({
      title: `👤 Profile Switched: ${target.name}`,
      body: `Active as ${target.role} (${target.org}). Workspace signatures & author attribution updated.`,
      type: 'success'
    });

    this.closeProfileSwitcherDropdown();
  }

  static syncWithAuthManager() {
    const active = this.getActiveProfile();
    if (!active) return;

    if (window.AuthManager) {
      const isAuth = !!AuthManager.currentUser?.isAuthenticated;
      AuthManager.currentUser = {
        isAuthenticated: isAuth,
        provider: active.provider || 'Ionity SSO',
        name: active.name,
        email: active.email,
        role: active.role,
        avatar: active.avatar,
        signature: active.signature,
        org: active.org,
        connectedProviders: AuthManager.currentUser?.connectedProviders || { google: true, github: true, microsoft: true, claude: true, firebase: true }
      };
      StorageManager.set(STORAGE_KEYS.AUTH, AuthManager.currentUser);
      AuthManager.renderUserUI();
    }
  }

  static createProfile(profileData) {
    const newProfile = {
      id: 'profile-' + Date.now(),
      name: profileData.name || 'New Team Member',
      role: profileData.role || 'Member',
      org: profileData.org || 'Ionity Global',
      email: profileData.email || 'member@ionity.today',
      avatar: profileData.avatar || 'assets/ionity-logo.png',
      signature: profileData.signature || 'assets/Johanwilhelmvanantwerpesignatureionity.png',
      bio: profileData.bio || 'Workspace collaborator.',
      provider: profileData.provider || 'Ionity SSO',
      website: profileData.website || 'https://www.ionity.today',
      isExecutive: false
    };

    this.profiles.push(newProfile);
    this.saveProfiles();
    this.switchProfile(newProfile.id);

    NotificationManager.play8BitChime('powerup');
    NotificationManager.showToast(`Profile "${newProfile.name}" created!`, 'success');
  }

  static updateProfile(profileId, updatedData) {
    const idx = this.profiles.findIndex(p => p.id === profileId);
    if (idx === -1) return;

    this.profiles[idx] = { ...this.profiles[idx], ...updatedData };
    this.saveProfiles();

    if (this.activeProfileId === profileId) {
      this.syncWithAuthManager();
    }

    this.renderHeaderProfileSwitcher();
    this.renderProfilesView();

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Profile updated.', 'success');
  }

  static deleteProfile(profileId) {
    if (this.profiles.length <= 1) {
      NotificationManager.showToast('You must have at least one active profile.', 'warning');
      return;
    }

    const toDelete = this.profiles.find(p => p.id === profileId);
    if (toDelete && toDelete.isExecutive) {
      NotificationManager.showToast('Cannot delete the primary Executive profile.', 'warning');
      return;
    }

    this.profiles = this.profiles.filter(p => p.id !== profileId);
    if (this.activeProfileId === profileId) {
      this.activeProfileId = this.profiles[0].id;
    }

    this.saveProfiles();
    this.syncWithAuthManager();
    this.renderHeaderProfileSwitcher();
    this.renderProfilesView();

    NotificationManager.play8BitChime('gameover');
    NotificationManager.showToast('Profile removed.', 'info');
  }

  static saveProfiles() {
    StorageManager.set(STORAGE_KEYS.PROFILES || 'ionity_central_profiles_v1', this.profiles);
  }

  static handleAvatarUpload(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  static handleSignatureUpload(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  static toggleProfileSwitcherDropdown() {
    const dropdown = document.getElementById('header-profile-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('active');
      if (dropdown.classList.contains('active')) {
        this.renderHeaderProfileSwitcher();
      }
    }
  }

  static closeProfileSwitcherDropdown() {
    const dropdown = document.getElementById('header-profile-dropdown');
    if (dropdown) dropdown.classList.remove('active');
  }

  static renderHeaderProfileSwitcher() {
    const active = this.getActiveProfile();
    const avatarPill = document.getElementById('header-profile-avatar-pill');
    const namePill = document.getElementById('header-profile-name-pill');
    const dropdownList = document.getElementById('header-profile-dropdown-list');

    if (avatarPill) {
      if (active.avatar && (active.avatar.includes('/') || active.avatar.startsWith('http') || active.avatar.startsWith('data:'))) {
        avatarPill.innerHTML = `<img src="${active.avatar}" alt="${active.name}" onerror="this.parentElement.textContent='${active.name.charAt(0)}'">`;
      } else {
        avatarPill.textContent = active.name.charAt(0).toUpperCase();
      }
    }

    if (namePill) {
      namePill.textContent = active.name;
    }

    if (dropdownList) {
      dropdownList.innerHTML = this.profiles.map(p => `
        <div class="profile-dropdown-item ${p.id === this.activeProfileId ? 'active' : ''}" onclick="ProfilesManager.switchProfile('${p.id}')">
          <div class="profile-dropdown-avatar">
            ${p.avatar ? `<img src="${p.avatar}" alt="${p.name}" onerror="this.parentElement.textContent='${p.name.charAt(0)}'">` : p.name.charAt(0)}
          </div>
          <div class="profile-dropdown-meta">
            <div class="profile-dropdown-name">
              ${p.name}
              ${p.id === this.activeProfileId ? `<span class="pixel-badge" style="font-size:7px; padding:1px 4px; margin-left:4px;">ACTIVE</span>` : ''}
            </div>
            <div class="profile-dropdown-role">${p.role} • ${p.org}</div>
          </div>
        </div>
      `).join('') + `
        <div class="profile-dropdown-footer" style="display:flex; flex-direction:column; gap:6px;">
          <button class="btn btn-secondary" style="width:100%; font-size:11px; padding:6px;" onclick="ProfilesManager.openCreateProfileModal()">
            ${renderIcon('userAdd', '', 12)} Add / Manage Profiles
          </button>
          <button class="btn btn-secondary" style="width:100%; font-size:11px; padding:6px; color:var(--status-red); border-color:rgba(255,61,113,0.3);" onclick="AuthManager.logout()">
            🚪 Sign Out / Lock Gate
          </button>
        </div>
      `;
    }
  }

  static renderProfilesView() {
    const container = document.getElementById('profiles-hub-container');
    if (!container) return;

    const active = this.getActiveProfile();

    container.innerHTML = `
      <div class="profiles-hub-grid">
        <!-- Active Profile Showcase Hero -->
        <div class="profile-hero-card">
          <div class="profile-hero-header">
            <div class="profile-hero-avatar-wrap">
              <div class="profile-hero-avatar">
                ${active.avatar ? `<img src="${active.avatar}" alt="${active.name}">` : `<div style="font-size:32px; font-weight:800;">${active.name.charAt(0)}</div>`}
              </div>
              <div class="profile-hero-status-dot online" title="Profile Active"></div>
            </div>
            <div class="profile-hero-info">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span class="pixel-badge" style="color:var(--accent-hover); border-color:var(--accent-hover);">${active.provider || 'Ionity Identity'}</span>
                ${active.isExecutive ? `<span class="pixel-badge" style="color:var(--status-yellow); border-color:var(--status-yellow);">EXECUTIVE AUTHOR</span>` : ''}
              </div>
              <h2 style="font-size:22px; font-weight:800; margin-top:6px;">${active.name}</h2>
              <div style="color:var(--accent-hover); font-weight:600; font-size:13px;">${active.role} • ${active.org}</div>
              <div style="color:var(--text-muted); font-size:12px; margin-top:2px;">${active.email} • <a href="${active.website}" target="_blank" style="color:var(--accent-hover); text-decoration:none;">${active.website.replace('https://', '')} ↗</a></div>
            </div>
          </div>

          <p class="profile-hero-bio">${active.bio}</p>

          <!-- Executive Signature Stamp Card -->
          <div class="signature-card-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">Executive Digital Signature & Brand Stamp</span>
              <span class="pixel-badge" style="font-size:8px;">VERIFIED 256-BIT SHA</span>
            </div>
            <div class="signature-img-container">
              <img src="${active.signature}" alt="${active.name} Signature" class="signature-img" onerror="this.src='assets/Johanwilhelmvanantwerpesignatureionity.png'">
            </div>
          </div>

          <div style="display:flex; gap:10px; margin-top:16px;">
            <button class="btn btn-primary" onclick="ProfilesManager.openCreateProfileModal('${active.id}')">
              ${renderIcon('edit', '', 14)} Edit Profile Details
            </button>
            <button class="btn btn-secondary" onclick="ProfilesManager.openCreateProfileModal()">
              ${renderIcon('userAdd', '', 14)} Create New Profile
            </button>
          </div>
        </div>

        <!-- Profiles Directory Grid -->
        <div class="profiles-directory-panel">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div>
              <span class="pixel-badge">WORKSPACE DIRECTORY</span>
              <h3 style="font-size:16px; font-weight:800; margin-top:4px;">Available Profiles (${this.profiles.length})</h3>
            </div>
            <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px;" onclick="ProfilesManager.openCreateProfileModal()">
              ${renderIcon('plus', '', 12)} Add Profile
            </button>
          </div>

          <div class="profiles-cards-list">
            ${this.profiles.map(p => `
              <div class="profile-card-item ${p.id === this.activeProfileId ? 'active' : ''}">
                <div class="profile-card-left">
                  <div class="profile-card-avatar">
                    <img src="${p.avatar}" alt="${p.name}" onerror="this.parentElement.textContent='${p.name.charAt(0)}'">
                  </div>
                  <div>
                    <div style="font-weight:700; font-size:13px; display:flex; align-items:center; gap:6px;">
                      <span>${p.name}</span>
                      ${p.id === this.activeProfileId ? `<span class="pixel-badge" style="font-size:7px; padding:1px 4px;">ACTIVE</span>` : ''}
                    </div>
                    <div style="font-size:11px; color:var(--accent-hover);">${p.role}</div>
                    <div style="font-size:10px; color:var(--text-subtle);">${p.email}</div>
                  </div>
                </div>

                <div class="profile-card-actions">
                  ${p.id !== this.activeProfileId ? `
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="ProfilesManager.switchProfile('${p.id}')">
                      ${renderIcon('userSwitch', '', 12)} Switch
                    </button>
                  ` : `
                    <button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" disabled>
                      ${renderIcon('check', '', 12)} Selected
                    </button>
                  `}
                  <button class="btn-icon" style="padding:6px;" title="Edit Profile" onclick="ProfilesManager.openCreateProfileModal('${p.id}')">
                    ${renderIcon('edit', '', 13)}
                  </button>
                  ${!p.isExecutive ? `
                    <button class="btn-icon" style="padding:6px; color:var(--status-red);" title="Delete Profile" onclick="ProfilesManager.deleteProfile('${p.id}')">
                      ${renderIcon('trash', '', 13)}
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  static openCreateProfileModal(editProfileId = null) {
    App.openModal('modal-manage-profiles');
    this._editingProfileId = editProfileId;

    const modalTitle = document.getElementById('modal-profile-title');
    const nameInput = document.getElementById('prof-input-name');
    const roleInput = document.getElementById('prof-input-role');
    const orgInput = document.getElementById('prof-input-org');
    const emailInput = document.getElementById('prof-input-email');
    const bioInput = document.getElementById('prof-input-bio');
    const websiteInput = document.getElementById('prof-input-website');
    const avatarPreview = document.getElementById('prof-avatar-preview-img');
    const signaturePreview = document.getElementById('prof-signature-preview-img');

    if (editProfileId) {
      const p = this.profiles.find(x => x.id === editProfileId);
      if (p) {
        if (modalTitle) modalTitle.textContent = 'Edit Profile: ' + p.name;
        if (nameInput) nameInput.value = p.name || '';
        if (roleInput) roleInput.value = p.role || '';
        if (orgInput) orgInput.value = p.org || '';
        if (emailInput) emailInput.value = p.email || '';
        if (bioInput) bioInput.value = p.bio || '';
        if (websiteInput) websiteInput.value = p.website || '';
        if (avatarPreview) avatarPreview.src = p.avatar || 'assets/ionity-logo.png';
        if (signaturePreview) signaturePreview.src = p.signature || 'assets/Johanwilhelmvanantwerpesignatureionity.png';
        this._stagedAvatar = p.avatar;
        this._stagedSignature = p.signature;
        return;
      }
    }

    // New Profile mode
    if (modalTitle) modalTitle.textContent = 'Create New Workspace Profile';
    if (nameInput) nameInput.value = '';
    if (roleInput) roleInput.value = 'Engineer / Specialist';
    if (orgInput) orgInput.value = 'Ionity Global';
    if (emailInput) emailInput.value = '';
    if (bioInput) bioInput.value = '';
    if (websiteInput) websiteInput.value = 'https://www.ionity.today';
    if (avatarPreview) avatarPreview.src = 'assets/ionity-logo.png';
    if (signaturePreview) signaturePreview.src = 'assets/Johanwilhelmvanantwerpesignatureionity.png';
    this._stagedAvatar = 'assets/ionity-logo.png';
    this._stagedSignature = 'assets/Johanwilhelmvanantwerpesignatureionity.png';
  }

  static setStagedAvatarPreset(src) {
    this._stagedAvatar = src;
    const img = document.getElementById('prof-avatar-preview-img');
    if (img) img.src = src;
  }

  static setStagedSignaturePreset(src) {
    this._stagedSignature = src;
    const img = document.getElementById('prof-signature-preview-img');
    if (img) img.src = src;
  }

  static saveProfileFromModal() {
    const name = document.getElementById('prof-input-name')?.value?.trim();
    const role = document.getElementById('prof-input-role')?.value?.trim() || 'Team Member';
    const org = document.getElementById('prof-input-org')?.value?.trim() || 'Ionity Global';
    const email = document.getElementById('prof-input-email')?.value?.trim() || 'user@ionity.today';
    const bio = document.getElementById('prof-input-bio')?.value?.trim() || '';
    const website = document.getElementById('prof-input-website')?.value?.trim() || 'https://www.ionity.today';

    if (!name) {
      NotificationManager.showToast('Please enter a profile name.', 'warning');
      return;
    }

    const payload = {
      name,
      role,
      org,
      email,
      bio,
      website,
      avatar: this._stagedAvatar || 'assets/ionity-logo.png',
      signature: this._stagedSignature || 'assets/Johanwilhelmvanantwerpesignatureionity.png'
    };

    if (this._editingProfileId) {
      this.updateProfile(this._editingProfileId, payload);
    } else {
      this.createProfile(payload);
    }

    App.closeModal('modal-manage-profiles');
  }
}
