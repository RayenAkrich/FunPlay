import HeroSection from '../components/HeroSection';
import FeatureHighlights from '../components/FeatureHighlights';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      <Header />
      <main>
        <HeroSection />
        <FeatureHighlights />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
