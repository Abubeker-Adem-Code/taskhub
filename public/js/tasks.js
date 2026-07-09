async function loadDashboardContent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const dashTitle = document.getElementById('dash-title');
  const dashActions = document.getElementById('dash-actions');
  const contentList = document.getElementById('dash-content-list');

  if (!contentList) return;
  contentList.innerHTML = '<p class="text-muted">Loading available tasks...</p>';

  if (user.role === 'client') {
    dashTitle.innerText = "Client Workspace Dashboard";
    dashActions.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="showCreateTaskForm()">+ Post New Task</button>
    `;
  } else {
    dashTitle.innerText = "Available Freelance Marketplace";
    dashActions.innerHTML = '';
  }

  try {
     
    const tasks = await api.get('/tasks');
    
    if (tasks.length === 0) {
      contentList.innerHTML = '<p class="text-muted">No tasks available in the marketplace currently.</p>';
      return;
    }

    contentList.innerHTML = tasks.map(task => `
      <div class="detail-card animate-fade" style="margin-top:0;">
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px; color: var(--primary);">${task.title}</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px; min-height: 42px;">
          ${task.description.length > 90 ? task.description.substring(0, 90) + '...' : task.description}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px;">
          <span style="font-weight: 700; font-size: 15px; color: var(--text);">Est. Budget: $${task.budget}</span>
          <span class="btn btn-outline btn-sm" onclick="loadTaskDetails(${task.id})">View Details</span>
        </div>
      </div>
    `).join('');

  } catch (err) {
    contentList.innerHTML = `<p style="color: red;">Failed to load marketplace content: ${err.message}</p>`;
  }
}

function showCreateTaskForm() {
  const container = document.getElementById('task-detail-card');
  document.getElementById('screen-task-detail').querySelector('button').onclick = () => showScreen('dashboard-view');
  
  container.innerHTML = `
    <div style="max-w: 500px; margin: 0 auto;">
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; text-align: center;">Post a New Freelance Project</h2>
      <form id="form-create-task" onsubmit="handleTaskCreation(event)">
        <div class="form-group">
          <label>Project Title</label>
          <input type="text" id="task-title" placeholder="e.g., Build a Node backend" required>
        </div>
        <div class="form-group">
          <label>Project Specifications / Description</label>
          <textarea id="task-desc" rows="4" placeholder="Detail the technical requirements..." required style="resize: none; font-family: inherit;"></textarea>
        </div>
        <div class="form-group">
          <label>Project Budget Allocation ($ USD)</label>
          <input type="number" id="task-budget" min="1" placeholder="e.g., 250" required>
        </div>
        <button type="submit" class="btn btn-primary btn-block" style="margin-top: 10px;">Broadcast Project to Marketplace</button>
      </form>
    </div>
  `;
  showScreen('task-detail-view');
}

async function handleTaskCreation(e) {
  e.preventDefault();
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  const budget = parseInt(document.getElementById('task-budget').value);

  try {
    await api.post('/tasks', { title, description, budget });
    alert('Task successfully launched on the marketplace!');
    showScreen('dashboard-view');
    loadDashboardContent();  
  } catch (err) {
    alert('Failed to launch task: ' + err.message);
  }
}

async function loadTaskDetails(taskId) {
  const container = document.getElementById('task-detail-card');
  if (!container) return;
  container.innerHTML = '<p class="text-muted">Fetching project documents...</p>';
  showScreen('task-detail-view');

  try {
    const task = await api.get(`/tasks/${taskId}`);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    let htmlContent = `
      <div style="margin-bottom: 24px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
          <h1 style="font-size: 28px; font-weight: 800; color: var(--text);">${task.title}</h1>
          <span style="font-size: 20px; font-weight: 800; color: var(--primary);">$${task.budget}</span>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 20px; font-size: 13px; color: var(--text-muted);">
          <span>Project Reference ID: #<strong>${task.id}</strong></span>
          <span>•</span>
          <span style="text-transform: uppercase; font-weight: 700; color: ${task.status === 'completed' ? 'green' : 'orange'}">Status: ${task.status}</span>
        </div>
        <p style="white-space: pre-wrap; font-size: 15px; color: #334155; line-height: 1.6; background: var(--bg); padding: 20px; border-radius: var(--radius); border: 1px solid var(--border);">
          ${task.description}
        </p>
      </div>
    `;

    if (user.role === 'worker' && task.status === 'pending') {
      htmlContent += `
        <div id="worker-proposal-box" style="border-top: 1px solid var(--border); padding-top: 24px; margin-top: 24px;">
          <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px;">Submit an Official Freelance Bid Proposal</h3>
          <form id="form-submit-proposal" onsubmit="handleProposalSubmission(event, ${task.id})">
            <div class="form-group">
              <label>Professional Cover Pitch Proposal Statement</label>
              <textarea id="proposal-text" rows="4" placeholder="Detail your experience level and how you plan to tackle this project..." required style="resize:none; font-family:inherit;"></textarea>
            </div>
            <div class="form-group" style="max-width: 200px;">
              <label>Bid Financial Amount ($ USD)</label>
              <input type="number" id="proposal-bid" min="1" max="${task.budget}" value="${task.budget}" required>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Transmit Job Application Document</button>
          </form>
        </div>
      `;
    }

    container.innerHTML = htmlContent;

    setTimeout(() => {
      if (typeof appendReviewFormIfCompleted === 'function') {
        appendReviewFormIfCompleted(task, user, container);
      }
    }, 50);

  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error loading project profile: ${err.message}</p>`;
  }
}

