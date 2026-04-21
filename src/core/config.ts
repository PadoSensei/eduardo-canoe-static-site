// src/core/config.ts

interface Config {
  apiBaseUrl: string;
  isProduction: boolean;
  isTest: boolean;
  googleMapsUrl: string;
  supportEmail: string;
  siteUrl: string;
  defaultOgImage: string;
}

const config: Config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  isProduction: import.meta.env.VITE_ENV === "production",
  isTest: import.meta.env.MODE === "test",
  googleMapsUrl: "https://maps.app.goo.gl/wqfu2W6PN9LdgXSR9",
  supportEmail: "contato@pipacanoahavaiana.com.br",
  siteUrl: import.meta.env.VITE_SITE_URL || "https://pipacanoahavaiana.com.br",
  defaultOgImage: "/img/sunset_pic.jpeg",
};

if (!import.meta.env.PROD) {
  console.log(
    `%c ⚡ EduCanoe API: ${config.apiBaseUrl} `,
    "background: #10b981; color: #fff; font-weight: bold; border-radius: 4px;"
  );
}

export default config;
