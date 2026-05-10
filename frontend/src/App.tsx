import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AvisNegatifs from './pages/AvisNegatifs';
import TousLesAvis from './pages/TousLesAvis';
import Profil from './pages/Profil';
import RouteProtegee from './components/auth/RouteProtegee';
import LoginPage from './components/auth/LoginPage';
import FeedbackForm from './pages/visitor/FeedbackForm';
import QRCodeAdmin from './pages/visitor/QRCodeAdmin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Routes publiques sans Layout */}
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Espace Admin — protégé, avec Layout */}
        <Route
          path="/admin"
          element={
            <RouteProtegee roles={['admin']}>
              <Layout />
            </RouteProtegee>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="avis/negatifs" element={<AvisNegatifs />} />
          <Route path="avis/tous" element={<TousLesAvis />} />
          <Route path="profil" element={<Profil />} />
          <Route path="qrcode" element={<QRCodeAdmin />} />
        </Route>

        {/* Espace Manager — protégé, avec Layout */}
        <Route
          path="/manager"
          element={
            <RouteProtegee roles={['responsable']}>
              <Layout />
            </RouteProtegee>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profil" element={<Profil />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
