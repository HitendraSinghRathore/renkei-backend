# Renkei Backend

[Renkei](https://renkei-latest.onrender.com/)

Renkei is a collaborative whiteboard app backend built with **Node.js**. It powers real-time communication using **Socket.io**, ensures data validation with **express-validator**, and uses **MongoDB** for storage. User authentication is implemented via **Passport.js** with Google OAuth. 
The projec is hosted on [Render](https://render.com/). Please checkout the website for a cheap and faster hosting solution.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Renkei backend is designed to handle real-time collaboration and secure user authentication. It provides RESTful endpoints and Socket.io channels for seamless integration with the frontend.

---

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework
- **Socket.io**: Real-time bidirectional communication
- **express-validator**: Request data validation
- **MongoDB**: NoSQL database
- **Passport.js**: Authentication middleware (Google OAuth integration)
- **Docker**: Used to create build images and deploy to render using github CI/CD with actions
 

---

## Prerequisites

Before running the backend, ensure you have installed:

- Node.js (v14+ recommended)
- MongoDB
- NPM (or Yarn)

---

## Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
PORT=8080
NODE_ENV=development
MONGODB_URI=<domain>
JWT_AUTH_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
GOOGLE_CLIENT_ID=<client_id>
GOOGLE_CLIENT_SECRET=<secret>
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
REDIRECT_DOMAIN=http://localhost:3000
UI_DOMAIN=http://localhost:3000
```
## Google OAuth Configuration Notes

**Important:**

* The `GOOGLE_API_KEY` and `GOOGLE_API_SECRET` are *crucial* credentials used by Passport.js for Google OAuth 2.0 authentication. **Keep these secure and do not expose them in client-side code.**

* The `FRONTEND_DOMAIN` environment variable *must* be set to the exact URL of your frontend application. This is essential for Passport.js to correctly handle the OAuth callback after the user authenticates with Google. A mismatch in the domain will prevent the authentication process from completing successfully.

**Key Configuration Points:**

* **`GOOGLE_API_KEY`:** This is your Google Cloud Platform (GCP) API key. You obtain this from the Credentials section of the Google Cloud Console. Ensure that the API key has the necessary permissions enabled for Google OAuth.

* **`GOOGLE_API_SECRET`:** This is your Google Cloud Platform (GCP) API secret. This is a *highly sensitive* piece of information. **Treat it like a password and never expose it in client-side code.** Store it securely as an environment variable on your server.

* **`FRONTEND_DOMAIN`:** This is the *exact* URL of your frontend application. It *must* match the authorized redirect URIs you've configured in your Google Cloud Console Credentials. Common examples:

    * **Development:** `http://localhost:3000` (or the port your frontend is running on)
    * **Production:** `https://your-deployed-frontend-domain.com` (e.g., `https://www.example.com`)

    Be precise with the protocol (`http://` or `https://`) and any subdomains. A trailing slash can also sometimes cause issues, so be consistent.

**Security Best Practices:**

* **Environment Variables:** Store `GOOGLE_API_KEY`, `GOOGLE_API_SECRET`, and `FRONTEND_DOMAIN` as environment variables on your server. This is the standard and most secure way to manage sensitive information.
* **Server-Side Only:** Implement the Google OAuth flow *entirely* on your server. Do not attempt to handle any part of the OAuth process on the client-side.
* **Authorized Redirect URIs:** In the Google Cloud Console, configure the "Authorized redirect URIs" for your OAuth credentials. These URIs *must* match the callback URL on your server (e.g., `https://your-backend-domain.com/auth/google/callback`). The domain part of these URIs should also match the `FRONTEND_DOMAIN` when appropriate.

**Example Configuration (Conceptual):**

```javascript
// Server-side code (e.g., in your authentication setup)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_API_SECRET = process.env.GOOGLE_API_SECRET;
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

// ... Passport.js configuration
passport.use(new GoogleStrategy({
    clientID: GOOGLE_API_KEY,
    clientSecret: GOOGLE_API_SECRET,
    callbackURL: `${YOUR_BACKEND_DOMAIN}/auth/google/callback`, // Matches authorized redirect URI
  },
  // ... your strategy callback
));
```
---
## Setup & Installation


### Clone the Repository

```bash

git clone https://github.com/HitendraSinghRathore/renkei-backend.git
cd renkei-backend
```
---
### Install Dependencies
```bash
npm install
```
---
### Run the Development Server
```bash

npm run start
```

---

## Usage

### API Base URL
```javascript
http://localhost:8080
```

### Real-Time Communication
Handled via Socket.io

### Authentication
Uses Passport.js with Google OAuth

### API Documentation
YTD

---
## Contributing

Contributions are welcome! Please fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

---
## License

This project is licensed under the [MIT License](https://mit-license.org/).
