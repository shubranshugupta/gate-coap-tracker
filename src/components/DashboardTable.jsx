import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const DashboardTable = ({ category, institute }) => {
	const [offers, setOffers] = useState([]);
	const [filterInstitute, setFilterInstitute] = useState('All');
	const [filterCategory, setFilterCategory] = useState('All');

	useEffect(() => {
		const q = query(collection(db, 'coap_offers'), orderBy('timestamp', 'desc'));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
		});
		return () => unsubscribe();
	}, []);

	const filteredOffers = offers.filter(offer => {
		return (filterInstitute === 'All' || offer.institute === filterInstitute) &&
			(filterCategory === 'All' || offer.category === filterCategory);
	});

	const selectStyles = "p-2 border rounded-md text-sm outline-none transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500";

	return (
		<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<h2 className="text-xl font-semibold text-gray-800 dark:text-white transition-colors">Recent Offers</h2>

				<div className="flex gap-2 w-full md:w-auto">
					<select onChange={(e) => setFilterInstitute(e.target.value)} className={selectStyles}>
						{institute.map(inst => <option key={inst} value={inst}>{inst}</option>)}
					</select>
					<select onChange={(e) => setFilterCategory(e.target.value)} className={selectStyles}>
						{category.map(cat => <option key={cat} value={cat}>{cat}</option>)}
					</select>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
							<th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Score / Rank</th>
							<th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
							<th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Institute</th>
							<th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Program & Spec</th>
							<th className="p-3 text-sm font-medium text-gray-600 dark:text-gray-400">Round</th>
						</tr>
					</thead>
					<tbody>
						{filteredOffers.length === 0 ? (
							<tr>
								<td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">No offers found. Be the first to report!</td>
							</tr>
						) : (
							filteredOffers.map((offer) => (
								<tr key={offer.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
									<td className="p-3">
										<div className="font-semibold text-blue-600 dark:text-blue-400">{offer.gateScore}</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">Rank: {offer.gateRank}</div>
									</td>
									<td className="p-3 text-sm text-gray-700 dark:text-gray-300">{offer.category}</td>
									<td className="p-3 font-medium text-sm text-gray-800 dark:text-gray-200">{offer.institute}</td>
									<td className="p-3">
										<div className="text-sm font-medium text-gray-800 dark:text-gray-200">{offer.programType}</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">{offer.specialization}</div>
									</td>
									<td className="p-3">
										<span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs rounded-full font-medium border border-green-200 dark:border-green-800">
											{offer.coapRound}
										</span>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

DashboardTable.propTypes = {
	category: PropTypes.array.isRequired,
	institute: PropTypes.array.isRequired,
};

export default DashboardTable;