/**
 * IONITY CENTRAL - UNITY 2.0 WORKSPACE & BLOCK EDITOR
 * Rich block engine with dynamic tables, focus timers, retro soundboards, code execution simulation,
 * block reordering (up/down/duplicate), cover gallery, and Markdown import/export.
 */

class WorkspaceManager {
  static init() {
    this.docs = StorageManager.get(STORAGE_KEYS.DOCS, []);
    this.activeDocId = this.docs.length > 0 ? this.docs[0].id : null;
    this.activeBlockIndex = null;
    this.activeTimers = {}; // Store active countdown timer intervals

    this.renderDocTree();
    if (this.activeDocId) {
      this.loadDoc(this.activeDocId);
    }
  }

  static getActiveDoc() {
    return this.docs.find(d => d.id === this.activeDocId);
  }

  static renderDocTree() {
    const list = document.getElementById('workspace-doc-tree-list');
    const navCount = document.getElementById('nav-docs-count');
    if (navCount) navCount.textContent = this.docs.length;
    if (!list) return;

    list.innerHTML = this.docs.map(doc => `
      <li class="tree-item ${doc.id === this.activeDocId ? 'active' : ''}" onclick="WorkspaceManager.loadDoc('${doc.id}')">
        <span class="tree-item-icon">${renderIcon(doc.iconKey || 'workspace', '', 16)}</span>
        <span class="tree-item-title">${doc.title || 'Untitled Document'}</span>
        <div class="tree-item-actions">
          <button class="tree-item-btn" title="Duplicate Document" onclick="event.stopPropagation(); WorkspaceManager.duplicateDoc('${doc.id}')">
            ${renderIcon('copy', '', 13)}
          </button>
          <button class="tree-item-btn" title="Delete Document" onclick="event.stopPropagation(); WorkspaceManager.deleteDoc('${doc.id}')">
            ${renderIcon('trash', '', 13)}
          </button>
        </div>
      </li>
    `).join('');
  }

  static createNewDoc(title = 'New Strategy Document', iconKey = 'workspace') {
    const newDoc = {
      id: 'doc-' + Date.now(),
      title,
      iconKey,
      cover: 'linear-gradient(135deg, #1f2a44 0%, #0d1322 100%)',
      updatedAt: new Date().toISOString(),
      blocks: [
        { id: 'b_' + Math.random(), type: 'h1', content: title },
        { id: 'b_' + Math.random(), type: 'callout', iconKey: 'calloutBlock', content: '<b>Ionity Document</b>: Start typing or type <code>/</code> for block commands (Headings, Checklists, Code, Callouts, Tables, Focus Timers, 8-Bit Soundboards).' },
        { id: 'b_' + Math.random(), type: 'text', content: 'Outline your project scope, company milestones, or API integrations here.' }
      ]
    };

    this.docs.unshift(newDoc);
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.activeDocId = newDoc.id;
    this.renderDocTree();
    this.loadDoc(newDoc.id);

    NotificationManager.play8BitChime('coin');
    NotificationManager.sendPushAlert({
      title: 'New Document Created',
      body: `"${title}" has been initialized in Ionity Central.`,
      type: 'info'
    });
  }

  static duplicateDoc(id) {
    const orig = this.docs.find(d => d.id === id);
    if (!orig) return;

    const copyDoc = JSON.parse(JSON.stringify(orig));
    copyDoc.id = 'doc-' + Date.now();
    copyDoc.title = `${orig.title} (Copy)`;
    copyDoc.updatedAt = new Date().toISOString();

    this.docs.unshift(copyDoc);
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.activeDocId = copyDoc.id;
    this.renderDocTree();
    this.loadDoc(copyDoc.id);

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Document duplicated successfully!', 'success');
  }

  static deleteDoc(id) {
    if (this.docs.length <= 1) {
      NotificationManager.showToast('You must keep at least one workspace document.', 'info');
      return;
    }

    this.docs = this.docs.filter(d => d.id !== id);
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);

    if (this.activeDocId === id) {
      this.activeDocId = this.docs[0].id;
    }

    this.renderDocTree();
    this.loadDoc(this.activeDocId);
    NotificationManager.showToast('Document deleted.', 'info');
  }

  static loadDoc(id) {
    this.activeDocId = id;
    const doc = this.getActiveDoc();
    if (!doc) return;

    this.renderDocTree();

    const titleInput = document.getElementById('doc-title-input');
    const iconBtn = document.getElementById('doc-icon-btn');
    const metaDate = document.getElementById('doc-meta-date');
    const coverContainer = document.getElementById('doc-cover-container');

    if (titleInput) titleInput.value = doc.title;
    if (iconBtn) iconBtn.innerHTML = renderIcon(doc.iconKey || 'workspace', '', 28);
    if (metaDate) metaDate.textContent = `Updated ${new Date(doc.updatedAt).toLocaleDateString()} ${new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (coverContainer && doc.cover) coverContainer.style.background = doc.cover;

    this.renderBlocks();
  }

  static updateDocTitle(newTitle) {
    const doc = this.getActiveDoc();
    if (doc) {
      doc.title = newTitle;
      doc.updatedAt = new Date().toISOString();
      StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
      this.renderDocTree();
    }
  }

  static changeDocIcon() {
    const availableIcons = ['workspace', 'crm', 'scrum', 'auth', 'gcp', 'settings', 'logo', 'codeBlock', 'aiBlock', 'calloutBlock', 'tableBlock', 'timerBlock', 'soundboardBlock'];
    const current = this.getActiveDoc();
    if (!current) return;

    const currentIdx = availableIcons.indexOf(current.iconKey || 'workspace');
    const nextIcon = availableIcons[(currentIdx + 1) % availableIcons.length];
    current.iconKey = nextIcon;
    current.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderDocTree();
    this.loadDoc(current.id);
    NotificationManager.play8BitChime('click');
  }

  static openCoverPicker() {
    App.openModal('modal-cover-picker');
  }

  static selectCoverGradient(gradient) {
    const doc = this.getActiveDoc();
    if (!doc) return;

    doc.cover = gradient;
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);

    const coverContainer = document.getElementById('doc-cover-container');
    if (coverContainer) coverContainer.style.background = gradient;

    App.closeModal('modal-cover-picker');
    NotificationManager.play8BitChime('powerup');
    NotificationManager.showToast('Cover updated!', 'success');
  }

  static renderBlocks() {
    const container = document.getElementById('doc-editor-blocks');
    if (!container) return;

    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks) return;

    container.innerHTML = doc.blocks.map((block, index) => this.renderBlockHTML(block, index)).join('');
  }

  static renderBlockHTML(block, index) {
    let contentHtml = '';

    switch (block.type) {
      case 'h1':
        contentHtml = `<div class="block-content-area block-h1" contenteditable="true" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>`;
        break;
      case 'h2':
        contentHtml = `<div class="block-content-area block-h2" contenteditable="true" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>`;
        break;
      case 'h3':
        contentHtml = `<div class="block-content-area block-h3" contenteditable="true" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>`;
        break;
      case 'todo':
        contentHtml = `
          <div class="block-todo" style="width: 100%;">
            <input type="checkbox" class="todo-checkbox" ${block.checked ? 'checked' : ''} onchange="WorkspaceManager.toggleTodo(${index}, this.checked)">
            <div class="block-content-area todo-text ${block.checked ? 'checked' : ''}" contenteditable="true" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>
          </div>
        `;
        break;
      case 'callout':
        contentHtml = `
          <div class="block-callout" style="width: 100%;">
            <div class="callout-icon" style="color: var(--accent-primary);">${renderIcon('calloutBlock', '', 20)}</div>
            <div class="block-content-area" contenteditable="true" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>
          </div>
        `;
        break;
      case 'quote':
        contentHtml = `<div class="block-content-area block-quote" contenteditable="true" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>`;
        break;
      case 'code':
        contentHtml = `
          <div class="block-code" style="width: 100%;">
            <div class="code-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:flex; align-items:center; gap:6px;">${renderIcon('codeBlock', '', 14)}</span>
                <select class="code-lang-select" onchange="WorkspaceManager.updateCodeLanguage(${index}, this.value)">
                  <option value="typescript" ${block.language === 'typescript' ? 'selected' : ''}>TypeScript</option>
                  <option value="javascript" ${block.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
                  <option value="python" ${block.language === 'python' ? 'selected' : ''}>Python</option>
                  <option value="bash" ${block.language === 'bash' ? 'selected' : ''}>Bash / Shell</option>
                  <option value="json" ${block.language === 'json' ? 'selected' : ''}>JSON</option>
                  <option value="sql" ${block.language === 'sql' ? 'selected' : ''}>SQL</option>
                  <option value="html" ${block.language === 'html' ? 'selected' : ''}>HTML</option>
                </select>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="WorkspaceManager.runCodeBlock(${index})">▶ Run Snippet</button>
                <button class="btn btn-secondary" style="padding: 2px 8px; font-size: 11px; display:flex; align-items:center; gap:4px;" onclick="WorkspaceManager.copyCodeBlock(${index})">${renderIcon('copy', '', 12)} Copy</button>
              </div>
            </div>
            <div class="block-content-area code-content-editor" contenteditable="true" style="font-family: var(--font-mono); white-space: pre-wrap;" onblur="WorkspaceManager.updateBlockContent(${index}, this.innerText)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>
            <div id="code-output-${index}" class="code-output-console" style="display:${block.output ? 'block' : 'none'};">
              <div class="code-output-title">OUTPUT PREVIEW:</div>
              <pre class="code-output-text">${block.output || ''}</pre>
            </div>
          </div>
        `;
        break;
      case 'table':
        const table = block.tableData || {
          headers: ['Phase', 'Deliverable', 'Owner', 'Status'],
          rows: [
            ['Q3 2026', 'Google OAuth 2.0 & Cloud VM Hub', 'Johan Wilhelm van Antwerp', 'DONE'],
            ['Q4 2026', 'Global Multi-Tenant Edge Scaling', 'Ionity Global', 'IN PROGRESS']
          ]
        };

        contentHtml = `
          <div class="block-table-wrapper" style="width:100%;">
            <div class="table-toolbar">
              <span style="font-size:11px; font-weight:700; color:var(--text-muted); display:flex; align-items:center; gap:6px;">
                ${renderIcon('tableBlock', '', 14)} Dynamic Structured Table
              </span>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="WorkspaceManager.addTableRow(${index})">+ Add Row</button>
                <button class="btn btn-secondary" style="padding:2px 8px; font-size:10px;" onclick="WorkspaceManager.addTableColumn(${index})">+ Add Column</button>
              </div>
            </div>
            <div style="overflow-x:auto;">
              <table class="block-table">
                <thead>
                  <tr>
                    ${table.headers.map((h, cIdx) => `
                      <th contenteditable="true" onblur="WorkspaceManager.updateTableHeader(${index}, ${cIdx}, this.innerText)">
                        ${h}
                      </th>
                    `).join('')}
                    <th style="width: 40px; text-align:center;">✕</th>
                  </tr>
                </thead>
                <tbody>
                  ${table.rows.map((row, rIdx) => `
                    <tr>
                      ${row.map((cell, cIdx) => `
                        <td contenteditable="true" onblur="WorkspaceManager.updateTableCell(${index}, ${rIdx}, ${cIdx}, this.innerText)">
                          ${cell}
                        </td>
                      `).join('')}
                      <td style="text-align:center;">
                        <button class="table-del-row-btn" title="Delete row" onclick="WorkspaceManager.deleteTableRow(${index}, ${rIdx})">✕</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;

      case 'timer':
        const timerData = block.timerData || { minutes: 25, seconds: 0, initial: 25, isRunning: false };
        const minStr = String(timerData.minutes).padStart(2, '0');
        const secStr = String(timerData.seconds).padStart(2, '0');

        contentHtml = `
          <div class="block-focus-timer">
            <div class="timer-header">
              <span class="pixel-badge" style="font-size: 8px;">8-BIT FOCUS SPRINT TIMER</span>
              <span style="font-size: 11px; color: var(--text-muted);">Deep Work & Agile Tasks</span>
            </div>
            <div class="timer-display-wrap">
              <div class="timer-digits font-8bit" id="timer-display-${index}">${minStr}:${secStr}</div>
              <div class="timer-controls">
                <button class="btn btn-primary" onclick="WorkspaceManager.toggleTimer(${index})">
                  ${timerData.isRunning ? '⏸ Pause' : '▶ Start Focus'}
                </button>
                <button class="btn btn-secondary" onclick="WorkspaceManager.resetTimer(${index}, 25)">25m Work</button>
                <button class="btn btn-secondary" onclick="WorkspaceManager.resetTimer(${index}, 5)">5m Break</button>
              </div>
            </div>
          </div>
        `;
        break;

      case 'soundboard':
        contentHtml = `
          <div class="block-soundboard">
            <div class="soundboard-header">
              <span class="pixel-badge">8-BIT SYNTHESIZER SOUNDBOARD</span>
              <span style="font-size: 11px; color: var(--text-muted);">Interactive Web Audio Sound Effects</span>
            </div>
            <div class="soundboard-grid">
              <button class="sound-chip-btn" onclick="NotificationManager.play8BitChime('coin')">
                <span>🪙 Coin Chime</span>
              </button>
              <button class="sound-chip-btn" onclick="NotificationManager.play8BitChime('powerup')">
                <span>⚡ Power Up</span>
              </button>
              <button class="sound-chip-btn" onclick="NotificationManager.play8BitChime('laser')">
                <span>🔫 Laser Blast</span>
              </button>
              <button class="sound-chip-btn" onclick="NotificationManager.play8BitChime('jump')">
                <span>🦘 Jump Boing</span>
              </button>
              <button class="sound-chip-btn" onclick="NotificationManager.play8BitChime('victory')">
                <span>🏆 Victory Fanfare</span>
              </button>
              <button class="sound-chip-btn" onclick="NotificationManager.play8BitChime('gameover')">
                <span>💀 Game Over</span>
              </button>
            </div>
          </div>
        `;
        break;

      case 'video':
        const videoTitle = block.title || 'Screen Recording / Video Demo';
        const videoDuration = block.duration || '00:00';
        const videoAuthor = block.author || (window.ProfilesManager ? ProfilesManager.getActiveProfile().name : 'Johan Wilhelm van Antwerp');
        contentHtml = `
          <div class="block-video-container" style="width:100%;">
            <div class="video-block-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="color:var(--accent-hover);">${renderIcon('videoBlock', '', 16)}</span>
                <span style="font-weight:700; font-size:13px;" contenteditable="true" onblur="WorkspaceManager.updateBlockTitle(${index}, this.innerText)">${videoTitle}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="pixel-badge" style="font-size:8px;">${videoDuration}</span>
                <span class="pixel-badge" style="font-size:8px; color:var(--status-green); border-color:var(--status-green);">WATERMARKED</span>
                <a href="${block.url}" download="Ionity_Capture.webm" class="btn btn-secondary" style="padding:2px 8px; font-size:10px; text-decoration:none;" title="Download Video">
                  ${renderIcon('download', '', 11)} Download
                </a>
              </div>
            </div>
            <div class="video-player-wrap">
              <video src="${block.url}" controls playsinline preload="metadata" class="embedded-block-video" poster="${block.thumbnail || 'assets/AEDi-AntwerpDesigns-Ionityglobal.png'}"></video>
            </div>
            <div class="video-block-footer">
              <span style="font-size:11px; color:var(--text-muted);">Recorded by: <b style="color:var(--text-main);">${videoAuthor}</b> • Antwerp Designs Video Studio</span>
              <span style="font-size:10px; color:var(--text-subtle);">${new Date(block.timestamp || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        `;
        break;

      case 'divider':
        contentHtml = `<div class="block-divider"></div>`;
        break;
      case 'text':
      default:
        contentHtml = `<div class="block-content-area block-text" contenteditable="true" placeholder="Type '/' for commands..." onblur="WorkspaceManager.updateBlockContent(${index}, this.innerHTML)" onkeydown="WorkspaceManager.handleBlockKey(event, ${index})">${block.content}</div>`;
        break;
    }

    return `
      <div class="notion-block" data-index="${index}">
        <div class="block-handle">
          <button class="block-handle-btn" title="Add block below" onclick="WorkspaceManager.showSlashMenu(${index}, event)">${renderIcon('plus', '', 13)}</button>
          <button class="block-handle-btn" title="Move Up" onclick="WorkspaceManager.moveBlockUp(${index})">${renderIcon('moveUp', '', 13)}</button>
          <button class="block-handle-btn" title="Move Down" onclick="WorkspaceManager.moveBlockDown(${index})">${renderIcon('moveDown', '', 13)}</button>
          <button class="block-handle-btn" title="Duplicate Block" onclick="WorkspaceManager.duplicateBlock(${index})">${renderIcon('copy', '', 13)}</button>
          <button class="block-handle-btn" title="Delete block" onclick="WorkspaceManager.deleteBlock(${index})">${renderIcon('trash', '', 13)}</button>
        </div>
        ${contentHtml}
      </div>
    `;
  }

  static updateBlockContent(index, content) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;

    doc.blocks[index].content = content;
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
  }

  static updateBlockTitle(index, title) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;

    doc.blocks[index].title = title;
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
  }

  static toggleTodo(index, checked) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;

    doc.blocks[index].checked = checked;
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();

    if (checked) {
      NotificationManager.play8BitChime('coin');
    }
  }

  static updateCodeLanguage(index, lang) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;

    doc.blocks[index].language = lang;
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
  }

  static runCodeBlock(index) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;

    const block = doc.blocks[index];
    NotificationManager.play8BitChime('click');

    const outputEl = document.getElementById(`code-output-${index}`);
    if (outputEl) {
      outputEl.style.display = 'block';
      const textEl = outputEl.querySelector('.code-output-text');
      if (textEl) textEl.textContent = '⚡ Running in simulated Ionity runtime environment...';
    }

    setTimeout(() => {
      let result = '';
      if (block.language === 'bash') {
        result = `[ionity-central:vm-01]$ exec\nSUCCESS: Cloud configuration executed. Output: 200 OK`;
      } else if (block.language === 'json') {
        result = `Valid JSON structure verified. Parsed 12 keys.`;
      } else if (block.language === 'python') {
        result = `Python 3.11.8 (Ionity Cloud Engine)\n>>> Code compiled with 0 errors. Process returned 0.`;
      } else {
        result = `[V8 Runtime] Compiled & Executed in 4.2ms\nOutput: { status: 'authenticated', provider: 'google_oauth_2.0', active: true }`;
      }

      block.output = result;
      StorageManager.set(STORAGE_KEYS.DOCS, this.docs);

      if (outputEl) {
        const textEl = outputEl.querySelector('.code-output-text');
        if (textEl) textEl.textContent = result;
      }
      NotificationManager.play8BitChime('powerup');
    }, 450);
  }

  /* Dynamic Table Block Handlers */
  static addTableRow(blockIndex) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex]) return;

    const block = doc.blocks[blockIndex];
    if (!block.tableData) {
      block.tableData = {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [['Data 1', 'Data 2', 'Data 3']]
      };
    }

    const colCount = block.tableData.headers.length;
    const newRow = Array(colCount).fill('New Entry');
    block.tableData.rows.push(newRow);

    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  static deleteTableRow(blockIndex, rowIndex) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex] || !doc.blocks[blockIndex].tableData) return;

    const block = doc.blocks[blockIndex];
    if (block.tableData.rows.length <= 1) {
      NotificationManager.showToast('Table must have at least one row.', 'info');
      return;
    }

    block.tableData.rows.splice(rowIndex, 1);
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  static addTableColumn(blockIndex) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex]) return;

    const block = doc.blocks[blockIndex];
    if (!block.tableData) return;

    const newColNum = block.tableData.headers.length + 1;
    block.tableData.headers.push(`Column ${newColNum}`);
    block.tableData.rows.forEach(r => r.push('Value'));

    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  static updateTableHeader(blockIndex, colIndex, value) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex] || !doc.blocks[blockIndex].tableData) return;

    doc.blocks[blockIndex].tableData.headers[colIndex] = value.trim();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
  }

  static updateTableCell(blockIndex, rowIndex, colIndex, value) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex] || !doc.blocks[blockIndex].tableData) return;

    doc.blocks[blockIndex].tableData.rows[rowIndex][colIndex] = value.trim();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
  }

  /* Pomodoro / Focus Timer Handlers */
  static toggleTimer(blockIndex) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex]) return;

    const block = doc.blocks[blockIndex];
    if (!block.timerData) {
      block.timerData = { minutes: 25, seconds: 0, initial: 25, isRunning: false };
    }

    if (block.timerData.isRunning) {
      // Pause
      clearInterval(this.activeTimers[blockIndex]);
      delete this.activeTimers[blockIndex];
      block.timerData.isRunning = false;
      NotificationManager.play8BitChime('click');
    } else {
      // Start
      block.timerData.isRunning = true;
      NotificationManager.play8BitChime('powerup');

      this.activeTimers[blockIndex] = setInterval(() => {
        if (block.timerData.seconds > 0) {
          block.timerData.seconds--;
        } else if (block.timerData.minutes > 0) {
          block.timerData.minutes--;
          block.timerData.seconds = 59;
        } else {
          // Finished!
          clearInterval(this.activeTimers[blockIndex]);
          delete this.activeTimers[blockIndex];
          block.timerData.isRunning = false;
          NotificationManager.play8BitChime('victory');
          NotificationManager.sendPushAlert({
            title: '⏰ Sprint Focus Timer Completed',
            body: 'Focus session finished! Take a 5-minute breather or celebrate progress.',
            type: 'success'
          });
        }

        const display = document.getElementById(`timer-display-${blockIndex}`);
        if (display) {
          display.textContent = `${String(block.timerData.minutes).padStart(2, '0')}:${String(block.timerData.seconds).padStart(2, '0')}`;
        }
      }, 1000);
    }

    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
  }

  static resetTimer(blockIndex, minutes = 25) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[blockIndex]) return;

    if (this.activeTimers[blockIndex]) {
      clearInterval(this.activeTimers[blockIndex]);
      delete this.activeTimers[blockIndex];
    }

    doc.blocks[blockIndex].timerData = {
      minutes: minutes,
      seconds: 0,
      initial: minutes,
      isRunning: false
    };

    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  /* Block Reordering & Modification */
  static moveBlockUp(index) {
    const doc = this.getActiveDoc();
    if (!doc || index <= 0) return;

    const temp = doc.blocks[index];
    doc.blocks[index] = doc.blocks[index - 1];
    doc.blocks[index - 1] = temp;

    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  static moveBlockDown(index) {
    const doc = this.getActiveDoc();
    if (!doc || index >= doc.blocks.length - 1) return;

    const temp = doc.blocks[index];
    doc.blocks[index] = doc.blocks[index + 1];
    doc.blocks[index + 1] = temp;

    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  static duplicateBlock(index) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;

    const clone = JSON.parse(JSON.stringify(doc.blocks[index]));
    clone.id = 'b_' + Date.now() + Math.random().toString(36).substr(2, 4);

    doc.blocks.splice(index + 1, 0, clone);
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Block duplicated.', 'success');
  }

  static handleBlockKey(event, index) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.insertBlock(index + 1, 'text', '');
    } else if (event.key === 'Backspace' && event.target.innerText.trim() === '') {
      const doc = this.getActiveDoc();
      if (doc && doc.blocks.length > 1) {
        event.preventDefault();
        this.deleteBlock(index);
      }
    } else if (event.key === '/') {
      const rect = event.target.getBoundingClientRect();
      this.showSlashMenuAt(index, rect.left, rect.bottom + window.scrollY);
    }
  }

  static insertBlock(index, type = 'text', content = '', extraData = {}) {
    const doc = this.getActiveDoc();
    if (!doc) return;

    const newBlock = {
      id: 'b_' + Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      content,
      checked: false,
      iconKey: type === 'callout' ? 'calloutBlock' : undefined,
      language: type === 'code' ? 'typescript' : undefined,
      url: extraData.url || (type === 'video' ? 'assets/ionity-card-electric.gif' : undefined),
      title: extraData.title || (type === 'video' ? 'Screen Recording / Video Walkthrough' : undefined),
      duration: extraData.duration || (type === 'video' ? '01:24' : undefined),
      author: extraData.author || (window.ProfilesManager ? ProfilesManager.getActiveProfile().name : 'Johan Wilhelm van Antwerp'),
      thumbnail: extraData.thumbnail || 'assets/AEDi-AntwerpDesigns-Ionityglobal.png',
      timestamp: extraData.timestamp || new Date().toISOString(),
      tableData: type === 'table' ? {
        headers: ['Sprint Item', 'Lead Developer', 'Priority', 'Status'],
        rows: [
          ['OAuth 2.0 Identity Hub', 'Johan W.', 'Urgent', 'VERIFIED'],
          ['PWA Cross-Device Push', 'Antwerp Designs', 'High', 'ACTIVE']
        ]
      } : undefined,
      timerData: type === 'timer' ? { minutes: 25, seconds: 0, initial: 25, isRunning: false } : undefined
    };

    doc.blocks.splice(index, 0, newBlock);
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();

    setTimeout(() => {
      const blockEl = document.querySelector(`.notion-block[data-index="${index}"] .block-content-area`);
      if (blockEl) blockEl.focus();
    }, 50);
  }

  static insertVideoBlock(url, title = 'Screen Recording Demo', duration = '00:00') {
    const doc = this.getActiveDoc();
    if (!doc) return;
    this.insertBlock(doc.blocks.length, 'video', '', {
      url,
      title,
      duration,
      author: window.ProfilesManager ? ProfilesManager.getActiveProfile().name : 'Johan Wilhelm van Antwerp',
      timestamp: new Date().toISOString()
    });
  }

  static deleteBlock(index) {
    const doc = this.getActiveDoc();
    if (!doc || doc.blocks.length <= 1) return;

    doc.blocks.splice(index, 1);
    doc.updatedAt = new Date().toISOString();
    StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
    this.renderBlocks();
    NotificationManager.play8BitChime('click');
  }

  static showSlashMenu(index, event) {
    const rect = event.target.getBoundingClientRect();
    this.showSlashMenuAt(index, rect.left, rect.bottom);
  }

  static showSlashMenuAt(index, x, y) {
    this.activeBlockIndex = index;
    const menu = document.getElementById('slash-command-menu');
    if (!menu) return;

    menu.style.left = `${Math.min(x, window.innerWidth - 300)}px`;
    menu.style.top = `${Math.min(y, window.innerHeight - 380)}px`;
    menu.classList.add('active');
  }

  static hideSlashMenu() {
    const menu = document.getElementById('slash-command-menu');
    if (menu) menu.classList.remove('active');
  }

  static selectSlashType(type) {
    this.hideSlashMenu();
    if (this.activeBlockIndex !== null) {
      this.insertBlock(this.activeBlockIndex + 1, type, '');
    }
  }

  static copyCodeBlock(index) {
    const doc = this.getActiveDoc();
    if (!doc || !doc.blocks[index]) return;
    navigator.clipboard.writeText(doc.blocks[index].content);
    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Code copied to clipboard!', 'success');
  }

  static triggerAiAssistant() {
    App.openModal('modal-ai-assist');
  }

  static async executeAiPrompt(promptType, customPrompt = '') {
    const doc = this.getActiveDoc();
    if (!doc) return;

    App.closeModal('modal-ai-assist');
    NotificationManager.showToast('🤖 Gemini AI & Cache AUC processing prompt...', 'info');

    let prompt = '';
    if (promptType === 'architecture' || promptType === 'spec') {
      prompt = 'Generate an Enterprise Cloud Architecture specification for Ionity Central detailing the GCP Always-Free e2-micro VM, 30GB disk, 5GB Cloud Storage, and Firebase Hosting.';
    } else if (promptType === 'scrum' || promptType === 'stories') {
      prompt = 'Generate 4 agile SCRUM user stories in Gherkin format (Feature, Scenario, Given, When, Then) for Ionity Central cloud and auth features.';
    } else if (promptType === 'finance') {
      prompt = 'Generate a professional commercial quote & financial milestone breakdown (Check-in, Quoted, Followed Up, Paid) with deliverables, SLA, and ROI analysis for Antwerp Designs.';
    } else if (promptType === 'debrief') {
      prompt = 'Extract 4 actionable engineering and CRM tasks with assignees and story points from this workspace document.';
    } else if (promptType === 'table') {
      prompt = 'Generate a dynamic comparison table of Cloud Hosting SLA and cost tiers.';
    } else if (promptType === 'pomodoro' || promptType === 'timer') {
      this.insertBlock(doc.blocks.length, 'timer', '');
      this.insertBlock(doc.blocks.length, 'todo', 'Focus sprint: Review Firebase & GCP Cloud VM infrastructure', false);
      NotificationManager.play8BitChime('victory');
      return;
    } else if (customPrompt) {
      prompt = customPrompt;
    } else {
      prompt = 'Summarize key deliverables and next steps for Antwerp Designs workspace.';
    }

    try {
      const result = await GeminiService.generateContent(prompt, doc.title);
      const isCached = result.isCached;
      const badge = isCached ? '<span class="pixel-badge" style="font-size:8px; color:var(--status-green); border-color:var(--status-green);">⚡ CACHE AUC HIT</span> ' : '';

      this.insertBlock(doc.blocks.length, 'callout', `${badge}<b>⚡ Gemini AI (${GeminiService.config.model})</b>:\n\n${result.text.replace(/\n/g, '<br>')}`);
      
      NotificationManager.play8BitChime('victory');
      NotificationManager.sendPushAlert({
        title: isCached ? '⚡ Gemini Cache AUC Response' : '🤖 Gemini AI Response Injected',
        body: isCached ? 'Served instantly from Local Cache AUC (0 tokens).' : 'Generated via Google AI Studio Gemini API.',
        type: 'success'
      });
    } catch (err) {
      this.insertBlock(doc.blocks.length, 'callout', `<b>⚠️ Gemini AI Note</b>: ${err.message}. Configure your free API key in Gemini Settings.`);
    }
  }


  static exportMarkdown() {
    const doc = this.getActiveDoc();
    if (!doc) return;

    let md = `# ${doc.title}\n\n`;
    doc.blocks.forEach(b => {
      if (b.type === 'h1') md += `# ${b.content}\n\n`;
      else if (b.type === 'h2') md += `## ${b.content}\n\n`;
      else if (b.type === 'h3') md += `### ${b.content}\n\n`;
      else if (b.type === 'todo') md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
      else if (b.type === 'code') md += `\`\`\`${b.language || 'text'}\n${b.content}\n\`\`\`\n\n`;
      else if (b.type === 'quote') md += `> ${b.content}\n\n`;
      else if (b.type === 'callout') md += `> **Note**: ${b.content}\n\n`;
      else if (b.type === 'table' && b.tableData) {
        md += `| ${b.tableData.headers.join(' | ')} |\n`;
        md += `| ${b.tableData.headers.map(() => '---').join(' | ')} |\n`;
        b.tableData.rows.forEach(r => {
          md += `| ${r.join(' | ')} |\n`;
        });
        md += '\n';
      }
      else md += `${b.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    NotificationManager.play8BitChime('coin');
    NotificationManager.showToast('Exported document as Markdown.', 'success');
  }

  static triggerMarkdownImport() {
    const input = document.getElementById('markdown-import-file-input');
    if (input) input.click();
  }

  static handleMarkdownFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const docTitle = file.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ');

      const blocks = [];
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('# ')) {
          blocks.push({ id: 'b_' + Math.random(), type: 'h1', content: trimmed.substring(2) });
        } else if (trimmed.startsWith('## ')) {
          blocks.push({ id: 'b_' + Math.random(), type: 'h2', content: trimmed.substring(3) });
        } else if (trimmed.startsWith('### ')) {
          blocks.push({ id: 'b_' + Math.random(), type: 'h3', content: trimmed.substring(4) });
        } else if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('* [ ] ')) {
          blocks.push({ id: 'b_' + Math.random(), type: 'todo', content: trimmed.substring(6), checked: false });
        } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('* [x] ')) {
          blocks.push({ id: 'b_' + Math.random(), type: 'todo', content: trimmed.substring(6), checked: true });
        } else if (trimmed.startsWith('> ')) {
          blocks.push({ id: 'b_' + Math.random(), type: 'quote', content: trimmed.substring(2) });
        } else {
          blocks.push({ id: 'b_' + Math.random(), type: 'text', content: trimmed });
        }
      });

      if (blocks.length === 0) {
        blocks.push({ id: 'b_1', type: 'h1', content: docTitle });
        blocks.push({ id: 'b_2', type: 'text', content: 'Empty document imported.' });
      }

      const newDoc = {
        id: 'doc-' + Date.now(),
        title: docTitle,
        iconKey: 'workspace',
        cover: 'linear-gradient(135deg, #1f2a44 0%, #0d1322 100%)',
        updatedAt: new Date().toISOString(),
        blocks
      };

      this.docs.unshift(newDoc);
      StorageManager.set(STORAGE_KEYS.DOCS, this.docs);
      this.activeDocId = newDoc.id;
      this.renderDocTree();
      this.loadDoc(newDoc.id);

      NotificationManager.play8BitChime('victory');
      NotificationManager.showToast(`Imported "${docTitle}" as Unity document.`, 'success');
    };
    reader.readAsText(file);
  }
}

