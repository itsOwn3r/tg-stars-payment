import { getItemById } from "@/app/data/items";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, userId } = body;
    if (!itemId || !userId) {
      return NextResponse.json("Missing itemId or userId", { status: 400 });
    }

    // Get the item from our data store
    const item = getItemById(itemId);

    if (!item) {
      return NextResponse.json("Item not found", { status: 404 });
    }

    // Extract item details
    const { name: title, description, price } = item;

    // Get the bot token
    const botToken = process.env.botToken;

    if(!botToken) {
      return NextResponse.json({ success: false, message: "Bot token not found" }, { status: 500 });
    }

    // Create an actual invoice link by calling the Telegram Bot API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createInvoiceLink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          payload: itemId,
          provider_token: "", // empty for stars
          currency: "XTR",
          prices: [{ label: title, amount: price }],
          start_parameter: "start_parameter",
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
        console.log("Telegram Api Error", data);
        return NextResponse.json({ success: false, message: data.description }, { status: 500 });
    }

    const invoiceLink = data.result;


    // We don't store the payment yet - that will happen after successful payment
    // We'll return the invoice link to frontend
    return NextResponse.json({ success: true, invoiceLink});
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 500 }
    );
  }
}
