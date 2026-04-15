# CyberSecure Platform — Core API & Backend

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

**The resilient, heavily-fortified backend engine for the CyberSecure Platform.**
</div>

## Overview
This repository contains the backend server constructed using **NestJS**, a progressive Node.js framework building efficient, reliable, and scalable server-side applications. The server utilizes **TypeORM** to interface with a MySQL 8.0 instance. Its primary responsibility is maintaining secure access control, managing encrypted blobs, logging system events, and orchestrating the WebSocket network.

## Architecture

The backend utilizes NestJS's modular architecture:
- `AuthModule`: Manages JWT parsing, Multi-factor Authentication tokens (TOTP via Authenticator apps), and session controls.
- `SecurityModule`: Central mechanism for producing comprehensive `AuditLogs`. Guards critical endpoints from brute attacks via configurable `RateLimiters`.
- `ChatModule`: Orchestrates isolated WebSocket server namespaces mapping to encrypted conversations.
- `FilesModule`: Local storage ingestion pipeline validating incoming encrypted boundaries.
- `Tasks/Projects Module`: CRUD entities restricted by Role-based access control.

## Installation

```bash
$ npm install
```

## Running the app

Ensure your MySQL container/service is running before starting the server. Standard development port is `3001`.

```bash
# development
$ npm run start

# watch mode (Standard approach for active development)
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Environment Variables
The root `K-T-T01/backend/.env` file requires the following structure:

```env
# Server
PORT=3001

# Database (MySQL 8.0 Docker Default)
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=cybersecure_dev
DB_NAME=cybersecure_v2

# Security & Encryption
JWT_SECRET=YOUR_SUPER_SECRET_KEY
SESSION_SECRET=YOUR_SESSION_SECRET

# Email Configuration (Nodemailer instance)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM="CyberSecure <no-reply@cybersecure.com>"
```

## Authentication & Authorization Pipelines
All REST endpoints (excluding `/auth/login` and `/auth/register`) strictly utilize the `@UseGuards(JwtAuthGuard)` metadata. Moreover, managerial functions implement `@Roles('Admin', 'Manager')` role guards to prevent vertical privilege escalation.
