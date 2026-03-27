import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CreateCampaign } from './pages/CreateCampaign';
import { CampaignList } from './pages/CampaignList';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stats" element={<Dashboard />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/create" element={<CreateCampaign />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
