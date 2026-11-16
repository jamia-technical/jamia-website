import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import NewsListClient from "../../components/NewsListClient";
import { getPublishedNews } from "../../lib/publicContent";

export const revalidate = 3600;

const NewsPage = async () => {
  const newsItems = await getPublishedNews();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="relative bg-gradient-to-r from-primary to-primary/80 pt-52 pb-24">
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="mt-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-4 mt-4 md:mt-0">
              Updates
            </h1>
            <p className="text-xl text-white">
              Stay updated with the latest happenings at Jamia Madeenathunnoor
            </p>
          </div>
        </div>
      </div>
      <NewsListClient newsItems={newsItems} />
      <Footer />
    </div>
  );
};

export default NewsPage;
