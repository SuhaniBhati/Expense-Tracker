# 💰 Expense Tracker

A **full-stack expense management application** that helps users record, organize, track, and analyze their personal expenses through a clean and intuitive interface.

The application provides a centralized dashboard where users can manage their expenses, monitor spending activity, and gain insights into their spending patterns.

## ✨ Features

### 🔐 Authentication & Authorization

* User registration and login
* Secure user authentication
* Protected application routes
* User-specific expense data
* JWT-based authentication and authorization

### 💰 Expense Management

* Add new expenses
* Edit existing expenses
* Delete expenses
* View complete expense history
* Categorize expenses
* Store expense descriptions and amounts
* Track expense dates

### 📊 Dashboard & Analytics

* Overview of total expenses
* Expense summaries
* Category-wise spending analysis
* Identify spending patterns
* Visual representation of financial data

### 🔎 Search & Filtering

* Search expenses by relevant details
* Filter expenses by category
* Filter expenses by date
* Quickly locate specific transactions

### 📱 Responsive Interface

* Responsive design across different screen sizes
* Clean and intuitive user interface
* Mobile-friendly layouts
* Reusable React components

## 🛠️ Tech Stack

### Frontend

* **React.js** – Building the user interface
* **JavaScript** – Application logic
* **CSS / Tailwind CSS** – Styling and responsive design
* **Axios / Fetch API** – Client-server communication
* **React Router** – Client-side routing

### Backend

* **Node.js** – JavaScript runtime environment
* **Express.js** – REST API framework
* **MongoDB** – Database
* **Mongoose** – MongoDB object modeling
* **JWT** – Authentication and authorization

### Development Tools

* **Git & GitHub** – Version control and source management
* **VS Code** – Development environment
* **npm** – Package management
* **Postman** – API development and testing

## 🏗️ Application Architecture

The application follows a **client-server architecture**:

```text
┌──────────────────────┐
│      React.js        │
│      Frontend        │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│    Express.js        │
│      Backend         │
└──────────┬───────────┘
           │
           │ Mongoose
           ▼
┌──────────────────────┐
│      MongoDB         │
│      Database        │
└──────────────────────┘
```

Authentication is handled using **JWT tokens**, while protected routes ensure that users can only access and manage their own expense data.

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/SuhaniBhati/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Install Dependencies

Install the dependencies for the frontend and backend according to the project's directory structure.

```bash
npm install
```

If the frontend and backend are separate applications, install dependencies in each directory:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory and add the required environment variables.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

> **Note:** Never commit your `.env` file or other sensitive credentials to GitHub.

### 4. Start the Application

Start the backend:

```bash
npm run server
```

Start the frontend:

```bash
npm start
```

The application will be available locally at the configured frontend URL.

## 📂 Project Structure

```text
Expense-Tracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔒 Security

The application uses authentication and authorization mechanisms to protect user data.

* JWT-based authentication
* Protected API routes
* User-specific expense records
* Environment variables for sensitive configuration
* `.gitignore` to prevent sensitive files from being committed

## 🎯 Project Goals

This project was built to demonstrate practical experience with:

* Full-stack web development
* REST API development
* Authentication and authorization
* Database design and CRUD operations
* React-based frontend development
* Client-server communication
* Responsive UI development
* Data visualization and analytics

## 🔗 Repository

**GitHub:**
https://github.com/SuhaniBhati/Expense-Tracker

## 👩‍💻 Author

**Suhani Bhati**

GitHub: https://github.com/SuhaniBhati
