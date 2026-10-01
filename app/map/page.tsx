import Navbar from "@/components/Navbar";
import MapExplorer from "@/components/MapExplorer";

import {
  getAllProperties,
} from "@/lib/properties";

export default async function MapPage() {
  const properties =
    await getAllProperties();

  return (
    <>
      <Navbar />

      <MapExplorer
        properties={properties}
      />
    </>
  );
}