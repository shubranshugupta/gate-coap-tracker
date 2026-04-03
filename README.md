# GATE COAP Offer Tracker 🎓

A real-time, community-driven web application designed to help GATE students track M.Tech, MS, and PSU cut-offs during the COAP (Common Offer Acceptance Portal) rounds.

This is the Next.js V2 iteration of the original React tracker, rebuilt from the ground up for enhanced security, advanced analytics, and network resilience. Students can anonymously report their offers, providing immediate visibility into admission trends across top institutes.

## ✨ Features

* **Advanced Analytics Dashboard:** Visualized insights into the "Lowest GATE Score per Institute" and "Offers per Round" using interactive Recharts.
* **Community Moderation:** Built-in flagging system. Users can report suspicious or fake entries, keeping the crowdsourced data clean and reliable.
* **Spam Prevention (Bot Protection):** Integrated with Cloudflare Turnstile to block automated bots from polluting the database with fake scores.
* **Data Export:** Easily download the current filtered dataset as an Excel (`.xlsx`) or CSV file to perform your own offline analysis.
* **Real-Time Database:** Offers appear on the dashboard instantly powered by Firebase Firestore. Optimized with long-polling and memory-cache to bypass restrictive college/corporate Wi-Fi proxies.
* **Dark / Light Mode:** A visually accessible UI with a built-in theme toggle (`next-themes`).
* **Anonymous Reporting:** No login required. Quick, frictionless submission form.

## 🛠 Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Frontend:** React 19, Tailwind CSS v4
* **Database (Client & Server):** Firebase Client SDK & Firebase Admin SDK (Cloud Firestore)
* **Visualizations:** Recharts
* **Bot Protection:** Cloudflare Turnstile (`@marsidev/react-turnstile`)
* **Deployment:** Vercel

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

* Node.js (v18 or higher)
* npm, yarn, or pnpm
* A Google Firebase Account (with Firestore enabled)
* A Cloudflare Account (for Turnstile keys)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/shubranshugupta/gate-coap-tracker.git
    cd gate-coap-tracker
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**
    Create a `.env` file in the root directory and add your Firebase configuration keys. Make sure this file is included in your `.gitignore`.

    ```env
    # --- Firebase Client Configuration (Public) ---
    NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

    # --- Firebase Admin SDK Configuration (Secret) ---
    FIREBASE_ADMIN_PROJECT_ID="your-project-id"
    FIREBASE_ADMIN_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
    # IMPORTANT: Keep the \n characters exactly as they appear in the downloaded JSON
    FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nSuper\nLong\nKey\nHere\n-----END PRIVATE KEY-----\n"

    # --- Cloudflare Turnstile Configuration ---
    NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
    TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
    ```

    (**Note:** The 1x... Turnstile keys are dummy testing keys provided by Cloudflare. Replace them with your actual production keys before deployment).

4. **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🔒 Security & Architecture Notes

Unlike V1, which relied entirely on client-side security rules, this Next.js version utilizes server-side API routes (`/api/verify-turnstile` and `/api/flag-offer`).

* Turnstile Verification: When a user submits an offer, a token is sent to the backend. The backend verifies this token with Cloudflare before writing the data to Firestore using the Admin SDK.
* Network Resilience: The client-side Firebase initialization (`src/config/firebase.ts`) is explicitly configured to force long-polling (`experimentalForceLongPolling: true`) instead of WebSockets to prevent connection hanging on restricted campus networks.

## 🤝 Contributing

Feedback, issues, and pull requests are welcome! Feel free to check the [issues page](https://github.com/shubranshugupta/gate-coap-tracker/issues) and [CONTRIBUTING.md](./CONTRIBUTING.md) if you want to contribute.
