import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import PublicationFlipBook from "../../../components/PublicationFlipBook";
import { getPublicationBySlug } from "../../../lib/publicContent";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};

const PublicationDetailPage = async ({
  params,
}: {
  params: { slug: string };
}) => {
  const publication = await getPublicationBySlug(params.slug);

  if (!publication) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-36 pb-16">
        <div className="container mx-auto px-4">
          <Link
            href="/publication"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-secondary mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Publications
          </Link>

          <div className="mb-8">
            {publication.issue && (
              <p className="text-secondary font-semibold mb-2">
                {publication.issue}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {publication.title}
            </h1>
            {publication.publishedat && (
              <p className="text-gray-500">{formatDate(publication.publishedat)}</p>
            )}
            {publication.description && (
              <p className="text-gray-700 mt-4 max-w-3xl leading-relaxed">
                {publication.description}
              </p>
            )}
          </div>

          <PublicationFlipBook
            pdfUrl={publication.pdfurl}
            title={publication.title}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicationDetailPage;
