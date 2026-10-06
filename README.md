# 🛍️ Electronics E-Commerce Application

An advanced full-stack e-commerce application for electronics, built with a modern tech stack focused on performance, scalability, and a smooth user experience.

- ⚙️ Backend: Node.js + NestJS
- 💻 Frontend: React 19 + TypeScript
- 🗄️ Database: PostgreSQL
- 🤖 CI/CD: GitHub Actions

## Main Menu

- [Overview](#overview)
- [Features](#features)
- [Responsiveness](#responsiveness)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Setup Instructions](#setup-instructions)
- [Available Scripts](#available-scripts)
- [CI/CD](#cicd)
- [Demo](#demo)
- [Author](#author)

---

## Overview

This application supports two roles: User and Admin, and provides a complete shopping flow from browsing products to checkout and order management. The backend handles authentication, product and inventory logic, cart and wishlist operations, order processing, notifications, and infrastructure services. The frontend provides the shopping experience, dashboard UI, and user interactions.

---

## Features

### User Functionality

- 🔐 Authentication: register, login, and password recovery via email, address, or phone-based flows
- 🛒 Shop: browse products and categories, view product details, and discover inventory quickly
- 📦 Cart: add, update, remove, and review items with live totals
- ❤️ Wishlist: save favorite products for later
- 🔎 Search & Filter: search by name, category, and price range
- 🧾 Orders: place orders, review order history, and manage order details including cancellation windows
- ⚙️ Profile: manage personal details and interface preferences, including theme support

### Admin Functionality

- 📦 Product Management: create, update, archive, and remove product listings
- 📃 Order Management: monitor customer orders and update statuses such as Pending or Shipped
- 🧾 Export: download order lists as XML for external integrations
- 🌐 Dashboard: responsive admin dashboard optimized for desktop, tablet, and mobile layouts

---

## Responsiveness

The application is fully responsive and optimized for:

- ✅ Mobile
- ✅ Tablets
- ✅ Desktops

It uses Tailwind CSS 4 with Flexbox and Grid utilities, along with conditional rendering patterns to ensure a smooth experience across screen sizes.

---

## Tech Stack

### Frontend

| Technology                                                  | Purpose                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| [React 19](https://react.dev/)                              | UI library for building the interactive storefront and admin dashboard |
| [Vite](https://vitejs.dev/)                                 | Fast dev server and production build tooling                           |
| [TypeScript](https://www.typescriptlang.org/)               | Strong typing for safer frontend development                           |
| [Zustand](https://zustand-demo.pmnd.rs/)                    | Client-side state management for auth, UI state, and theme             |
| [TanStack Query v5](https://tanstack.com/query/latest)      | Fetching, caching, and syncing server data in the client               |
| [TanStack Router](https://tanstack.com/router/latest)       | Route handling and navigation across pages                             |
| [TanStack Form](https://tanstack.com/form/latest)           | Structured form state and validation workflows                         |
| [Zod](https://zod.dev/)                                     | Runtime validation for form data and API inputs                        |
| [Tailwind CSS 4](https://tailwindcss.com/)                  | Utility-first styling for responsive interface design                  |
| [Axios](https://axios-http.com/)                            | HTTP client for communicating with the backend API                     |
| [Lucide React](https://lucide.dev/)                         | Modern icon set for product and app UI                                 |
| [React Toastify](https://fkhadra.github.io/react-toastify/) | Clean toast notifications for user feedback                            |

### Backend

| Technology                                                            | Purpose                                                         |
| --------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Node.js](https://nodejs.org/)                                        | JavaScript runtime that powers the API server                   |
| [NestJS](https://nestjs.com/)                                         | Progressive Node.js framework for scalable backend architecture |
| [TypeScript](https://www.typescriptlang.org/)                         | Type-safe application code across services and modules          |
| [PostgreSQL](https://www.postgresql.org/)                             | Relational database for persistent application data             |
| [Redis](https://redis.io/)                                            | In-memory caching and fast session or performance enhancement   |
| [Drizzle ORM](https://orm.drizzle.team/)                              | Type-safe SQL database access and migrations                    |
| [JWT](https://jwt.io/)                                                | Secure authentication and session token management              |
| [Cloudinary](https://cloudinary.com/)                                 | Cloud image storage and media delivery                          |
| [Nodemailer](https://nodemailer.com/)                                 | Email notifications and transactional messages                  |
| [Helmet](https://helmetjs.github.io/)                                 | Security headers for the HTTP server                            |
| [class-validator](https://github.com/typestack/class-validator)       | Request validation and DTO rules                                |
| [class-transformer](https://github.com/typestack/class-transformer)   | Data transformation and sanitization                            |
| [Throttler](https://github.com/express-rate-limit/express-rate-limit) | Request rate limiting and API protection                        |
| [Pino](https://github.com/pinojs/pino)                                | Structured logging for backend observability                    |

---

## Screenshots

### Modern UI

The latest version includes a dark, modern UI with better accessibility and improved performance.

<details>
<summary>👤 <strong>User Experience</strong></summary>

- Login & Authentication
- Registration
- Password Recovery
- Categories Page
- Products
- Product Details
- Search Modal
- Cart
- Wishlist
- Orders
- Profile

</details>

<details>
<summary>🛠️ <strong>Admin Dashboard</strong></summary>

- Product Inventory Management
- Add New Product
- Edit Product Details
- Order Tracking
- Admin Order Details
- XML Export

</details>

<details>
<summary>💡 <strong>Light Theme</strong></summary>

- Profile Light
- Wishlist Light
- Order History Light
- Admin Orders Light
- Admin Product Details Light

</details>

---

### Legacy UI Reference

<details>
<summary>View Legacy UI Screenshots</summary>

- Legacy Login
- Legacy Products
- Legacy Search Filters
- Legacy Cart (Light)
- Legacy Admin Products
- Legacy Admin Orders

</details>

👉 [View All Screenshots in Gallery](https://imgur.com/a/x2solXr)

---

## Setup Instructions

### Backend (Node.js + NestJS)

1. Clone the repository and navigate to the backend folder.
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in a `.env` file or Docker environment:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://<your_db_username>:<your_db_password>@<your_db_host>:5432/<your_db_name>
JWT_SECRET=<your_secret_key>
JWT_EXPIRATION_TIME=7d
REDIS_HOST=<your_redis_host>
REDIS_PORT=6379
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=<your_smtp_user>
SMTP_PASSWORD=<your_smtp_password>
SMTP_FROM=no-reply@example.com
SMTP_FROM_NAME=Electronics Store
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

4. Start the backend:

```bash
npm run start:dev
```

5. For Docker-based setup:

```bash
docker compose up --build
```

### Frontend (React + Vite)

1. Navigate to the frontend folder.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in the browser at:

```text
http://localhost:5173
```

---

## Available Scripts

### Backend

```bash
npm run build
npm run start
npm run start:dev
npm run start:prod
npm run test
npm run test:e2e
npm run lint
npm run lint:check
npm run format
npm run format:check
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run format:check
npm run format:fix
```

---

## CI/CD

This project uses GitHub Actions for continuous integration. On every push and pull request, the workflow performs:

1. Dependency installation with `npm ci`
2. Linting checks with ESLint
3. Formatting validation with Prettier
4. Production build verification for both frontend and backend

---

## Demo

🚀 Live Demo: [Electronics Store App](https://electronics-online.netlify.app/)

---

## Author

**Elad Reuveny**  
📧 [eladre123@gmail.com](mailto:eladre123@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/eladreuveny/)  
🌐 [Portfolio](https://eladtechportfolio.netlify.app/)

© Electronics — All rights reserved.
