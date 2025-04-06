import { getItemById } from "@/app/data/items";
import { NextRequest, NextResponse } from "next/server";
import { Purchase } from "@/app/types";

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
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json("Missing userId!", { status: 400 });
    }

    // Filter purchases by userId
    const userPurchases = purchases.filter((purchase: Purchase) => purchase.userId === userId);

    // Validate all items in purchases exist (in case item data has changed)
    const validedPurchases = userPurchases.filter((purchase: Purchase) => {
      const item = getItemById(purchase.itemId);
      return item !== null;
    });


    // Return the purchases
    return NextResponse.json({ success: true, purchases: validedPurchases }, { status: 200});
  } catch (error) {
    console.log("Error in storing successful payment", (error as Error).message);
    return NextResponse.json(
      { success: false, message: "Error in storing successful payment" + (error as Error).message },
      { status: 500 }
    );
  }
}
