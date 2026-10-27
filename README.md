# raj2913.github.io

The portfolio of **Raj Vardhan**, Forward Deployed AI Engineer (Voice AI). Live at **https://raj2913.github.io**.

The concept is *the court is yours*: a career told as a game. Basketball gives the site its visual language; voice AI gives it something to play with.

| Section | What it is |
| --- | --- |
| **Tip-off** (hero) | A lit indoor court, built entirely in SVG and CSS 3D. On scroll the camera rises overhead and the court lines turn into a data-flow diagram. |
| **The read** | About, plus a scouting report. |
| **The playbook** | Projects as plays. Each diagram is the project's real architecture in playbook notation (O handles the ball, X is a check, ◎ scores). Every play has its own case-study page under `/work/<slug>/`. |
| **The voice lab** | An interactive voice agent demo: turn states, barge-in, silence handling, slot filling, optional mic and agent voice. |
| **The game log** | Experience timeline with scoreboard stats. |
| **The kit** | Skills, each linked to where it was actually used. |
| **Final buzzer** | Contact: a message form that emails Raj directly, "Book a 1:1", and direct lines (email, phone, LinkedIn, GitHub). |

The shot clock in the nav counts down from 24 as you scroll, and hits 0.0 at the contact section.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into ./out
npm run lint
```

Requires Node 20+.

## Edit the content

Everything a visitor reads lives in `src/content/`, separate from the components:

| File | Holds |
| --- | --- |
| `site.ts` | Name, role, links, email, headline, intro, scouting report, nav. Set `resumeUrl` to show a résumé link. |
| `experience.ts` | Roles, dates, stats and bullet points. |
| `projects.ts` | Plays, play diagrams (node positions on a 400 × 300 half court), case-study copy, archive. |
| `skills.ts` | The kit, and where each tool shows up. |

To add a résumé: put the PDF in `public/` (for example `public/raj-vardhan-resume.pdf`) and set `resumeUrl: "/raj-vardhan-resume.pdf"` in `site.ts`.

## The voice lab

The demo agent ("Courtside") books court time at a fictional gym. It is a **rule-based dialogue manager** (`src/lib/courtside.ts`), not a language model, and the page says so. The turn loop (`src/lib/useVoiceSession.ts`) is real:

- understands days (today, tomorrow, weekdays, "next Thursday"), times ("7", "seven thirty", "half past six", "18:00", "noon", "6 to 8"), court size and length, and checks opening hours; one slot is always taken, so you can see it offer alternatives
- handles edits at confirmation, cancel and reschedule, prices, hours, location, "are you a bot?", language requests, frustration, abuse and handoff to a person
- behaviour is pinned by `npm run test:agent` (54 scripted conversations, also run in CI)
- states: listening → processing → responding, plus interrupted and ended
- barge-in: input while the agent is talking cuts it off, and only the words already said are kept
- silence: one reprompt after 9 seconds, then a graceful end
- the rules-engine time shown is measured in the browser; the "think time" is an artificial delay standing in for a model call, and is labelled that way
- **mic** (optional, click to enable) uses the browser's Web Speech API for speech-to-text; **agent voice** (optional, off by default) uses `speechSynthesis`

No API keys, no backend, and nothing is sent anywhere by this site. To put a real model behind it, you would need a small server (for example a FastAPI or serverless function holding the API key) that the lab calls in place of `respond()`. Never put a key in this repo: everything here ships to the browser.

## Contact form and 1:1 booking

- **Messages** post to [FormSubmit](https://formsubmit.co) (`contactFormEndpoint` in `site.ts`), which forwards them to the inbox in the URL. The very first submission triggers an activation email; click the link in it once, and every message after that is delivered. FormSubmit then shows a random alias you can swap in for the email address.
- **Book a 1:1** works out of the box: the visitor picks a slot (shown in IST and their own time zone), Google Calendar opens with Raj added as a guest, and saving it sends Raj a calendar invite. Raj also gets an email about the request.
- For a real availability-aware scheduler, create a free booking page on [Cal.com](https://cal.com) (or Calendly, or a Google Calendar appointment schedule) and paste its link into `bookingUrl` in `site.ts`. The tab then embeds it.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints, builds the static export and publishes it to GitHub Pages (Settings → Pages → Source: GitHub Actions).

## Stack

Next.js (static export) · React · TypeScript · Tailwind CSS · Motion · Lucide. Fonts: Anton, Space Grotesk, JetBrains Mono. No images except the generated social card; every visual is SVG, CSS or canvas.

Accessibility: semantic landmarks, skip link, keyboard-operable diagrams and tabs, visible focus, `prefers-reduced-motion` support (scroll scenes and animations switch off, and the content stays complete).
