import { CartItem } from '@/types'
import { create } from 'zustand'

interface CartState {
  items: CartItem[]
  nurseryId: string | null
  nurseryName: string | null
  addItem: (item: CartItem, nurseryId: string, nurseryName: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  nurseryId: null,
  nurseryName: null,

  addItem: (item, incomingNurseryId, incomingNurseryName) =>
    set((state) => {
      const switchingNursery = state.nurseryId !== null && state.nurseryId !== incomingNurseryId
      const baseItems = switchingNursery ? [] : state.items

      const existingItem = baseItems.find((cartItem) => cartItem.productId === item.productId)

      if (existingItem) {
        return {
          nurseryId: incomingNurseryId,
          nurseryName: incomingNurseryName,
          items: baseItems.map((cartItem) =>
            cartItem.productId === item.productId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          ),
        }
      }

      return {
        nurseryId: incomingNurseryId,
        nurseryName: incomingNurseryName,
        items: [...baseItems, { ...item, quantity: item.quantity > 0 ? item.quantity : 1 }],
      }
    }),

  removeItem: (productId) =>
    set((state) => {
      const updatedItems = state.items.filter((item) => item.productId !== productId)

      return {
        items: updatedItems,
        nurseryId: updatedItems.length ? state.nurseryId : null,
        nurseryName: updatedItems.length ? state.nurseryName : null,
      }
    }),

  updateQuantity: (productId, qty) =>
    set((state) => {
      const updatedItems =
        qty <= 0
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) =>
              item.productId === productId ? { ...item, quantity: qty } : item
            )

      return {
        items: updatedItems,
        nurseryId: updatedItems.length ? state.nurseryId : null,
        nurseryName: updatedItems.length ? state.nurseryName : null,
      }
    }),

  clearCart: () =>
    set({
      items: [],
      nurseryId: null,
      nurseryName: null,
    }),

  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}))

export default useCartStore
