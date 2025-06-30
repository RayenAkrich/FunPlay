import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} /> {/* Default route to LobbyPage */}
        <Route path="/lobby" element={<LobbyPage />} /> {/* Explicit route to LobbyPage (used after auth) */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
