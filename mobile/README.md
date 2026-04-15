# CyberSecure Platform — Mobile Client

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**High-fidelity, secure mobile companion for the CyberSecure Enterprise Platform.**
</div>

## Overview
This is the dedicated mobile application for the CyberSecure Platform, built natively with **React Native (Expo)** and styled using **NativeWind** (Tailwind CSS for React Native). The app is designed following modern, premium UI standard matching Telegram/iOS visual aesthetics while fully supporting the security requirements (End-to-End Encryption, WebSockets, etc.) of the web platform.

## Features
- **Dark Theme Interface**: Fully integrated, battery-saving dark mode with glassmorphism UI elements.
- **Staggered Animations**: Native spring transitions during Authentication, MFA, and PIN setup.
- **Real-time Messaging**: Socket.IO-based chat system integrating End-to-End Encryption (E2EE) decoding natively on the mobile device.
- **Secure File Vault**: Mobile-optimized offline and online file viewers for encrypted documents.
- **User Task Management**: Floating action boards, checklists, and project status interactions.
- **Role-based Dashboards**: Distinct dashboards for Users, Managers, and Admins.

## Quick Start
```bash
# 1. Install Dependencies
cd mobile
npm install

# 2. Start the Metro Bundler
npx expo start

# Alternatively, use the automated script in the root directory:
# ../scripts/start-mobile.sh
```

## Security & E2EE Implementation
To maintain absolute security without compromising user experience, the mobile application does **not** persist the End-to-End Encryption `privateKey` in plain text.
- E2EE Keys retrieved from the backend are unlocked via the **Master Password** on the first run.
- The raw key is then re-encrypted using a **6-digit Local PIN** and stored in iOS Keychain / Android KeyStore (`expo-secure-store`).
- Subsequent app launches require only the 6-digit PIN, providing seamless yet cryptographically secure communication.

## Architectural Notes
- The app uses `Lucide-React-Native` instead of standard expo icons for a clean, consistent vector layout.
- Styling strictly relies on the project's design tokens (e.g., `bg-tl-bg`, `text-tl-primary`) mapped inside `tailwind.config.js`.
- Inline styles are deliberately avoided for layout to prevent native re-render bottlenecks unless executing `Animated.View` hooks.

## Build for Production
To build standalone APKS/AABs for Android or IPAs for iOS, utilize Expo Application Services (EAS):
```bash
npm install -g eas-cli
eas login
eas build --profile production
```
