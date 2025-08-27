import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import AuthCallback from './components/AuthCallback'; // ✅ Adjust path if needed
import AuthPage from './components/AuthPage';
import OnboardingPage from './components/OnboardingPage';
import LearnPage from './components/LearnPage';
import SubscriptionPage from './components/SubscriptionPage';
import OrderDetails from './components/OrderDetails';
import OrderHistory from './components/OrderHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/subscription" element={< SubscriptionPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/order-details/:order_id" element={<OrderDetails />} />
        <Route path="/order-history" element={<OrderHistory />} />
      </Routes>
    </Router>
  );
}

export default App;