"use client";

import { useEffect, useState } from "react";
import { ITEMS, Item } from "@/app/data/items";
import { Purchase, CurrentPurchaseWithSecret } from "./types";


// Import components
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import ItemsList from "./components/ItemsList";
import PurchaseSuccessModal from "./components/PurchaseSuccessModal";
import PurchaseHistory from "./components/PurchaseHistory";
import RefundInstructionModal from "./components/RefundInstructionModal";

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    type: "purchase" | "refund" | null;
    purchase?: CurrentPurchaseWithSecret;
  }>({
    type: null
  });

  useEffect(() => {
    // Import TWA SDK dynamically to avoid SSR issues
    const initTelegram = async () => {
      try {
        // Dynamic import of the TWA SDK
        const WebApp = (await import('@twa-dev/sdk')).default;
        
        // Check if running within Telegram
        const isTelegram = WebApp.isExpanded !== undefined;
        
        if (isTelegram) {
          // Initialize Telegram Web App
          WebApp.ready();
          WebApp.expand();
          
          // Get user ID from initData
          if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
            // Access user data directly from the WebApp object
            const user = WebApp.initDataUnsafe.user;
            setUserId(user.id?.toString() || '');
          } else {
            setError('No user data available from Telegram');
            setIsLoading(false);
          }
        } else {
          // Not in Telegram, set an error message
          setError('This application can only be accessed from within Telegram');
          setIsLoading(false);
        }

        setInitialized(true);
      } catch (e) {
        console.error('Failed to initialize Telegram Web App:', e);
        setError('Failed to initialize Telegram Web App');
        setInitialized(true);
        setIsLoading(false);
      }
    };

    initTelegram();
  }, [])

  useEffect(() => {
    if(initialized && userId) {
      fetchPurchases();
    }
    // eslint-disable-next-line
  }, [initialized, userId])

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/purchases?userId=${userId}`);
      if(!response.ok) {
        throw new Error('Failed to fetch purchases');
      }
      
      const data = await response.json();
      setPurchases(data.purchases);
      setIsLoading(false);
    } catch (e) {
      console.error('Failed to fetch purchases:', e);
      setError('Failed to fetch purchases');
      setIsLoading(false);
    }
  };

  const handlePurchase = async(item: Item) => {
    try {
      setIsLoading(true);

      // Create invoice link through our api
      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          userId
        })
      });
      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const { invoiceLink } = await response.json();
      setIsLoading(false);
      
      // Import TWA SDK
      const WebApp = (await import('@twa-dev/sdk')).default;
      // Open the invoice link in Telegram
      WebApp.openInvoice(invoiceLink, async (status) => {
        if(status === "paid"){
          setIsLoading(true);

          const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

          try {
            
            // Store the successful payment and get the secret code
            const paymentResponse = await fetch('/api/payment-success', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                itemId: item.id,
                userId,
                transactionId
              })
            });

            if(!paymentResponse.ok) {
              throw new Error('Failed to save payment');
            }

            const { secret } = await paymentResponse.json();

            setModalState({
              type: 'purchase',
              purchase: {
                item,
                transactionId,
                timestamp: Date.now(),
                secret
              }
            });

            // Refresh purchase list
            await fetchPurchases();

          } catch (e) {
            console.error('Error saving payment:', e);
            alert("Your payment was successful, but we had trouble saving the purchase. Please contact support.")
            setIsLoading(false);
          }
        } else if(status === "failed"){
          alert("Payment failed. Please try again.")
        } else if (status === "cancelled"){
          alert("Payment canceled.");
          console.log("Payment was cancelled by user!");
        }
      })
    } catch (error) {
      console.error('Failed during purchase:', error);
      setError(`Failed to process purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }

  // Function to reveal secret for past purchases
  const revealSecret = async (purchase: Purchase) => {
    try {
      setIsLoading(true);
      // Fetch the secret from the server for this purchase
      const response = await fetch(`/api/get-secret?itemId=${purchase.itemId}&transactionId=${purchase.transactionId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch secret');
      }

      const { secret } = await response.json();
      const item = ITEMS.find(i => i.id === purchase.itemId);

        if(item) {
        setModalState({
          type: 'purchase',
          purchase: {
            item,
            transactionId: purchase.transactionId,
            timestamp: purchase.timestamp,
            secret
          }
        });
      }

      setIsLoading(false);
    } catch (error) {
      alert("Unable to retrieve the secret code. Please try again.");
      console.log("Error fetching secret code:", error);
      setIsLoading(false);
    }
  }
  
  const handleRefund = () => {
    setModalState({ type: "refund" })
  }

  // Handle retry on error
  const handleRetry = () => {
    window.location.reload();
  }

  // Close modal
  const handleCloseModal = () => {
    setModalState({ type: null });
  }

  if (!initialized || isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />
  }


  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      
      {modalState.type === "purchase" && modalState.purchase && modalState.purchase.item && (
        <PurchaseSuccessModal
          currentPurchase={modalState.purchase}
          onClose={handleCloseModal}
        />
      )}

      {modalState.type === "refund" && (
        <RefundInstructionModal
          onClose={handleCloseModal}
        />
      )}

      <h1 className="text-2xl font-bold mb-6 text-center">First Stars Store</h1>

      <ItemsList items={ITEMS} onPurchase={handlePurchase} />

      <PurchaseHistory
        purchases={purchases}
        items={ITEMS}
        onRefund={handleRefund}
        onViewSecret={revealSecret}
        />

    </div>
  );
}
