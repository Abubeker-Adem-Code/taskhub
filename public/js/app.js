 function router() {
    const hash = window.location.hash || '#/';

    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.add('current-hidden');
    });

     if (hash === '#/tasks') {
        document.getElementById('view-tasks').classList.remove('current-hidden');
        loadTasks();
    } else if (hash === '#/dashboard') {
        document.getElementById('view-dashboard').classList.remove('current-hidden');
        renderPostTaskForm();
        loadDashboard();
    } else if (hash === '#/auth') {
        document.getElementById('view-auth').classList.remove('current-hidden');
    } else {
        document.getElementById('view-home').classList.remove('current-hidden');
    }
}

function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;

    const token = localStorage.getItem('token');

    if (token) {
        authBtn.textContent = 'Logout';
        authBtn.onclick = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.hash = '#/';
            updateAuthButton();
        };
    } else {
        authBtn.textContent = 'Login';
        authBtn.onclick = () => {
            window.location.hash = '#/auth';
        };
    }
}
window.addEventListener('DOMContentLoaded', () => {
    router();
    updateAuthButton();
    setupAuthForms();
});
window.addEventListener('hashchange', router);
async function loadDashboard() {
    const container = document.getElementById('dashboard-metrics');
    if (!container) return;

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.role === 'worker') {
        container.innerHTML = '<p>Loading your applications...</p>';

        try {
            const response = await fetch('http://localhost:3000/api/applications/mine', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const applications = await response.json();

            if (!applications || applications.length === 0) {
                container.innerHTML = '<p>Browse available tasks on the "Browse Tasks" page to find work. You haven\'t applied to anything yet.</p>';
                return;
            }

            container.innerHTML = '';
            applications.forEach(app => {
                const card = document.createElement('div');
                card.className = 'task-card';
                card.innerHTML = `
                    <h3>${app.taskTitle}</h3>
                    <span class="task-budget">$${app.taskBudget}</span>
                    <p>Your bid: $${app.bid_amount}</p>
                    <p>Proposal: ${app.proposal}</p>
                    <span class="application-status status-${app.status}">${app.status}</span>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Failed to load applications:', error);
            container.innerHTML = '<p>Could not load your applications.</p>';
        }
        return;
    }
       if (user.role === 'worker') {
        container.innerHTML = '<p>Browse available tasks on the "Browse Tasks" page to find work. Application tracking is coming soon.</p>';
        return;
    }

    container.innerHTML = '<p>Loading your tasks...</p>';

    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        const allTasks = await response.json();
        const myTasks = allTasks.filter(task => task.client_id === user.id);

        if (myTasks.length === 0) {
            container.innerHTML = '<p>You haven\'t posted any tasks yet.</p>';
            return;
        }

        container.innerHTML = '';
        myTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <h3>${task.title}</h3>
                <span class="task-budget">$${task.budget}/hr</span>
                <p>Status: ${task.status}</p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        container.innerHTML = '<p>Could not load your dashboard.</p>';
    }
}
async function loadTasks() {
    const container = document.getElementById('tasks-list-container');
    if (!container) return;

    container.innerHTML = '<p>Loading tasks...</p>';

    try {
        const response = await fetch('http://localhost:3000/api/tasks');
        const tasks = await response.json();

        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<p>No open tasks right now.</p>';
            return;
        }

    container.innerHTML = '';
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';

            let applySection = '';
            if (user.role === 'worker') {
                applySection = `
                    <button class="btn btn-outline btn-sm apply-btn" data-task-id="${task.id}">Apply</button>
                    <div class="apply-form-slot" id="apply-form-${task.id}"></div>
                `;
            }

            card.innerHTML = `
                <h3>${task.title}</h3>
                <span class="task-budget">$${task.budget}/hr</span>
                <p>${task.description}</p>
                ${applySection}
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', () => showApplyForm(btn.dataset.taskId));
        });
    } catch (error) {
        console.error('Failed to load tasks:', error);
        container.innerHTML = '<p>Could not load tasks. Is the backend running?</p>';
    }
}
function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleLink = document.getElementById('auth-toggle-link');
    const heading = document.getElementById('auth-heading');

    if (!loginForm || !registerForm) return;

    toggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        const showingLogin = !loginForm.classList.contains('current-hidden');

        if (showingLogin) {
            loginForm.classList.add('current-hidden');
            registerForm.classList.remove('current-hidden');
            heading.textContent = 'Register';
            toggleLink.textContent = 'Already have an account? Login';
        } else {
            registerForm.classList.add('current-hidden');
            loginForm.classList.remove('current-hidden');
            heading.textContent = 'Login';
            toggleLink.textContent = "Need an account? Register";
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (!response.ok) {
                errorEl.textContent = data.error || 'Login failed';
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            updateAuthButton();
            window.location.hash = '#/dashboard';
        } catch (error) {
            errorEl.textContent = 'Could not reach the server';
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const errorEl = document.getElementById('register-error');
        errorEl.textContent = '';

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await response.json();

            if (!response.ok) {
                errorEl.textContent = data.error || 'Registration failed';
                return;
            }

            toggleLink.click();
            document.getElementById('login-email').value = email;
        } catch (error) {
            errorEl.textContent = 'Could not reach the server';
        }
    });
}
function renderPostTaskForm() {
    const container = document.getElementById('post-task-form-container');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.role !== 'client') {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="post-task-panel">
            <h3>Post a New Task</h3>
            <form id="post-task-form">
                <div class="form-group">
                    <label for="new-task-title">Title</label>
                    <input type="text" id="new-task-title" required>
                </div>
                <div class="form-group">
                    <label for="new-task-description">Description</label>
                    <textarea id="new-task-description" required></textarea>
                </div>
                <div class="form-group">
                    <label for="new-task-budget">Budget ($)</label>
                    <input type="number" id="new-task-budget" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary">Post Task</button>
                <p class="post-task-success" id="post-task-success"></p>
                <p class="post-task-error" id="post-task-error"></p>
            </form>
        </div>
    `;

    document.getElementById('post-task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('new-task-title').value;
        const description = document.getElementById('new-task-description').value;
        const budget = parseFloat(document.getElementById('new-task-budget').value);
        const successEl = document.getElementById('post-task-success');
        const errorEl = document.getElementById('post-task-error');
        successEl.textContent = '';
        errorEl.textContent = '';

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, budget })
            });
            const data = await response.json();

            if (!response.ok) {
                errorEl.textContent = data.error || 'Failed to post task';
                return;
            }

            successEl.textContent = 'Task posted successfully!';
            document.getElementById('post-task-form').reset();
            loadDashboard();
        } catch (error) {
            errorEl.textContent = 'Could not reach the server';
        }
    });
}
function showApplyForm(taskId) {
    const slot = document.getElementById(`apply-form-${taskId}`);
    if (!slot) return;

    if (slot.innerHTML !== '') {
        slot.innerHTML = '';
        return;
    }

    slot.innerHTML = `
        <form class="apply-task-form" data-task-id="${taskId}">
            <div class="form-group">
                <label>Your Proposal</label>
                <textarea class="apply-proposal" required></textarea>
            </div>
            <div class="form-group">
                <label>Bid Amount ($)</label>
                <input type="number" class="apply-bid" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Submit Application</button>
            <p class="apply-message"></p>
        </form>
    `;

    slot.querySelector('.apply-task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const proposal = form.querySelector('.apply-proposal').value;
        const bid_amount = parseFloat(form.querySelector('.apply-bid').value);
        const messageEl = form.querySelector('.apply-message');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ proposal, bid_amount })
            });
            const data = await response.json();

            if (!response.ok) {
                messageEl.textContent = data.error || 'Failed to apply';
                messageEl.style.color = '#b91c1c';
                return;
            }

            messageEl.textContent = 'Application submitted!';
            messageEl.style.color = '#15803d';
            form.querySelector('button').disabled = true;
        } catch (error) {
            messageEl.textContent = 'Could not reach the server';
            messageEl.style.color = '#b91c1c';
        }
    });
}
