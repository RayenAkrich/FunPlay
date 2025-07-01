import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div>© {new Date().getFullYear()} FunPlay - Rayen Akriche. Tous droits réservés.</div>
  </footer>
);

export default Footer;
