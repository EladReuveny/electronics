import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingCart, XCircle } from "lucide-react";
import PageTitle from "../../../components/PageTitle";
import ProductCard from "../../../components/ProductCard";
import ProductCardSkeleton from "../../../components/ProductCardSkeleton";
import StartShopping from "../../../components/StartShopping";
import { cartsApi } from "../../../features/carts/carts.api";
import { cartsKeys } from "../../../features/carts/carts.keys";
import type { Product } from "../../../features/products/product.types";
import { usersApi } from "../../../features/users/users.api";
import { wishlistsApi } from "../../../features/wishlists/wishlists.api";
import { wishlistsKeys } from "../../../features/wishlists/wishlists.keys";
import { useAuthStore } from "../../../lib/store/auth.store";
import { handleError } from "../../../lib/utils/utils";

export const Route = createFileRoute("/(protected)/wishlist/")({
  component: WishlistPage,
});

function WishlistPage() {
  const user = useAuthStore((state) => state.user)!;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: wishlist,
    isLoading: isWishlistLoading,
    error: wishlistError,
  } = useQuery({
    queryKey: wishlistsKeys.byUserId(user?.id ?? ""),
    queryFn: () => usersApi.findUserWishlist(user.id),
    enabled: !!user?.id,
  });

  const clearWishlistMutation = useMutation({
    mutationFn: () => wishlistsApi.clearWishlist(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: wishlistsKeys.all }),
    onError: (err) => handleError(err),
  });

  const moveTocartMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity?: number;
    }) => cartsApi.addProductToCart(productId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistsKeys.all });
      queryClient.invalidateQueries({ queryKey: cartsKeys.all });
    },
    onError: (err) => handleError(err),
  });

  const removeProductFromWishlistMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      wishlistsApi.removeProductFromWishlist(productId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: wishlistsKeys.all }),
    onError: (err) => handleError(err),
  });

  const handleMoveTocart = (productId: string) => {
    const quantity = prompt("Enter quantity", "1");

    if (!quantity) return;

    moveTocartMutation.mutate(
      {
        productId,
        quantity: !isNaN(Number(quantity)) ? Number(quantity) : 1,
      },
      {
        onSuccess: () => navigate({ to: "/cart" }),
      },
    );
  };

  if (wishlistError) {
    handleError(wishlistError);
    return;
  }

  return (
    <div>
      <PageTitle title="My Wishlist" />

      {isWishlistLoading ? (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={`wishlist-skeleton-${i}`} />
          ))}
        </div>
      ) : (wishlist?.products?.length ?? 0) > 0 ? (
        <>
          <p className="my-4 text-(--text-clr-muted) text-center">
            {wishlist?.products?.length ?? 0} products saved in your wishlist.
          </p>

          <button
            type="button"
            className="ml-auto cursor-pointer flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 px-8 rounded-xl font-bold border-2 border-red-500/20 hover:bg-red-500 hover:text-(--text-clr) active:scale-[97%] disabled:opacity-50"
            onClick={() => clearWishlistMutation.mutate()}
          >
            <XCircle className="size-4" />
            Clear wishlist
          </button>

          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {wishlist?.products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                isInWishlist={true}
                onToggleProductInWishlist={() =>
                  removeProductFromWishlistMutation.mutate({
                    productId: product.id,
                  })
                }
                onMoveTocart={() => handleMoveTocart(product.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <StartShopping
          text="Your wishlist is empty."
          description="Save products you love so you can find them easily later."
          Icon={Heart}
          primaryLinkText="Browse Products"
          primaryLinkTo="/products"
          secondaryLinkText="Go to Cart"
          secondaryLinkTo="/cart"
          SecondaryLinkIcon={ShoppingCart}
        />
      )}
    </div>
  );
}
