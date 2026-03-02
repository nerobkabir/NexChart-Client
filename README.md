# NexChat — Real-time Messaging App

A full-stack chat application with instant messaging, typing indicators, and read receipts.

🔗 **Live Demo:** [nexchat-frontend-six.vercel.app](https://nexchat-frontend-six.vercel.app)

---

## What Does It Do?

NexChat lets two users send messages to each other **instantly** — no page refresh needed. It works like WhatsApp for the browser:

- Send a message → other person sees it **immediately**
- Start typing → other person sees **"typing…"** indicator
- Other person reads it → your tick turns **green ✓✓**
- User goes online/offline → status updates **in real-time**

This is powered by **WebSockets (Socket.io)** — a persistent connection between browser and server, so data flows both ways without waiting for a request.

---

## Tech Stack

| | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 16, Tailwind CSS | Fast React framework with App Router |
| **State** | Zustand | Lightweight global state for messages & conversations |
| **Backend** | Node.js, Express | REST API + Socket.io server |
| **Database** | MongoDB Atlas | Stores users, conversations, messages |
| **Real-time** | Socket.io | WebSocket connection for instant messaging |
| **Auth** | JWT + bcrypt | Secure login via httpOnly cookies |
| **Deploy** | Vercel + Render | Frontend on Vercel, backend on Render |

---

## How It Works

```
User types a message
        │
        ▼
Socket.io sends to backend  ──→  Saved in MongoDB
        │
        ▼
Backend emits to recipient's room
        │
        ▼
Recipient sees message instantly (no refresh)
```

---

## Run Locally

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env        # add MONGO_URI and JWT_SECRET
node seed.js                # create test users
npm run dev                 # → http://localhost:5000
```

**2. Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                 # → http://localhost:3000
```

**3. Test**

Login with two browser tabs:

| Email | Password |
|-------|----------|
| alice@connect.app | password123 |
| bob@connect.app | password123 |

---

## Environment Variables

**Backend**
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## License

MIT — free to use and modify.