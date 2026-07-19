# Wake Up India

**A Collaborative Digital Protest Canvas**

<p align="center">
  <img src="./app/assets/banner.jpg" alt="Wake Up India banner" width="100%" />
</p>

## The Movement

Wake Up India is a digital space for collective dissent — a living, public record of anger, urgency, and active participation against corruption in the education system.

**Our demand:** accountability from those responsible for the crisis.

**Why we protest:** this platform exists for the students affected by the NEET exam paper leak and the systemic failures that followed. It lets citizens visually document their protest and stand in solidarity with those affected.

---

## Features

- **Community Paint (Live Multiplayer)** — A shared canvas where users collaboratively paint their dissent in real time. Every stroke is visible to everyone currently on the site, building a live, shared civic memory.
- **Private Studio** — A personal canvas for individual artwork. Add an Artist Alias and export instantly to Instagram Stories, WhatsApp, or Facebook.
- **Digital Toolkit** — Gritty, retro-styled tools: Brush, Spray Paint, Eraser, Custom Text, and Emoji Stickers.
- **Canvas Templates** — Pre-loaded backgrounds tied to the movement's themes.
- **One-Stroke Rule (Community)** — Each user gets one impactful stroke on the live community canvas, until they undo it or publish their own piece.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Frontend:** React, Tailwind CSS, Framer Motion
- **Icons/UI:** Lucide React, Emoji-Picker-React
- **Real-time Engine:** Custom backend polling architecture

## Running Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to see the result.

## Deployment Notes

Optimized for **Vercel** or **Render**.

- **Vercel:** works out of the box. Note — since the Community Canvas relies on in-memory storage, the live board periodically resets when serverless functions spin down. Connect a database like Redis for a permanent board.
- **Render:** deploying as a Web Service keeps the Node.js server running continuously, so the community canvas persists as long as the server doesn't restart.

---

*Enough is enough. Add your stroke to the picture.*