export interface Item {
    id: string,
    name: string,
    description: string,
    price: number,
    icon: string
}

export const ITEMS: Item[] = [
    {
        id: "ice_cream",
        name: "Ice Cream 🍧",
        description: "A delicious virtual ice cream",
        price: 1,
        icon: "🍧"
    },
    {
        id: "cookie",
        name: "Cookie 🍪",
        description: "A delicious virtual Cokie",
        price: 1,
        icon: "🍪"
    },
    {
        id: "hamburger",
        name: "Hamburger 🍔",
        description: "A tasty virual HamBurger with Beef and Cheese!",
        price: 2,
        icon: "🍔"
    }
]

export function getItemById(id: string): Item | undefined {
    return ITEMS.find(item => item.id === id);
}