
# Evaluation Service Backend

Node.js + TypeScript + Express backend for managing evaluations, scheduling, and notifications.

## Features
- User authentication and registration flow
- Structured logging middleware
- Vehicle maintenance scheduling with optimization algorithm
- Notification system with priority-based inbox
- Clean architecture with separation of concerns

## Requirements
- Node.js 20+

## Setup & Running
1. Copy `.env.example` to `.env` and configure your environment variables:
   ```
   PORT=3000
   EMAIL=user@example.com
   NAME="Your Name"
   MOBILE=9999999999
   ROLL_NO=YOUR_ROLL_NO
   ACCESS_CODE=YOUR_ACCESS_CODE
   GITHUB_USERNAME=yourgithub
   BASE_URL=http://evaluation-server-url
   CLIENT_ID=
   CLIENT_SECRET=
   BEARER_TOKEN=
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

## API Endpoints
- `GET /health` - Health check
- `POST /auth/register` - Register and authenticate user
- `GET /vehicle-scheduling/solve` - Optimize vehicle maintenance scheduling
- `GET /notifications/priority?limit=10` - Get priority-sorted notifications