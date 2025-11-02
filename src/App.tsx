import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { PricingPage } from './pages/PricingPage';
import { GeneratePage } from './pages/GeneratePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PublicMenuPage } from './pages/PublicMenuPage';
import { SettingsPage } from './pages/SettingsPage';
import { EstablishmentSettingsPage } from './pages/EstablishmentSettingsPage';
import { EnhancePage } from './pages/EnhancePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="generate" element={<GeneratePage />} />
        <Route path="enhance" element={<EnhancePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/establishment" element={<EstablishmentSettingsPage />} />
        <Route path="menu/:userId" element={<PublicMenuPage />} />
      </Route>
    </Routes>
  );
}

export default App;
