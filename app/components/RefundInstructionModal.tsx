"use client";
import React from 'react'

const RefundInstructionModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className='fixed inset-0 bg-[#808080] bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
            <div className="text-center mb-4">
                <div className="text-4xl">↩</div>
                <h3 className="text-xl font-semibold mb-2">Refund Instructions</h3>
            </div>


                <div className="my-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="mb-3">For refunds, please use our Telegram bot:</p>
                    <ol className='list-decimal list-inside space-y-2 pl-2'>
                        <li>Open our Telegram bot</li>
                        <li>Search for the appropriate <code>/refund</code> command</li>
                        <li>Follow the instructions to get a refund.</li>
                    </ol>
                    <p className="mt-3 text-sm italic">
                        The bot has access to your complete purchase history with the actual transaction ID required for processing refunds.
                    </p>
                </div>

            <button onClick={onClose} className='mt-4 w-full tg-button cursor-pointer'>Got it</button>
        </div>
    </div>
  )
}

export default RefundInstructionModal