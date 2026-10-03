import type {
  MetadataRoute,
} from "next";


export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      "Khak-e-Wathan",

    short_name:
      "Khak-e-Wathan",

    description:
      "Property discovery for Chitral.",

    start_url:
      "/",

    display:
      "standalone",

    background_color:
      "#f7f8fa",

    theme_color:
      "#0f172a",

    icons: [
      {
        src:
          "/brand-icon-192.png",

        sizes:
          "192x192",

        type:
          "image/png",
      },
      {
        src:
          "/brand-icon-512.png",

        sizes:
          "512x512",

        type:
          "image/png",
      },
    ],
  };
}
