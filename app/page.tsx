import Navbar from "../components/Navbar";
import News from "../components/News";
import Footer from "../components/Footer";
import Posters from "../components/Updates";
import About from "../components/About";
import ChairmanMessage from "../components/ChairmanMessage";
import RectorMessage from "../components/RectorMessage";
import MileStone from "../components/MileStone";
import Logos from "../components/Logos";
import Features from "../components/Features";
import Hero from "../components/HeroBanner";
import Mission from "../components/Mission";
import HomeMarquee from "../components/HomeMarquee";
import AosInit from "../components/AosInit";
import { getLatestPosters, getLatestPublishedNews } from "../lib/publicContent";

export const revalidate = 3600;

const Home = async () => {
  const [poster, latestNews] = await Promise.all([
    getLatestPosters(5),
    getLatestPublishedNews(3),
  ]);

  return (
    <div className="scroll-smooth">
      <AosInit />
      <HomeMarquee />
      <Navbar />
      <div className="home">
        <Hero />
        <About />
        <Posters poster={poster} />
        <MileStone />
        <Logos />
        <ChairmanMessage />
        <Mission />
        <RectorMessage />
        <Features />
        <News data={latestNews} />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
