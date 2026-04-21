import React from "react";
import { Helmet } from "react-helmet-async";
import config from "../../core/config";

interface ServiceSchema {
  "@type": "Service";
  name: string;
  description?: string;
  offers?: {
    "@type": "Offer";
    price: number;
    priceCurrency: string;
  };
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article";
  lang?: string;
  services?: ServiceSchema[];
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image,
  path = "",
  type = "website",
  lang = "pt",
  services,
}) => {
  const siteName = "Pipa Canoa Havaiana";
  // If title already contains the brand name, don't append it again
  const fullTitle =
    title && title.includes(siteName)
      ? title
      : title
        ? `${title} | ${siteName}`
        : siteName;
  const metaDescription =
    description ||
    "Pipa Canoa Havaiana - Experiência autêntica de Canoa Havaiana em Pipa, RN.";
  const canonicalUrl = `${config.siteUrl}${path}`;
  const absoluteImageUrl = new URL(
    image || config.defaultOgImage,
    config.siteUrl
  ).href;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        name: siteName,
        image: absoluteImageUrl,
        "@id": config.siteUrl,
        url: config.siteUrl,
        telephone: "",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Escadaria do Pôr do Sol",
          addressLocality: "Tibau do Sul",
          addressRegion: "RN",
          postalCode: "59178-000",
          addressCountry: "BR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -6.1868,
          longitude: -35.0886,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "05:00",
          closes: "20:00",
        },
      },
      ...(services || []),
    ],
  };

  return (
    <Helmet>
      {/* Standard Metadata */}
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData).replace(/</g, "\\u003c")}
      </script>
    </Helmet>
  );
};

export default SEO;
