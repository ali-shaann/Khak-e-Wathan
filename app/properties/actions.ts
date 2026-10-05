"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


export type PropertyInquiryState = {
  status:
    | "idle"
    | "success"
    | "error";

  message: string;
};


export async function createPropertyInquiry(
  _previousState:
    PropertyInquiryState,
  formData:
    FormData
): Promise<PropertyInquiryState> {
  const propertyId =
    getText(
      formData,
      "propertyId"
    );

  const buyerName =
    getText(
      formData,
      "buyerName"
    );

  const buyerPhone =
    getText(
      formData,
      "buyerPhone"
    );

  const buyerEmail =
    getText(
      formData,
      "buyerEmail"
    ).toLowerCase();

  const message =
    getText(
      formData,
      "message"
    );

  const website =
    getText(
      formData,
      "website"
    );


  if (website) {
    return {
      status:
        "success",

      message:
        "Your viewing request was sent.",
    };
  }


  if (!propertyId) {
    return {
      status:
        "error",

      message:
        "This property could not be identified.",
    };
  }


  if (
    buyerName.length <
      2 ||
    buyerName.length >
      80
  ) {
    return {
      status:
        "error",

      message:
        "Enter your name.",
    };
  }


  if (
    !buyerPhone &&
    !buyerEmail
  ) {
    return {
      status:
        "error",

      message:
        "Provide a phone number or email address.",
    };
  }


  if (
    buyerEmail &&
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
      buyerEmail
    )
  ) {
    return {
      status:
        "error",

      message:
        "Enter a valid email address.",
    };
  }


  if (
    buyerPhone.length >
      40 ||
    buyerEmail.length >
      160
  ) {
    return {
      status:
        "error",

      message:
        "The contact information is too long.",
    };
  }


  if (
    message.length <
      5 ||
    message.length >
      1000
  ) {
    return {
      status:
        "error",

      message:
        "Add a short message for the seller.",
    };
  }


  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_property_inquiry",
      {
        p_property_id:
          propertyId,

        p_buyer_name:
          buyerName,

        p_buyer_phone:
          buyerPhone ||
          null,

        p_buyer_email:
          buyerEmail ||
          null,

        p_message:
          message,
      }
    );


  if (
    error ||
    !data
  ) {
    console.error(
      "PROPERTY INQUIRY ERROR:",
      {
        message:
          error?.message,

        details:
          error?.details,
      }
    );


    return {
      status:
        "error",

      message:
        "The request could not be sent. Please try again shortly.",
    };
  }


  revalidatePath(
    "/dashboard"
  );


  return {
    status:
      "success",

    message:
      "Your viewing request was sent to the seller.",
  };
}


function getText(
  formData: FormData,
  key: string
) {
  return String(
    formData.get(
      key
    ) ??
      ""
  ).trim();
}
