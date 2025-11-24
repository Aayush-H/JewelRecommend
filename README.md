# 💎 Aura Blend - Jewelry Recommendation System

A smart jewelry recommendation platform that connects users with jewelry designers based on personal preferences and style.

---

## 🧭 Overview

**Aura Blend** is a web application that helps users discover jewelry that matches their preferences using an intelligent recommendation algorithm.  
Designers can upload their products, and users can search for recommendations based on colors, occasions, budget, materials, and more.

---

## ✨ Key Features

- **User Authentication** – Sign up and log in as a user or designer  
- **Smart Recommendations** – AI-powered jewelry suggestions based on preferences  
- **Image Analysis** – Extract colors from your style photos for accurate matching  
- **Designer Dashboard** – Manage and track your jewelry products  
- **Multiple Filters** – Search by occasion, style, budget, material, gender, and category  
- **Product Links** – Direct links to purchase recommended jewelry  

---

## 🧰 Tech Stack

**Frontend:**
- Next.js 16 (React)
- TypeScript
- Tailwind CSS
- Vercel deployment

**Backend:**
- Express.js
- Node.js
- MongoDB
- Cloudinary (image storage)
- Render deployment

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure you have:
- Node.js v16+
- MongoDB database
- Cloudinary account (for image uploads)

---

### ⚙️ Installation

#### 🖥️ Backend Setup

```bash
# Go to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your environment variables
# Then start the server
npm start
```

#### 💻 Frontend Setup

```bash
# Go to frontend folder
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

- Frontend runs on → `http://localhost:3000`  
- Backend runs on → `http://localhost:5000`

---

## 📁 Project Structure

```
jewelry-recommendation/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions (recommendation engine, Cloudinary)
│   ├── middleware/      # Auth middleware
│   └── server.js        # Express server
│
├── frontend/
│   ├── app/             # Next.js app router
│   ├── components/      # Reusable UI components
│   ├── lib/             # Utilities (auth, API calls)
│   └── public/          # Static assets
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| **POST** | `/api/auth/register` | Register user/designer |
| **POST** | `/api/auth/login` | User login |
| **POST** | `/api/auth/login-designer` | Designer login |
| **POST** | `/api/products` | Add product (designers) |
| **GET** | `/api/products` | Get all products |
| **POST** | `/api/recommendations/analyze` | Get recommendations |
| **GET** | `/api/users/:id` | Get user profile |

---

## 🔐 Environment Variables

### 🗂️ `.env` (Backend)

```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=your_frontend_url
PORT=5000
```

### 🗂️ `.env.local` (Frontend)

```env
NEXT_PUBLIC_API_URL=your_backend_url
```

---

## 📄 License

This project is licensed under the **MIT License**.
