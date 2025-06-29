import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Future routes: <Route path="/auth" element={<AuthPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App
