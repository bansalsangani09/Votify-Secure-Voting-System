# ✨ Votify: Secure Voting System

Votify is a secure, transparent, and real-time voting application. It ensures tamper-proof elections while providing a modern and intuitive user interface for both administrators and voters.

---

## 🚀 Key Features

- **🛡️ Secure Data Integrity**: Every vote is recorded with cryptographic integrity, ensuring immutability and transparency.
- **📊 Real-time Monitoring**: Live tracking of election progress and results using Socket.io integration.
- **🔐 Robust Authentication**: Secure login system with Google OAuth support and reCAPTCHA protection.
- **🛠️ Admin Dashboard**: Comprehensive suite for managing elections, candidates, and voters, along with system health monitoring.
- **👤 Voter Experience**: Intuitive interface for voters to browse active elections and securely cast their ballots.
- **📉 Data Visualization**: Beautifully rendered results and statistics using Recharts and Framer Motion for smooth transitions.
- **🕵️ Audit Logs**: Detailed activity tracking for administrative actions and system events.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite, TypeScript), Tailwind CSS, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Socket.io |
| **Security** | JWT, Google OAuth, reCAPTCHA v3, Helmet, BCrypt |

---

## 🏗️ System Architecture

Votify follows a modular architecture consisting of the following main components:

1.  **API Layer (Backend)**: An Express server that manages user authentication, data persistence in MongoDB, and real-time updates via Socket.io.
2.  **UI Layer (Frontend)**: A modern React application providing a responsive and interactive dashboard for all users.

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) or local MongoDB instance

### 1️⃣ Environment Configuration
Create `.env` files in each of the following directories:

**`/backend/.env`**:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
VITE_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```text
Votify/
├── backend/          # Express API, MongoDB models, Socket.io
├── frontend/         # React/Vite application, Tailwind styles
└── docs/             # Documentation and assets
```

---

## 📜 License
This project is licensed under the ISC License.
