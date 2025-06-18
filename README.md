# Messaging App

Messaging App is a real-time chat application built as part of [The Odin Project](https://www.theodinproject.com/) curriculum. This project demonstrates a full-stack messaging application where users can create accounts, log in, and exchange messages between users instantly using modern web technologies.

The frontend is built with React and Vite.
<br>
The backend is built with Node.js/Express. <br>
Real-time communication using WebSockets (Socket.io).

## Table of Contents

- [Links](#links)
- [Features](#features)
- [Tools & Frameworks used](#tools--frameworks-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
### Links
- [Live demo](https://forge-messaging-app.netlify.app/) (Dead now)
- [Backend API repository](https://github.com/forge34/messaging-app-backend)

## Features

- Register and log in securely.
- Send and receive messages instantly with Socket.io.
- Add users and manage conversations.
- Fully usable on mobile, tablet, and desktop devices.

### Tools & Frameworks used
- **Frontend:** React, Vite, React Query, React Testing Library
- **Backend:** Express.js, Socket.io (see backend repo)
- **Other:** TypeScript for type safety

## Installation

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/forge34/messaging-app-frontend.git
   cd messaging-app-frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   ```

The app will typically be available at `http://localhost:5173` (default Vite port).

## Environment Variables
(also see setup instructions on the backend repo)

To connect the frontend to the backend API, you must create a `.env` file in the root of your project.  
Below is an example of what it should look like:

```
VITE_API=http://localhost:3000
```

- `VITE_API` should be set to the base URL of your backend API (for local development, this is usually `http://localhost:3000`, but it should match wherever your backend is running).
- All environment variables used by Vite must be prefixed with `VITE_`.
- If you deploy the frontend to production, update the value to your production backend endpoint.
