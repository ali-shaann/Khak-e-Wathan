import { Property } from "@/types/property";

export const booniProperties: Property[] = [
  {
    id: "booni-001",
    price: "PKR 34 Lakh",
    estimate: "32–36 Lakh",
    title: "5 Marla Residential Plot",
    location: "Booni",
    size: "5 Marla",
    type: "Residential",
    gradient: "from-emerald-100 via-teal-100 to-slate-200",

    roadAccess: true,
    waterAvailable: true,
    electricityAvailable: true,
  },
  {
    id: "booni-002",
    price: "PKR 58 Lakh",
    estimate: "55–61 Lakh",
    title: "10 Marla Premium Land",
    location: "Booni",
    size: "10 Marla",
    type: "Residential",
    gradient: "from-sky-100 via-slate-100 to-indigo-100",

    roadAccess: true,
    waterAvailable: true,
    electricityAvailable: true,
  },
  {
    id: "booni-003",
    price: "PKR 42 Lakh",
    estimate: "39–44 Lakh",
    title: "Agricultural Land",
    location: "Booni",
    size: "8 Marla",
    type: "Agricultural",
    gradient: "from-lime-100 via-emerald-100 to-slate-100",

    roadAccess: true,
    waterAvailable: true,
    electricityAvailable: false,
  },
];

export const balachProperties: Property[] = [
  {
    id: "balach-001",
    price: "PKR 29 Lakh",
    estimate: "27–31 Lakh",
    title: "4 Marla Residential Plot",
    location: "Balach",
    size: "4 Marla",
    type: "Residential",
    gradient: "from-orange-100 via-amber-50 to-slate-200",

    roadAccess: true,
    waterAvailable: true,
    electricityAvailable: true,
  },
  {
    id: "balach-002",
    price: "PKR 46 Lakh",
    estimate: "43–48 Lakh",
    title: "7 Marla Land",
    location: "Balach",
    size: "7 Marla",
    type: "Residential",
    gradient: "from-cyan-100 via-sky-100 to-slate-200",

    roadAccess: true,
    waterAvailable: true,
    electricityAvailable: true,
  },
  {
    id: "balach-003",
    price: "PKR 65 Lakh",
    estimate: "61–68 Lakh",
    title: "Commercial Land",
    location: "Balach",
    size: "10 Marla",
    type: "Commercial",
    gradient: "from-violet-100 via-slate-100 to-pink-100",

    roadAccess: true,
    waterAvailable: false,
    electricityAvailable: true,
  },
];

export const allProperties = [
  ...booniProperties,
  ...balachProperties,
];