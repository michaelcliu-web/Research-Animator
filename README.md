# Reel Research

Reel Research turns research papers into short animated explainer videos. Upload a PDF, pick who the explanation is for (5th grade, 10th grade, or college), and it writes a summary, plans the scenes, narrates them, and animates them in the style of 3Blue1Brown. Each finished video comes with key takeaways, a short quiz, and a reading list, and you can ask follow-up questions about the paper beside the video.

This repository is the React frontend. The video pipeline lives in the Django backend, [reel-research-backend](https://github.com/michaelcliu-web/reel-research-backend). The two talk over a single authenticated WebSocket, so generation progress and the summary stream into the dashboard as they happen.

## Getting Started

These instructions will get a copy of the frontend running on your local machine for development and testing.

### Prerequisites

- Node.js 18 or newer, with npm
- The [backend](https://github.com/michaelcliu-web/reel-research-backend) running locally on port 8000
- A [Clerk](https://clerk.com) application (the frontend needs its publishable key)

```bash
node --version
```

### Installing

Clone the repository and install dependencies:

```bash
git clone https://github.com/michaelcliu-web/Research-Animator.git
cd Research-Animator
npm install
```

Copy the environment file and add your Clerk publishable key:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm start
```

Open http://localhost:3000 and sign in.

To try it out, pick one of the example papers on the dashboard (or drop in your own PDF) and choose a skill level. The progress bar moves through reading, summarizing, planning, and animating while the summary streams in beside it. When the video is done it shows up in **My Videos** and in the **Feed**, where you can open the takeaways, the quiz, and the reading list, or ask questions about the paper.

## Configuration

| Variable | Default in `.env.example` | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://localhost:8000/api/` | Backend REST base URL. Media files are served from the same origin without `/api/` |
| `REACT_APP_WS_URL` | `ws://localhost:8000/` | Backend WebSocket origin |
| `REACT_APP_CLERK_PUBLISHABLE_KEY` | none | Clerk publishable key for sign-in |
| `REACT_APP_IS_PRODUCTION` | `false` | Turns on Sentry when `true` |
| `REACT_APP_SENTRY_DSN` | empty | Sentry project DSN |
| `REACT_APP_GA_TRACKING_ID` | empty | Google Analytics 4 measurement ID |

## How It Works

```
 Browser ──POST /api/papers/upload/──▶ Django ──▶ PostgreSQL + media/papers/
    │
    ├──WS generate_video {paper_id, skill_level}──▶ pipeline
    │        PDF text → summary (Claude Haiku) → storyboard (Claude Opus)
    │        → per scene: narration (ElevenLabs) → Manim code (Claude Opus) → render
    │        → stitch scenes (ffmpeg) → takeaways, quiz, reading list
    │                                                    │
    ◀────── status updates + streamed summary ───────────┘
    │
    └──GET /media/videos/<id>_final.mp4 (videos, thumbnails, PDFs)
```

- **Sign-in:** Clerk handles authentication. The app sends the Clerk session token as a `Bearer` header on uploads and as a `token` query parameter when it opens the WebSocket.
- **Connection:** `useAppSocket` opens one WebSocket to `ws/app/` after sign-in and reconnects with exponential backoff (1 s up to 15 s) if it drops.
- **Generating:** uploading a PDF returns a `paper_id`. `useVideoGeneration` then sends `generate_video` and moves the progress bar through each `status` the backend reports. It lives above the views, so a run keeps going while you switch tabs.
- **Library and feed:** `useVideoLibrary` asks for `list_videos` to fill My Videos and the Feed. The Feed plays one video per screen and pauses the rest.
- **Questions:** `usePaperChat` sends `ask_question` and appends the streamed `ask_answer` chunks to the chat.

The backend README lists the full WebSocket protocol.

### Project Structure

```
src/
├── config/         # API URLs, upload request, stages, skill levels, example papers
├── hooks/          # WebSocket connection, generation state, library, chat, quiz
├── views/          # One folder per sidebar tab: Dashboard, Feed, MyVideos, Settings
├── components/     # Sidebar, login, shared icons/spinners, study cards (quiz, takeaways, read next)
└── utils/          # Formatting, quiz scoring, socket helpers
public/research-paper-examples/   # Sample PDFs shown on the dashboard
```

## Running the Tests

There is no automated test suite yet. `npm test` starts the Create React App test runner, but there are no test files. ESLint (the `react-app` config) runs during `npm start` and `npm run build`.

## Deployment

```bash
npm run build
```

This writes a static production build to `build/` with source maps turned off. Set the `REACT_APP_*` variables to your production backend before building, because they are baked in at build time.

## Built With

- [React](https://react.dev) with [Create React App](https://create-react-app.dev): frontend
- [Tailwind CSS](https://tailwindcss.com): styling
- [Framer Motion](https://www.framer.com/motion/): animation
- [Clerk](https://clerk.com): authentication
- [Axios](https://axios-http.com): file uploads
- [Sentry](https://sentry.io) and Google Analytics: monitoring

## Authors

- Michael Liu
- William Du

## License

No license has been chosen yet.
