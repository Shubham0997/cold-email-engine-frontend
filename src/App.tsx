import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CreateCampaign } from './pages/CreateCampaign';
import { CampaignList } from './pages/CampaignList';
import { CampaignDetails } from './pages/CampaignDetails';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { LoadingProvider } from './context/LoadingContext';

function App() {
  return (
    <LoadingProvider>
      <ConfirmProvider>
        <ToastProvider>
        <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/campaigns/create" element={<CreateCampaign />} />
          <Route path="/campaigns/edit/:id" element={<CreateCampaign />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </ConfirmProvider>
  </LoadingProvider>
  );
}

export default App;
