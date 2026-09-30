import PropertyExplorer from "@/components/PropertyExplorer";

import {
  getAllProperties,
} from "@/lib/properties";

export default async function PropertiesPage() {
  const properties =
    await getAllProperties();

  return (
    <PropertyExplorer
      properties={properties}
    />
  );
}