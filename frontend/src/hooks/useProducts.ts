import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { productsService, Product, ProductsResponse, CreateProductDto, UpdateProductDto } from '@/services/products.service';
import { toast } from 'sonner';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: { page?: number; category?: string }) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string, filters?: Record<string, any>) => [...productKeys.all, 'search', query, filters] as const,
};

// Fetch all products with optional pagination and filtering
export function useProducts(
  params?: { page?: number; limit?: number; category?: string },
  options?: Omit<UseQueryOptions<ProductsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsService.getAll(params),
    staleTime: 30000, // 30 seconds
    ...options,
  });
}

// Fetch single product by ID
export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<Product>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: !!id,
    ...options,
  });
}

// Fetch products by category
export function useProductsByCategory(
  categoryId: string,
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<ProductsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['products', 'category', categoryId, params],
    queryFn: () => productsService.getByCategory(categoryId, params),
    enabled: !!categoryId,
    ...options,
  });
}

// Search products
export function useSearchProducts(
  query: string,
  filters?: Record<string, any>,
  options?: Omit<UseQueryOptions<Product[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.search(query, filters),
    queryFn: () => productsService.search(query, filters),
    enabled: query.length > 0,
    ...options,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsService.create(data),
    onSuccess: () => {
      // Invalidate all product queries to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsService.update(id, data),
    onSuccess: (updatedProduct) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
      toast.success('Product updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success('Product deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
