import styles from './Header.module.css';

const Header = () => (
  <header className={styles.header}>
    <div className={styles.logo}>FunPlay</div>
    <nav className={styles.nav}>
      <a href="/" className={styles.link}>Accueil</a>
      <a href="/auth?mode=login" className={styles.link}>Connexion</a>
      <a href="/auth?mode=signup" className={styles.link}>Inscription</a>
    </nav>
  </header>
);

export default Header;
