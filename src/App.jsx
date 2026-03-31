import OfferTracker from './components/OfferTracker';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      {/* The OfferTracker component contains the entire application 
        layout, including the EntryForm and DashboardTable. 
      */}
      <Toaster position="top-right" />
      <OfferTracker />
    </>
  );
}

export default App;