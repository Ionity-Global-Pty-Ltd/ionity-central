/**
 * IONITY CENTRAL - CRM 2.0 (PIPELINE, DEALS, FINANCIAL FORECAST & CONTACTS)
 * Features interactive Deal Inspector modal, probability-weighted revenue forecasting,
 * dynamic SVG revenue telemetry chart, contact CRUD management, and CSV export.
 */

class CRMManager {
  static init() {
    this.deals = StorageManager.get(STORAGE_KEYS.CRM_DEALS, []);
    this.contacts = StorageManager.get(STORAGE_KEYS.CRM_CONTACTS, []);
    this.currentView = 'pipeline';
    this.filterQuery = '';
    this.activeDealId = null;

    this.renderStats();
    this.renderPipeline();
    this.renderContactsTable();
    this.renderForecastChart();
    this.setupDragAndDrop();
  }

  static normalizeStage(stage) {
    if (stage === 'lead' || stage === 'checkin') return 'checkin';
    if (stage === 'contacted' || stage === 'proposal' || stage === 'quoted') return 'quoted';
    if (stage === 'negotiation' || stage === 'followedup') return 'followedup';
    if (stage === 'won' || stage === 'paid') return 'paid';
    return stage;
  }

  static renderStats() {
    const totalPipeline = this.deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const paidTotal = this.deals.filter(d => this.normalizeStage(d.stage) === 'paid').reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const inFollowup = this.deals.filter(d => this.normalizeStage(d.stage) === 'followedup').reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    
    // Probability-weighted revenue forecast = sum of (deal.value * deal.probability / 100)
    const weightedForecast = this.deals.reduce((sum, d) => sum + ((Number(d.value) || 0) * (Number(d.probability) || 50) / 100), 0);
    const winRate = this.deals.length > 0 ? Math.round((this.deals.filter(d => this.normalizeStage(d.stage) === 'paid').length / this.deals.length) * 100) : 0;

    const elTotal = document.getElementById('crm-stat-total-pipeline');
    const elWon = document.getElementById('crm-stat-won');
    const elNeg = document.getElementById('crm-stat-negotiation');
    const elWinRate = document.getElementById('crm-stat-winrate');
    const elForecast = document.getElementById('crm-stat-weighted-forecast');
    const navCount = document.getElementById('nav-crm-count');

    if (navCount) navCount.textContent = this.deals.length;
    if (elTotal) elTotal.textContent = `$${totalPipeline.toLocaleString()}`;
    if (elWon) elWon.textContent = `$${paidTotal.toLocaleString()}`;
    if (elNeg) elNeg.textContent = `$${inFollowup.toLocaleString()}`;
    if (elWinRate) elWinRate.textContent = `${winRate}%`;
    if (elForecast) elForecast.textContent = `$${Math.round(weightedForecast).toLocaleString()}`;

    this.renderForecastChart();
  }

  static renderForecastChart() {
    const chartContainer = document.getElementById('crm-forecast-chart-container');
    if (!chartContainer) return;

    const stages = [
      { id: 'checkin', label: 'Check-in', prob: '25%' },
      { id: 'quoted', label: 'Quoted', prob: '50%' },
      { id: 'followedup', label: 'Followed Up', prob: '75%' },
      { id: 'paid', label: 'Paid', prob: '100%' }
    ];

    const maxVal = Math.max(...stages.map(s => {
      const stageDeals = this.deals.filter(d => this.normalizeStage(d.stage) === s.id);
      return stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    }), 100000);

    chartContainer.innerHTML = `
      <div class="forecast-bars-grid">
        ${stages.map(s => {
          const stageDeals = this.deals.filter(d => this.normalizeStage(d.stage) === s.id);
          const totalVal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
          const weightedVal = stageDeals.reduce((sum, d) => sum + ((Number(d.value) || 0) * (Number(d.probability) || 50) / 100), 0);
          const heightPercent = Math.max(Math.round((totalVal / maxVal) * 100), 4);
          const weightedPercent = Math.max(Math.round((weightedVal / maxVal) * 100), 2);

          return `
            <div class="forecast-bar-col">
              <div class="forecast-bar-val">$${(totalVal / 1000).toFixed(0)}k</div>
              <div class="forecast-bar-track">
                <div class="forecast-bar-fill total" style="height: ${heightPercent}%;" title="Total: $${totalVal.toLocaleString()}"></div>
                <div class="forecast-bar-fill weighted" style="height: ${weightedPercent}%;" title="Weighted: $${Math.round(weightedVal).toLocaleString()}"></div>
              </div>
              <div class="forecast-bar-label">${s.label}</div>
              <div class="forecast-bar-prob">${s.prob}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  static filterDeals(query) {
    this.filterQuery = (query || '').toLowerCase().trim();
    this.renderPipeline();
  }

  static renderPipeline() {
    const stages = ['checkin', 'quoted', 'followedup', 'paid', 'lead', 'contacted', 'proposal', 'negotiation', 'won'];

    stages.forEach(stage => {
      const container = document.getElementById(`crm-stage-${stage}`);
      const countEl = document.getElementById(`crm-count-${stage}`);
      const totalEl = document.getElementById(`crm-total-${stage}`);

      if (!container) return;

      let stageDeals = this.deals.filter(d => {
        const norm = this.normalizeStage(d.stage);
        return norm === stage || d.stage === stage;
      });

      if (this.filterQuery) {
        stageDeals = stageDeals.filter(d => 
          (d.title || '').toLowerCase().includes(this.filterQuery) || 
          (d.company || '').toLowerCase().includes(this.filterQuery) ||
          (d.contact || '').toLowerCase().includes(this.filterQuery)
        );
      }

      const stageSum = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

      if (countEl) countEl.textContent = stageDeals.length;
      if (totalEl) totalEl.textContent = `$${stageSum.toLocaleString()}`;

      container.innerHTML = stageDeals.map(deal => {
        const normStage = this.normalizeStage(deal.stage);
        return `
          <div class="deal-card" draggable="true" data-deal-id="${deal.id}" 
               ondragstart="CRMManager.handleDragStart(event, '${deal.id}')"
               onclick="CRMManager.openDealInspector('${deal.id}')">
            <div class="deal-card-header">
              <span class="deal-company">${deal.company || 'Enterprise Corp'}</span>
              <span class="deal-value-tag">$${Number(deal.value).toLocaleString()}</span>
            </div>
            <div class="deal-title">${deal.title}</div>
            <div class="deal-footer">
              <div class="deal-contact">${renderIcon('user', '', 12)} ${deal.contact || 'Direct Client'}</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size: 10px; font-weight: 700; color: var(--accent-hover);">${deal.probability || 50}% Prob</span>
                ${normStage !== 'paid' ? `
                  <button class="btn-icon" style="padding:2px 6px; font-size:10px; background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:4px;" title="Advance Stage" onclick="CRMManager.moveDealNextStage(event, '${deal.id}')">➔</button>
                ` : `<span style="font-size:10px; color:var(--status-green); font-weight:bold;">🏆 WON</span>`}
              </div>
            </div>
            <div class="deal-probability-bar">
              <div class="deal-probability-fill" style="width: ${deal.probability || 50}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    });
  }

  static moveDealNextStage(event, dealId) {
    if (event) event.stopPropagation();
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;
    const stageFlow = ['checkin', 'quoted', 'followedup', 'paid'];
    const currentNorm = this.normalizeStage(deal.stage);
    const currentIndex = stageFlow.indexOf(currentNorm);
    if (currentIndex >= 0 && currentIndex < stageFlow.length - 1) {
      const nextStage = stageFlow[currentIndex + 1];
      this.moveDealStage(dealId, nextStage);
    }
  }

  static handleDragStart(event, dealId) {
    event.dataTransfer.setData('text/plain', dealId);
    event.dataTransfer.effectAllowed = 'move';
  }

  static setupDragAndDrop() {
    const stages = ['checkin', 'quoted', 'followedup', 'paid', 'lead', 'contacted', 'proposal', 'negotiation', 'won'];

    stages.forEach(stage => {
      const container = document.getElementById(`crm-stage-${stage}`);
      if (!container) return;

      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
      });

      container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        const dealId = e.dataTransfer.getData('text/plain');
        CRMManager.moveDealStage(dealId, stage);
      });
    });
  }

  static moveDealStage(dealId, newStage) {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;

    deal.stage = newStage;
    if (newStage === 'paid' || newStage === 'won') deal.probability = 100;
    if (newStage === 'followedup' || newStage === 'negotiation') deal.probability = 75;
    if (newStage === 'quoted' || newStage === 'proposal') deal.probability = 50;
    if (newStage === 'checkin' || newStage === 'lead') deal.probability = 25;

    StorageManager.set(STORAGE_KEYS.CRM_DEALS, this.deals);
    this.renderStats();
    this.renderPipeline();

    if (newStage === 'paid' || newStage === 'won') {
      NotificationManager.play8BitChime('victory');
    } else {
      NotificationManager.play8BitChime('coin');
    }

    NotificationManager.sendPushAlert({
      title: '💰 Finance & Deal Stage Updated',
      body: `"${deal.title}" moved to ${newStage.toUpperCase()} ($${Number(deal.value).toLocaleString()}).`,
      type: (newStage === 'paid' || newStage === 'won') ? 'success' : 'info'
    });
  }

  /* Deal Inspector & Full Modal Editor */
  static openDealInspector(dealId) {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) return;

    this.activeDealId = dealId;
    NotificationManager.play8BitChime('click');

    const modal = document.getElementById('modal-deal-inspector');
    if (!modal) return;

    document.getElementById('insp-deal-title').value = deal.title || '';
    document.getElementById('insp-deal-company').value = deal.company || '';
    document.getElementById('insp-deal-value').value = deal.value || 0;
    document.getElementById('insp-deal-stage').value = deal.stage || 'lead';
    document.getElementById('insp-deal-probability').value = deal.probability || 50;
    document.getElementById('insp-prob-val').textContent = `${deal.probability || 50}%`;
    document.getElementById('insp-deal-contact').value = deal.contact || '';
    document.getElementById('insp-deal-email').value = deal.email || '';
    document.getElementById('insp-deal-notes').value = deal.notes || '';

    App.openModal('modal-deal-inspector');
  }

  static updateProbSlider(value) {
    const display = document.getElementById('insp-prob-val');
    if (display) display.textContent = `${value}%`;

    const valInput = document.getElementById('insp-deal-value');
    const weightedDisplay = document.getElementById('insp-weighted-calc');
    if (valInput && weightedDisplay) {
      const val = Number(valInput.value) || 0;
      const weighted = Math.round(val * (Number(value) / 100));
      weightedDisplay.textContent = `Forecast: $${weighted.toLocaleString()}`;
    }
  }

  static saveDealInspector() {
    if (!this.activeDealId) return;
    const deal = this.deals.find(d => d.id === this.activeDealId);
    if (!deal) return;

    deal.title = document.getElementById('insp-deal-title').value.trim() || 'Untitled Opportunity';
    deal.company = document.getElementById('insp-deal-company').value.trim() || 'Global Client';
    deal.value = Number(document.getElementById('insp-deal-value').value) || 10000;
    deal.stage = document.getElementById('insp-deal-stage').value;
    deal.probability = Number(document.getElementById('insp-deal-probability').value) || 50;
    deal.contact = document.getElementById('insp-deal-contact').value.trim();
    deal.email = document.getElementById('insp-deal-email').value.trim();
    deal.notes = document.getElementById('insp-deal-notes').value.trim();
    deal.updatedAt = new Date().toISOString();

    StorageManager.set(STORAGE_KEYS.CRM_DEALS, this.deals);
    this.renderStats();
    this.renderPipeline();
    App.closeModal('modal-deal-inspector');

    NotificationManager.play8BitChime('powerup');
    NotificationManager.showToast('Deal updated successfully.', 'success');
  }

  static deleteActiveDeal() {
    if (!this.activeDealId) return;

    this.deals = this.deals.filter(d => d.id !== this.activeDealId);
    StorageManager.set(STORAGE_KEYS.CRM_DEALS, this.deals);
    this.renderStats();
    this.renderPipeline();
    App.closeModal('modal-deal-inspector');

    NotificationManager.play8BitChime('click');
    NotificationManager.showToast('Deal removed from pipeline.', 'info');
  }

  static duplicateActiveDeal() {
    if (!this.activeDealId) return;
    const orig = this.deals.find(d => d.id === this.activeDealId);
    if (!orig) return;

    const copy = JSON.parse(JSON.stringify(orig));
    copy.id = 'deal-' + Date.now();
    copy.title = `${orig.title} (Copy)`;
    copy.updatedAt = new Date().toISOString();

    this.deals.unshift(copy);
    StorageManager.set(STORAGE_KEYS.CRM_DEALS, this.deals);
    this.renderStats();
    this.renderPipeline();
    App.closeModal('modal-deal-inspector');

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Deal duplicated.', 'success');
  }

  static addNewDeal(title, company, value, stage, contact, email, probability) {
    const newDeal = {
      id: 'deal-' + Date.now(),
      title: title || 'New Opportunity',
      company: company || 'Global Client',
      value: Number(value) || 10000,
      stage: stage || 'lead',
      contact: contact || 'Key Contact',
      email: email || '',
      probability: Number(probability) || 50,
      notes: '',
      updatedAt: new Date().toISOString()
    };

    this.deals.unshift(newDeal);
    StorageManager.set(STORAGE_KEYS.CRM_DEALS, this.deals);
    this.renderStats();
    this.renderPipeline();

    if (contact && !this.contacts.find(c => c.name.toLowerCase() === contact.toLowerCase())) {
      this.contacts.unshift({
        id: 'c_' + Date.now(),
        name: contact,
        company: company,
        email: email,
        phone: '+27 (0) 10 000 0000',
        status: 'Active Deal'
      });
      StorageManager.set(STORAGE_KEYS.CRM_CONTACTS, this.contacts);
      this.renderContactsTable();
    }

    NotificationManager.play8BitChime('coin');
    NotificationManager.sendPushAlert({
      title: 'New CRM Deal Added',
      body: `${company} - ${title} ($${Number(value).toLocaleString()})`,
      type: 'success'
    });
  }

  /* Contact Directory Management */
  static filterContacts(query) {
    const q = (query || '').toLowerCase().trim();
    const filtered = this.contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.company.toLowerCase().includes(q) || 
      c.email.toLowerCase().includes(q)
    );
    this.renderContactsTable(filtered);
  }

  static renderContactsTable(list = null) {
    const tbody = document.getElementById('crm-contacts-tbody');
    if (!tbody) return;

    const dataset = list || this.contacts;

    if (dataset.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--text-muted);">No contacts found. Click "+ Add Contact" to create one.</td></tr>`;
      return;
    }

    tbody.innerHTML = dataset.map(c => `
      <tr>
        <td style="font-weight: 700; display:flex; align-items:center; gap:8px;">
          ${renderIcon('user', '', 14)} ${c.name}
        </td>
        <td><span class="pixel-badge" style="font-size: 8px;">${c.company}</span></td>
        <td><a href="mailto:${c.email}" style="color: var(--accent-hover); text-decoration: none;">${c.email}</a></td>
        <td style="font-family: var(--font-mono); font-size: 12px;">${c.phone || '-'}</td>
        <td><span class="auth-provider-badge">${c.status || 'Active'}</span></td>
        <td style="text-align:right;">
          <button class="tree-item-btn" title="Delete contact" onclick="CRMManager.deleteContact('${c.id}')">
            ${renderIcon('trash', '', 13)}
          </button>
        </td>
      </tr>
    `).join('');
  }

  static addNewContact(name, company, email, phone, status) {
    const newContact = {
      id: 'c_' + Date.now(),
      name: name || 'New Lead',
      company: company || 'Enterprise Corp',
      email: email || 'lead@enterprise.com',
      phone: phone || '+27 11 000 0000',
      status: status || 'Lead'
    };

    this.contacts.unshift(newContact);
    StorageManager.set(STORAGE_KEYS.CRM_CONTACTS, this.contacts);
    this.renderContactsTable();

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast(`Contact "${name}" added.`, 'success');
  }

  static deleteContact(id) {
    this.contacts = this.contacts.filter(c => c.id !== id);
    StorageManager.set(STORAGE_KEYS.CRM_CONTACTS, this.contacts);
    this.renderContactsTable();
    NotificationManager.play8BitChime('click');
    NotificationManager.showToast('Contact removed.', 'info');
  }

  static exportCSV() {
    const headers = ['Deal ID', 'Title', 'Company', 'Value (USD)', 'Stage', 'Contact', 'Probability (%)', 'Weighted Value (USD)', 'Notes', 'Updated'];
    const rows = this.deals.map(d => [
      d.id,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      `"${(d.company || '').replace(/"/g, '""')}"`,
      d.value || 0,
      d.stage,
      `"${(d.contact || '').replace(/"/g, '""')}"`,
      d.probability || 50,
      Math.round((d.value || 0) * (d.probability || 50) / 100),
      `"${(d.notes || '').replace(/"/g, '""')}"`,
      d.updatedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ionity_CRM_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('CRM Deals exported to CSV.', 'success');
  }

  static switchView(view) {
    this.currentView = view;
    const pipeEl = document.getElementById('crm-pipeline-view-container');
    const contEl = document.getElementById('crm-contacts-view-container');
    const tabPipe = document.getElementById('crm-tab-pipeline');
    const tabCont = document.getElementById('crm-tab-contacts');

    NotificationManager.play8BitChime('click');

    if (view === 'pipeline') {
      if (pipeEl) pipeEl.style.display = 'grid';
      if (contEl) contEl.style.display = 'none';
      if (tabPipe) tabPipe.classList.add('active');
      if (tabCont) tabCont.classList.remove('active');
    } else {
      if (pipeEl) pipeEl.style.display = 'none';
      if (contEl) contEl.style.display = 'block';
      if (tabPipe) tabPipe.classList.remove('active');
      if (tabCont) tabCont.classList.add('active');
    }
  }
}

