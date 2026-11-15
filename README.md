# JobPortal

A full stack job portal where users sign up, browse jobs, apply with a validated form, and track the status of their applications.

**Repository:** https://github.com/AnushkaNellipalli/jobportal

**Live Demo:** coming soon

## Screenshots

Add screenshots of the home page, jobs page, apply form, and My Applications page here.

## Overview

JobPortal is built to practice a real-world full stack workflow: a React frontend that talks to a Django REST API, with token-based login and data saved in a database. A user can go from browsing jobs to applying and tracking each application in one place.

## Features

- Sign up and log in with email, using a custom Django user model
- JWT authentication
- Browse jobs and open a job page
- Apply to a job with a form that validates required fields
- My Applications page loaded from the backend, with status filters (In Review, Shortlisted, Rejected), a progress timeline, and loading, empty, and logged-out states
- Profile page
- Responsive layout for desktop and mobile

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Django, Django REST Framework |
| Authentication | JWT (token blacklist enabled) |
| Database | SQLite (development) |

## Project Structure

```
jobapplication-main/
├── backend/
│   ├── accounts/        # custom user model, auth
│   ├── jobs/            # job listings
│   ├── applications/    # job applications API
│   ├── config/          # Django settings and urls
│   └── manage.py
├── src/
│   ├── pages/           # Home, Jobs, JobPage, ApplyJob, Applications, Profile, Login, Register
│   ├── components/
│   └── utils/
├── package.json
└── vite.config.js
```

## Run Locally

### 1. Backend

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at http://127.0.0.1:8000

### 2. Frontend

Open a new terminal in the project root:

```
npm install
npm run dev
```

The app runs at http://localhost:5173

### 3. Try it

1. Register a new account and log in.
2. Open Jobs and choose a job.
3. Submit the apply form.
4. Open My Applications to see it listed.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values. Never commit your real `.env` file.

## What I Learned

- Designing a custom user model so users log in with email
- Building REST endpoints with Django REST Framework ViewSets and routers
- Securing endpoints with JWT and calling them from React
- Handling loading, error, empty, and logged-out states in the UI

## Future Improvements

- Employer dashboard to post jobs and update application status
- Resume upload
- Search and filters on the jobs page
- Deployment of the frontend and backend

## Author

Anushka Nellipalli
GitHub: https://github.com/AnushkaNellipalli