/**
 * useCart Hook - Cart state and actions
 */
import { useCartStore } from '../store/cartStore';

export function useCart() {
  return useCartStore();
}
