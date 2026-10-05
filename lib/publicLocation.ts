const PUBLIC_OFFSET_MIN_DEGREES =
  0.0015;

const PUBLIC_OFFSET_RANGE_DEGREES =
  0.002;


export function approximatePublicCoordinates(
  propertyId: string,
  latitude: number | null,
  longitude: number | null
) {
  if (
    latitude === null ||
    longitude === null
  ) {
    return {
      latitude: null,
      longitude: null,
    };
  }


  const latitudeHash =
    hashString(
      `${propertyId}:latitude`
    );

  const longitudeHash =
    hashString(
      `${propertyId}:longitude`
    );


  return {
    latitude:
      roundCoordinate(
        latitude +
          signedOffset(
            latitudeHash
          )
      ),

    longitude:
      roundCoordinate(
        longitude +
          signedOffset(
            longitudeHash
          )
      ),
  };
}


function signedOffset(
  hash: number
) {
  const direction =
    hash % 2 === 0
      ? 1
      : -1;

  const fraction =
    (
      hash % 10_000
    ) /
    10_000;

  return (
    direction *
    (
      PUBLIC_OFFSET_MIN_DEGREES +
      fraction *
        PUBLIC_OFFSET_RANGE_DEGREES
    )
  );
}


function roundCoordinate(
  value: number
) {
  return Number(
    value.toFixed(
      3
    )
  );
}


function hashString(
  value: string
) {
  let hash =
    2_166_136_261;

  for (
    const character of
    value
  ) {
    hash ^=
      character.charCodeAt(
        0
      );

    hash =
      Math.imul(
        hash,
        16_777_619
      );
  }

  return hash >>>
    0;
}
