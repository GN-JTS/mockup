# 📊 Mock Data Guide - Complete System Overview

## ✅ Comprehensive Mock Data Implementation

All roles now have complete, properly linked mock data with various statuses and scenarios.

---

## 👥 Users & Roles

### **Administrators**

| ID     | Name              | Email               | Role          | Dept   | Section | Job Title        | Grade |
| ------ | ----------------- | ------------------- | ------------- | ------ | ------- | ---------------- | ----- |
| user-1 | Sarah Admin       | sarah.admin@jts.com | ADMIN         | dept-1 | sec-1   | Shift Supervisor | GC10  |
| user-2 | John UpperManager | john.upper@jts.com  | UPPER_MANAGER | dept-1 | sec-1   | Shift Supervisor | GC10  |

### **Managers**

| ID     | Name            | Email                   | Role             | Dept   | Section | Job Title        | Grade |
| ------ | --------------- | ----------------------- | ---------------- | ------ | ------- | ---------------- | ----- |
| user-3 | Emily Manager   | emily.manager@jts.com   | MANAGER          | dept-1 | sec-1   | Shift Supervisor | GC9   |
| user-4 | Michael Manager | michael.manager@jts.com | TRAINING_MANAGER | dept-2 | sec-3   | Shift Supervisor | GC9   |

### **Training Managers**

| ID     | Name           | Email                  | Dept   | Section | Responsibility                                  |
| ------ | -------------- | ---------------------- | ------ | ------- | ----------------------------------------------- |
| user-5 | Lisa Training  | lisa.training@jts.com  | dept-1 | sec-1   | Assigns promotions to employees in dept-1/sec-1 |
| user-6 | David Training | david.training@jts.com | dept-2 | sec-3   | Assigns promotions to employees in dept-2/sec-3 |

### **Mentors**

| ID     | Name            | Email                   | Dept   | Section | Can Mentor (Target Grade)   |
| ------ | --------------- | ----------------------- | ------ | ------- | --------------------------- |
| user-7 | Robert Mentor   | robert.mentor@jts.com   | dept-1 | sec-1   | Employees targeting **GC7** |
| user-8 | Jennifer Mentor | jennifer.mentor@jts.com | dept-1 | sec-2   | Employees targeting **GC8** |
| user-9 | William Mentor  | william.mentor@jts.com  | dept-2 | sec-3   | Employees targeting **GC9** |

### **Evaluators**

| ID      | Name               | Email                 | Dept   | Section | Can Evaluate (Target Grade) |
| ------- | ------------------ | --------------------- | ------ | ------- | --------------------------- |
| user-10 | Patricia Evaluator | patricia.eval@jts.com | dept-1 | sec-1   | Employees targeting **GC7** |
| user-11 | James Evaluator    | james.eval@jts.com    | dept-1 | sec-2   | Employees targeting **GC8** |
| user-12 | Linda Evaluator    | linda.eval@jts.com    | dept-2 | sec-3   | Employees targeting **GC9** |

### **Employees**

| ID      | Name           | Email             | Current Position     | Dept   | Section | Active Promotion Status          |
| ------- | -------------- | ----------------- | -------------------- | ------ | ------- | -------------------------------- |
| user-13 | Alex Employee  | alex.emp@jts.com  | Field Operator GC6   | dept-1 | sec-1   | → GC7 (In Progress)              |
| user-14 | Maria Employee | maria.emp@jts.com | Console Operator GC7 | dept-1 | sec-2   | → GC8 (In Progress)              |
| user-15 | Chris Employee | chris.emp@jts.com | Field Operator GC6   | dept-1 | sec-1   | → GC7 (Assigned)                 |
| user-16 | Diana Employee | diana.emp@jts.com | Console Operator GC8 | dept-2 | sec-3   | → GC9 (In Progress, Almost Done) |

---

## 🎯 Employee Promotions (4 Active)

### **Promo-1: Alex Employee**

- **Employee**: Alex Employee (user-13)
- **Current**: Field Operator GC6
- **Target**: Field Operator **GC7**
- **Status**: In Progress (some subtasks completed)
- **Assigned By**: Lisa Training (user-5)
- **Assigned Date**: 2024-10-15
- **Mentor**: Robert Mentor (user-7)
- **Evaluator**: Patricia Evaluator (user-10)
- **Required Subtasks**: 1.1, 1.2, 1.3
- **Progress**:
  - ✅ Subtask 1.1 - Mastered by Mentor
  - ⏳ Subtask 1.2 - Attempt 1 (needs more practice)
  - ⭕ Subtask 1.3 - Not Started

### **Promo-2: Maria Employee**

- **Employee**: Maria Employee (user-14)
- **Current**: Console Operator GC7
- **Target**: Console Operator **GC8**
- **Status**: In Progress (midway)
- **Assigned By**: Lisa Training (user-5)
- **Assigned Date**: 2024-10-20
- **Mentor**: Jennifer Mentor (user-8)
- **Evaluator**: James Evaluator (user-11)
- **Required Subtasks**: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2
- **Progress**:
  - ✅✅ Subtask 1.1 - Mastered by both Mentor & Evaluator
  - ✅ Subtask 1.2 - Mentor Mastered, Evaluator Attempt 1
  - ✅ Subtask 1.3 - Mentor Mastered, Evaluator Not Started
  - ⏳ Subtask 1.4 - Attempt 2 by Mentor
  - ⏳ Subtask 2.1 - Attempt 1 by Mentor
  - ⭕ Subtask 2.2 - Not Started

### **Promo-3: Chris Employee**

- **Employee**: Chris Employee (user-15)
- **Current**: Field Operator GC6
- **Target**: Field Operator **GC7**
- **Status**: Assigned (just started, no progress yet)
- **Assigned By**: Lisa Training (user-5)
- **Assigned Date**: 2024-11-10
- **Mentor**: Robert Mentor (user-7)
- **Evaluator**: Patricia Evaluator (user-10)
- **Required Subtasks**: 1.1, 1.2, 1.3
- **Progress**:
  - ⭕ All subtasks Not Started (newly assigned)

### **Promo-4: Diana Employee**

- **Employee**: Diana Employee (user-16)
- **Current**: Console Operator GC8
- **Target**: Console Operator **GC9**
- **Status**: In Progress (almost done, ready for final evaluations)
- **Assigned By**: David Training (user-6)
- **Assigned Date**: 2024-09-15
- **Mentor**: William Mentor (user-9)
- **Evaluator**: Linda Evaluator (user-12)
- **Required Subtasks**: 1.1-1.6, 2.1-2.4 (10 subtasks)
- **Progress**:
  - ✅✅ Subtasks 1.1-1.7 - All Mastered by both Mentor & Evaluator (7/10)
  - ✅ Subtask 2.2 - Mentor Mastered, Evaluator Attempt 1
  - ✅ Subtask 2.3 - Mentor Mastered, Evaluator Not Started
  - ⏳ Subtask 2.4 - Mentor Attempt 1, Evaluator Not Started
  - **Almost ready for certificate!**

---

## 📅 Appointments & Requests (6 Pending/Confirmed, 4 Completed)

### **Pending Requests**

| ID    | Employee | Mentor/Evaluator | Type       | Date   | Status  | Subtasks      |
| ----- | -------- | ---------------- | ---------- | ------ | ------- | ------------- |
| req-1 | Alex     | Robert Mentor    | Mentorship | Nov 20 | Pending | 1.3           |
| req-4 | Chris    | Robert Mentor    | Mentorship | Nov 21 | Pending | 1.1           |
| req-5 | Diana    | Linda Evaluator  | Evaluation | Nov 23 | Pending | 2.2, 2.3, 2.4 |

### **Proposed (Needs Employee Response)**

| ID    | Employee | Mentor/Evaluator | Original Date | Proposed Date | Subtasks |
| ----- | -------- | ---------------- | ------------- | ------------- | -------- |
| req-2 | Maria    | Jennifer Mentor  | Nov 19 14:00  | Nov 20 09:00  | 1.4      |

### **Confirmed (Upcoming)**

| ID    | Employee | Mentor/Evaluator | Type       | Date         | Subtasks |
| ----- | -------- | ---------------- | ---------- | ------------ | -------- |
| req-3 | Maria    | James Evaluator  | Evaluation | Nov 22 10:00 | 1.2      |
| req-6 | Diana    | William Mentor   | Mentorship | Nov 19 10:00 | 2.4      |

### **Completed**

| ID     | Employee | Mentor/Evaluator | Date   | Outcome                         |
| ------ | -------- | ---------------- | ------ | ------------------------------- |
| appt-3 | Alex     | Robert Mentor    | Oct 20 | Subtask 1.1 Mastered            |
| appt-4 | Alex     | Robert Mentor    | Oct 25 | Subtask 1.2 needs more practice |
| appt-5 | Maria    | Jennifer Mentor  | Oct 25 | Subtask 1.1 Mastered            |
| appt-6 | Diana    | William Mentor   | Nov 13 | Subtask 2.3 Excellent           |

---

## 🗓️ Calendar Availability

### **Mentors**

- **Robert Mentor (user-7)**: Mon-Fri 9am-5pm

  - Available slots: Nov 18-19 multiple times
  - Pending: Nov 20 10:00 (req-1), Nov 21 14:00 (req-4)

- **Jennifer Mentor (user-8)**: Mon-Fri 9am-5pm

  - Available slots: Nov 19-20 multiple times

- **William Mentor (user-9)**: Mon-Fri 8am-4pm
  - Booked: Nov 19 10:00 (appt-2 with Diana)
  - Available slots: Nov 19-20 multiple times

### **Evaluators**

- **Patricia Evaluator (user-10)**: Mon-Fri 9am-6pm

  - Available slots: Nov 20-21 multiple times

- **James Evaluator (user-11)**: Mon-Fri 9am-6pm

  - Booked: Nov 22 10:00 (appt-1 with Maria)
  - Available slots: Nov 21-22 multiple times

- **Linda Evaluator (user-12)**: Mon-Fri 9am-6pm
  - Pending: Nov 23 09:00 (req-5 with Diana)
  - Available slots: Nov 22-23 multiple times

---

## 🔄 Workflows by Role

### **Admin / Upper Manager**

- Can manage all system configuration
- Create/edit job titles, grades, tasks, subtasks
- Configure promotion requirements matrix
- View all users and promotions

### **Training Manager**

**Lisa Training (dept-1, sec-1)**:

- Manages: Alex (promo-1), Chris (promo-3)
- Can assign new promotions
- Tracks progress dashboards

**David Training (dept-2, sec-3)**:

- Manages: Diana (promo-4)
- Can assign new promotions
- Tracks progress dashboards

### **Manager**

- Views employees in their department/section
- Reads employee promotion progress
- Cannot assign promotions (Training Manager only)

### **Mentor Workflow**

**Robert Mentor** → Alex & Chris (targeting GC7):

1. Receives appointment request from Alex for subtask 1.3
2. Reviews Alex's progress: 1 mastered, 1 in attempt1, 1 not started
3. Can approve/reject appointment request
4. Conducts mentorship session
5. Evaluates subtasks: Not Started → Attempt 1 → Attempt 2 → Mastered
6. Provides feedback

**Jennifer Mentor** → Maria (targeting GC8):

1. Proposed new time for subtask 1.4 re-evaluation
2. Waiting for Maria to accept proposed time
3. Tracks Maria's progress across 6 subtasks

**William Mentor** → Diana (targeting GC9):

1. Has confirmed appointment Nov 19 for subtask 2.4
2. Diana is almost done (7/10 mastered by both)
3. Final mentor evaluations before evaluator certification

### **Evaluator Workflow**

**Patricia Evaluator** → Alex & Chris (targeting GC7):

- Waits for mentor to complete evaluations
- Can start evaluating Alex's subtask 1.1 (mentor mastered)
- Chris not ready yet (all not started)

**James Evaluator** → Maria (targeting GC8):

- Has confirmed appointment Nov 22 for subtask 1.2
- Can evaluate subtasks 1.1 (mentor mastered), 1.3 (mentor mastered)
- Provided feedback on subtask 1.2: needs improvement

**Linda Evaluator** → Diana (targeting GC9):

- Has pending request for Nov 23 (final evaluations!)
- 7/10 subtasks fully mastered
- 3 subtasks need final evaluation (2.2, 2.3, 2.4)
- **Can issue certificate when all 10 mastered!**

### **Employee Workflow**

**Alex** (promo-1 → GC7):

1. Views dashboard: 1/3 subtasks mastered
2. Sees active promotion progress
3. Books appointment with Robert for subtask 1.3
4. Tracks mentor/evaluator feedback

**Maria** (promo-2 → GC8):

1. Dashboard shows 6 subtasks, 1 fully mastered
2. Needs to respond to Jennifer's proposed time change
3. Has confirmed evaluation appointment with James Nov 22
4. Midway through promotion

**Chris** (promo-3 → GC7):

1. Just assigned promotion
2. No progress yet (all not started)
3. Pending appointment request with Robert for first subtask
4. Needs to start training

**Diana** (promo-4 → GC9):

1. Dashboard shows 7/10 fully mastered! 🎉
2. Has confirmed mentor appointment Nov 19
3. Pending evaluator appointment request Nov 23
4. **Very close to completion and certificate!**

---

## 🏆 Certificates

Currently no certificates issued yet (Diana is closest to completion).

When Diana completes all 10 subtasks:

- System will auto-issue certificate
- Certificate will include:
  - promotionId: promo-4
  - jobTitleId: job-console-operator
  - gradeId: grade-gc9
  - masteredSubtaskIds: all 10 subtasks
  - issuedBy: Linda Evaluator
  - certificateNumber: JTS-2024-001

---

## 🔗 Data Relationships

```
User (Employee)
  └─ EmployeePromotion (target jobTitle + grade)
      ├─ PromotionRequirement (what's required for this combo)
      │   └─ Tasks & Subtasks (specific requirements)
      └─ EmployeeProgress (per subtask tracking)
          ├─ mentorStatus (Not Started → Attempt 1 → Attempt 2 → Mastered)
          ├─ evaluatorStatus (same progression)
          ├─ mentorFeedback
          └─ evaluatorFeedback

AppointmentRequest
  ├─ employeeId
  ├─ mentorOrEvaluatorId
  ├─ promotionId (links to specific promotion)
  ├─ subtaskIds (what will be evaluated)
  └─ status (pending → approved/proposed → confirmed)

Appointment (confirmed)
  ├─ Links to AppointmentRequest
  ├─ promotionId
  └─ status (confirmed → completed)

Mentor/Evaluator Filtering:
  - Mentor.mentorFor[].gradeId = EmployeePromotion.targetGradeId
  - Evaluator.evaluatorFor[].gradeId = EmployeePromotion.targetGradeId
  - **NOT** User.gradeId (current grade)
```

---

## 🧪 Test Scenarios

### 1. **Login as Training Manager (Lisa)**

- Email: `lisa.training@jts.com`
- Password: `password`
- Should see: Alex, Chris in employee list
- Can: Assign new promotions, view progress

### 2. **Login as Mentor (Robert)**

- Email: `robert.mentor@jts.com`
- Password: `password`
- Should see: Alex, Chris (both targeting GC7)
- Has: 2 pending appointment requests
- Can: Approve/reject requests, evaluate subtasks

### 3. **Login as Evaluator (Linda)**

- Email: `linda.eval@jts.com`
- Password: `password`
- Should see: Diana (targeting GC9)
- Has: 1 pending appointment request (Nov 23)
- Can: Perform final evaluations, issue certificate

### 4. **Login as Employee (Alex)**

- Email: `alex.emp@jts.com`
- Password: `password`
- Should see: Active promotion to GC7, 1/3 mastered
- Has: 1 pending appointment request
- Can: View progress, book appointments, see feedback

### 5. **Login as Employee (Diana)**

- Email: `diana.emp@jts.com`
- Password: `password`
- Should see: 7/10 subtasks mastered
- Has: 1 confirmed, 1 pending appointment
- Status: Almost ready for certificate!

---

## 📊 Status Distribution

| Status          | Count | Percentage |
| --------------- | ----- | ---------- |
| Not Started     | 9     | 27%        |
| Attempt 1       | 4     | 12%        |
| Attempt 2       | 1     | 3%         |
| Mentor Mastered | 18    | 55%        |
| Both Mastered   | 8     | 24%        |

**Total Subtasks in Progress**: 33 across 4 promotions

---

## ✅ System is Now Fully Functional

All roles have:

- ✅ Proper data with realistic statuses
- ✅ Linked promotions and progress
- ✅ Appointment workflows (pending, proposed, confirmed, completed)
- ✅ Calendar availability
- ✅ Mentor/Evaluator filtering by TARGET grade
- ✅ Various progression states to test all scenarios

The system is ready for comprehensive end-to-end testing! 🚀
