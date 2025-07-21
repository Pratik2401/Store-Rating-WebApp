# 🏪 Store Rating WebApp

A full-stack web application for rating and reviewing stores, featuring both a modern frontend (React + Vite) and a secure backend (Node.js + Express + MySQL). Users can browse stores, submit ratings and reviews, and view analytics. Admin and store owner dashboards provide management and insights.

---

## ✨ Features

- **User:**  
  - Browse/search stores
  - Submit star ratings and reviews
  - View average ratings, reviews, and recommendations
  - Manage favorites

- **Store Owner:**  
  - See dashboard with store performance
  - View/manage ratings, analytics, and profile

- **Admin:**  
  - Dashboard with system stats
  - User and store management (CRUD)
  - Analytics and audit logs

---

## 🗂️ Project Structure

```
├── backend/      # Node.js/Express server and API
│   ├── routes/       # API endpoints (auth, admin, user, storeOwner)
│   ├── middleware/   # Auth, validation, error handling
│   ├── models/       # Database models (if present)
│   ├── index.js      # Main server entry
│   └── ...           # Additional server files
├── frontend/     # React + Vite frontend
│   ├── src/
│   │   ├── api/              # API clients for user, admin, store owner
│   │   ├── components/       # UI components (SystemAdmin, StoreOwner, User, Common)
│   │   ├── styles/           # CSS modules and global styles
│   │   ├── main.jsx, App.jsx # Main React entry and app
│   │   └── ...
│   ├── index.html
│   └── ...
├── package.json         # (root or per project)
└── README.md
```

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, CSS Modules
- **Backend:** Node.js, Express, MySQL2, JWT, CORS, Helmet
- **API:** RESTful endpoints for authentication, store management, ratings, analytics
- **Auth:** Role-based access control (User, Store Owner, Admin)
- **Security:** Input sanitization, helmet, CORS, validation, logging

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Pratik2401/Store-Rating-WebApp.git
cd Store-Rating-WebApp
```

### 2. Setup the Backend

```bash
cd backend
npm install
# Create a .env file with DB and JWT configs (see below)
node index.js
```
#### Example `.env` (backend)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=store_rating
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Setup the Frontend

```bash
cd ../frontend
npm install
# Create a .env file (see below)
npm run dev
```
#### Example `.env` (frontend)
```
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173
```

---

## ⚙️ Usage

- Visit `http://localhost:5173` in your browser.
- Register as a user, store owner, or login as admin.
- Rate stores, write reviews, favorite stores.
- Store owners and admins get dedicated dashboards.

---

## 🧩 API Overview

- `POST /auth/register` — Register new user
- `POST /auth/login` — Login
- `GET /user/stores` — List stores
- `POST /user/ratings` — Rate a store
- `GET /admin/dashboard/stats` — System statistics
- ...and more (see backend/routes/)

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `feature/<your-feature-name>`
3. Commit your changes & push
4. Open a Pull Request — feedback welcomed!

---

## 📝 License

MIT © 2025 Pratik2401

---
