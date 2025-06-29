import styles from './FeatureHighlights.module.css';
import { FaUserFriends, FaBolt, FaShieldAlt } from 'react-icons/fa';

const features = [
  {
    icon: <FaUserFriends size={32} color="var(--primary)" />,
    title: 'Multijoueur instantané',
    desc: 'Jouez avec vos amis ou des joueurs du monde entier en temps réel.'
  },
  {
    icon: <FaBolt size={32} color="var(--accent)" />,
    title: 'Jeux rapides & variés',
    desc: 'Tic Tac Toe, Memory, Pierre-Feuille-Ciseaux et plus à venir.'
  },
  {
    icon: <FaShieldAlt size={32} color="var(--primary)" />,
    title: 'Sûr & sans installation',
    desc: 'Aucune installation requise, vos données sont protégées.'
  }
];

const FeatureHighlights = () => (
  <section className={styles.features}>
    <div className={styles.grid}>
      {features.map((f) => (
        <div className={styles.card}>
          <div className={styles.icon}>{f.icon}</div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeatureHighlights;
