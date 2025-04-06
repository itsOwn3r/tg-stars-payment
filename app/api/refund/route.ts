import { NextResponse } from "next/server";

export async function POST() {


    return NextResponse.json({ success: false, message: "In this demo app, refunds must be through the Telegram Bot",
        details: 'For a production app, you would implement direct refund functionality using real transaction IDs stored in your database'
     }, { status: 400 });

  }