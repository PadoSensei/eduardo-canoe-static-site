// src/core/config.ts

interface Config {
  apiBaseUrl: string;
  isProduction: boolean;
  googleMapsUrl: string;
  supportEmail: string;
}

const config: Config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  isProduction: import.meta.env.VITE_ENV === "production",
  googleMapsUrl: "https://maps.app.goo.gl/wqfu2W6PN9LdgXSR9",
  supportEmail: "contato@pipacanoahavaiana.com.br",
};

export default config;
