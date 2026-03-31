import EntryForm from './EntryForm';
import DashboardTable from './DashboardTable';

const OfferTracker = () => {
  const CATEGORIES = ['All', 'General', 'EWS', 'OBC-NCL', 'SC', 'ST', 'PwD'];
  const INSTITUTES = ["All", "IISc Bangalore", "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur", 
      "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "IIT ISM Dhanbad", "IIT Indore", "IIT Gandhinagar", 
      "IIT Ropar", "IIT Patna", "IIT Bhubaneswar", "IIT Mandi", "IIT Jodhpur", "IIT Tirupati", "IIT Palakkad", 
      "IIT Bhilai", "IIT Goa", "IIT Dharwad", "IIT Jammu"];
  const PROGRAM_TYPES = ['Mtech', 'Mtech(RA/RAP/HVA)', 'MS', 'MS(RA/RAP)'];
  const ROUNDS = Array.from({ length: 10 }, (_, i) => `Round ${i + 1}`).concat(['Additional Rounds']);


  return (
      <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans text-gray-900 dark:text-gray-100">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header & Theme Toggle */}
          <header className="relative text-center space-y-2 pt-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">GATE CSE COAP Offer Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">Anonymously report and track M.Tech/MS cut-offs in real-time.</p>
          </header>

          <EntryForm category={CATEGORIES} institute={INSTITUTES} programType={PROGRAM_TYPES} coapRound={ROUNDS} />
          <DashboardTable category={CATEGORIES} institute={INSTITUTES} />
        </div>
      </div>
  );
};

export default OfferTracker;