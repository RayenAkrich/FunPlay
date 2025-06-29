import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LobbyPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.is_guest) {
      const handleUnload = () => {
        navigator.sendBeacon(`/api/guest/${user.id}`);
        localStorage.removeItem('user');
      };
      window.addEventListener('unload', handleUnload);
      return () => window.removeEventListener('unload', handleUnload);
    }
  }, []);

  return (
    <div>
      <h1>Lobby</h1>
      {/* Afficher la liste des rooms, bouton créer, etc. */}
    </div>
  );
};

export default LobbyPage;
