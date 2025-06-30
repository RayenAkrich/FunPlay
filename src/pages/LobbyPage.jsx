import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './LobbyPage.module.css';

const LobbyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showStreak, setShowStreak] = useState(false);
  const [streakMsg, setStreakMsg] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      // Show streak popup if loginStreak/message present and not guest
      if (u.loginStreak && u.message && !u.is_guest) {
        setStreakMsg(u.message);
        setShowStreak(true);
        // Remove message so it doesn't show again on refresh
        u.message = undefined;
        localStorage.setItem('user', JSON.stringify(u));
      }
    } else {
      // If not logged in, redirect to home
      navigate('/home');
    }
  }, [navigate]);

  return (
    <div className={styles.lobbyContainer}>
      <Header user={user} />
      <main className={styles.main}>
        {showStreak && (
          <div className={styles.streakPopup}>
            <div className={styles.streakContent}>
              <h2>🔥 Série de connexions</h2>
              <p>{streakMsg}</p>
              <button className={styles.closeBtn} onClick={() => setShowStreak(false)}>Fermer</button>
            </div>
          </div>
        )}
        <h1>Lobby</h1>
        {/* Afficher la liste des rooms, bouton créer, etc. */}
      </main>
      <Footer />
    </div>
  );
};

export default LobbyPage;
