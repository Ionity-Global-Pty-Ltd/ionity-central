/**
 * IONITY CENTRAL - STORAGE & DATA PERSISTENCE
 * Handles state hydration, LocalStorage & IndexedDB fallbacks, export/import.
 */

const STORAGE_KEYS = {
  DOCS: 'ionity_central_docs_v1',
  CRM_DEALS: 'ionity_central_deals_v1',
  CRM_CONTACTS: 'ionity_central_contacts_v1',
  SCRUM_TASKS: 'ionity_central_tasks_v1',
  SCRUM_SPRINT: 'ionity_central_sprint_v1',
  AUTH: 'ionity_central_auth_v1',
  CONFIG: 'ionity_central_config_v1',
  NOTIFICATIONS: 'ionity_central_notifications_v1',
  PROFILES: 'ionity_central_profiles_v1',
  ACTIVE_PROFILE_ID: 'ionity_central_active_profile_v1',
  WATERMARK: 'ionity_central_watermark_v1',
  RECORDINGS: 'ionity_central_recordings_v1'
};

const DEFAULT_DOCS = [
  {
    id: 'doc-welcome',
    title: 'Welcome to Ionity Central',
    iconKey: 'logo',
    cover: 'linear-gradient(135deg, #1f2a44 0%, #0d1322 100%)',
    updatedAt: new Date().toISOString(),
    blocks: [
      { id: 'b1', type: 'h1', content: 'Ionity Central: Global Enterprise Workspace' },
      { id: 'b2', type: 'callout', iconKey: 'calloutBlock', content: '<b>Antwerp Designs & Ionity Global Architecture</b>: This unified system pairs the Unity dynamic block editor with an enterprise CRM pipeline and SCRUM sprint board. Powered by Google OAuth 2.0 and PWA multi-platform notifications.' },
      { id: 'b3', type: 'text', content: 'Use this workspace to organize team knowledge, brainstorm ideas, log technical specs, or track global client deliverables.' },
      { id: 'b4', type: 'h2', content: 'Quick Start Checklist' },
      { id: 'b5', type: 'todo', content: 'Connect Google OAuth 2.0 in the Auth Manager', checked: true },
      { id: 'b6', type: 'todo', content: 'Test cross-device push notifications via top bell icon', checked: false },
      { id: 'b7', type: 'todo', content: 'Explore the SCRUM Sprint Board and Story Points', checked: false },
      { id: 'b8', type: 'todo', content: 'Review CRM Deals pipeline and client contacts', checked: false },
      { id: 'b9', type: 'h2', content: 'Global Architecture Specs' },
      { id: 'b10', type: 'code', language: 'bash', content: '# Deploy Ionity Central on Google Cloud VM\ncurl -sSL https://get.ionity.today/setup.sh | bash\nsudo systemctl start ionity-central' },
      { id: 'b11', type: 'quote', content: '"Design with precision, structure with purpose." — Johan Wilhelm van Antwerp' }
    ]
  },
  {
    id: 'doc-roadmap',
    title: 'Ionity Global Product Roadmap',
    iconKey: 'scrum',
    cover: 'linear-gradient(135deg, #11293a 0%, #08111d 100%)',
    updatedAt: new Date().toISOString(),
    blocks: [
      { id: 'rm1', type: 'h1', content: '2026-2027 Engineering & Product Roadmap' },
      { id: 'rm2', type: 'text', content: 'Strategic initiatives spanning Ionity Webapp, Cloud Compute VM clusters, and multi-tenant authentication.' },
      { id: 'rm3', type: 'h2', content: 'Q3 Deliverables' },
      { id: 'rm4', type: 'todo', content: 'Google Cloud Compute Engine Nginx edge deployment', checked: true },
      { id: 'rm5', type: 'todo', content: 'Service Worker offline sync & IndexedDB background pipeline', checked: true },
      { id: 'rm6', type: 'todo', content: 'OAuth multi-identity bridge (Google, GitHub, Microsoft, Claude)', checked: true }
    ]
  }
];

const DEFAULT_DEALS = [
  {
    id: 'deal-1',
    title: 'Cloud Infrastructure Migration',
    company: 'Apex Digital Global',
    value: 48500,
    stage: 'paid',
    contact: 'Sarah Jenkins',
    email: 'sarah@apexdigital.com',
    probability: 100,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'deal-2',
    title: 'Enterprise Workspace Rollout',
    company: 'Vanguard Systems',
    value: 120000,
    stage: 'quoted',
    contact: 'Michael Vance',
    email: 'mvance@vanguard.io',
    probability: 60,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'deal-3',
    title: 'Ionity AI Integration Suite',
    company: 'Horizon Energy Corp',
    value: 75000,
    stage: 'paid',
    contact: 'Elena Rostova',
    email: 'elena@horizonenergy.com',
    probability: 100,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'deal-4',
    title: 'Security Audit & Auth Bridge',
    company: 'FinTech Secure Ltd',
    value: 32000,
    stage: 'followedup',
    contact: 'David Meyer',
    email: 'd.meyer@fintechsecure.de',
    probability: 75,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'deal-5',
    title: 'Custom PWA & Telemetry Setup',
    company: 'Metro Logistics',
    value: 19500,
    stage: 'checkin',
    contact: 'Amara Okafor',
    email: 'amara@metrologistics.co.za',
    probability: 25,
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_CONTACTS = [
  { id: 'c1', name: 'Sarah Jenkins', company: 'Apex Digital Global', email: 'sarah@apexdigital.com', phone: '+27 82 123 4567', status: 'Active Client' },
  { id: 'c2', name: 'Michael Vance', company: 'Vanguard Systems', email: 'mvance@vanguard.io', phone: '+1 415 892 0192', status: 'Quoted' },
  { id: 'c3', name: 'Elena Rostova', company: 'Horizon Energy Corp', email: 'elena@horizonenergy.com', phone: '+44 20 7946 0912', status: 'Paid Client' },
  { id: 'c4', name: 'David Meyer', company: 'FinTech Secure Ltd', email: 'd.meyer@fintechsecure.de', phone: '+49 30 2312 4490', status: 'Followed Up' },
  { id: 'c5', name: 'Amara Okafor', company: 'Metro Logistics', email: 'amara@metrologistics.co.za', phone: '+27 11 445 9900', status: 'Check-in' }
];

const DEFAULT_SCRUM_SPRINT = {
  id: 'sprint-42',
  name: 'Sprint 42: Global Scalability & OAuth 2.0',
  goal: 'Finalize PWA offline synchronization, Google OAuth 2.0 provider integration (@ionity.today domain lock), and GCP Compute Engine Always-Free VM.',
  startDate: '2026-08-15',
  endDate: '2026-08-29',
  velocityTarget: 35
};

const DEFAULT_TASKS = [
  { id: 'task-1', title: 'Implement Google OAuth 2.0 @ionity.today domain restriction', stage: 'done', points: 5, priority: 'urgent', epic: 'auth', assignee: 'Johan W.' },
  { id: 'task-2', title: 'Design 8-bit & modern dark structured workspace UI', stage: 'done', points: 8, priority: 'high', epic: 'crm', assignee: 'Antwerp Designs' },
  { id: 'task-3', title: 'Configure Firebase Hosting & 100% Always-Free GCP VM', stage: 'done', points: 5, priority: 'high', epic: 'gcp', assignee: 'DevOps' },
  { id: 'task-4', title: 'Live Cache AUC engine & token consumption optimization', stage: 'progress', points: 5, priority: 'urgent', epic: 'pwa', assignee: 'Lead Eng' },
  { id: 'task-5', title: 'Finance Check-in, Quoted, Followed Up & Paid automation', stage: 'progress', points: 5, priority: 'high', epic: 'crm', assignee: 'Cloud Arch' },
  { id: 'task-6', title: 'AI Executive Deal & Financial Proposal Generator', stage: 'todo', points: 5, priority: 'medium', epic: 'pwa', assignee: 'Frontend' },
  { id: 'task-7', title: 'Automated CSV export for CRM pipeline and Scrum velocity', stage: 'todo', points: 2, priority: 'low', epic: 'crm', assignee: 'Eng Team' }
];


const DEFAULT_CONFIG = {
  googleClientId: '',
  googleClientSecret: '',
  appName: 'Ionity Central',
  theme: 'dark-8bit',
  soundEnabled: true,
  notificationsEnabled: true,
  currency: 'USD ($)',
  vmIp: '34.120.45.89'
};

class StorageManager {
  static get(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  static initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.DOCS)) {
      this.set(STORAGE_KEYS.DOCS, DEFAULT_DOCS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CRM_DEALS)) {
      this.set(STORAGE_KEYS.CRM_DEALS, DEFAULT_DEALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CRM_CONTACTS)) {
      this.set(STORAGE_KEYS.CRM_CONTACTS, DEFAULT_CONTACTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCRUM_TASKS)) {
      this.set(STORAGE_KEYS.SCRUM_TASKS, DEFAULT_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCRUM_SPRINT)) {
      this.set(STORAGE_KEYS.SCRUM_SPRINT, DEFAULT_SCRUM_SPRINT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
      this.set(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
    }
  }

  static exportAll() {
    const data = {
      docs: this.get(STORAGE_KEYS.DOCS, []),
      deals: this.get(STORAGE_KEYS.CRM_DEALS, []),
      contacts: this.get(STORAGE_KEYS.CRM_CONTACTS, []),
      tasks: this.get(STORAGE_KEYS.SCRUM_TASKS, []),
      sprint: this.get(STORAGE_KEYS.SCRUM_SPRINT, {}),
      config: this.get(STORAGE_KEYS.CONFIG, {}),
      profiles: this.get(STORAGE_KEYS.PROFILES, []),
      activeProfileId: this.get(STORAGE_KEYS.ACTIVE_PROFILE_ID, 'profile-johan'),
      watermark: this.get(STORAGE_KEYS.WATERMARK, {}),
      recordings: this.get(STORAGE_KEYS.RECORDINGS, []),
      exportedAt: new Date().toISOString(),
      app: 'Ionity Central'
    };
    return JSON.stringify(data, null, 2);
  }

  static importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.docs) this.set(STORAGE_KEYS.DOCS, data.docs);
      if (data.deals) this.set(STORAGE_KEYS.CRM_DEALS, data.deals);
      if (data.contacts) this.set(STORAGE_KEYS.CRM_CONTACTS, data.contacts);
      if (data.tasks) this.set(STORAGE_KEYS.SCRUM_TASKS, data.tasks);
      if (data.sprint) this.set(STORAGE_KEYS.SCRUM_SPRINT, data.sprint);
      if (data.config) this.set(STORAGE_KEYS.CONFIG, { ...DEFAULT_CONFIG, ...data.config });
      if (data.profiles) this.set(STORAGE_KEYS.PROFILES, data.profiles);
      if (data.activeProfileId) this.set(STORAGE_KEYS.ACTIVE_PROFILE_ID, data.activeProfileId);
      if (data.watermark) this.set(STORAGE_KEYS.WATERMARK, data.watermark);
      if (data.recordings) this.set(STORAGE_KEYS.RECORDINGS, data.recordings);
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
      return false;
    }
  }
}

// Auto init defaults
StorageManager.initDefaults();
