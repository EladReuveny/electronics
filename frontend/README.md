# 🛍️ Electronics E-Commerce Application

An advanced **Full-Stack E-Commerce Web Application** for electronics, built with a modern tech stack and a focus on performance, scalability, and user experience.

- ⚙️ **Backend**: Spring Boot (Java)
- 💻 **Frontend**: React 19 (TypeScript)
- 🗄️ **Database**: PostgreSQL
- 🤖 **CI/CD**: GitHub Actions

This responsive web application supports two roles: **User** and **Admin**, offering a complete and seamless cart experience.

---

## ✨ Features

### 👤 User Functionality

- 🔐 **Authentication**: Register, Login, and Forgot Password (via email/address/phone).
- 🛒 **Shop**: Browse products and categories, view detailed product information.
- 📦 **Cart**: Add, update, and remove items with real-time calculations.
- ❤️ **Wishlist**: Save favorite products for later.
- 🔎 **Search & Filter**: Powerful search by name, category, and price range.
- 🧾 **Orders**: Place orders, view order history, and manage order details (including cancellation within a time window).
- ⚙️ **Profile**: Manage personal details and application preferences (Dark/Light mode support).

### 🛠️ Admin Functionality

- 📦 **Product Management**: Full CRUD operations for products and categories.
- 📃 **Order Management**: Monitor all customer orders and update statuses (Pending, Shipped, etc.).
- 🧾 **Export**: Download order lists in XML format for external integration.
- 🌐 **Dashboard**: A responsive admin interface optimized for all devices.

---

## 📱 Responsiveness

The application is fully responsive and optimized for:

- ✅ **Mobile** (Phones)
- ✅ **Tablets**
- ✅ **Desktops**

It utilizes **Tailwind CSS 4** (Flexbox and Grid) along with conditional rendering to ensure a seamless experience across all screen sizes.

---

## ⚙️ Tech Stack

### 💻 Frontend (Electronics Store UI)

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**:
  - [Zustand](https://zustand-demo.pmnd.rs/) (Client-side state: Auth, Theme)
  - [TanStack Query v5](https://tanstack.com/query/latest) (Server-side state: Data fetching/caching)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Form Handling**: [TanStack Form](https://tanstack.com/form/latest) & [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Toastify](https://fkhadra.github.io/react-toastify/)

### ⚙️ Backend

- **Framework**: Spring Boot (Java)
- **Data Access**: Spring Data JPA
- **Format Support**: Jackson (JSON & XML)
- **API**: RESTful Web Services
- **Build Tool**: Maven

### 🗄️ Database & Storage

- **Database**: PostgreSQL
- **Image Hosting**: Imgur

---

## 📸 Screenshots

### 🌟 New Modern UI (Current Version)

The latest version of the application features a sleek, dark-themed modern interface with improved accessibility and performance.

<details>
<summary>👤 <strong>User Experience (New UI)</strong></summary>

- **Login & Authentication**  
  ![Login](https://imgur.com/PTR1Cgc.png)
- **Registration**  
  ![Register](https://imgur.com/9fztvqO.png)
- **Password Recovery**  
  ![Forgot Password](https://imgur.com/DmoM8Tq.png)
- **Browse Categories**  
  ![Categories Page](https://imgur.com/0k0wZ93.png)
- **Product Discovery**  
  ![Products](https://imgur.com/LZSVuSp.png)
- **Detailed Product View**  
  ![Product Details](https://imgur.com/TyDabSs.png)
- **Search Experience**  
  ![Search Modal](https://imgur.com/RWVI8rJ.png)
- **cart Cart**  
  ![cart Cart](https://imgur.com/8yCQgEx.png)
- **Wishlist**  
  ![Wishlist](https://imgur.com/0Xx60UU.png)
- **Orders Overview**  
  ![Orders](https://imgur.com/ZaTpzGT.png)
- **Detailed Order History**  
  ![Order Details](https://imgur.com/wUwzRad.png)
- **User Profile Settings**  
  ![Profile](https://imgur.com/9fMK6vZ.png)

</details>

<details>
<summary>🛠️ <strong>Admin Dashboard (New UI)</strong></summary>

- **Product Inventory Management**  
  ![Admin Products](https://imgur.com/DwpC5Wh.png)
- **Add New Product**  
  ![Add Product Modal](https://imgur.com/VJIASxC.png)
- **Edit Product Details**  
  ![Edit Product Modal](https://imgur.com/HVdGTzC.png)
- **Order Tracking**  
  ![Admin Orders](https://imgur.com/n0SR4Qa.png)
- **Order Details (Admin View)**  
  ![Admin Product Details](https://imgur.com/yYGOvdX.png)
- **XML Data Export**  
  ![XML Format](https://imgur.com/N0hF8yH.png)

</details>

<details>
<summary>💡 <strong>Light Theme (New UI)</strong></summary>

- **User Profile (Light)**  
  ![Profile Light](https://imgur.com/MSpy3AD.png)
- **Wishlist (Light)**  
  ![Wishlist Light](https://imgur.com/tyrCIZo.png)
- **Order History (Light)**  
  ![Order Details Light](https://imgur.com/IbmEoUg.png)
- **Admin Orders (Light)**  
  ![Admin Orders Light](https://imgur.com/qVyRTpM.png)
- **Admin Product Details (Light)**  
  ![Admin Product Details Light](https://imgur.com/FKCSVe3.png)

</details>

---

### 🏛️ Legacy UI (Reference)

Previous iterations of the UI design for historical reference.

<details>
<summary>View Legacy UI Screenshots</summary>

- **Legacy Login**  
  ![Legacy Login](https://imgur.com/hHHfjjU.png)
- **Legacy Products**  
  ![Legacy Products](https://imgur.com/yJkQK11.png)
- **Legacy Search Filters**  
  ![Legacy Search](https://imgur.com/7rZb5pq.png)
- **Legacy Cart (Light)**  
  ![Legacy Cart Light](https://imgur.com/LwRyNZX.png)
- **Legacy Admin Products**  
  ![Legacy Admin Products](https://imgur.com/gGOUsAx.png)
- **Legacy Admin Orders**  
  ![Legacy Admin Orders](https://imgur.com/bjmox9p.png)

</details>

👉 [**View All Screenshots in Gallery**](https://imgur.com/a/x2solXr)

---

## 🎥 Demo

🚀 **Live Demo**: [Electronics Store App](https://electronics-store-app.netlify.app/)

---

## 🛠️ Setup Instructions

### 🔧 Backend (Spring Boot)

1. Clone the repository and navigate to the backend folder.
2. Update `src/main/resources/application.properties` with your PostgreSQL credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/your_db_name
   spring.datasource.username=your_db_username
   spring.datasource.password=your_db_password
   ```
3. Run the `ElectronicsApplication.java` file.

### 💻 Frontend (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173).

---

## 📜 Available Scripts

- `npm run dev`: Start development server with HMR.
- `npm run build`: Build the project for production (includes type-checking).
- `npm run lint`: Run ESLint to check for code quality.
- `npm run format:check`: Check code formatting with Prettier.
- `npm run format:fix`: Automatically fix code formatting with Prettier.
- `npm run preview`: Preview the production build locally.

---

## 🤖 CI/CD

This project uses **GitHub Actions** for continuous integration. On every push and pull request, the following checks are performed:

1. **Clean Install**: Uses `npm ci` for reliable dependency management.
2. **Linting**: Ensures code adheres to ESLint rules.
3. **Formatting**: Validates code style using Prettier.
4. **Build & Type-Check**: Runs `tsc` and ensures the project builds successfully.

---

## 👨‍💻 Author

**Elad Reuveny**  
📧 [eladre123@gmail.com](mailto:eladre123@gmail.com)  
🔗 [LinkedIn](https://www.linkedin.com/in/eladreuveny/)  
🌐 [Portfolio](https://eladreuveny-portfolio.netlify.app/)

© Electronics Store App — All rights reserved.
