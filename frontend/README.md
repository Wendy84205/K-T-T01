# CyberSecure Platform — UI / Frontend

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vanilla CSS](https://img.shields.io/badge/Vanilla_CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**The administrative web interface and user portal for CyberSecure.**
</div>

## Overview
This is the Web Frontend of the CyberSecure project, bootstrapped with `Create React App`. It serves as the primary gateway for System Administrators, Project Managers, and General Users. 

## Core Capabilities
- **End-to-End Encrypted Messaging Environment**: Supports native client-side encryption/decryption of chat threads and metadata utilizing `Crypto.Subtle` Web APIs.
- **Zero-Trust Dashboard**: Full multi-factor authentication setup UI.
- **Admin Security Console**: Visualize global server health, trigger manual **Lockdowns**, and review real-time WebSocket connection traffic and Audit Logs.
- **Custom Design System**: Pure CSS-driven theming without bloated frameworks (Tailwind/Bootstrap are excluded here to ensure lightning-fast CSS parse times and absolute structural control).

## Available Scripts

In the project directory, run:

### `npm start`
Runs the application in development mode on port `3000`.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser. Automatic hot-reloading is enabled.

### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for maximal performance. The build is minified and the filenames include the hashes.

## Integration with Backend & Tuners
In development environments utilizing Cloudflare Tunnels (via `start-tunnels.sh`), the script automatically modifies `src/config.js` to ensure the frontend properly directs its Axios and Socket.IO requests to the ephemeral public URL rather than `localhost:3001`.

**Note:** Be sure to revert `src/config.js` or avoid committing it if you manually override endpoints.

## State Management
The application avoids heavy state solutions like Redux, instead utilizing standard React Context API for global, lightly changing elements:
- `AuthContext`: Session lifecycle.
- `E2EEContext`: Cryptographic keychain.
- `SocketContext`: Stateful WebSocket pipelines.
