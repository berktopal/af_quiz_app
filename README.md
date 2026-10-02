# AF Quiz — API Server

REST API for an American Football trivia quiz: serves randomized question sets and keeps a top-10 leaderboard. Node.js + Express + MongoDB (Mongoose).

![CI](https://github.com/berktopal/af_quiz_app/actions/workflows/ci.yml/badge.svg)

> **Status:** this repository contains the API server. The web client is being reworked and is not included yet.

## Features

- **Randomized quizzes:** each request returns 10 random questions (MongoDB `$sample`)
- **Leaderboard:** stores scores with username and avatar, returns the top 10 (highest score, most recent first); duplicate submissions are ignored
- **Question import:** loads the question bank from a JSON file into MongoDB
- **Admin-protected operations:** importing questions and deleting scores require an admin token
- **Input validation & injection protection:** score payloads are type- and range-checked; Mongoose `sanitizeFilter` strips query operators such as `$ne`

## Tech Stack

Node.js · Express 5 · MongoDB · Mongoose · GitHub Actions (smoke tests against a real MongoDB)

## API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/questions` | – | 10 random questions |
| GET | `/api/scores` | – | Top 10 scores |
| POST | `/api/scores` | – | Save a score: `{ "username", "score", "total", "avatar" }` (`0 ≤ score ≤ total ≤ 100`) |
| POST | `/api/import` | `x-admin-token` | Replace the question bank from `server/data/af_quiz_questions_50.json` |
| DELETE | `/api/scores/:id` | `x-admin-token` | Delete a score |

### Question file format

`server/data/af_quiz_questions_50.json` (not committed) is an array of:

```json
{
  "question": "How many points is a touchdown worth?",
  "options": ["3", "6", "7", "2"],
  "correctAnswer": "6",
  "category": "Rules"
}
```

## Getting Started

### Prerequisites
- Node.js 20.6+ (uses the built-in `--env-file` flag)
- MongoDB running locally (or a connection string)

### Run
```bash
cd server
cp .env.example .env        # set ADMIN_TOKEN to a long random value
npm install
npm start                   # http://localhost:5000
```

Load the questions once:
```bash
curl -X POST http://localhost:5000/api/import -H "x-admin-token: <ADMIN_TOKEN>"
```

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/af-quiz` | MongoDB connection string |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed client origin |
| `ADMIN_TOKEN` | – | Required for `/api/import` and score deletion |

## Project Structure

```
server/
├── index.js            # Express app, routes, validation, admin guard
├── models/
│   ├── Question.js     # question, options[], correctAnswer, category
│   └── Score.js        # username, score, total, avatar, date
└── .env.example
```
