import React from 'react';
import { Item } from '@/app/data/items';
import { Purchase } from '../types';
import PurchaseHistoryItem from './PurchaseHistoryItem';

interface PurchaseHistoryProps {
    purchases: Purchase[];
    items: Item[];
    onViewSecret: (purchase: Purchase) => void;
    onRefund: (transactionId: string) => void;
}

const PurchaseHistory = ({ purchases, items, onRefund, onViewSecret }: PurchaseHistoryProps) => {
  return (
    <div>
        <h2 className='text-xl font-semibold mb-4'>Purchase History</h2>
        {purchases.length === 0 ? (
            <p className="text-center py-4 tg-hint">
                No purchases yet. Buy something to see it here!
            </p>
        ) : (
            <div className="space-y-3">
                {purchases.map((purchase) => {
                    const item = items.find((item) => item.id === purchase.itemId);
                    return (
                        <PurchaseHistoryItem key={purchase.transactionId} purchase={purchase} item={item} onRefund={onRefund} onViewSecret={onViewSecret} />
                    );
                })}
            </div>
        )}
    </div>
  )
}

export default PurchaseHistory