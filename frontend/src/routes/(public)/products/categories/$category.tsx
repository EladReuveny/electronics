import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "react-toastify";
import NoResultsFound from "../../../../components/NoResultsFound";
import PageTitle from "../../../../components/PageTitle";
import ProductCard from "../../../../components/ProductCard";
import ProductCardSkeleton from "../../../../components/ProductCardSkeleton";
import type { Category } from "../../../../features/products/product.types";
import { productsApi } from "../../../../features/products/products.api";
import { productsKeys } from "../../../../features/products/products.keys";
import { usersApi } from "../../../../features/users/users.api";
import { wishlistsApi } from "../../../../features/wishlists/wishlists.api";
import { wishlistsKeys } from "../../../../features/wishlists/wishlists.keys";
import { useAuthStore } from "../../../../lib/store/auth.store";
import { handleError } from "../../../../lib/utils/utils";

type CategoryParam = "smart-phones" | "tablets" | "laptops" | "televisions";

const mapToCategory: Record<CategoryParam, Category> = {
  "smart-phones": "SMART_PHONE",
  tablets: "TABLET",
  laptops: "LAPTOP",
  televisions: "TV",
};

const mapToCategoryName: Record<CategoryParam, string> = {
  "smart-phones": "Smart Phones",
  tablets: "Tablets",
  laptops: "Laptops",
  televisions: "Televisions",
};

export const Route = createFileRoute("/(public)/products/categories/$category")(
  {
    component: CategoriesPage,
  },
);

function CategoriesPage() {
  const { category } = Route.useParams();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const selectedCategory = mapToCategory[category as CategoryParam];
  const categoryTitle =
    mapToCategoryName[category as CategoryParam] ?? category;

  const {
    data: products,
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery({
    queryKey: productsKeys.category(selectedCategory),
    queryFn: () =>
      productsApi.findProductsByQuery({
        category: selectedCategory,
      }),
    enabled: !!selectedCategory,
  });

  const queryClient = useQueryClient();

  const {
    data: wishlistProductsIds,
    isLoading: isWishlistProductsIdsLoading,
    error: wishlistProductsIdsError,
  } = useQuery({
    queryKey: wishlistsKeys.byUserId(user?.id ?? ""),
    queryFn: async () => {
      if (!user?.id) return [];
      const wishlist = await usersApi.findUserWishlist(user.id);
      return wishlist.products.map((p) => p.id);
    },
    enabled: !!user?.id,
  });

  const addProductToWishlistMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      wishlistsApi.addProductToWishlist(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: wishlistsKeys.all }),
    onError: (err) => handleError(err),
  });

  const removeProductFromWishlistMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      wishlistsApi.removeProductFromWishlist(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: wishlistsKeys.all }),
    onError: (err) => handleError(err),
  });

  const handleToggleProductInWishlist = (productId: string) => {
    if (!user) {
      toast.info("You need to be logged in to manage your wishlist");
      navigate({ to: "/login" });
      return;
    }

    if (wishlistProductsIds?.includes(productId)) {
      removeProductFromWishlistMutation.mutate({ productId });
    } else {
      addProductToWishlistMutation.mutate({ productId });
    }
  };

  const isLoading = isProductsLoading || isWishlistProductsIdsLoading;

  if (productsError || wishlistProductsIdsError) {
    handleError(productsError || wishlistProductsIdsError);
    return
  }

  return (
    <div>
      <PageTitle title={categoryTitle} />

      {isLoading ? (
        <div className="h-5 w-24 bg-(--primary-clr)/10 animate-pulse rounded mx-auto" />
      ) : (
        <span className="text-(--text-clr-muted) font-medium">
          {(products?.length ?? 0) > 0
            ? `${products?.length} results`
            : "No results"}
        </span>
      )}

      {isLoading ? (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={`product-card-skeleton-${i}`} />
          ))}
        </div>
      ) : (products?.length ?? 0) > 0 ? (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInWishlist={wishlistProductsIds?.includes(product.id)}
              onToggleProductInWishlist={() =>
                handleToggleProductInWishlist(product.id)
              }
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <NoResultsFound
            title={`No products in ${categoryTitle}`}
            description="We couldn't find any products in this category at the moment. Please check back later."
          />
        </div>
      )}
    </div>
  );
}
