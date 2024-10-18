# Pet Social Media Web App Backend

## Description

A social media web application for pet lovers to share and interact with posts about their pets.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/yourproject.git
   ```
2. Navigate to the project directory:
   ```sh
   cd yourproject
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Usage

To start the application, run:

```sh
npm run start

Features
User authentication and authorization
Posting and commenting on posts
Real-time chat functionality
Email notifications for comments
Environment Setup
Create a .env file in the root directory.
Add the following environment variables:

DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE_API_KEY=your_email_service_api_key
FRONTEND_URL=your_frontend_url

Running Tests
To run unit tests:

To run end-to-end tests:

API Documentation
Chat
Get all messages: GET /chat/messages
Get messages between users: GET /chat/messages/:sender/:receiver
Get chat users for a user: GET /chat/chat-users/:userId
Comments
Create a comment: POST /comments
Delete a comment: DELETE /comments/:commentId
Get comments by post ID: GET /comments/post/:postId
Contributing
Fork the repository.
Create a new branch:
git checkout -b feature-branch
Make your changes and commit them:
Push to the branch:
Open a pull request.
```
