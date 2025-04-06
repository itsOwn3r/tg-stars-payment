import { getSecretForItem } from "@/app/server/item-secrets";
import { NextRequest, NextResponse } from "next/server";

// Make purchases accessible to other routes

// @ts-ignore
if (!global.purchases) {
  // @ts-ignore
  global.purchases = [];
}

// @ts-ignore
const purchases = global.purchases;


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, userId, transactionId } = body;
    if (!itemId || !userId || !transactionId) {
      return NextResponse.json("Missing itemId or userId or transactionId", { status: 400 });
    }

    // Get the item from our data store
    const secret = getSecretForItem(itemId);

    if (!secret) {
      return NextResponse.json("secret not found", { status: 404 });
    }

    // Store the purchase
    purchases.push({
      userId,
      itemId,
      timestamp: Date.now(),
      transactionId,
    });


    // Return the secret
    return NextResponse.json({ success: true, secret});
  } catch (error) {
    console.log("Error in storing successful payment", (error as Error).message);
    return NextResponse.json(
      { success: false, message: "Error in storing successful payment" + (error as Error).message },
      { status: 500 }
    );
  }
}
