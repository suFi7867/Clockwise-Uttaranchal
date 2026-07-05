# Clockwise Project

Clockwise is a comprehensive platform designed to streamline various tasks and operations within an organization. This document provides an overview of its key features, available routes, architectural details, and instructions on how to install and configure the application.

## Features

- **User Authentication:** Secure login and registration system.
- **Dashboard:** Customizable dashboard with quick access to essential information.
- **Task Management:** Create, assign, and track tasks efficiently.
- **Reporting:** Generate detailed reports for analysis and presentation.
- **Integration:** Seamless integration with third-party services.

## Routes

Clockwise exposes several routes to facilitate interaction. Below are some of the key endpoints:

### Authentication
- `/api/login` - POST: Authenticate a user and return a token.
- `/api/register` - POST: Register a new user.
- `/api/logout` - POST: Invalidate the current session.

### Task Management
- `/api/tasks` - GET: Retrieve all tasks.
- `/api/tasks/{id}` - GET: Retrieve a single task by ID.
- `/api/tasks` - POST: Create a new task.
- `/api/tasks/{id}` - PUT: Update an existing task.
- `/api/tasks/{id}` - DELETE: Delete a task.

### Reports
- `/api/reports` - GET: Retrieve all reports.
- `/api/reports/{id}` - GET: Retrieve a single report by ID.
- `/api/reports` - POST: Generate a new report.

## Architecture

Clockwise follows a microservices architecture to ensure scalability and maintainability. The core components include:

- **Auth Service:** Handles user authentication and authorization.
- **Task Service:** Manages task creation, retrieval, update, and deletion.
- **Report Service:** Generates and manages reports.

Each service is containerized using Docker and communicates with the database via a shared PostgreSQL instance.

## Installation Guide

### Prerequisites
- Docker
- Docker Compose
- Node.js
- npm

### Steps to Install

1. **Clone the Repository**
   ```bash
   git clone https://github.com/suFi7867/Clockwise-Uttaranchal
   cd clockwise
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add the following variables:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=clockwise
   DB_USER=admin
   DB_PASSWORD=password
   JWT_SECRET=your_jwt_secret
   ```

3. **Build Docker Images**
   ```bash
   docker-compose build
   ```

4. **Start Services**
   ```bash
   docker-compose up -d
   ```

5. **Initialize Database**
   ```bash
   docker-compose exec auth-service npx prisma migrate dev --name init
   ```

6. **Run Migrations for Other Services**
   Repeat the above step for other services if necessary.

7. **Access the Application**
   Open your browser and navigate to `http://localhost:3000` to access the Clockwise dashboard.

### Configuration

You can configure various settings in the `.env` file, such as database credentials, JWT secret, and more.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) for details on how to contribute to the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.