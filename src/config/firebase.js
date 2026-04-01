import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// Initialize App Check
// Note: You must generate a reCAPTCHA v3 site key in the Google Cloud Console
// and add it to your .env file as VITE_RECAPTCHA_SITE_KEY
if (typeof window !== 'undefined') {
	initializeAppCheck(app, {
		provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
		isTokenAutoRefreshEnabled: true
	});
}

export const db = getFirestore(app);
export const auth = getAuth(app);