import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ProfilePage.module.css';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegUserCircle } from "react-icons/fa";

const ProfilePage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    // If user is not logged in, redirect to home
    if (!user) {
      navigate('/');
    }

    const [form, setForm] = useState({ name: user?.nickname || '', email: user?.email || '', oldPassword: '', newPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
    
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/edit-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur inconnue');
      // Store user data (localStorage/sessionStorage or context)
      localStorage.setItem('user', JSON.stringify(data.user));
      // Tell user profile updated successfully
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className={styles.profilePage}>
        <Header user={user} />
        <div className={styles.profileContainer}>
            <section className={styles.heroSection}>
            <h1><FaRegUserCircle /> Bienvenue, {user.nickname}!</h1>
            <p>Voici votre profil. Vous pouvez modifier vos informations ci-dessous.</p>
            </section>
            <section className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                <label htmlFor="name">Nom:</label>
                <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                <label htmlFor="oldPassword">Ancien mot de passe:</label>
                <input type={showOldPassword ? "text" : "password"} id="oldPassword" name="oldPassword" value={form.oldPassword} onChange={handleChange} required />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)}>
                    {showOldPassword ? "Cacher" : "Afficher"}
                </button>
                </div>
                <div className={styles.formGroup}>
                <label htmlFor="newPassword">Nouveau mot de passe:</label>
                <input type={showNewPassword ? "text" : "password"} id="newPassword" name="newPassword" value={form.newPassword} onChange={handleChange} required />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? "Cacher" : "Afficher"}
                </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit" disabled={loading}>{loading ? 'Chargement...' : 'Mettre à jour'}</button>
            </form>
            </section>
        </div>
        <Footer />
        </div>
    );

};

export default ProfilePage;