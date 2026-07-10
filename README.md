# TaskHub

A micro-task / freelance marketplace web application built for Web Programming II.
Clients post short-term tasks; workers browse and apply with a proposal and bid; clients
review applications, accept a worker, and leave a rating once the task is complete.

## Description

TaskHub follows an MVC architecture with a Node.js/Express backend, a SQLite database
(via `better-sqlite3`), and a vanilla JavaScript frontend (no frameworks) using
hash-based client-side routing. Authentication uses JWT tokens with bcrypt-hashed
passwords, and role-based access control (`client` / `worker`) restricts who can
perform which actions.

**Core user flow:**
1. A user registers as either a `client` or a `worker`.
2. Clients post tasks with a title, description, and budget.
3. Workers browse open tasks and submit an application (proposal + bid amount).
4. Clients review applications and accept one.
5. Once the task is marked complete, the client leaves a review for the worker.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Node.js, Express 5 |
| Database   | SQLite via `better-sqlite3` |
| Auth       | JWT (`jsonwebtoken`) + `bcrypt` password hashing |
| Frontend   | Vanilla JavaScript (ES6+), HTML5, custom CSS — no frameworks |
| Dev tools  | `morgan` (request logging), VS Code Live Server |

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- VS Code with the **Live Server** extension (for the frontend)

### Backend

```bash
# 1. Clone the repo
git clone https://github.com/Abubeker-Adem-Code/taskhub.git
cd taskhub

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root with:
#    JWT_SECRET=your_secret_key_here
#    PORT=3000

# 4. Start the server
node index.js
```

The API will be available at `http://localhost:3000`. The SQLite database file
(`taskmatch.db`) is created automatically on first run using the schema in
`config/database.js`.

### Frontend

1. Open the project folder in VS Code.
2. Right-click `public/index.html` → **Open with Live Server**.
3. The frontend runs at `http://127.0.0.1:5500` and calls the backend at
   `http://localhost:3000/api`.

> Both the backend (`node index.js`) and Live Server must be running at the same time.

## Database Schema (DDL)

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN('client', 'worker')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget REAL NOT NULL,
    deadline DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open', 'assigned', 'in_progress', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    proposal TEXT NOT NULL,
    bid_amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    reviewee_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 and 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
);
```

**Entity relationships:**
- A `user` (client) has many `tasks`.
- A `task` has many `applications`, each submitted by a `user` (worker).
- A `task` has many `reviews`, linking a reviewer and reviewee (both `users`).

## API Endpoints

| Method | Endpoint                       | Auth required        | Description |
|--------|---------------------------------|-----------------------|--------------|
| POST   | `/api/auth/register`            | No                    | Register a new user (client or worker) |
| POST   | `/api/auth/login`                | No                    | Log in, returns JWT + user object |
| GET    | `/api/tasks`                     | No                    | List all tasks |
| GET    | `/api/tasks/:id`                 | No                    | Get a single task by ID |
| POST   | `/api/tasks`                     | Yes (`client` only)   | Create a new task |
| PATCH  | `/api/tasks/:id/status`          | Yes                   | Update a task's status |
| PATCH  | `/api/tasks/:id/complete`        | Yes                   | Mark a task as completed |
| POST   | `/api/tasks/:id/review`          | Yes                   | Submit a review for a completed task |
| POST   | `/api/tasks/:id/apply`           | Yes                   | Worker applies to a task with a proposal + bid |
| PATCH  | `/api/applications/:id/accept`   | Yes                   | Client accepts a worker's application |
| GET    | `/api/reviews`                   | No                    | List all reviews (shown on the home page) |

Authenticated routes expect a `Bearer <token>` in the `Authorization` header.

## Extra Features

- **Role-based UI rendering** — the frontend shows different controls (post-task form,
  apply button) depending on whether the logged-in user is a `client` or `worker`.
- **Reviews feed** — the home page fetches and displays recent reviews via `GET /api/reviews`.
- **Password security** — passwords are hashed with `bcrypt` before storage; plaintext
  passwords are never persisted.
- **Request logging** — `morgan` logs every incoming request in development, and a custom
  `global.logAction()` helper writes structured action logs to `app.log`.

## Known Issues / In Progress

- `applicationController.js` has a harmless casing typo (`lastInsertRowId` instead of
  `lastInsertRowid`) in the `applyForTask` response.
- Server-side role enforcement (`requireRole`) is defined in `middleware/auth.js` and
  already used on `POST /api/tasks`, but is not yet applied to the apply/accept
  application routes — currently only a valid JWT is required for those.
- The "My Applications" view for workers on the dashboard is a placeholder; full
  application tracking for workers is planned but not yet built.
- Editing/deleting tasks and password reset are intentionally out of scope for this
  version.
