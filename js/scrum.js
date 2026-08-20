/**
 * IONITY CENTRAL - SCRUM 2.0 (SPRINT BOARD, STORY INSPECTOR & BURNDOWN CHART)
 * Dynamic SVG Burndown chart, Fibonacci point selector, Task Inspector modal,
 * Epic filters, and Sprint Completion victory celebration.
 */

class ScrumManager {
  static init() {
    this.tasks = StorageManager.get(STORAGE_KEYS.SCRUM_TASKS, []);
    this.sprint = StorageManager.get(STORAGE_KEYS.SCRUM_SPRINT, {
      id: 'sprint-42',
      name: 'Sprint 42: Global Scalability & OAuth 2.0',
      goal: 'Finalize PWA offline synchronization, Google OAuth 2.0 provider integration, and GCP Compute Engine VM deployment template.',
      startDate: '2026-08-15',
      endDate: '2026-08-29',
      velocityTarget: 35
    });
    this.selectedEpic = 'all';
    this.activeTaskId = null;

    this.renderSprintHeader();
    this.renderBoard();
    this.renderBurndownChart();
    this.setupScrumDragAndDrop();
  }

  static renderSprintHeader() {
    const titleEl = document.getElementById('scrum-sprint-title');
    const goalEl = document.getElementById('scrum-sprint-goal');
    const totalPtsEl = document.getElementById('scrum-total-points');
    const donePtsEl = document.getElementById('scrum-done-points');
    const velocityEl = document.getElementById('scrum-velocity-rate');
    const progressBar = document.getElementById('scrum-sprint-progress-fill');
    const navCount = document.getElementById('nav-scrum-count');

    const totalPts = this.tasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const donePts = this.tasks.filter(t => t.stage === 'done').reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const percent = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;

    if (navCount) navCount.textContent = this.tasks.length;
    if (titleEl) titleEl.textContent = this.sprint.name;
    if (goalEl) goalEl.textContent = this.sprint.goal;
    if (totalPtsEl) totalPtsEl.textContent = `${totalPts} pts`;
    if (donePtsEl) donePtsEl.textContent = `${donePts} pts`;
    if (velocityEl) velocityEl.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;

    this.renderBurndownChart();
  }

  static renderBurndownChart() {
    const chartWrap = document.getElementById('scrum-burndown-chart-wrap');
    if (!chartWrap) return;

    const totalPts = this.tasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0) || 30;
    const donePts = this.tasks.filter(t => t.stage === 'done').reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const remainingPts = totalPts - donePts;

    // 14-day sprint points curve
    const days = [
      { d: 'D1', ideal: totalPts, actual: totalPts },
      { d: 'D3', ideal: Math.round(totalPts * 0.85), actual: Math.max(totalPts - 5, remainingPts) },
      { d: 'D6', ideal: Math.round(totalPts * 0.65), actual: Math.max(totalPts - 10, remainingPts) },
      { d: 'D9', ideal: Math.round(totalPts * 0.40), actual: Math.max(totalPts - 13, remainingPts) },
      { d: 'D12', ideal: Math.round(totalPts * 0.18), actual: remainingPts },
      { d: 'D14', ideal: 0, actual: remainingPts }
    ];

    const maxP = totalPts + 5;
    const svgWidth = 500;
    const svgHeight = 140;
    const padding = 30;
    const graphWidth = svgWidth - padding * 2;
    const graphHeight = svgHeight - padding * 2;

    const getX = (idx) => padding + (idx / (days.length - 1)) * graphWidth;
    const getY = (val) => padding + (1 - (val / maxP)) * graphHeight;

    const idealPoints = days.map((d, i) => `${getX(i)},${getY(d.ideal)}`).join(' ');
    const actualPoints = days.map((d, i) => `${getX(i)},${getY(d.actual)}`).join(' ');
    const areaPoints = `${getX(0)},${getY(0)} ${actualPoints} ${getX(days.length - 1)},${getY(0)}`;

    chartWrap.innerHTML = `
      <div class="burndown-card">
        <div class="burndown-header">
          <div>
            <span class="pixel-badge" style="font-size: 8px; color:var(--accent-hover); border-color:var(--accent-primary);">⚡ INTERACTIVE BURNDOWN</span>
            <div style="font-weight: 800; font-size: 13.5px; margin-top: 4px; letter-spacing:-0.2px;">Sprint 42 Velocity & Burndown Trajectory</div>
          </div>
          <div style="display:flex; gap:16px; font-size:11px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:12px; height:2px; background:var(--text-subtle); border-top: 2px dashed var(--text-subtle);"></span>
              <span>Ideal Guideline</span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:12px; height:3px; background:var(--accent-primary); box-shadow:0 0 6px var(--accent-primary);"></span>
              <span>Actual Burn (${remainingPts} pts remaining)</span>
            </div>
          </div>
        </div>
        <div style="width: 100%; overflow-x: auto;">
          <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; max-height: 140px; overflow: visible;">
            <defs>
              <linearGradient id="scrumBurnArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#3366FF" stop-opacity="0.45" />
                <stop offset="100%" stop-color="#3366FF" stop-opacity="0.0" />
              </linearGradient>
              <filter id="scrumGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- Grid lines -->
            <line x1="${padding}" y1="${getY(0)}" x2="${svgWidth - padding}" y2="${getY(0)}" stroke="#333333" stroke-width="1" />
            <line x1="${padding}" y1="${getY(totalPts/2)}" x2="${svgWidth - padding}" y2="${getY(totalPts/2)}" stroke="#282828" stroke-dasharray="4" stroke-width="1" />
            <line x1="${padding}" y1="${getY(totalPts)}" x2="${svgWidth - padding}" y2="${getY(totalPts)}" stroke="#282828" stroke-dasharray="4" stroke-width="1" />

            <!-- Area under actual curve -->
            <polygon fill="url(#scrumBurnArea)" points="${areaPoints}" />

            <!-- Ideal line -->
            <polyline fill="none" stroke="#666666" stroke-width="2" stroke-dasharray="6,4" points="${idealPoints}" />

            <!-- Actual line -->
            <polyline fill="none" stroke="var(--accent-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#scrumGlow)" points="${actualPoints}" />

            <!-- Actual Data Point Dots -->
            ${days.map((d, i) => `
              <circle cx="${getX(i)}" cy="${getY(d.actual)}" r="4.5" fill="var(--accent-hover)" stroke="#FFFFFF" stroke-width="2" style="filter: drop-shadow(0 0 6px var(--accent-primary)); cursor: pointer;">
                <title>${d.d}: ${d.actual} pts remaining</title>
              </circle>
              <text x="${getX(i)}" y="${svgHeight - 8}" text-anchor="middle" fill="var(--text-muted)" font-size="10.5" font-family="var(--font-mono)" font-weight="700">${d.d}</text>
            `).join('')}
          </svg>
        </div>
      </div>
    `;
  }

  static filterByEpic(epicKey) {
    this.selectedEpic = epicKey;
    NotificationManager.play8BitChime('click');

    document.querySelectorAll('.scrum-epic-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-epic') === epicKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderBoard();
  }

  static renderBoard() {
    const stages = ['todo', 'progress', 'review', 'done'];

    stages.forEach(stage => {
      const col = document.getElementById(`scrum-col-${stage}`);
      const countEl = document.getElementById(`scrum-count-${stage}`);
      if (!col) return;

      let stageTasks = this.tasks.filter(t => t.stage === stage);
      if (this.selectedEpic !== 'all') {
        stageTasks = stageTasks.filter(t => t.epic === this.selectedEpic);
      }

      if (countEl) countEl.textContent = stageTasks.length;

      col.innerHTML = stageTasks.map(task => `
        <div class="scrum-task-card" draggable="true" data-task-id="${task.id}" 
             ondragstart="ScrumManager.handleDragStart(event, '${task.id}')"
             onclick="ScrumManager.openTaskInspector('${task.id}')">
          <div class="task-card-meta">
            <span class="epic-badge ${task.epic || 'pwa'}">${task.epic ? task.epic.toUpperCase() : 'TASK'}</span>
            <span class="task-priority-tag ${task.priority || 'medium'}">${task.priority ? task.priority.toUpperCase() : 'MED'}</span>
          </div>
          <div class="task-card-title">${task.title}</div>
          <div class="task-card-footer">
            <div class="task-assignee">
              <div class="task-assignee-avatar">${(task.assignee || 'U').charAt(0)}</div>
              <span>${task.assignee || 'Unassigned'}</span>
            </div>
            <span class="task-points-badge font-8bit">${task.points || 1} PTS</span>
          </div>
        </div>
      `).join('');
    });
  }

  static handleDragStart(event, taskId) {
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }

  static setupScrumDragAndDrop() {
    const stages = ['todo', 'progress', 'review', 'done'];

    stages.forEach(stage => {
      const col = document.getElementById(`scrum-col-${stage}`);
      if (!col) return;

      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        ScrumManager.moveTaskStage(taskId, stage);
      });
    });
  }

  static moveTaskStage(taskId, newStage) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.stage === newStage) return;

    task.stage = newStage;
    StorageManager.set(STORAGE_KEYS.SCRUM_TASKS, this.tasks);
    this.renderSprintHeader();
    this.renderBoard();

    if (newStage === 'done') {
      NotificationManager.play8BitChime('victory');
      NotificationManager.sendPushAlert({
        title: '🏆 Scrum Story Completed',
        body: `"${task.title}" marked as DONE (+${task.points} pts).`,
        type: 'success'
      });
    } else {
      NotificationManager.play8BitChime('coin');
      NotificationManager.sendPushAlert({
        title: 'Task Status Updated',
        body: `"${task.title}" moved to ${newStage.toUpperCase()}.`,
        type: 'info'
      });
    }
  }

  /* Task Inspector & Full Modal Editor */
  static openTaskInspector(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.activeTaskId = taskId;
    NotificationManager.play8BitChime('click');

    const modal = document.getElementById('modal-task-inspector');
    if (!modal) return;

    document.getElementById('insp-task-title').value = task.title || '';
    document.getElementById('insp-task-desc').value = task.desc || '';
    document.getElementById('insp-task-points').value = task.points || 3;
    document.getElementById('insp-task-priority').value = task.priority || 'medium';
    document.getElementById('insp-task-epic').value = task.epic || 'pwa';
    document.getElementById('insp-task-assignee').value = task.assignee || 'Johan W.';
    document.getElementById('insp-task-stage').value = task.stage || 'todo';

    App.openModal('modal-task-inspector');
  }

  static saveTaskInspector() {
    if (!this.activeTaskId) return;
    const task = this.tasks.find(t => t.id === this.activeTaskId);
    if (!task) return;

    task.title = document.getElementById('insp-task-title').value.trim() || 'Untitled Story';
    task.desc = document.getElementById('insp-task-desc').value.trim();
    task.points = Number(document.getElementById('insp-task-points').value) || 1;
    task.priority = document.getElementById('insp-task-priority').value;
    task.epic = document.getElementById('insp-task-epic').value;
    task.assignee = document.getElementById('insp-task-assignee').value.trim();
    task.stage = document.getElementById('insp-task-stage').value;

    StorageManager.set(STORAGE_KEYS.SCRUM_TASKS, this.tasks);
    this.renderSprintHeader();
    this.renderBoard();
    App.closeModal('modal-task-inspector');

    NotificationManager.play8BitChime('powerup');
    NotificationManager.showToast('User story updated.', 'success');
  }

  static deleteActiveTask() {
    if (!this.activeTaskId) return;

    this.tasks = this.tasks.filter(t => t.id !== this.activeTaskId);
    StorageManager.set(STORAGE_KEYS.SCRUM_TASKS, this.tasks);
    this.renderSprintHeader();
    this.renderBoard();
    App.closeModal('modal-task-inspector');

    NotificationManager.play8BitChime('click');
    NotificationManager.showToast('Task removed from sprint.', 'info');
  }

  static addNewTask(title, stage = 'todo', points = 3, priority = 'medium', epic = 'pwa', assignee = 'Johan W.', desc = '') {
    const newTask = {
      id: 'task-' + Date.now(),
      title: title || 'New Scrum Story',
      stage: stage,
      points: Number(points) || 1,
      priority: priority,
      epic: epic,
      assignee: assignee,
      desc: desc
    };

    this.tasks.unshift(newTask);
    StorageManager.set(STORAGE_KEYS.SCRUM_TASKS, this.tasks);
    this.renderSprintHeader();
    this.renderBoard();

    NotificationManager.play8BitChime('coin');
    NotificationManager.sendPushAlert({
      title: 'New Scrum Story Added',
      body: `[${epic.toUpperCase()}] ${title} (${points} pts)`,
      type: 'success'
    });
  }

  /* Sprint Controller & Complete Sprint Celebration */
  static openSprintSettings() {
    document.getElementById('cfg-sprint-name').value = this.sprint.name || '';
    document.getElementById('cfg-sprint-goal').value = this.sprint.goal || '';
    document.getElementById('cfg-sprint-target').value = this.sprint.velocityTarget || 35;
    App.openModal('modal-sprint-settings');
  }

  static saveSprintSettings() {
    this.sprint.name = document.getElementById('cfg-sprint-name').value.trim() || 'Active Sprint';
    this.sprint.goal = document.getElementById('cfg-sprint-goal').value.trim() || '';
    this.sprint.velocityTarget = Number(document.getElementById('cfg-sprint-target').value) || 35;

    StorageManager.set(STORAGE_KEYS.SCRUM_SPRINT, this.sprint);
    this.renderSprintHeader();
    App.closeModal('modal-sprint-settings');

    NotificationManager.play8BitChime('powerup');
    NotificationManager.showToast('Sprint details updated.', 'success');
  }

  static completeSprint() {
    const doneTasks = this.tasks.filter(t => t.stage === 'done');
    const donePts = doneTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);

    NotificationManager.play8BitChime('victory');
    NotificationManager.sendPushAlert({
      title: '🏆 SPRINT 42 COMPLETED!',
      body: `Velocity Achieved: ${donePts} Story Points delivered across ${doneTasks.length} stories!`,
      type: 'success'
    });

    NotificationManager.showToast(`🎉 Sprint Completed! Delivered ${donePts} points.`, 'success');
  }
}

