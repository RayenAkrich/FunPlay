import styles from './HeroSection.module.css';

const HeroSection = () => (
  <section className={styles.hero}>
    <div className={styles.heroContent}>
      <h1>FunPlay: Jouez, Connectez et Progressez!</h1>
      <p>Plateforme de mini-jeux multijoueurs en ligne. Défiez vos amis ou jouez en solo, sans installation, partout, tout le temps.</p>
      <div className={styles.ctaGroup}>
        <a href="/auth?mode=login" className={styles.ctaBtn}>Se connecter</a>
        <a href="/auth?mode=signup" className={styles.ctaBtnAlt}>Créer un compte</a>
      </div>
    </div>
  </section>
);

export default HeroSection;
