/**
 * IONITY CENTRAL - GEMINI AI FREE-TIER SERVICE & CACHE AUC ENGINE
 * Integrates Google Gemini API (Google AI Studio Free Tier) with Cache AUC
 * (Active Universal Caching & Context Cache) for instant zero-token query reuse.
 * Author: Johan Wilhelm van Antwerp / Antwerp Designs / Ionity Global
 */

const GEMINI_STORAGE_KEYS = {
  CONFIG: 'ionity_gemini_config_v1',
  CACHE_AUC: 'ionity_gemini_cache_auc_v1',
  STATS: 'ionity_gemini_stats_v1'
};

const DEFAULT_GEMINI_CONFIG = {
  apiKey: '',
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxOutputTokens: 2048,
  cacheAucEnabled: true,
  systemInstruction: 'You are Ionity AI, an enterprise AI assistant architected by Antwerp Designs for Ionity Global. Respond clearly, concisely, and use structured markdown, code blocks, or tables.'
};

class GeminiService {
  static config = DEFAULT_GEMINI_CONFIG;
  static cache = {};
  static stats = { cacheHits: 0, cacheMisses: 0, tokensSaved: 0, queriesRun: 0 };

  static init() {
    console.log('🤖 Initializing Gemini AI Service & Cache AUC Engine...');
    this.config = StorageManager.get(GEMINI_STORAGE_KEYS.CONFIG, DEFAULT_GEMINI_CONFIG);
    this.cache = StorageManager.get(GEMINI_STORAGE_KEYS.CACHE_AUC, {});
    this.stats = StorageManager.get(GEMINI_STORAGE_KEYS.STATS, {
      cacheHits: 0,
      cacheMisses: 0,
      tokensSaved: 0,
      queriesRun: 0
    });
  }

  static getConfig() {
    return this.config;
  }

  static saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    StorageManager.set(GEMINI_STORAGE_KEYS.CONFIG, this.config);
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Gemini AI & Cache AUC settings saved!', 'success');
  }

  static getCacheKey(prompt, context = '') {
    const raw = `${this.config.model}::${this.config.systemInstruction}::${prompt.trim()}::${context.trim()}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `auc_${Math.abs(hash).toString(16)}`;
  }

  static async generateContent(prompt, context = '') {
    this.stats.queriesRun++;
    const cacheKey = this.getCacheKey(prompt, context);

    // 1. Check Cache AUC (Active Universal Cache)
    if (this.config.cacheAucEnabled && this.cache[cacheKey]) {
      const cached = this.cache[cacheKey];
      this.stats.cacheHits++;
      this.stats.tokensSaved += (cached.estimatedTokens || 120);
      StorageManager.set(GEMINI_STORAGE_KEYS.STATS, this.stats);

      console.log(`⚡ [Cache AUC Hit] Serving cached response for key: ${cacheKey}`);
      NotificationManager.play8BitChime('coin');
      NotificationManager.showToast(`⚡ Cache AUC Hit (0 Tokens Used • Instant 0ms)`, 'info');

      return {
        text: cached.text,
        isCached: true,
        cachedAt: cached.timestamp,
        tokensSaved: cached.estimatedTokens || 120
      };
    }

    // 2. Check if Local Tiny AI (In-Cache / Nano) is selected
    if (this.config.model === 'local-tiny-ai' || !this.config.apiKey.trim()) {
      if (window.LocalTinyAI) {
        const localResult = await LocalTinyAI.generateLocalResponse(prompt, context);
        this.stats.tokensSaved += (localResult.tokens || 80);
        StorageManager.set(GEMINI_STORAGE_KEYS.STATS, this.stats);

        NotificationManager.play8BitChime('coin');
        NotificationManager.showToast(`⚡ Local Tiny AI (${localResult.engine}) • 0 Tokens Used`, 'info');

        return {
          text: localResult.text,
          isCached: true,
          engine: localResult.engine,
          tokensSaved: localResult.tokens
        };
      }
    }

    // 3. Check Live Google Gemini API with Local RAG Enrichment
    const apiKey = this.config.apiKey.trim();
    this.stats.cacheMisses++;
    const modelName = this.config.model || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // Retrieve RAG Context
    let ragContext = '';
    if (window.LocalRAGService) {
      const ragHits = LocalRAGService.search(prompt, 2);
      if (ragHits.length > 0) {
        ragContext = `\n\n[Workspace Local RAG Knowledge Context]:\n` + ragHits.map(r => `• (${r.source}) ${r.title}: ${r.content.slice(0, 250)}`).join('\n');
      }
    }

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${context ? `Context / Workspace Document:\n${context}\n` : ''}${ragContext}\n\nTask / User Prompt:\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: this.config.temperature || 0.7,
        maxOutputTokens: this.config.maxOutputTokens || 2048
      }
    };

    if (this.config.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: this.config.systemInstruction }]
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
      const estimatedTokens = data.usageMetadata?.totalTokenCount || Math.ceil(generatedText.length / 4);

      // 4. Save to Cache AUC
      if (this.config.cacheAucEnabled) {
        this.cache[cacheKey] = {
          text: generatedText,
          timestamp: new Date().toISOString(),
          estimatedTokens: estimatedTokens
        };
        StorageManager.set(GEMINI_STORAGE_KEYS.CACHE_AUC, this.cache);
      }

      StorageManager.set(GEMINI_STORAGE_KEYS.STATS, this.stats);
      NotificationManager.play8BitChime('victory');

      return {
        text: generatedText,
        isCached: false,
        usage: data.usageMetadata
      };
    } catch (err) {
      console.error('Gemini API Error:', err);
      NotificationManager.showToast(`Gemini API Error: ${err.message}`, 'danger');
      throw err;
    }
  }

  static getSimulatedResponse(prompt) {
    if (prompt.toLowerCase().includes('spec') || prompt.toLowerCase().includes('architecture')) {
      return `### 🏛️ Antwerp Designs & Ionity Global Cloud Architecture Spec\n\n- **Compute Tier**: Google Cloud Compute Engine Always-Free \`e2-micro\` (2 vCPU, 1GB RAM + 2GB Swap) in \`us-central1-a\`.\n- **Storage Tier**: 30GB Standard Persistent Disk + 5GB Cloud Storage Bucket (\`gs://ionity-storage\`).\n- **Edge Network**: Firebase Hosting CDN with automated SSL on \`central.ionity.today\`.\n- **AI Engine**: Gemini 1.5 Flash with Cache AUC for 0ms token caching.`;
    }
    if (prompt.toLowerCase().includes('stories') || prompt.toLowerCase().includes('scrum')) {
      return `### ⚡ Sprint User Stories (Gherkin Format)\n\n1. **[AUTH-01] Google OAuth 2.0 Integration**\n   - **Given** an unauthenticated workspace visitor\n   - **When** they click "Continue with Google"\n   - **Then** authenticate via Google Identity Services and hydrate active profile.\n\n2. **[CLOUD-02] Cache AUC Prompt Acceleration**\n   - **Given** repeated workspace document analysis queries\n   - **When** the query hash matches Cache AUC store\n   - **Then** return 0ms cached response with 0 token consumption.`;
    }
    return `### 🤖 Ionity AI Assistant\nGenerated response for: "${prompt}". Configure your free Google AI Studio key in Preferences / Gemini Settings to unlock live streaming generative intelligence.`;
  }

  static clearCacheAuc() {
    this.cache = {};
    StorageManager.set(GEMINI_STORAGE_KEYS.CACHE_AUC, {});
    this.stats.cacheHits = 0;
    this.stats.tokensSaved = 0;
    StorageManager.set(GEMINI_STORAGE_KEYS.STATS, this.stats);
    NotificationManager.play8BitChime('laser');
    NotificationManager.showToast('Cache AUC storage cleared!', 'success');
  }

  static openConfigModal() {
    NotificationManager.play8BitChime('click');
    const modal = document.getElementById('modal-gemini-config');
    if (modal) {
      const keyInput = document.getElementById('gemini-cfg-api-key');
      const modelSelect = document.getElementById('gemini-cfg-model');
      const cacheToggle = document.getElementById('gemini-cfg-cache-auc');
      const hitStat = document.getElementById('gemini-stat-hits');
      const savedStat = document.getElementById('gemini-stat-tokens');

      if (keyInput) keyInput.value = this.config.apiKey || '';
      if (modelSelect) modelSelect.value = this.config.model || 'gemini-1.5-flash';
      if (cacheToggle) cacheToggle.checked = this.config.cacheAucEnabled !== false;
      if (hitStat) hitStat.textContent = this.stats.cacheHits;
      if (savedStat) savedStat.textContent = `${this.stats.tokensSaved.toLocaleString()} tokens`;

      App.openModal('modal-gemini-config');
    }
  }

  static saveModalConfig() {
    const key = (document.getElementById('gemini-cfg-api-key')?.value || '').trim();
    const model = document.getElementById('gemini-cfg-model')?.value || 'gemini-1.5-flash';
    const cacheEnabled = document.getElementById('gemini-cfg-cache-auc')?.checked;

    this.saveConfig({
      apiKey: key,
      model: model,
      cacheAucEnabled: cacheEnabled
    });

    App.closeModal('modal-gemini-config');
  }

  static async testApiKey() {
    const key = (document.getElementById('gemini-cfg-api-key')?.value || this.config.apiKey || '').trim();
    if (!key) {
      NotificationManager.showToast('Please enter a Google AI Studio Gemini API Key first.', 'warning');
      return;
    }

    NotificationManager.showToast('Testing Gemini API Key with Google AI Studio...', 'info');
    try {
      const tempConfig = { ...this.config, apiKey: key };
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello, verify Gemini free tier connection.' }] }]
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      NotificationManager.play8BitChime('victory');
      NotificationManager.showToast('✅ Gemini API Key is valid and active (Free Tier)!', 'success');
    } catch (e) {
      NotificationManager.showToast(`❌ Connection failed: ${e.message}`, 'danger');
    }
  }
}
