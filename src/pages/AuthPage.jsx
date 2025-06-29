import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './AuthPage.module.css';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get mode from query param, fallback to 'login'
  const getModeFromQuery = () => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    return modeParam === 'signup' ? 'signup' : 'login';
  };
  const [mode, setMode] = useState(getModeFromQuery());
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur inconnue');
      // Store user data (localStorage/sessionStorage or context)
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect to lobby or main page (to be developed)
      navigate('/lobby');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: form.name || '' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur inconnue');
      // Store guest user data (localStorage/sessionStorage or context)
      localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect to lobby or main page (to be developed)
      navigate('/lobby');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sync mode with URL query param
  useEffect(() => {
    setMode(getModeFromQuery());
  }, [location.search]);

  // When toggling mode, update the URL
  const handleToggleMode = (newMode) => {
    navigate(`/auth?mode=${newMode}`);
  };

  return (
    <div className={styles.authContainer}>
      <Header />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2><FaRegUserCircle /> {mode === 'signup' ? 'Créer un compte' : 'Connexion'}</h2>
          {mode === 'signup' && (
            <input type="text" name="name" placeholder="Nom d'utilisateur" value={form.name}
              onChange={handleChange} required autoComplete="username"
            />
          )}
          <input type="email" name="email" placeholder="Email" value={form.email} 
            onChange={handleChange} required autoComplete="email"
          />
          <input type="password" name="password" placeholder="Mot de passe" value={form.password}
            onChange={handleChange} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Veuillez patienter...' : mode === 'signup' ? 'S’inscrire' : 'Se connecter'}
          </button>
          <div className={styles.toggleText}>
            {mode === 'signup' ? (
              <>
                Vous avez déjà un compte ?{' '}
                <span className={styles.toggleLink} onClick={() => handleToggleMode('login')}>Connectez-vous</span>
              </>
            ) : (
              <>
                Vous n’avez pas un compte ?{' '}
                <span className={styles.toggleLink} onClick={() => handleToggleMode('signup')}>Créer un compte</span>
              </>
            )}
          </div>
          <div className={styles.guestText}>
            <span onClick={guestLogin} className={styles.guestLink}>
              Testez le site comme un guest
            </span>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
