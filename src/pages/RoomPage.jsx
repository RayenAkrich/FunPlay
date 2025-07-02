import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function RoomPage() {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get roomId from URL params
    const roomId = window.location.pathname.split('/').pop();
    if (!roomId) {
      navigate('/lobby');
      return;
    }

    // Fetch room details
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!res.ok) throw new Error('Room not found');
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRoom();
  }, [navigate]);

  if (error) return <div>Error: {error}</div>;
  if (!room) return <div>Loading...</div>;

  return (
    <div>
      <Header />
      <main>
        <h1>{room.name}</h1>
        <p>Game: {room.game}</p>
        <p>Privacy: {room.privacy}</p>
        {/* Add more room details and functionality here */}
      </main>
      <Footer />
    </div>
  );
}

export default RoomPage;