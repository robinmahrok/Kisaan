import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  author = "Khetihat",
  structuredData,
}) => {
  const defaultTitle = "Khetihat - Agricultural Marketplace for Farmers";
  const defaultDescription =
    "Connect farmers with buyers and sellers. Buy and sell agricultural products, request farm supplies, and grow your agricultural business with Khetihat.";
  const defaultKeywords =
    "farming, agriculture, farmers marketplace, buy crops, sell crops, agricultural products, farm supplies, kisaan, khetihat";
  const siteUrl = "https://khetihat.com";
  
  // Use absolute URL for default image
  const defaultImage = `${siteUrl}/khetihat.png`;

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  
  // Convert relative image paths to absolute URLs
  const seoImage = image 
    ? (image.startsWith('http') ? image : `${siteUrl}${image}`)
    : defaultImage;
  
  const seoUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:secure_url" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:site_name" content="Khetihat" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={seoUrl} />
      <meta property="twitter:title" content={seoTitle} />
      <meta property="twitter:description" content={seoDescription} />
      <meta property="twitter:image" content={seoImage} />
      <meta property="twitter:image:alt" content={seoTitle} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
