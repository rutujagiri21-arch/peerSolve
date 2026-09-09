# PeerSolve - Academic Doubt-Solving Forum

> **Ask doubts. Help others. Grow together.**

PeerSolve is a full-stack peer-to-peer academic doubt-solving platform connecting junior college students with experienced senior mentors. It eliminates classroom hesitation and prevents repetitive 1-on-1 messaging by making answers available for everyone.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Modern Light Theme matching PeerSolve UI), Vanilla JavaScript (ES6+)
- **Backend**: Node.js & Express.js REST API
- **Database**: MySQL (`mysql2/promise`) with complete `schema.sql`
- **Security**: Password hashing with `bcryptjs`, JWT authentication

---

## ✨ Features

- **Exact PeerSolve UI**: Hero section, animated platform statistics, floating mockup cards, and 3-step "How It Works" guide.
- **MySQL Authentication**: Register and login as a **Junior Student** or a **Senior Mentor**.
- **Mandatory Subject Selection & Filter**: Doubts are organized by subject (`DBMS`, `Data Structures`, `Operating Systems`, `Computer Networks`, `Web Development`, `Mathematics`).
- **Multi-Senior Solutions**: Multiple seniors can provide explanations and code snippets for the same question.
- **Best Answer Acceptance (+25 Reputation)**: The student who asked can accept the best answer, awarding +25 reputation to the senior.
- **Senior Reputation Leaderboard**: Highlights top-ranked senior mentors with badges and printable Mentorship Recognition Cards.
- **Anonymous Asking Mode**: Students can mask their name as "Anonymous Junior" to ask basic questions without fear of judgment.
- **"I Have This Doubt Too (+1)"**: Juniors can bump questions they also share without duplicate posts.

---

## 🚀 How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://www.mysql.com/) (Optional: XAMPP, WampServer, or MySQL Workbench)

### Quick Start (Windows)
Simply double-click **`run.bat`** in the project folder!

### Or via Terminal:
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the application
npm start
```
Open **`http://localhost:5000`** in your browser!

---

## 🗄️ MySQL Setup (Optional)

1. Open your MySQL client (phpMyAdmin, MySQL Workbench, or CLI).
2. Import or run the queries from `schema.sql`.
3. In `.env`, configure your database credentials:
```ini
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=peersolve_db
```
*(Note: The server includes a built-in instant driver that runs smoothly even before MySQL configuration).*
