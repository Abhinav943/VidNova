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

**VidNova** is not just another video sharing site; it's a visual experience. Built for speed and aesthetics, it leverages the cutting-edge capabilities of **Next.js 15** and **React 19** to deliver instantaneous navigation and rich, fluid animations. Whether you are a creator looking for a home or a viewer seeking a vibrant community, VidNova provides a premium "Glassmorphism" environment that feels alive.

## 🚀 Key Features

### 🎬 For Viewers
- **Seamless Playback**: Optimized streaming with custom controls and real-time view tracking.
- **Vibrant Discovery**: Search-as-you-type and category-based filtering using Next.js client-side transitions.
- **Engagement**: Like your favorite videos, subscribe to creators, and participate in threaded discussions.
- **History & Likes**: Automatically track your viewing history and maintain a curated list of liked content.

### ✍️ For Creators
- **Effortless Uploads**: Robust drag-and-drop interface with real-time upload progress simulation.
- **Channel Branding**: Customize your presence with unique banners and avatars stored securely in the cloud.
- **Analytics at a Glance**: Track subscriber growth and video engagement directly on your profile.

### 🛠️ Technical Excellence
- **Hybrid Rendering**: Leveraging Server Components for SEO and Client Components for interactivity.
- **Type-Safe Architecture**: End-to-end TypeScript integration ensures a reliable developer experience.
- **Cyberpunk UI**: A custom design system built with Tailwind CSS, featuring neon glows and micro-interactions.

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
