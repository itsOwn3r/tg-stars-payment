import { NextRequest, NextResponse } from "next/server";
import { Purchase } from "@/app/types";
import { getSecretForItem } from "@/app/server/item-secrets";

// Make purchases accessible to other routes

// @ts-expect-error checked
if (!global.purchases) {
  
  // @ts-expect-error checked
  global.purchases = [];
}


// @ts-expect-error checked
const purchases = global.purchases;


export async function GET(req: NextRequest) {
  try {
    const itemId = req.nextUrl.searchParams.get("itemId");
    const transactionId = req.nextUrl.searchParams.get("transactionId");
    if (!itemId || !transactionId) {
      return NextResponse.json("Missing transactionId or itemId!", { status: 400 });
    }

    // Verify the purchase exists
    const purchase = purchases.find((p: Purchase) => p.itemId === itemId && purchase.transactionId === transactionId);

    if (!purchase) {
      return NextResponse.json({ success: false, message:"Purchase not found"}, { status: 404 });
    }

    // Get the secret from purchased item
    const secret = getSecretForItem(itemId);

    if (!secret) {
      return NextResponse.json({ success: false, message:"Secret not found"}, { status: 404 });
    }
    
    // return the secret
    return NextResponse.json({ success: true, secret: secret }, { status: 200});

  } catch (error) {
    console.log("Error in retrieving secret: ", (error as Error).message);
    return NextResponse.json(
      { success: false, message: "Error in retrieving secret: " + (error as Error).message },
      { status: 500 }
    );
  }
}
