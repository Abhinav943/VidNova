# 🌌 VidNova: The Future of Streaming

<div align="center">
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=white" />
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
    <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=json-web-tokens&logoColor=white" />
    <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
  </p>
  
  **A high-performance, animation-driven video platform with a stunning Cyberpunk soul.**
</div>

---

## 📖 Introduction

**VidNova** is a video sharing platform I built to learn full-stack web development. It's a YouTube-like app where you can upload videos, watch content, like videos, leave comments, and subscribe to creators. The project uses modern tools like **Next.js 15**, **React 19**, and **Express.js** to handle everything from smooth animations on the frontend to secure user authentication and video storage on the backend.

## 🚀 Key Features

### 🎬 Viewer Features
- **Watch Videos**: Play videos with custom player controls and automatic view tracking.
- **Search & Browse**: Find videos by searching or browsing through categories.
- **Interact**: Like videos, subscribe to creators, and comment on videos.
- **Track History**: Keep a history of videos you've watched and a list of videos you've liked.

### ✍️ Creator Features
- **Upload Videos**: Drag and drop to upload videos with a progress indicator.
- **Create a Channel**: Customize your profile with a banner and avatar.
- **Track Growth**: See how many subscribers you have and how many people watched your videos.

### 🛠️ Built With
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, and Framer Motion for animations.
- **Backend**: Express.js with Node.js for the API and MongoDB for the database.
- **Storage**: Cloudinary for storing videos and images.
- **Authentication**: JWT tokens for secure login and session management.

---

## 📸 Visual Showcase

| Home Feed | Video Player |
| :---: | :---: |
| ![Home](screenshots/home.png) | ![Player](screenshots/player.png) |

| Creator Dashboard | Authentication |
| :---: | :---: |
| ![Upload](screenshots/upload.png) | ![Login](screenshots/login.png) |

---

## 🏗️ Project Architecture

```mermaid
graph TD
    A[Next.js Frontend] -->|Axios / REST| B[Express.js Backend]
    B -->|Mongoose| C[MongoDB Atlas]
    B -->|Upload SDK| D[Cloudinary Storage]
    A -->|Framer Motion| E[Animation Engine]
    B -->|JWT| F[Auth System]
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` or `yarn`
- **Cloudinary Account**: For media storage

### 1. Clone & Install
```bash
git clone https://github.com/Abhinav943/VidNova.git
cd VidNova

# Install dependencies for both halves
cd Backend && npm install
cd ../frontend && npm install
```

### 2. Environment Configuration
Create a `.env` in the **Backend** folder:
```env
PORT=8000
MONGO_URI=your_mongodb_atlas_uri
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=any_long_random_string
REFRESH_TOKEN_SECRET=any_longer_random_string
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Launch the Platform
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd Backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Your app will be live at `http://localhost:3000`!

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contact
Abhinav - [@Abhinav943](https://github.com/Abhinav943)  
Project Link: [https://github.com/Abhinav943/VidNova](https://github.com/Abhinav943/VidNova)

<div align="center">
  <sub>Built with ❤️ by the Abhinav943</sub>
</div>
