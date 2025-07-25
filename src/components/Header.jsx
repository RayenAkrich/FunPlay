import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import { FaHome , FaRegUser , FaExclamationCircle } from "react-icons/fa";
import { IoMdStats , IoIosExit } from "react-icons/io";

const Header = ({ user }) => {
  const navigate = useNavigate();
  const isGuest = user?.is_guest;
  const isLogged = !!user && !isGuest;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>FunPlay</div>
      <nav className={styles.nav}>
        {isLogged && (
          <>
            <a href="/lobby" className={styles.link}><FaHome /> Salles</a>
            <div className={styles.profileDropdown}>
              <span className={styles.link}>{user.nickname} ▼</span>
              <div className={styles.dropdownContent}>
                <a href="/profile" className={styles.link}><FaRegUser /> Modifier profil</a>
                <a href="/leaderboard" className={styles.link}><IoMdStats /> Classement</a>
                <a href="/about" className={styles.link}><FaExclamationCircle /> À propos</a>
                <span className={styles.link} onClick={() => { localStorage.removeItem('user'); navigate('/'); }}><IoIosExit /> Déconnexion</span>
              </div>
            </div>
          </>
        )}
        {isGuest && (
          <>
            <a href="/auth?mode=login" className={styles.link}>Connexion</a>
            <a href="/auth?mode=signup" className={styles.link}>Inscription</a>
            <a href="/about" className={styles.link}>À propos</a>
          </>
        )}
        {!user && (
          <>
            <a href="/home" className={styles.link}>Accueil</a>
            <a href="/auth?mode=login" className={styles.link}>Connexion</a>
            <a href="/auth?mode=signup" className={styles.link}>Inscription</a>
            <a href="/about" className={styles.link}>À propos</a>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
