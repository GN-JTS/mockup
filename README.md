# JTS System - React + Vite Mockup

A fully functional UI mockup for the Job Training Standard (JTS) System built with React, TypeScript, and TailwindCSS.

## 📋 Overview

This mockup demonstrates a comprehensive training management system featuring:

- **7 User Roles**: Admin, Upper Manager, Manager, Training Manager, Mentor, Evaluator, Employee
- **Complete Workflows**: Assignment requests, evaluations, appointments, certificates
- **Advanced Features**: Individual calendars, appointment negotiation, flexible evaluation system
- **Hierarchical Certificates**: Track previously mastered skills across certificate levels

## 🚀 Getting Started

### Prerequisites

- Node.js 22.11.0 or higher
- npm 10.9.1 or higher

### Installation

```bash
cd jts-mockup
npm install
```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Deployment

This project includes automatic deployment to Netlify on every push to the `main` branch via GitHub Actions.

For deployment setup instructions, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md).

## 🔑 Demo Login Credentials

The application includes quick login options for all roles. Use any of the following emails with password: `password`

| Role             | Email                 |
| ---------------- | --------------------- |
| Employee         | alex.emp@jts.com      |
| Manager          | emily.manager@jts.com |
| Training Manager | lisa.training@jts.com |
| Mentor           | robert.mentor@jts.com |
| Evaluator        | patricia.eval@jts.com |
| Admin            | sarah.admin@jts.com   |

## 📐 Architecture

### Project Structure

```
src/
├── components/        # Reusable UI components
│   └── common/       # Shared components (Sidebar, Header, Toast, etc.)
├── pages/            # Page components
│   ├── Auth/         # Login page
│   └── Dashboard/    # Role-based dashboards
├── layouts/          # Layout components
├── routes/           # React Router configuration
├── mock/             # Mock data and API services
│   ├── data/         # Mock data files
│   └── services/     # Mock API with setTimeout delays
├── context/          # React Context providers
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
    ├── constants.ts  # Enums and constants
    ├── formatters.ts # Date/number formatters
    └── validators.ts # Form validation
```

### Key Features Demonstrated

#### 1. Role-Based Access Control

- 7 distinct user roles with tailored dashboards
- Role-specific menu items and permissions
- Conditional rendering based on user role

#### 2. Standards Assignment Workflow

- **Flow**: Training Manager → Manager → Employee
- Training Manager assigns standard to employee
- Manager reviews and approves/rejects
- Employee reviews and accepts/rejects
- Enrollment activated only when both approve

#### 3. Flexible Evaluation System

- **Status Progression**: Can pass directly to Master OR Attempt 1 → Attempt 2 → Master
- Attempt 1 and Attempt 2 are retry opportunities only
- Employees may demonstrate mastery on first attempt
- Separate mentor and evaluator evaluation statuses

#### 4. Re-evaluation Rules

- Only subtasks with Attempt 1 or Attempt 2 status appear for rescheduling
- Mastered subtasks are NOT re-evaluated (unless part of new certificate)
- Evaluation queues automatically filter based on status

#### 5. Individual Calendar System

- Each mentor/evaluator has their own calendar
- Real-time availability tracking
- Prevents double-booking and conflicts
- Calendar slots: Available, Booked, Pending Approval, Blocked

#### 6. Appointment Negotiation Workflow

- Employee sends request with preferred date/time
- Mentor/Evaluator can:
  - Approve immediately
  - Reject and propose new time
- Negotiation loop continues until both confirm
- Calendar slots locked during negotiation

#### 7. Standards with Flexible Content

- Standards can contain ANY subset of subtasks from tasks
- Not all subtasks from a task must be in a standard
- Flexible standard composition for different certification levels

#### 8. Hierarchical Certificates

- Each certificate includes previous certificate tasks + new ones
- Previously mastered subtasks tracked and displayed
- Only new subtasks require evaluation
- No re-evaluation of mastered content

### Mock Data Structure

The application uses comprehensive mock data including:

- **Users**: 16 users across 7 roles
- **Departments**: 3 departments with 5 sections
- **Tasks**: 5 base tasks
- **Subtasks**: 13 subtasks belonging to tasks
- **Standards**: 5 standards with subset subtask selection
- **Assignments**: Assignment requests with workflow states
- **Evaluations**: Subtask evaluations with mentor/evaluator statuses
- **Appointments**: Requests with negotiation states
- **Calendars**: Individual calendars for mentors/evaluators
- **Certificates**: Issued certificates with hierarchical relationships

## 🔄 User Journeys

### Employee Journey

1. Receive assignment request (Training Manager → Manager → Employee)
2. Review and approve/reject assignment
3. Work on assigned tasks/subtasks
4. View mentor/evaluator calendars and book appointments
5. Negotiate appointment times if needed
6. Mentor evaluates (can achieve Master directly or through attempts)
7. After mentor mastery, book evaluator appointment
8. Evaluator evaluates (same flexible approach)
9. Receive certificate after all subtasks mastered
10. For next certificate, only new subtasks need evaluation

### Training Manager Journey

1. Select employee and standard
2. Submit assignment request
3. Monitor approval progress (Manager → Employee)
4. Track department training statistics

### Manager Journey

1. Receive assignment requests
2. Review employee eligibility and standard requirements
3. Approve or reject with comments
4. Monitor team training progress

### Mentor Journey

1. Manage personal calendar availability
2. Receive and respond to appointment requests
3. Approve, reject, or propose new times
4. Conduct mentorship sessions
5. Evaluate subtasks (Master directly or through attempts)
6. Only Attempt 1/2 status subtasks appear for re-evaluation

### Evaluator Journey

1. Manage personal calendar availability
2. View evaluation queue (employees with mentor mastery)
3. Negotiate appointment times with employees
4. Conduct final evaluations
5. Evaluate subtasks (Master directly or through attempts)
6. Only Attempt 1/2 status subtasks appear for re-evaluation

### Admin Journey

1. Manage users and roles
2. Create/edit tasks, subtasks, and standards
3. Assign mentors/evaluators to departments/sections
4. View system-wide metrics and reports

## 🔌 Replacing Mock Data with Real API

The mock API is located in `src/mock/services/mockApi.ts`. To replace with real API calls:

1. **Create API Service**:

```typescript
// src/services/api.ts
const API_BASE_URL = "https://your-api.com";

export const api = {
  async getEnrollments() {
    const response = await fetch(`${API_BASE_URL}/enrollments`);
    return response.json();
  },
  // ... other endpoints
};
```

2. **Update Components**:
   Replace `mockApi` imports with your real `api`:

```typescript
// Before
import { mockApi } from "@/mock/services/mockApi";

// After
import { api } from "@/services/api";
```

3. **Remove setTimeout Delays**:
   The mock API includes artificial delays (500-1500ms) to simulate network latency. Your real API won't need these.

4. **Authentication**:
   Replace the mock JWT token in `AuthContext.tsx` with real authentication:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  setUser(data.user);
  localStorage.setItem("jts_token", data.token);
};
```

## 🎨 UI/UX Features

- **Loading States**: Skeleton loaders and spinners
- **Error States**: Error messages with retry options
- **Empty States**: Friendly messages when no data available
- **Toast Notifications**: Success/error feedback
- **Responsive Design**: Mobile-friendly layouts
- **Accessibility**: ARIA labels and keyboard navigation

## 🛠️ Technology Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first styling
- **React Router v6**: Client-side routing
- **Heroicons**: Icon library
- **Context API**: Global state management

## 📝 Design Decisions

### Why Context API over Redux/Zustand?

For a mockup demonstration, Context API provides sufficient state management without additional dependencies.

### Why Mock Data with setTimeout?

Simulates real API behavior including loading states, error handling, and async operations.

### Why TypeScript?

Provides type safety, better developer experience, and self-documenting code.

### Why Tailwind CSS?

Rapid UI development with utility classes, consistent design system, and small bundle size.

## 🔍 Key Implementation Details

### Evaluation Status Progression

```typescript
// Can go directly to Master
NOT_STARTED → MASTER

// Or through retry attempts
NOT_STARTED → ATTEMPT_1 → ATTEMPT_2 → MASTER
```

### Assignment Workflow States

```typescript
PENDING_MANAGER → PENDING_EMPLOYEE → APPROVED → ACTIVE
// Or rejected at any stage
PENDING_MANAGER → REJECTED
PENDING_EMPLOYEE → REJECTED
```

### Appointment Negotiation States

```typescript
// Employee requests
PENDING
// Mentor/Evaluator proposes new time
→ PROPOSED
// Employee accepts
→ APPROVED
// Both confirmed
→ CONFIRMED
```

### Re-evaluation Filter Logic

```typescript
// Only show for re-evaluation:
evaluation.status === ATTEMPT_1 || evaluation.status === ATTEMPT_2;

// Mastered items excluded:
evaluation.status !== MASTER;
```

## 🚧 Future Enhancements

While this mockup demonstrates core functionality, a production system would include:

1. **Real-time Updates**: WebSocket connections for live notifications
2. **File Uploads**: Attach documents to evaluations
3. **Advanced Search**: Filter and search across all data
4. **Bulk Operations**: Mass updates for admin tasks
5. **Detailed Analytics**: Charts and graphs for training metrics
6. **Email Integration**: Automated email notifications
7. **Mobile App**: Native mobile application
8. **Offline Support**: Progressive Web App capabilities
9. **Advanced Reporting**: PDF export of certificates and reports
10. **Audit Logs**: Complete history of all system actions

## 📄 License

This is a mockup demonstration project created for the JTS System requirements.

## 👥 Support

For questions about this mockup implementation, please refer to the source code comments which explain UI decisions, data flow, and journey steps throughout the application.
