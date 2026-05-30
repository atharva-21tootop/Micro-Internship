# MITAOE Micro Internship Portal

React + Firebase + Node/Firebase backend structure for managing micro internships for MITAOE Computer Department students, organizations, and admins.

Last updated: May 20, 2026

## Current Status

The project has been cleaned and standardized into a full-stack layout:

```text
client/  -> React frontend
server/  -> Node/Firebase backend modules
shared/  -> reusable logic shared by client/server
scripts/ -> Firebase maintenance and seed scripts
```

Latest restructuring completed:

- Root-level duplicate `src/` was moved into `client/src/`.
- Dataset CSV files were moved from `Dataset/` to `scripts/seed/data/`.
- Tooling folders `.agents/`, `.claude/`, and `.trae/` were removed from the project root.
- Frontend pages were grouped by audience: `public`, `student`, `admin`, and `organization`.
- Reusable UI components were grouped into `common`, `layout`, and `notifications`.
- Firebase client setup was moved to `client/src/services/firebase/client.js`.
- Admin Firestore business logic was moved from the dashboard page into `client/src/services/adminService.js`.
- Internship filtering/profile matching logic was moved into `client/src/services/ai/filteringService.js`.
- Reusable validators were moved into `shared/validators/index.js`.
- Backend folders were created under `server/src` for routes, controllers, middleware, functions, services, and Firebase Admin config.
- Import aliases were added and verified.

Verification after restructuring:

```bash
npm run lint
npm run build
```

Both commands pass.

## Tech Stack

- React 18
- Vite
- React Router DOM
- Firebase Auth
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK for scripts/server modules
- Lucide React icons
- ESLint

## Run The Project

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Default app URL:

```text
http://localhost:3000
```

If port `3000` is busy, Vite may use another port such as:

```text
http://127.0.0.1:3001/index.html
```

Build production bundle:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Preview production build:

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the project root with:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase is initialized in:

```js
import { auth, db, storage } from '@/services/firebase/client'
```

## Final Folder Structure

```text
review 6/
├─ client/
│  └─ src/
│     ├─ components/
│     │  ├─ common/
│     │  │  ├─ ErrorBoundary.jsx
│     │  │  └─ LoadingSpinner.jsx
│     │  ├─ layout/
│     │  │  └─ Header.jsx
│     │  └─ notifications/
│     │     └─ Notifications.jsx
│     ├─ hooks/
│     │  └─ useNotifications.js
│     ├─ pages/
│     │  ├─ admin/
│     │  │  ├─ AdminDashboard.jsx
│     │  │  └─ AdminUtils.jsx
│     │  ├─ organization/
│     │  │  └─ OrganizationDashboard.jsx
│     │  ├─ public/
│     │  │  ├─ Community.jsx
│     │  │  ├─ Home.jsx
│     │  │  ├─ InternshipDetail.jsx
│     │  │  ├─ Internships.jsx
│     │  │  ├─ Login.jsx
│     │  │  └─ Register.jsx
│     │  └─ student/
│     │     ├─ Achievements.jsx
│     │     ├─ Profile.jsx
│     │     └─ StudentDashboard.jsx
│     ├─ services/
│     │  ├─ ai/
│     │  │  ├─ filteringService.js
│     │  │  ├─ recommendationService.js
│     │  │  └─ resumeGenerator.js
│     │  ├─ firebase/
│     │  │  └─ client.js
│     │  ├─ achievementService.js
│     │  ├─ adminService.js
│     │  ├─ applicationService.js
│     │  ├─ authService.js
│     │  ├─ communityService.js
│     │  ├─ internshipService.js
│     │  ├─ notificationService.js
│     │  ├─ organizationService.js
│     │  └─ userService.js
│     ├─ utils/
│     │  ├─ seedInternships.js
│     │  └─ validators.js
│     ├─ App.jsx
│     ├─ main.jsx
│     └─ index.css
├─ server/
│  └─ src/
│     ├─ api/
│     │  ├─ controllers/
│     │  │  └─ internshipController.js
│     │  ├─ middleware/
│     │  │  └─ requireAuth.js
│     │  └─ routes/
│     │     └─ internshipRoutes.js
│     ├─ config/
│     │  └─ firebaseAdmin.js
│     ├─ functions/
│     │  ├─ ai/
│     │  ├─ applications/
│     │  ├─ auth/
│     │  └─ internships/
│     ├─ services/
│     │  ├─ applicationService.js
│     │  └─ internshipService.js
│     └─ index.js
├─ shared/
│  └─ validators/
│     └─ index.js
├─ scripts/
│  ├─ clearFirebaseData.js
│  ├─ seedInternshipsFromCSV.js
│  └─ seed/
│     └─ data/
├─ firebase.json
├─ firestore.indexes.json
├─ firestore.rules
├─ index.html
├─ package.json
├─ vite.config.js
└─ eslint.config.js
```

## Important Import Aliases

Configured in `vite.config.js`:

```js
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'client/src'),
    '@shared': path.resolve(__dirname, 'shared')
  }
}
```

Use these imports in the web project:

```js
import Header from '@/components/layout/Header'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import Notifications from '@/components/notifications/Notifications'

import Home from '@/pages/public/Home'
import Internships from '@/pages/public/Internships'
import InternshipDetail from '@/pages/public/InternshipDetail'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import Community from '@/pages/public/Community'

import StudentDashboard from '@/pages/student/StudentDashboard'
import Profile from '@/pages/student/Profile'
import Achievements from '@/pages/student/Achievements'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUtils from '@/pages/admin/AdminUtils'

import OrganizationDashboard from '@/pages/organization/OrganizationDashboard'

import { auth, db, storage } from '@/services/firebase/client'
import { loginWithEmail, logoutUser, signupWithEmail } from '@/services/authService'
import { getUser, createOrUpdateUser } from '@/services/userService'
import { subscribeToInternships, getInternshipById } from '@/services/internshipService'
import { applyToInternship, getApplicationsByUser } from '@/services/applicationService'
import { createNotification } from '@/services/notificationService'

import {
  filterInternships,
  getInternshipFilterOptions,
  getProfileMatchedFilters,
} from '@/services/ai/filteringService'

import { recommendInternships } from '@/services/ai/recommendationService'
import { generateResumeSummary } from '@/services/ai/resumeGenerator'

import { validateRegisterForm } from '@/utils/validators'
import { validateInternshipForm } from '@shared/validators'
```

Avoid old imports like:

```js
import Home from './pages/Home'
import { auth } from '../services/firebase'
import { validateRegisterForm } from '../utils/validators'
```

Use alias imports instead where possible.

## Frontend Routes

Routes are defined in `client/src/App.jsx`.

```text
/                    -> public/Home
/internships         -> public/Internships
/internships/:id     -> public/InternshipDetail
/community           -> public/Community
/login               -> public/Login
/register            -> public/Register
/student-dashboard   -> student/StudentDashboard
/profile             -> student/Profile
/achievements        -> student/Achievements
/admin-dashboard     -> admin/AdminDashboard
/admin-utils         -> admin/AdminUtils
/org-dashboard       -> organization/OrganizationDashboard
```

## Main Features

### Students

- Browse internships.
- Search and filter internships.
- Match internships using profile skills/interests.
- View internship details.
- Apply to internships.
- Track applications from dashboard.
- **Student portfolio profile** (`/profile`):
  - Tabs: Personal Info, Academic, Internships, Achievements, Skills & AI Insights
  - Edit skills, career interests, projects, manual internship experience, resume upload
  - Profile completeness bar, AI keyword insights, internship recommendations
  - Resume preview modal with PDF download (auto-filled from profile)
  - Achievement badges with points (includes auto-badges from accepted applications)

### Organizations

- Register organization accounts.
- Create internship posts.
- View applications.
- Accept or reject student applications.
- Receive notifications for approval/rejection events.

### Admins

- View department overview.
- Monitor students, organizations, internships, and applications.
- Review pending internships.
- Approve or reject internships.
- Use database utility tools during development.

## Firebase Collections Used

```text
users
internships
applications
notifications
achievements
achievementTemplates
discussions
events
studyGroups
```

## Firebase Scripts

Seed internships from CSV using Firebase Admin SDK:

```bash
node scripts/seedInternshipsFromCSV.js
```

CSV files are stored in:

```text
scripts/seed/data/
```

The seed script expects `serviceAccountKey.json` in the project root. Do not commit that file.

Clear Firebase data:

```bash
node scripts/clearFirebaseData.js
```

Use this carefully because it deletes Firestore data.

## Backend Structure

The backend is now prepared under `server/src`.

Current backend modules:

```text
server/src/config/firebaseAdmin.js
server/src/services/internshipService.js
server/src/services/applicationService.js
server/src/functions/internships/index.js
server/src/functions/applications/index.js
server/src/functions/auth/index.js
server/src/functions/ai/recommendationService.js
server/src/functions/ai/resumeGenerator.js
server/src/api/controllers/internshipController.js
server/src/api/routes/internshipRoutes.js
server/src/api/middleware/requireAuth.js
server/src/index.js
```

The current frontend still talks mostly to Firebase client SDK services. The server folder is ready for moving heavier admin, AI, and protected workflows into backend/Firebase Functions.

## AI Module Cleanup

AI-related logic is standardized into:

```text
client/src/services/ai/filteringService.js
client/src/services/ai/recommendationService.js
client/src/services/ai/resumeGenerator.js
server/src/functions/ai/recommendationService.js
server/src/functions/ai/resumeGenerator.js
```

Frontend pages should call AI service modules, not keep filtering or scoring logic directly inside components.

## Shared Logic

Reusable validation lives in:

```text
shared/validators/index.js
```

Client compatibility export:

```text
client/src/utils/validators.js
```

Use `@shared/validators` for shared validation when possible.

## Admin Test Account

Temporary admin account used during testing:

```text
Email:    admin@mitaoe.edu
Password: 123456789admin
Role:     admin
```

First-time setup:

1. Create this user in Firebase Authentication.
2. Copy the generated UID.
3. Create a Firestore document in `users/{uid}`.
4. Add:

```text
role: "admin"
email: "admin@mitaoe.edu"
fullName: "Admin User"
verified: true
password: 123456789admin
```

Then login and open:

```text
/admin-dashboard
```

## Known Notes

- `npm run build` passes, but Vite reports a large bundle warning. This is not a build failure.
- Code splitting with lazy routes is recommended next.
- Some routes still use component-level auth redirects. Central role guards should be added.
- Some frontend workflows still call Firestore directly through client services. Sensitive admin and AI workflows should gradually move to backend/Firebase Functions.

## SaaS Scaling Recommendations

- Add route guards and role-based access wrappers.
- Move admin approvals and privileged writes to backend functions.
- Add organization/tenant IDs to business documents.
- Add pagination everywhere collection reads can grow.
- Add Cloud Functions for notifications, emails, and audit logs.
- Add Firestore indexes for every production query.
- Add `.env.example`.
- Add tests for validators, services, and key user flows.
- Add lazy route loading to reduce bundle size.
- Add audit fields such as `createdBy`, `updatedBy`, `approvedBy`, and `tenantId`.

## Current Quality Check

```text
Lint:  passed
Build: passed
Imports: updated to new folder structure and aliases
```

The project is now structured for cleaner frontend/backend/shared ownership and is ready for continued feature work.