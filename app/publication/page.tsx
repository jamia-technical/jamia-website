import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPublishedPublications } from "../../lib/publicContent";
import { BookOpen, Calendar } from "lucide-react";

export const revalidate = 3600;

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Not published";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const PublicationPage = async () => {
  const publications = await getPublishedPublications();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="relative bg-gradient-to-r from-primary to-primary/80 pt-52 pb-24">
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="mt-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-4 mt-4 md:mt-0">
              Publications
            </h1>
            <p className="text-xl text-white">
              Read Jamia Madeenathunnoor magazines and published issues
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        {publications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {publications.map((publication: any) => (
              <Link href={`/publication/${publication.slug}`}
                key={publication.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="relative w-full bg-gray-100 border-b border-neutral-200">
                  {publication.coverimage && (
                    <Image
                      src={publication.coverimage}
                      alt={publication.title}
                      width={900}
                      height={1200}
                      className="w-full h-auto"
                    />
                  )}
                  {publication.issue && (
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {formatDate(publication.publishedat)}
                    </div>
                  )}
                </div>

                <div className="p-4 px-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    {publication.title} <span className="text-primary p-1 px-1.5 rounded-lg border border-green-950/30 text-sm">{publication.issue}</span>
                  </h2>
                  {publication.description && (
                    <p className="text-gray-600 mb-5 line-clamp-3">
                      {publication.description}
                    </p>
                  )}
                  {/* <Link
                    href={`/publication/${publication.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read
                  </Link> */}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
            <BookOpen className="text-gray-300 w-16 h-16 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No publications available yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PublicationPage;
