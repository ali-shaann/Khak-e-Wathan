import Navbar from "@/components/Navbar";
import PropertyExplorer from "@/components/PropertyExplorer";

import {
  getAllProperties,
} from "@/lib/properties";

import {
  interpretPropertySearch,
} from "@/lib/aiSearch";


export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const params =
    await searchParams;

  const query =
    (
      params.q ??
      ""
    ).trim();

  const properties =
    await getAllProperties();


  /*
    Only call the AI interpreter if the user actually
    supplied a natural-language query.
  */

  const interpretation =
    query
      ? await interpretPropertySearch(
          query
        )
      : null;


  return (
    <>
      <Navbar />

      <PropertyExplorer
        key={
          query ||
          "__all-properties"
        }
        properties={
          properties
        }
        initialQuery={
          query
        }
        initialIntent={
          interpretation?.intent ??
          null
        }
        searchSource={
          interpretation?.source ??
          null
        }
      />
    </>
  );
}