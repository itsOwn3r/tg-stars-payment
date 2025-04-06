// server Only

export const ITEM_SERCRETS: Record<string, string> = {

    "ice_cream": "FROZEN2025",
    "cookie": "SWEET2025",
    "hamburger": "BURGEER2025"
}

export const getSecretForItem = (itemId: string): string | undefined => {
    return ITEM_SERCRETS[itemId]
}