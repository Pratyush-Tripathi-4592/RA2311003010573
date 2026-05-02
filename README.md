
This is a complete Node.js + TypeScript + Express backend built for the evaluation assignment.

## Features implemented
- Pre-test registration and auth flow
- Reusable logging middleware (`logging_middleware/`)
- Vehicle Maintenance Scheduler algorithm (0/1 Knapsack) (`vehicle_maintence_scheduler/`)
- Notification system design markdown (`notification_system_design.md`)
- Priority inbox solver (`notification_app_be/`)
- Pure backend, no frontend, clean architecture

## Requirements
- Node.js 20+

## Setup & Running
1. Copy `.env.example` to `.env` (or configure your environment variables):
   ```
   AFFORD_EMAIL=your-email@example.com
   AFFORD_NAME="Your Name"
   AFFORD_MOBILE=9999999999
   AFFORD_ROLL_NO=YOUR_ROLL_NO
   AFFORD_ACCESS_CODE=YOUR_ACCESS_CODE
   GITHUB_USERNAME=yourgithub
   AFFORD_BASE_URL=http://evaluation-server-url
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

## Endpoints
- `GET /health` : Health check
- `POST /auth/register` : Executes the full registration & auth flow. Saves `clientId`, `clientSecret`, and `token` internally for subsequent calls.
- `GET /vehicle-scheduling/solve` : Solves the knapsack problem based on fetched vehicles and depots.
- `GET /notifications/priority?limit=10` : Fetches notifications and sorts them by priority and time using the specified weights.