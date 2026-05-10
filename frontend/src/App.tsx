import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AvisNegatifs from './pages/AvisNegatifs';
import TousLesAvis from './pages/TousLesAvis';
import Profil from './pages/Profil';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="avis/negatifs" element={<AvisNegatifs />} />
          <Route path="avis/tous" element={<TousLesAvis />} />
          <Route path="profil" element={<Profil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;