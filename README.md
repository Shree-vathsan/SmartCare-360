# 🏥 SmartCare 360° – Patient Management System

Live demo : https://smartcare360.vercel.app/

SmartCare 360° is a modern full-stack web application that streamlines healthcare management for doctors, patients, and administrators. Built with **React + TypeScript** on the frontend and **Node.js + Express + SQLite** on the backend, it supports secure authentication, dynamic dashboards, appointment handling, and more.

---

## 🚀 Features

- 🔐 Role-based login for **Doctor**, **Patient**, and **Admin**
- 🩺 Doctor dashboard to manage appointments and prescriptions
- ❤️ Patient dashboard for tracking prescriptions and appointments
- 🛡️ Admin dashboard for managing users
- 📆 Add reminders for appointments/tasks
- ✅ Mark tasks/prescriptions as complete
- 🧠 JWT-based authentication and protected routes
- 🔗 SQLite for lightweight and fast database management
- 🌐 Vite-powered frontend for blazing fast dev experience

---

## 📁 Project Structure

SmartCare-360/
- ├── server/ # Node.js + Express backend
- │ ├── database/ # SQLite DB initialization
- │ ├── routes/ # API endpoints (auth, users, appointments, etc.)
- │ ├── middleware/ # Auth middlewares
- │ └── index.js # Entry point for backend
- │
- ├── src/ # React frontend
- │ ├── pages/ # Role-based dashboards + login + landing
- │ ├── contexts/ # AuthContext (JWT handling)
- │ └── App.jsx # Main app logic with routing-
- │
- ├── .env # Environment variables (JWT secret, etc.)
- ├── vite.config.ts # Vite config for React
- ├── package.json # Project metadata and scripts


---

## ⚙️ Tech Stack

| Frontend              | Backend             | Database       |
|-----------------------|---------------------|----------------|
| React js              | Node.js + Express   | SQLite         |
| Vite                  | JWT Auth            |                |

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Shree-vathsan/SmartCare-360.git
cd SmartCare-360
```

## 2. Install Dependencies

### Backend
```bash
cd server
npm init
```
### Frontend
```bash
cd ../
npm install
```

## 3. Environment Setup

### Create a .env file in the server/ folder:
```bash
JWT_SECRET=yourSuperSecretKey
PORT=5001
```

## 4. Initialize the Database

```bash
cd server
node database/init.js
```
This will create your SQLite database with necessary tables.

## 5. Run the App

```bash
npm run dev
```
### This runs both backend and frontend concurrently.

- Backend: http://localhost:5001
- Frontend: http://localhost:5173

##  📦 API Endpoints

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | /api/auth/login    | User login                   |
| POST   | /api/auth/register | User registration (if added) |
| GET    | /api/users/\:role  | Get users by role            |
| GET    | /api/appointments  | Fetch appointments           |
| POST   | /api/appointments  | Create new appointment       |

## 🔐 Authentication

- JWT tokens are stored in local storage and verified via the auth.js middleware on protected backend routes.

## 🛠️ Troubleshooting
- EADDRINUSE Error
Make sure nothing else is running on port 5001. Change PORT in .env if needed.

- 404 on Login
Confirm proxy is set in vite.config.ts and backend is running.

## 📄 License

MIT © Shree Vathsan

## 🌟 Contributions

Pull requests are welcome! If you'd like to add new features, fix bugs, or improve docs, feel free to fork and submit a PR.
```bash 
---

Let me know if you want it customized more for deployment (like with render, vercel, docker, etc.) or if you want me to add badge shields or usage examples!
```













