# ✨ Votify: Secure Blockchain-Based Voting System

Votify is a full-stack, real-time decentralized voting application (dApp) designed to ensure **transparency, security, and trust** in elections. It combines blockchain technology with modern web development to deliver a scalable and user-friendly voting platform.

---

## 🚀 Key Features

### 🛡️ Security & Authentication
- JWT-based authentication
- Google OAuth integration
- reCAPTCHA protection
- Role-based access control (Admin/User)
- Rate limiting & security middleware (Helmet, custom filters)

### ⚡ Real-Time System
- WebSocket (Socket.IO) integration
- Live voting updates without page refresh
- Instant notifications for voters and admins
- Event-driven architecture

### 🧠 Backend Architecture
- Modular service-based architecture (Controller → Service → Model)
- Transaction queue for blockchain consistency
- Global error handling middleware
- Scalable and maintainable code structure

### 📊 Data & Blockchain
- MongoDB for fast data access and metadata storage
- Ethereum blockchain (Ganache) for vote integrity
- Hybrid architecture (Off-chain + On-chain)
- Audit logs for system transparency

### ✅ API Validation
- Joi-based validation middleware
- Validation for body, params, and query
- Structured error responses
- Protection against invalid and malicious inputs

---

## 🛠️ Technology Stack

| Layer        | Technologies |
|-------------|-------------|
| **Frontend** | React (Vite, TypeScript), Tailwind CSS, Framer Motion, Recharts |
| **Backend**  | Node.js, Express, MongoDB (Mongoose), Socket.IO, Ethers.js |
| **Blockchain** | Solidity, Hardhat, Ganache |
| **Security** | JWT, OAuth, reCAPTCHA, Helmet, BCrypt |
| **Validation** | Joi |

---

## 🏗️ System Architecture

Votify follows a **hybrid architecture**:

1. **Blockchain Layer**
   - Smart contracts handle vote integrity and immutability  
   - Ensures tamper-proof election results  

2. **Backend (API Layer)**
   - Handles authentication, business logic, and API requests  
   - Syncs blockchain and database  
   - Emits real-time updates via WebSockets  

3. **Frontend (UI Layer)**
   - Interactive dashboard for admins and voters  
   - Displays real-time results and notifications  

👉 MongoDB ensures fast UI performance, while blockchain ensures trust and integrity.

---

## ⚙️ Demo Mode (Deployment Ready)

To enable smooth deployment without requiring a blockchain node:

```env
DEMO_MODE=true
```

🔹 **What Demo Mode Does:**
- Simulates blockchain transactions
- Keeps real-time WebSocket features fully functional
- Preserves backend architecture and API flow

👉 Ideal for showcasing the project in production environments

## 📁 Project Structure

```text
Votify/
├── backend/
│   ├── src/
│   │   ├── modules/        # Feature modules (Auth, Vote, Election)
│   │   ├── services/       # Blockchain, Queue, Mail services
│   │   ├── middleware/     # Auth, Validation, Security, Error handling
│   │   ├── validations/    # Joi schemas
│   │   ├── config/         # DB & environment configs
│   │   └── utils/          # Socket & notification utilities
│
├── blockchain/             # Hardhat + Solidity contracts
├── frontend/               # React application
└── docs/                   # Documentation/assets
```

## 🔄 Request Flow

1. Client sends request
2. Authentication middleware verifies user
3. Joi validation checks request data
4. Controller handles request
5. Service layer processes logic
6. Blockchain (or demo mode) executes
7. WebSocket emits real-time updates

## ⚙️ Installation & Setup

### 🔧 Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or local)
- Ganache (for blockchain mode)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/bansalsangani09/Votify-Secure-Voting-System
cd Votify
```

### 2️⃣ Install Dependencies
```bash
cd backend
npm install
```

### 3️⃣ Environment Variables

📁 **backend/.env**

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
RECAPTCHA_SECRET_KEY=your_secret_key
DEMO_MODE=true
```

### 4️⃣ Run Backend
```bash
npm run dev
```

### ⛓️ Blockchain Setup (Optional - Development Mode)

1. **Start Ganache**
   - Open Ganache → Quickstart Ethereum
   - RPC URL: `http://127.0.0.1:7545`

2. **Compile Contracts**
   ```bash
   cd blockchain
   npx hardhat compile
   ```

3. **Deploy Contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```

## 🌐 Deployment

| Service | Platform |
| :--- | :--- |
| **Backend** | Render |
| **Frontend** | Vercel |

👉 Use Demo Mode for deployment without blockchain dependency

## 📌 Key Highlights
- Real-time voting system using WebSockets
- Blockchain-integrated secure architecture
- Production-level backend with validation & security
- Scalable and modular design

## 🚀 Future Improvements
- Deployment on Ethereum testnet (Sepolia)
- Advanced analytics dashboard
- Multi-election scalability
- Performance optimization & caching

## 👨‍💻 Author

**Bansal Sangani**  
GitHub: [bansalsangani09](https://github.com/bansalsangani09)

## 📜 License

This project is licensed under the ISC License.
