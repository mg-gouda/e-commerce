import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService, type Wishlist } from '@/services/wishlist.service';
import { toast } from 'sonner';

// Query keys
export const wishlistKeys = {
  all: ['wishlist'] as const,
  lists: () => [...wishlistKeys.all, 'list'] as const,
  list: () => [...wishlistKeys.lists()] as const,
  count: () => [...wishlistKeys.all, 'count'] as const,
  check: (productId: string) => [...wishlistKeys.all, 'check', productId] as const,
};

/**
 * Get user's wishlist with all items
 */
export function useWishlist() {
  return useQuery({
    queryKey: wishlistKeys.list(),
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get wishlist item count
 */
export function useWishlistCount() {
  return useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: () => wishlistService.getWishlistCount(),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Check if a product is in the wishlist
 */
export function useIsInWishlist(productId: string) {
  return useQuery({
    queryKey: wishlistKeys.check(productId),
    queryFn: () => wishlistService.checkIfInWishlist(productId),
    enabled: !!productId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Add product to wishlist
 */
export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.addToWishlist(productId),
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });

      // Optimistically update check status
      queryClient.setQueryData(
        wishlistKeys.check(productId),
        { inWishlist: true }
      );

      // Optimistically update count
      const previousCount = queryClient.getQueryData<{ count: number }>(wishlistKeys.count());
      if (previousCount) {
        queryClient.setQueryData(wishlistKeys.count(), {
          count: previousCount.count + 1,
        });
      }

      return { previousCount };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success('Added to wishlist!');
    },
    onError: (error, productId, context) => {
      // Rollback optimistic updates
      if (context?.previousCount) {
        queryClient.setQueryData(wishlistKeys.count(), context.previousCount);
      }
      queryClient.setQueryData(
        wishlistKeys.check(productId),
        { inWishlist: false }
      );

      const errorMessage = (error as any)?.message || 'Failed to add to wishlist';
      toast.error(errorMessage);
    },
  });
}

/**
 * Remove product from wishlist
 */
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistService.removeFromWishlist(productId),
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: wishlistKeys.all });

      // Optimistically update check status
      queryClient.setQueryData(
        wishlistKeys.check(productId),
        { inWishlist: false }
      );

      // Optimistically update count
      const previousCount = queryClient.getQueryData<{ count: number }>(wishlistKeys.count());
      if (previousCount) {
        queryClient.setQueryData(wishlistKeys.count(), {
          count: Math.max(0, previousCount.count - 1),
        });
      }

      // Optimistically remove from list
      const previousWishlist = queryClient.getQueryData<Wishlist>(wishlistKeys.list());
      if (previousWishlist) {
        queryClient.setQueryData(wishlistKeys.list(), {
          ...previousWishlist,
          wishlistItems: previousWishlist.wishlistItems.filter(
            (item) => item.product_id !== productId
          ),
        });
      }

      return { previousCount, previousWishlist };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success('Removed from wishlist');
    },
    onError: (error, productId, context) => {
      // Rollback optimistic updates
      if (context?.previousCount) {
        queryClient.setQueryData(wishlistKeys.count(), context.previousCount);
      }
      if (context?.previousWishlist) {
        queryClient.setQueryData(wishlistKeys.list(), context.previousWishlist);
      }
      queryClient.setQueryData(
        wishlistKeys.check(productId),
        { inWishlist: true }
      );

      const errorMessage = (error as any)?.message || 'Failed to remove from wishlist';
      toast.error(errorMessage);
    },
  });
}

/**
 * Clear entire wishlist
 */
export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      toast.success('Wishlist cleared');
    },
    onError: (error) => {
      const errorMessage = (error as any)?.message || 'Failed to clear wishlist';
      toast.error(errorMessage);
    },
  });
}

/**
 * Toggle product in wishlist (add if not in wishlist, remove if already in)
 */
export function useToggleWishlist() {
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  return {
    toggle: (productId: string, isInWishlist: boolean) => {
      if (isInWishlist) {
        return removeFromWishlist.mutate(productId);
      } else {
        return addToWishlist.mutate(productId);
      }
    },
    isPending: addToWishlist.isPending || removeFromWishlist.isPending,
  };
}
