# GATE CSE COAP Offer Tracker 🎓

A real-time, community-driven web application designed to help GATE Computer Science students track M.Tech and MS cut-offs during the COAP (Common Offer Acceptance Portal) rounds. Students can anonymously report their offers, providing immediate visibility into admission trends across IITs and IISc.

## ✨ Features

* **Real-Time Dashboard:** Offers appear on the dashboard instantly upon submission without needing a page refresh, powered by Firebase Firestore real-time listeners.
* **Anonymous Reporting:** No login required. Students can quickly submit their GATE score, rank, category, and offer details.
* **Smart Filtering:** Quickly sort through offers by selecting specific Institutes or Categories.
* **Dark Mode / Light Mode:** A visually stunning, accessible UI with a built-in theme toggle that remembers user preferences.
* **Fully Responsive:** Designed with a mobile-first approach, ensuring the data table is easily readable on smartphones.
* **Data Validation:** Prevents spam by enforcing strict input rules (e.g., GATE scores must be between 0 and 1000).

## 🛠 Tech Stack

* **Frontend Framework:** React (Bootstrapped with Vite)
* **Styling:** Tailwind CSS v4
* **Backend & Database:** Firebase (Cloud Firestore NoSQL)
* **Hosting:** Netlify

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn
* A Google Firebase Account

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
    VITE_FIREBASE_API_KEY="your-api-key"
    VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
    VITE_FIREBASE_APP_ID="your-app-id"
    VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
    ```

4. **Configure Firebase Database Security Rules**
    In your Firebase Console, navigate to Firestore Database -> Rules, and set the following to allow anonymous submissions while preventing deletions:

    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /coap_offers/{document=**} {
          allow read: if true;
          allow create: if true;
          allow update, delete: if false;
        }
      }
    }
    ```

5. **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! If you are a fellow developer in the GATE community and want to improve this tool:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🚀 Feature To-Do List (For the Future)

1. Data Export (CSV/Excel)

   **What:** Add a "Download as CSV" button above the table.

   **Why:** Students love playing with the data themselves. Allowing them to download the filtered list will make your tool highly shareable on Telegram and Reddit.
2. Analytics & Visualizations

   **What:** Integrate a charting library like Recharts or Chart.js.

   **Why:** Instead of just a table, show a bar chart of the "Lowest GATE Score per IIT" or "Number of Offers per Round." Visual data is much easier to digest.
3. Pagination or Infinite Scrolling

   **What:** Update the DashboardTable to fetch only the last 20-50 offers, and load more when the user scrolls down or clicks "Next."

   **Why:** Right now, the app fetches all documents at once. When thousands of students submit offers, this will slow down the app and increase your Firebase read costs.
4. Community Moderation (Flagging)

   **What:** Add a small "Report" flag icon next to each row. If an entry gets flagged 5 times, hide it from the dashboard.

   **Why:** Trolls might submit fake data (e.g., GATE Score 1000 getting rejected). Community moderation keeps the data clean without you having to manually delete entries in the Firebase console.
5. Spam Prevention & CAPTCHA

   **What:** Integrate Google reCAPTCHA v3 or Cloudflare Turnstile into the EntryForm.

   **Why:** Since the form is completely anonymous and open, it is vulnerable to bots submitting fake offers. A silent CAPTCHA will protect your Firestore database.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
