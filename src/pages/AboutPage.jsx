import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './AboutPage.module.css';
import { SiFacebook , SiGithub, SiGmail , SiInstagram , SiLinkedin } from "react-icons/si";

const AboutPage = () => {
    // Retrieve user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    return(
        <div className={styles.aboutPage}>
    <Header user={user} />
  <div className={styles.aboutContainer}>
    <section className={styles.heroSection}>
      <h1>👋 Hi, I'm Rayen Akriche!</h1>
      <p>
        I’m an engineering student at Faculté des Sciences Mathématiques, Physiques et Naturelles de Tunis, passionate about coding, web and software development, and building cool things. I love exploring new technologies, solving problems, and turning ideas into real, useful projects.
      </p>
    </section>
    <section className={styles.bioSection}>
      <h2>About Me</h2>
      <p>
        I enjoy working on diverse projects—from websites to desktop apps—and I’m always eager to expand my knowledge, especially in areas like cybersecurity and how tech helps teams and businesses work better. I care about both the visual side and the logic behind the scenes.
      </p>
      <ul>
        <li>🌐 Web & software development</li>
        <li>🛠️ Learning new tools and tech</li>
        <li>💡 Building smart solutions</li>
      </ul>
    </section>
    <section className={styles.siteSection}>
      <h2>About FunPlay</h2>
      <p>
        FunPlay is a modern web platform for multiplayer mini-games. It lets you play quick, fun games like Tic Tac Toe, Memory, and Rock Paper Scissors—solo or with friends—right in your browser. With real-time rooms, guest and registered modes, and a focus on smooth, accessible gameplay, FunPlay is designed for everyone who wants to have fun and connect, no downloads needed!
      </p>
    </section>
    <section className={styles.contactSection}>
      <h2>Contact Me</h2>
      <ul className={styles.links}>
        <li><a href="https://github.com/RayenAkrich" target="_blank" rel="noopener noreferrer"><SiGithub /></a></li>
        <li><a href="https://www.linkedin.com/in/akricherayen" target="_blank" rel="noopener noreferrer"><SiLinkedin /></a></li>
        <li><a href="https://www.instagram.com/rayen._.akrich" target="_blank" rel="noopener noreferrer"><SiInstagram /></a></li>
        <li><a href="https://www.facebook.com/rayen.akrich.0" target="_blank" rel="noopener noreferrer"><SiFacebook /></a></li>
        <li><a href="mailto:akricherayen@gmail.com"><SiGmail /></a></li>
      </ul>
    </section>
  </div>
    <Footer />
    </div>
);
};

export default AboutPage;
