import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Curated — a magazine you can shop",
    short_name: "Curated",
    description: "An editorial feed of complete looks — real outfits from real brands, ready to wear and ready to shop.",
    start_url: "/",
    display: "standalone",
    background_color: "#100f0d",
    theme_color: "#100f0d",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
