# Habit Tracker App

A simple, goal-oriented habit tracking application where users can create, manage, and track their daily and weekly habits. The app provides insightful analytics and includes basic user authentication, an admin panel, and suggested habit templates to help users stay motivated.

---

## Features

### User Functionality
- Register/Login with session-based authentication
- Create/Edit/Delete Habits with daily or weekly frequency
- Log Habit Status (completed, partial, missed, or day off)
- Weekly Progress View with color-coded mini calendar
- Analytics Page showing:
  - Completion percentages
  - Weekly progress heatmaps
  - Streak tracking and badges
  - Average scores and trends

### Admin Functionality
- View all registered users
- See each user’s habits
- Add suggested habits for users to explore and add
- View top 5 active users and basic system stats

---

## Technologies Used

- Node.js / Express for backend
- MongoDB / Mongoose for database
- Express-Session for session handling
- Handlebars (HBS) for view rendering
- Custom CSS for styling and layout
- Chart.js for analytics charts
- connect-flash for success/error messaging

---

## Security Measures

- Sessions and cookie handling for auth state
- Password handling (with optional hashing via bcrypt)
- Validation and duplication checks on input
- Environment variables used for secrets and DB config
- Mongoose ORM protects against injection attacks

---

## Getting Started

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or via MongoDB Atlas

### Setup Instructions

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
npm install
```

Create a `.env` file with:

```
SESSION_SECRET=yourSecretKey
MONGO_URI=yourMongoDBConnectionString
```

Then run the app:

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
/models        → Mongoose schemas
/routes        → Express route controllers
/views         → Handlebars templates
/public        → Static assets and styles
/config        → Database connection
/utils         → Streak and scoring helpers
```

---

## Notes

- Suggested habits can be added by the admin and viewed by users.
- Logs support different scoring (2 = completed, 1 = partial, 0 = missed, 'f' = day off).
- Streaks apply to daily habits; weekly habits show progress against a weekly goal.
- All analytics and visual indicators are designed to give users feedback and encourage consistency.


