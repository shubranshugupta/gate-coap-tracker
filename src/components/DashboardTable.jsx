import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { collection, query, orderBy, limit, getDocs, where, startAfter } from 'firebase/firestore';
import { db } from '../config/firebase';

const PAGE_SIZE = 20;

const DashboardTable = ({ category: CATEGORIES, institute: INSTITUTES }) => {
	const [offers, setOffers] = useState([]);
	const [lastVisible, setLastVisible] = useState(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const [filterInstitute, setFilterInstitute] = useState('All');
	const [filterCategory, setFilterCategory] = useState('All');


	const fetchInitialData = useCallback(async () => {
		setLoading(true);
		try {
			let constraints = [];

			// Apply Database-level filtering
			if (filterInstitute !== 'All') constraints.push(where('institute', '==', filterInstitute));
			if (filterCategory !== 'All') constraints.push(where('category', '==', filterCategory));

			// Fix the .push() bug by doing them on separate lines
			constraints.push(orderBy('timestamp', 'desc'), limit(PAGE_SIZE));

			const q = query(collection(db, 'coap_offers'), ...constraints);
			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				setOffers([]);
				setHasMore(false);
			} else {
				setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
				setLastVisible(snapshot.docs.at(-1));
				setHasMore(snapshot.docs.length === PAGE_SIZE);
			}
		} catch (error) {
			console.error("Error fetching offers: ", error);
		} finally {
			setLoading(false);
		}
	}, [filterInstitute, filterCategory]);

	const loadMore = async () => {
		if (!lastVisible) return;
		setLoadingMore(true);
		try {
			let constraints = [];
			if (filterInstitute !== 'All') constraints.push(where('institute', '==', filterInstitute));
			if (filterCategory !== 'All') constraints.push(where('category', '==', filterCategory));

			constraints.push(orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE));

			const q = query(collection(db, 'coap_offers'), ...constraints);
			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				setHasMore(false);
			} else {
				setOffers(prev => [...prev, ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))]);
				setLastVisible(snapshot.docs.at(-1));
				setHasMore(snapshot.docs.length === PAGE_SIZE);
			}

		} catch (error) {
			console.error("Error loading more offers: ", error);
		} finally {
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	const selectStyles = "p-2 border rounded-md text-sm outline-none transition-colors duration-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500";

	return (
		<div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white transition-colors">Recent Offers</h2>
                    <button 
                        onClick={fetchInitialData} 
                        disabled={loading}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select value={filterInstitute} onChange={(e) => setFilterInstitute(e.target.value)} className={selectStyles}>
                        {INSTITUTES.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                    </select>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={selectStyles}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
						{renderTableContent(loading, offers)}
					</tbody>
				</table>

				{/* Load More Button */}
                {!loading && hasMore && (
                    <div className="mt-6 flex justify-center">
                        <button 
                            onClick={loadMore} 
                            disabled={loadingMore}
                            className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            {loadingMore ? 'Loading...' : 'Load More Offers'}
                        </button>
                    </div>
                )}
			</div>
		</div>
	);
};

const renderTableContent = (loading, offers) => {
    if (loading) {
        return (
            <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500 animation-delay-200"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500 animation-delay-400"></div>
                    </div>
                </td>
            </tr>
        );
    }
	if (offers.length === 0) {
        return (
            <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No offers found for these filters.
                </td>
            </tr>
        );
    }

    return offers.map((offer) => (
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
    ));
};

DashboardTable.propTypes = {
	category: PropTypes.array.isRequired,
	institute: PropTypes.array.isRequired,
};

export default DashboardTable;