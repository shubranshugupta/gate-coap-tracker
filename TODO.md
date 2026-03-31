# TODO List for Gate COAP Tracker

## 🛠️ Immediate Improvements for the Current Project

1. Re-add the Manual Dark Mode Toggle

Issue: In your current OfferTracker.jsx, you removed the Sun/Moon toggle button and the React state for it. The app now relies entirely on the user's OS system preferences (prefers-color-scheme in CSS) for dark mode.

Fix: Bring back the isDarkMode state and the toggle button so users can manually switch themes regardless of their system settings.
2. Replace alert() with Toast Notifications

Issue: The native browser alert("Offer submitted successfully!") is blocking and feels a bit outdated for a modern web app.

Fix: Install a library like react-hot-toast or react-toastify. It will provide beautiful, non-intrusive popups at the corner of the screen when an offer is submitted or fails.
3. Extract Constants to a Separate File

Issue: In OfferTracker.jsx, you have massive arrays for INSTITUTES, CATEGORIES, etc., taking up a lot of space inside the component.

Fix: Create a new file src/utils/constants.js, export those arrays from there, and import them into OfferTracker. This keeps your component files clean and focused on UI.
4. Add a Loading State to the Table

Issue: In DashboardTable.jsx, before Firebase finishes fetching the data, the offers array is empty. The UI will instantly flash "No offers found. Be the first to report!" for a split second before the data loads.

Fix: Add a loading state to DashboardTable that is true by default. Set it to false inside the onSnapshot callback. While loading, show a "Loading data..." spinner or skeleton loader.
5. Enhance Data Validation

Issue: The coapId pattern is currently [a-zA-Z0-9]+.

Fix: If COAP IDs follow a strict specific format every year (e.g., they always start with "24" or are exactly 8 digits long), update the Regex pattern or JavaScript validation to ensure students don't accidentally type garbage data.
6. Spam Prevention & CAPTCHA

What: Integrate Google reCAPTCHA v3 or Cloudflare Turnstile into the EntryForm.

Why: Since the form is completely anonymous and open, it is vulnerable to bots submitting fake offers. A silent CAPTCHA will protect your Firestore database.

## 🚀 Feature To-Do List (For the Future)

1. Data Export (CSV/Excel)

What: Add a "Download as CSV" button above the table.

Why: Students love playing with the data themselves. Allowing them to download the filtered list will make your tool highly shareable on Telegram and Reddit.
2. Analytics & Visualizations

What: Integrate a charting library like Recharts or Chart.js.

Why: Instead of just a table, show a bar chart of the "Lowest GATE Score per IIT" or "Number of Offers per Round." Visual data is much easier to digest.
3. Pagination or Infinite Scrolling

What: Update the DashboardTable to fetch only the last 20-50 offers, and load more when the user scrolls down or clicks "Next."

Why: Right now, the app fetches all documents at once. When thousands of students submit offers, this will slow down the app and increase your Firebase read costs.
4. Community Moderation (Flagging)

What: Add a small "Report" flag icon next to each row. If an entry gets flagged 5 times, hide it from the dashboard.

Why: Trolls might submit fake data (e.g., GATE Score 1000 getting rejected). Community moderation keeps the data clean without you having to manually delete entries in the Firebase console.