<<<<<<< HEAD
# note-app
=======

# Note-App

This is a web-based Note Application built using Node.js, Express, MongoDB, Passport.js for authentication, and EJS as the templating engine. The app allows users to register, log in, manage their notes, and view a personalized dashboard.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Routes](#routes)
- [Technologies Used](#technologies-used)
- [License](#license)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/mslater/note-app.git
   cd note-app
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables:

   Create a `.env` file in the root of your project and add the following variables:

   ```bash
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_secret_key
   ```

4. Start the application:

   ```bash
   npm start
   ```

## Configuration

- **MongoDB**: You need a MongoDB instance running. You can set the connection URI in the `.env` file using the `MONGODB_URI` variable.
- **Session Secret**: This is used to sign session cookies. Set a strong secret in the `SESSION_SECRET` variable.

## Usage

- Access the application via `http://localhost:3000` (or another port if specified in your `.env`).
- Register for an account or log in if you already have one.
- After logging in, you will be redirected to your dashboard where you can manage your notes.

### Protected Routes

- `/dashboard`: A protected route that requires authentication. This route displays a personalized dashboard with the user's notes.
- `/noteview`: Another protected route that renders a note view page.

## Features

- **User Authentication**: Registration and login functionality using Passport.js and session-based authentication.
- **Note Management**: Users can create and manage their personal notes.
- **Session Handling**: Secure sessions with configurable expiration and cookie settings.
- **EJS Templating**: Server-side rendering with EJS templates.
- **MongoDB Integration**: Persistent storage of user information and notes.

## Folder Structure

```
.
├── models
│   ├── User.js          # User schema and model
│   └── ToDo.js          # ToDo (Note) schema and model
├── public               # Static files (CSS, JS, images)
├── routers
│   ├── authRouter.js    # Routes related to authentication
│   └── todoRouter.js    # Routes related to notes (ToDo)
├── views
│   ├── dashboard.ejs    # Dashboard view template
│   ├── index.ejs        # Home page template
│   ├── login.ejs        # Login page template
│   └── register.ejs     # Registration page template
├── .env                 # Environment variables (not included in repo)
├── app.js               # Main application file
└── README.md            # This README file
```

## Routes

### Public Routes

- `GET /`: Renders the homepage with a welcome message.
- `GET /login`: Renders the login page.
- `GET /register`: Renders the registration page.
- `POST /login`: Authenticates the user and redirects to the dashboard.
- `POST /register`: Registers a new user.

### Protected Routes

- `GET /dashboard`: Displays the user's dashboard with their notes (requires authentication).
- `GET /noteview`: Displays the note view page (requires authentication).

## Technologies Used

- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user data and notes.
- **Passport.js**: Middleware for authentication.
- **EJS**: Embedded JavaScript templating engine for rendering views.
- **dotenv**: For loading environment variables.
- **express-session**: For session handling.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
>>>>>>> 5359bdf (First Commit)
