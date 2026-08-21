# NexaChat

A production-minded real-time chat application built with **Next.js, TypeScript, TanStack Query, Zustand, and Socket.IO**.

NexaChat supports **one-to-one and group conversations**, real-time messaging, optimistic message sending with retry handling, user search, group administration, cursor-based message history, and a responsive experience from mobile to desktop.

Built as a **Frontend Developer take-home assignment** against a live REST + Socket.IO API, with a focus on clean architecture, reliable chat behavior, responsive design, and thoughtful edge-case handling.

## 🚀 Live Demo

|                      | Link                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| **Landing Page**     | [https://nexa-chat-delta.vercel.app](https://nexa-chat-delta.vercel.app)         |
| **Chat Application** | [https://nexa-chat-delta.vercel.app/app](https://nexa-chat-delta.vercel.app/app) |

### Demo Account

The API automatically registers new phone numbers, so you can use any `+1555...` number to create a demo account.

**To test real-time messaging:** open the application in two separate browser profiles and sign in with different phone numbers.

---

## ✨ Key Features

### 💬 Chat

- Real-time one-to-one and group messaging
- Optimistic message sending
- Failed message state with retry
- Smart auto-scroll behavior
- "New messages" indicator when reading older messages
- Cursor-based message pagination
- Message timestamps and day separators
- Consecutive-sender message grouping

### 👥 Conversations & Groups

- Search users by name or phone number
- Start one-to-one conversations
- Create group conversations
- Add and remove group members
- Promote members to administrators
- Rename groups
- Leave groups with permission-aware handling

### 🔐 Authentication

- Phone-number based login
- Automatic account creation for new numbers
- Persistent authentication session
- Session validation on application startup
- Automatic logout for invalid or expired sessions

### 🎨 UI & UX

- Responsive mobile, tablet, and desktop layouts
- Custom dark Aurora design system
- Loading, empty, error, and reconnecting states
- Keyboard-accessible interactions
- Accessible dialogs and menus
- `⌘K` command palette
- Reduced-motion support
- Smooth micro-interactions

---

## 🛠 Tech Stack

### Frontend

- **Next.js 16** ,App Router
- **React 19**
- **TypeScript** ,strict type checking
- **Tailwind CSS v4** ,custom design-token system

### State & Data

- **TanStack Query v5** ,server-state management, caching, and pagination
- **Zustand v5** ,authentication session and UI state
- **Socket.IO Client** ,real-time communication

### UI & Interaction

- **Framer Motion** ,animations and micro-interactions
- **Lucide React** ,icons

---

## 🏗 Architecture

The application separates server state, client state, API communication, and real-time events.

### State Ownership

A core architectural decision was to give each type of state a single owner:

- **TanStack Query** owns server state such as conversations, messages, and users.
- **Zustand** manages authentication session and temporary UI state.
- **Socket.IO** updates the TanStack Query cache when real-time events arrive.

This prevents duplicated server state and keeps REST requests, optimistic mutations, and real-time events working against the same source of truth.

```text
                    REST API
                       │
                       ▼
                  API Client
                       │
                       ▼
                TanStack Query
                 /     |      \
                /      |       \
       Conversations Messages   Users
                ▲       ▲
                │       │
                └── Socket.IO
                  Realtime Events

```
