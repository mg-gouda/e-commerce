import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { cartService, Cart, AddToCartDto, UpdateCartItemDto } from '@/services/cart.service';
import { toast } from 'sonner';

// Query keys
export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'current'] as const,
};

// Fetch current cart
export function useCart(options?: Omit<UseQueryOptions<Cart>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => cartService.getCart(),
    staleTime: 10000, // 10 seconds
    ...options,
  });
}

// Add item to cart mutation
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartDto) => cartService.addItem(data),
    onMutate: async (newItem) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

      // Snapshot previous value
      const previousCart = queryClient.getQueryData<Cart>(cartKeys.cart());

      // Optimistically update cart
      if (previousCart) {
        queryClient.setQueryData<Cart>(cartKeys.cart(), {
          ...previousCart,
          items: [...previousCart.items],
        });
      }

      return { previousCart };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      toast.success('Added to cart!');
    },
    onError: (error: any, _newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
      toast.error(error.message || 'Failed to add to cart');
    },
  });
}

// Update cart item mutation
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemDto }) =>
      cartService.updateItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      toast.success('Cart updated!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update cart');
    },
  });
}

// Remove cart item mutation
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      toast.success('Removed from cart!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove from cart');
    },
  });
}

// Clear cart mutation
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
      toast.success('Cart cleared!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clear cart');
    },
  });
}
