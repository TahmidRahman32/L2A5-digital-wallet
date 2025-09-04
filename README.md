## 💳 Digital Wallet System

A secure, modular, and role-based backend API for a **digital wallet system** (similar to Bkash/Nagad) built with **Express.js** and **Mongoose**.  

---

### 🚀 Features
- 🔐 JWT Authentication (Admin, User, Agent roles)  
- 🔑 Role-based Authorization  
- 🏦 Wallet auto-created at registration (initial balance: ৳50)  
- 💸 Transactions: Add Money, Withdraw, Send Money  
- 👥 Agent Cash-in / Cash-out  
- 🧱 Transaction History & Tracking  
- 🛡️ Admin controls: Block wallets, Approve agents, View all data  

---

### 📌 API Endpoints
#### Auth
- `POST /auth/register` → Register (user/agent/admin)  
- `POST /auth/login` → Login (JWT token)  

#### Wallet
- `GET /wallet/me` → My wallet info  
- `PATCH /wallet/block/:id` (Admin) → Block/Unblock wallet  

#### Transactions
- `POST /wallet/top-up` → Add money  
- `POST /wallet/withdraw` → Withdraw money  
- `POST /wallet/send` → Send money to another user  
- `GET /transaction/me` → My transaction history  
- `GET /transaction` (Admin) → All transactions  

#### Admin
- `GET /users` → View all users  
- `GET /agents` → View all agents  
- `PATCH /agents/approve/:id` → Approve agent  

---

### 🧩 Tech Stack
- Express.js  
- MongoDB + Mongoose  
- JWT + bcrypt  


