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
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', game: '', privacy: 'public', password: '' });
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ game: '', status: '', privacy: '' });
  const [joinModal, setJoinModal] = useState({ open: false, roomId: null, error: '' });
  const [joinPassword, setJoinPassword] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const games = [
    { value: '', label: 'Sélectionner un jeu' },
    { value: 'tic-tac-toe', label: 'Tic-Tac-Toe' },
    { value: 'snake', label: 'Snake' },
    { value: 'pong', label: 'Pong' },
    // Ajoutez d'autres jeux ici
  ];

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

  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      let url = '/api/rooms';
      const params = [];
      if (filters.game) params.push(`game=${encodeURIComponent(filters.game)}`);
      if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
      if (filters.privacy) params.push(`privacy=${encodeURIComponent(filters.privacy)}`);
      if (params.length) url += '?' + params.join('&');
      const res = await fetch(url);
      const data = await res.json();
      setRooms(data.rooms || []);
      setLoadingRooms(false);
    };
    fetchRooms();
  }, [filters, showCreateRoom]);

  const handleRoomFormChange = e => {
    const { name, value } = e.target;
    setRoomForm(f => {
      if (name === 'privacy' && value === 'public') {
        // Clear password if switching to public
        return { ...f, privacy: value, password: '' };
      }
      return { ...f, [name]: value };
    });
  };

  const handleCreateRoom = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomForm: { ...roomForm }, ownerId: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur lors de la création de la salle');
        return;
      }
      alert(`Salle créée : ${roomForm.name} ${roomForm.game}, ${roomForm.privacy} ${roomForm.password ? 'avec mot de passe ' + roomForm.password : 'sans mot de passe'}`);
      navigate(`/room/${data.roomId}`);
      setShowCreateRoom(false);
      setRoomForm({ name: '', game: '', privacy: 'public', password: '' });
    } catch (error) {
      setError('Erreur réseau ou serveur.');
      console.error('Error creating room:', error);
    }
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const handleJoin = async (room) => {
    if (room.privacy === 'private') {
      setJoinModal({ open: true, roomId: room.id, error: '' });
      setJoinPassword('');
    } else {
      // Direct join for public rooms
      const res = await fetch('/api/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/room/${room.id}`);
      } else {
        alert(data.message || 'Erreur lors de la connexion à la salle');
      }
    }
  };

  const handleJoinModalSubmit = async e => {
    e.preventDefault();
    const res = await fetch('/api/join-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: joinModal.roomId, password: joinPassword, userId: user.id }),
    });
    const data = await res.json();
    if (res.ok) {
      setJoinModal({ open: false, roomId: null, error: '' });
      setJoinPassword('');
      navigate(`/room/${joinModal.roomId}`);
    } else {
      setJoinModal(j => ({ ...j, error: data.message || 'Mot de passe incorrect' }));
    }
  };

  return (
    <div className={styles.lobbyContainer}>
      <Header user={user} />
      <main className={styles.main}>
        <button className={styles.createRoomBtn} onClick={() => setShowCreateRoom(true)}>
          + Créer une salle
        </button>
        {showCreateRoom && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Créer une salle</h2>
              {error && <div className={styles.errorMsg}>{error}</div>}
              <form onSubmit={handleCreateRoom} className={styles.createRoomForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="roomName">Nom de la salle :</label>
                  <input
                    id="roomName"
                    name="name"
                    type="text"
                    value={roomForm.name}
                    onChange={handleRoomFormChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="game">Jeu :</label>
                  <select
                    id="game"
                    name="game"
                    value={roomForm.game}
                    onChange={handleRoomFormChange}
                    required
                  >
                    {games.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Confidentialité :</label>
                  <label>
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      checked={roomForm.privacy === 'public'}
                      onChange={handleRoomFormChange}
                    />
                    Publique
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      checked={roomForm.privacy === 'private'}
                      onChange={handleRoomFormChange}
                    />
                    Privée
                  </label>
                </div>
                {roomForm.privacy === 'private' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="roomPassword">Mot de passe :</label>
                    <input
                      id="roomPassword"
                      name="password"
                      type="password"
                      value={roomForm.password}
                      onChange={handleRoomFormChange}
                      required
                    />
                  </div>
                )}
                <div className={styles.formActions}>
                  <button type="submit">Créer</button>
                  <button type="button" onClick={() => setShowCreateRoom(false)}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
        {/* Filters UI */}
        <div className={styles.filters}>
          <select name="game" value={filters.game} onChange={handleFilterChange}>
            <option value="">Tous les jeux</option>
            {games.filter(g => g.value).map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="full">Plein</option>
          </select>
          <select name="privacy" value={filters.privacy} onChange={handleFilterChange}>
            <option value="">Toutes les salles</option>
            <option value="public">Publique</option>
            <option value="private">Privée</option>
          </select>
        </div>
        {loadingRooms ? (
          <div className={styles.loadingRooms}>Chargement des salles...</div>
        ) : (
          /* Room List UI */
          <table className={styles.roomTable}>
            <thead>
              <tr>
                <th>Jeu</th>
                <th>Hôte</th>
                <th>Statut</th>
                <th>Confidentialité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 && (
                <tr><td colSpan={5}>Aucune salle disponible</td></tr>
              )}
              {rooms.map(room => (
                <tr key={room.id}>
                  <td>{room.game}</td>
                  <td>{room.host}</td>
                  <td>{room.status === 'full' ? 'Plein' : 'Ouvert'}</td>
                  <td>{room.privacy === 'private' ? 'Privée' : 'Publique'}</td>
                  <td>
                    {room.ownerUserID !== user?.id && (
                      <button onClick={() => handleJoin(room)}>
                        Rejoindre
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Join Modal for private rooms */}
        {joinModal.open && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Entrer le mot de passe de la salle</h2>
              {joinModal.error && <div className={styles.errorMsg}>{joinModal.error}</div>}
              <form onSubmit={handleJoinModalSubmit}>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                />
                <div className={styles.formActions}>
                  <button type="submit">Rejoindre</button>
                  <button type="button" onClick={() => setJoinModal({ open: false, roomId: null, error: '' })}>Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Afficher la liste des rooms, bouton créer, etc. */}
      </main>
      <Footer />
    </div>
  );
};

export default LobbyPage;
