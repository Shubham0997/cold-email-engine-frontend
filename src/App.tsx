import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CreateCampaign } from './pages/CreateCampaign';
import { CampaignList } from './pages/CampaignList';
import { CampaignDetails } from './pages/CampaignDetails';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/AuthPage';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { LoadingProvider } from './context/LoadingContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <ConfirmProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public route */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Protected routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <>
                      <Navbar />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/stats" element={<Dashboard />} />
                        <Route path="/campaigns" element={<CampaignList />} />
                        <Route path="/campaigns/:id" element={<CampaignDetails />} />
                        <Route path="/campaigns/create" element={<CreateCampaign />} />
                        <Route path="/campaigns/edit/:id" element={<CreateCampaign />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </>
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ConfirmProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
