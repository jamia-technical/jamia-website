import Head from "next/head";
import React from "react";

interface SeoProps {
  title: string;
  description: string;
  url: string;
  shareImage?: string;
  keywords?: string;
  preventIndexing?: boolean;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  url,
  shareImage,
  keywords,
  preventIndexing,
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <meta name="keywords" content={keywords} />
      <meta
        name="twitter:card"
        content="summary_large_image"
        key="twitter:card"
      />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:title" content={title} key="og:title" />
      <meta
        property="og:description"
        content={description}
        key="og:description"
      />
      <meta property="og:image" content={shareImage} key="og:image" />
      <link rel="canonical" href={url} />
      {preventIndexing && (
        <>
          <meta name="robots" content="noindex"></meta>
          <meta name="googlebot" content="noindex"></meta>
        </>
      )}
    </Head>
  );
};

export default Seo;
