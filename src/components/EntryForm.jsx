import { useState } from 'react';
import PropTypes from 'prop-types';
// Firebase imports - Uncomment and configure when ready to enable database submission
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import toast from 'react-hot-toast';

const EntryForm = ({ category, institute, programType, coapRound }) => {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		gateScore: '', gateRank: '', category: category[1],
		institute: institute[1], programType: programType[0],
		specialization: '', coapRound: coapRound[0]
	});

	const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

	// Inside your EntryForm component:
	const handleSubmit = async (e) => {
		e.preventDefault();

		const score = Number(formData.gateScore);
		if (score < 0 || score > 1000) return toast.error("Invalid GATE Score.");
		if (Number(formData.gateRank) <= 0) return toast.error("Invalid GATE Rank.");

		// dev only - to avoid spamming the database while testing
		// In production, this will be replaced with actual Firebase submission
		// toast.success("Submission disabled in development mode. Please check the console for the data that would have been submitted.");
		// console.log("Form Data to Submit:", { ...formData, gateScore: score, gateRank: Number(formData.gateRank), timestamp: new Date().toISOString() });
		// setFormData({ ...formData, gateScore: '', gateRank: '', specialization: '' });
		// setLoading(false);

		// Uncomment the below code to enable Firebase submission after setting up your Firebase project and config
		setLoading(true);
		try {
			// 1. Authenticate anonymously
			const userCredential = await signInAnonymously(auth);
			const uid = userCredential.user.uid;

			// 2. Create a compound ID: UID_Institute_Round
			// e.g., "abc123_IITBombay_Round1"
			const safeInstitute = formData.institute.replaceAll(/[^a-zA-Z0-9]/g, '');
			const safeRound = formData.coapRound.replaceAll(/[^a-zA-Z0-9]/g, '');
			const compoundDocId = `${uid}_${safeInstitute}_${safeRound}`;

			// 3. Use setDoc with the custom ID instead of addDoc
			await setDoc(doc(db, 'coap_offers', compoundDocId), {
				...formData,
				userId: uid, // Required for our new security rules
				gateScore: score,
				gateRank: Number(formData.gateRank),
				timestamp: serverTimestamp()
			});

			toast.success('Offer submitted successfully!');
			setFormData({ ...formData, gateScore: '', gateRank: '', specialization: '' });
		} catch (error) {
			console.error("Submission error:", error);
			toast.error("Failed to submit. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Shared input styling for cleaner code
	const inputStyles = "w-full p-2 border rounded-md outline-none transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400";
	const labelStyles = "text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors";

	return (
		<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
			<h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white transition-colors">Report an Offer</h2>
			<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="space-y-1">
					<label htmlFor="gateScore" className={labelStyles}>GATE Score</label>
					<input required id="gateScore" type="number" name="gateScore" value={formData.gateScore} onChange={handleChange} placeholder="e.g. 740" className={inputStyles} />
				</div>

				<div className="space-y-1">
					<label htmlFor="gateRank" className={labelStyles}>GATE Rank</label>
					<input required id="gateRank" type="number" name="gateRank" value={formData.gateRank} onChange={handleChange} placeholder="e.g. 192" className={inputStyles} />
				</div>

				<div className="space-y-1">
					<label htmlFor="category" className={labelStyles}>Category</label>
					<select id="category" name="category" value={formData.category} onChange={handleChange} className={inputStyles}>
						{category.filter(cat => cat !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
					</select>
				</div>

				<div className="space-y-1">
					<label htmlFor="institute" className={labelStyles}>Institute</label>
					<select id="institute" name="institute" value={formData.institute} onChange={handleChange} className={inputStyles}>
						{institute.filter(inst => inst !== 'All').map(inst => <option key={inst} value={inst}>{inst}</option>)}
					</select>
				</div>

				<div className="space-y-1">
					<label htmlFor="programType" className={labelStyles}>Program Type</label>
					<select id="programType" name="programType" value={formData.programType} onChange={handleChange} className={inputStyles}>
						{programType.map(type => <option key={type} value={type}>{type}</option>)}
					</select>
				</div>

				<div className="space-y-1 lg:col-span-2">
					<label htmlFor="specialization" className={labelStyles}>Specialization</label>
					<input required id="specialization" type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. CS, AI, Data Science" className={inputStyles} />
				</div>

				<div className="space-y-1">
					<label htmlFor="coapRound" className={labelStyles}>COAP Round</label>
					<select id="coapRound" name="coapRound" value={formData.coapRound} onChange={handleChange} className={inputStyles}>
						{coapRound.map(round => <option key={round} value={round}>{round}</option>)}
					</select>
				</div>

				<div className="lg:col-span-4 mt-2 flex justify-end">
					<button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50">
						{loading ? 'Submitting...' : 'Submit Offer'}
					</button>
				</div>
			</form>
		</div>
	);
};

EntryForm.propTypes = {
	category: PropTypes.array.isRequired,
	institute: PropTypes.array.isRequired,
	programType: PropTypes.array.isRequired,
	coapRound: PropTypes.array.isRequired,
};

export default EntryForm;