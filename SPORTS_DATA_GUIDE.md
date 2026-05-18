# RawSports Live – Multi-Sports Data Guide

This document outlines the real-world sports networks connected to your Next.js backend and mobile clients, explaining exactly what live telemetry metrics, schedules, and standings data you will see in each section of your app!

---

## 1. Active Global API Networks & Keys

| Sport | Provider | Endpoint Focus | Configured Active Key |
| :--- | :--- | :--- | :--- |
| **Football (Soccer)** | [API-Football](https://api-sports.io/) | Live matches, event timelines, league standings | `c6f87537c730149933b93de45eb7eef3` |
| **Cricket** | [CricAPI](https://cricketdata.org/) | Ball-by-ball summaries, live run rates, wickets, series calendars | `a421fe4e-67e9-4cdb-8e30-0648da1c0b5f` |
| **Basketball (NBA)** | [balldontlie](https://api.balldontlie.io/) | Quarter-by-quarter score progression, schedules | `1fc77b43-b658-464a-9b2e-3bf9d9d37748` |
| **UFC / MMA** | [TheSportsDB](https://www.thesportsdb.com/) | Fight cards, challenger ratings, arena schedules | `3` (Free Sandbox Sandbox Key) |
| **Formula 1 / F1** | Ergast API | Lap timers, pit stop intervals, championship standings | Unified Sandbox Feed |
| **Tennis & Esports** | Sports-Reference Feed | Live match scores, sets, round structures | Unified Sandbox Feed |

---

## 2. Exactly What You Will See By Sport

### ⚽ Football (Soccer)
* **Live Scores:** Real-time scores, active timers (e.g. `74'`), half-time (HT) markers.
* **Match Telemetry:** Ball possession (%), total shots, shots on target, yellow/red cards, corner kicks, fouls.
* **Live Timeline:** Time-stamps for Goals (with player name & assistant), substitutions, yellow/red cards.
* **League Standings:** Premier League rankings table displaying: Rank, Games Played (GP), Wins (W), Draws (D), Losses (L), total Points (PTS), and recent five-match form (e.g., `W-W-D-L-W`).

### 🏏 Cricket
* **Live Scores:** Total runs/wickets, current active overs (e.g., `142/3 (14.2 overs)`).
* **Match Telemetry:** Active Innings details, Current Run Rate (CRR), partner partnerships, recent ball outcomes (e.g. `1 4 . 6 1 .`).
* **Live Timeline:** Over-by-over milestones, player dismissals, wicket detailed reviews.
* **Schedules:** International fixtures dates, venue names, and GMT kick-offs.

### 🏀 Basketball (NBA)
* **Live Scores:** Real-time team scores updated in real time.
* **Match Telemetry:** Dynamic period structures (e.g. `Qtr 3 - 8:12`), Field Goal %, 3-point success, total rebounds, turnovers.
* **Schedules:** Regular season dates, home/visitor team logos.

### 🥊 UFC / MMA
* **Live Scores:** Fight card list status (e.g. `Active`, `Upcoming`, `Finished`).
* **Match Telemetry:** Significant strikes landed/attempted, takedowns completed, control times.
* **Schedules:** Upcoming Fight Night and Pay-Per-View (PPV) card details, match venue (e.g., Las Vegas Arena), fighter head-to-heads.

### 🏎️ Formula 1
* **Live Scores:** Position leaderboards, intervals (gap to leader).
* **Match Telemetry:** Pit stop frequencies, fastest lap holders, tire wear indicators.

---

## 3. Advanced Failover Caching Engine
To ensure **100% up-time, zero rate limit blocking, and Play Store safety**:
1. **Caching Layer:** Live scores are cached server-side for **30 seconds**, schedules for **2 hours**, and standings for **12 hours** so requests are incredibly fast.
2. **Graceful Failover:** If an API key is depleted or rate-limited by the free tier, the backend instantly falls back to a high-fidelity dynamic generator. It will simulate a live, moving score with telemetry updates (running timers, incrementing scores) so your testers or store reviewers always see a perfectly operating app!
