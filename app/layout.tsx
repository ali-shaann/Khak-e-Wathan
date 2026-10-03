import type {
  Metadata,
  Viewport,
} from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";
import "leaflet/dist/leaflet.css";


const geistSans =
  Geist({
    variable:
      "--font-geist-sans",

    subsets: [
      "latin",
    ],
  });


const geistMono =
  Geist_Mono({
    variable:
      "--font-geist-mono",

    subsets: [
      "latin",
    ],
  });


const siteTitle =
  "Khak-e-Wathan — Property discovery for Chitral";


const siteDescription =
  "Explore property across Chitral with maps, clear listing details, verification information, access and utility data, and value guidance.";


export const metadata:
  Metadata = {
  title: {
    default:
      siteTitle,

    template:
      "%s | Khak-e-Wathan",
  },

  description:
    siteDescription,

  applicationName:
    "Khak-e-Wathan",

  keywords: [
    "Chitral property",
    "Chitral land",
    "Booni property",
    "Balach property",
    "property marketplace Pakistan",
    "land for sale Chitral",
  ],

  category:
    "real estate",

  openGraph: {
    type:
      "website",

    locale:
      "en_PK",

    siteName:
      "Khak-e-Wathan",

    title:
      siteTitle,

    description:
      siteDescription,
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      siteTitle,

    description:
      siteDescription,
  },
};


export const viewport:
  Viewport = {
  themeColor:
    "#0f172a",

  colorScheme:
    "light",
};


export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {
          children
        }
      </body>
    </html>
  );
}
