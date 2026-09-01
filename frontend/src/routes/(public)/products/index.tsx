import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, lazyRouteComponent, useNavigate } from "@tanstack/react-router";
import { FileText, Plus, RotateCcw, Save, Trash, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import FormField from "../../../components/FormField";
import NoResultsFound from "../../../components/NoResultsFound";
import PageTitle from "../../../components/PageTitle";
import ProductCard from "../../../components/ProductCard";
import ProductCardSkeleton from "../../../components/ProductCardSkeleton";
import type {
  Category,
  Product,
  ProductQueryDto,
} from "../../../features/products/product.types";
import { productsApi } from "../../../features/products/products.api";
import { productsKeys } from "../../../features/products/products.keys";
import { usersApi } from "../../../features/users/users.api";
import { wishlistsApi } from "../../../features/wishlists/wishlists.api";
import { wishlistsKeys } from "../../../features/wishlists/wishlists.keys";
import { useAuthStore } from "../../../lib/store/auth.store";
import { handleError } from "../../../lib/utils/utils";

const productSearchSchema = z.object({
  q: z.string().optional().catch(""),
  category: z
    .enum(["SMART_PHONE", "TABLET", "LAPTOP", "TV", ""])
    .optional()
    .catch(""),
  minPrice: z.coerce.number().min(0).optional().catch(undefined),
  maxPrice: z.coerce.number().min(0).optional().catch(undefined),
  inStock: z.boolean().optional().catch(undefined),
  showInStock: z.boolean().optional().catch(undefined),
  sortBy: z
    .enum(["price-asc", "price-desc", "name-asc", "name-desc", ""])
    .optional()
    .catch(""),
  orderBy: z
    .enum(["price-asc", "price-desc", "name-asc", "name-desc", ""])
    .optional()
    .catch(""),
});

const addProductSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  description: z.string().min(5, "Description is too short"),
  price: z.number().min(0, "Price must be positive"),
  imageUrl: z.url("Invalid URL"),
  stockQuantity: z.number().min(0),
  category: z.enum(["SMART_PHONE", "TABLET", "LAPTOP", "TV"]),
});

const CATEGORY_NAMES: Record<Category, string> = {
  SMART_PHONE: "Smart Phones",
  TABLET: "Tablets",
  LAPTOP: "Laptops",
  TV: "Televisions",
};

const SORT_LABELS: Record<string, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A to Z",
  "name-desc": "Name: Z to A",
};

export const Route = createFileRoute("/(public)/products/")({
  validateSearch: productSearchSchema,
  component: lazyRouteComponent(() => import("./index.tsx")),
});

function ProductsPage() {
  const user = useAuthStore((state) => state.user);
  const {
    q,
    category,
    minPrice,
    maxPrice,
    inStock,
    showInStock,
    sortBy,
    orderBy,
  } = Route.useSearch();
  const navigate = useNavigate();

  const addProductDialog = useRef<HTMLDialogElement | null>(null);

  const effectiveInStock = inStock ?? showInStock;
  const effectiveOrderBy = (orderBy || sortBy) as
    | "price-asc"
    | "price-desc"
    | "name-asc"
    | "name-desc"
    | undefined;
  const effectiveCategory = (category as Category) || undefined;

  const queryParams: ProductQueryDto = useMemo(
    () => ({
      q: q?.trim() || undefined,
      category: effectiveCategory,
      minPrice: minPrice !== undefined ? minPrice : undefined,
      maxPrice: maxPrice !== undefined ? maxPrice : undefined,
      inStock: effectiveInStock !== undefined ? effectiveInStock : undefined,
      orderBy: effectiveOrderBy || undefined,
    }),
    [
      q,
      effectiveCategory,
      minPrice,
      maxPrice,
      effectiveInStock,
      effectiveOrderBy,
    ],
  );

  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: productsKeys.search(queryParams),
    queryFn: () => productsApi.findProductsByQuery(queryParams),
  });

  const queryClient = useQueryClient();

  const {
    data: wishlistProductsIds,
    isLoading: isWishlistProductsIdsLoading,
    error: wishlistProductsIdsError,
  } = useQuery({
    queryKey: wishlistsKeys.byUserId(user?.id ?? ""),
    queryFn: async () => await usersApi.findUserWishlist(user?.id ?? ""),
    select: (data) => data.products?.map((product) => product.id),
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

  const removeSelectedProductsMutation = useMutation({
    mutationFn: (productIds: string[]) =>
      productsApi.removeSelectedProducts(productIds),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsKeys.all }),
    onError: (err) => handleError(err),
  });

  const addProductMutation = useMutation({
    mutationFn: (product: Product) => productsApi.create(product),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productsKeys.all }),
    onError: (err) => handleError(err),
  });

  const [selectedProductsIds, setSelectedProductsIds] = useState<string[]>([]);

  const toggleProductSelection = (productId: string) => {
    if (selectedProductsIds.includes(productId)) {
      setSelectedProductsIds((prev) => prev.filter((id) => id !== productId));
    } else {
      setSelectedProductsIds((prev) => [...prev, productId]);
    }
  };

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

  const addProductForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      stockQuantity: 0,
      category: "SMART_PHONE" as Category,
    },
    validators: {
      onChange: addProductSchema,
      onBlur: addProductSchema,
      onSubmit: addProductSchema,
    },
    onSubmit: ({ value }) => {
      addProductMutation.mutateAsync(value as Product, {
        onSuccess: () => {
          addProductDialog.current?.close();
          addProductForm.reset();
        },
      });
    },
  });

  const hasActiveFilters = Boolean(
    q ||
    effectiveCategory ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    effectiveInStock ||
    effectiveOrderBy,
  );

  const clearAllFilters = () => {
    navigate({
      to: "/products",
      search: {},
    });
  };

  const removeFilter = (
    filterKey:
      | "q"
      | "category"
      | "minPrice"
      | "maxPrice"
      | "inStock"
      | "sortBy",
  ) => {
    navigate({
      to: "/products",
      search: {
        q: filterKey === "q" ? undefined : q || undefined,
        category:
          filterKey === "category"
            ? undefined
            : (effectiveCategory as Category) || undefined,
        minPrice: filterKey === "minPrice" ? undefined : minPrice,
        maxPrice: filterKey === "maxPrice" ? undefined : maxPrice,
        inStock:
          filterKey === "inStock"
            ? undefined
            : effectiveInStock
              ? true
              : undefined,
        sortBy:
          filterKey === "sortBy"
            ? undefined
            : (effectiveOrderBy as
                | "price-asc"
                | "price-desc"
                | "name-asc"
                | "name-desc") || undefined,
      },
    });
  };

  const isLoading = isLoadingProducts || isWishlistProductsIdsLoading;

  if (productsError || wishlistProductsIdsError) {
    handleError(productsError || wishlistProductsIdsError);
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Products" />

      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-(--primary-clr)/5 border border-(--primary-clr)/20">
          <span className="text-xs font-bold uppercase tracking-wider text-(--secondary-clr) mr-1">
            Active Filters:
          </span>

          {q && (
            <button
              type="button"
              onClick={() => removeFilter("q")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--primary-clr)/20 text-(--text-clr) hover:bg-(--primary-clr)/30 transition-colors cursor-pointer"
            >
              <span>Search: "{q}"</span>
              <X className="size-3.5 text-(--secondary-clr)" />
            </button>
          )}

          {effectiveCategory && (
            <button
              type="button"
              onClick={() => removeFilter("category")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--primary-clr)/20 text-(--text-clr) hover:bg-(--primary-clr)/30 transition-colors cursor-pointer"
            >
              <span>
                Category:{" "}
                {CATEGORY_NAMES[effectiveCategory] ?? effectiveCategory}
              </span>
              <X className="size-3.5 text-(--secondary-clr)" />
            </button>
          )}

          {minPrice !== undefined && (
            <button
              type="button"
              onClick={() => removeFilter("minPrice")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--primary-clr)/20 text-(--text-clr) hover:bg-(--primary-clr)/30 transition-colors cursor-pointer"
            >
              <span>Min Price: ${minPrice}</span>
              <X className="size-3.5 text-(--secondary-clr)" />
            </button>
          )}

          {maxPrice !== undefined && (
            <button
              type="button"
              onClick={() => removeFilter("maxPrice")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--primary-clr)/20 text-(--text-clr) hover:bg-(--primary-clr)/30 transition-colors cursor-pointer"
            >
              <span>Max Price: ${maxPrice}</span>
              <X className="size-3.5 text-(--secondary-clr)" />
            </button>
          )}

          {effectiveInStock && (
            <button
              type="button"
              onClick={() => removeFilter("inStock")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--primary-clr)/20 text-(--text-clr) hover:bg-(--primary-clr)/30 transition-colors cursor-pointer"
            >
              <span>In Stock Only</span>
              <X className="size-3.5 text-(--secondary-clr)" />
            </button>
          )}

          {effectiveOrderBy && (
            <button
              type="button"
              onClick={() => removeFilter("sortBy")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-(--primary-clr)/20 text-(--text-clr) hover:bg-(--primary-clr)/30 transition-colors cursor-pointer"
            >
              <span>
                Sort: {SORT_LABELS[effectiveOrderBy] ?? effectiveOrderBy}
              </span>
              <X className="size-3.5 text-(--secondary-clr)" />
            </button>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 ml-auto text-xs font-bold text-(--secondary-clr) hover:underline cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <span className="text-(--text-clr-muted) font-medium">
          {isLoading ? (
            <div className="h-6 w-32 bg-(--primary-clr)/10 animate-pulse rounded" />
          ) : (
            `${products?.length ?? 0} results found ${q ? `for "${q}"` : ""}`
          )}
        </span>

        {user?.role === "ADMIN" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={selectedProductsIds.length === 0}
              className="cursor-pointer flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-2.5 px-6 rounded-xl font-bold border-2 border-red-500/20 hover:bg-red-500 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (
                  !confirm(
                    `Are you sure you want to remove ${selectedProductsIds.length} products?`,
                  )
                ) {
                  return;
                }

                removeSelectedProductsMutation.mutate(selectedProductsIds);
                setSelectedProductsIds([]);
              }}
            >
              <Trash className="size-5" />
              Remove Selected
            </button>
            <button
              type="button"
              className="cursor-pointer flex items-center gap-2 bg-(--primary-clr) py-2.5 px-6 rounded-xl font-bold hover:brightness-110 active:scale-[97%] shadow-lg"
              onClick={() => addProductDialog.current?.showModal()}
            >
              Add Product
              <Plus className="size-5" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={`product-skeleton-${i}`} />
          ))}
        </div>
      ) : (products?.length ?? 0) > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedProductsIds={
                user?.role === "ADMIN" ? selectedProductsIds : undefined
              }
              toggleProductSelection={() => toggleProductSelection(product.id)}
              isInWishlist={wishlistProductsIds?.includes(product.id)}
              onToggleProductInWishlist={() =>
                handleToggleProductInWishlist(product.id)
              }
            />
          ))}
        </div>
      ) : (
        <NoResultsFound />
      )}

      <dialog
        ref={addProductDialog}
        className="bg-(--bg-clr) text-(--text-clr) fixed top-1/2 left-1/2 -translate-1/2 rounded-2xl w-[90%] md:w-3/4 max-w-2xl backdrop:backdrop-blur-md shadow-2xl border-2 border-(--primary-clr)/30 overflow-hidden"
        onClick={(e) => {
          if (e.target === addProductDialog.current)
            addProductDialog.current?.close();
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-(--primary-clr)/20">
          <h2 className="font-bold text-2xl text-(--secondary-clr) flex items-center gap-2">
            <Plus className="size-6" />
            Add New Product
          </h2>
          <button
            type="button"
            className="cursor-pointer bg-(--primary-clr)/10 hover:bg-(--primary-clr)/30 text-(--primary-clr) p-2 rounded-full absolute top-2 right-2"
            onClick={() => addProductDialog.current?.close()}
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <fieldset className="border-2 border-(--primary-clr)/20 rounded-xl p-6">
            <legend className="px-4 text-sm font-bold text-(--primary-clr) uppercase tracking-widest flex items-center gap-2">
              <FileText className="size-4" />
              Product Details
            </legend>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addProductForm.handleSubmit();
              }}
              className="space-y-6 mt-4"
            >
              <addProductForm.Field name="name">
                {(field) => (
                  <FormField field={field} label="Product Name" required />
                )}
              </addProductForm.Field>

              <addProductForm.Field name="description">
                {(field) => (
                  <FormField field={field} label="Description">
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      required
                      placeholder=" "
                      rows={3}
                      className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/20 rounded-lg outline-none focus:border-(--secondary-clr) focus:bg-transparent  resize-none"
                    />
                  </FormField>
                )}
              </addProductForm.Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <addProductForm.Field name="price">
                  {(field) => (
                    <FormField
                      field={field}
                      label="Price ($)"
                      type="number"
                      step="0.01"
                      min={0}
                      required
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.handleChange(Number(e.target.value))
                      }
                    />
                  )}
                </addProductForm.Field>

                <addProductForm.Field name="stockQuantity">
                  {(field) => (
                    <FormField
                      field={field}
                      label="Stock Quantity"
                      type="number"
                      min={0}
                      required
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        field.handleChange(Number(e.target.value))
                      }
                    />
                  )}
                </addProductForm.Field>
              </div>

              <addProductForm.Field name="imageUrl">
                {(field) => (
                  <FormField
                    field={field}
                    label="Image URL"
                    type="url"
                    required
                  />
                )}
              </addProductForm.Field>

              <addProductForm.Field name="category">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={field.name}
                      className="text-sm font-semibold text-(--primary-clr) ml-1"
                    >
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name={field.name}
                      id={field.name}
                      value={field.state.value}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        field.handleChange(e.target.value as Category)
                      }
                      onBlur={field.handleBlur}
                      className="outline-none cursor-pointer border-2 border-(--primary-clr)/20 rounded-lg py-2.5 px-3 hover:bg-(--primary-clr)/10 focus:border-(--secondary-clr) "
                    >
                      {[
                        {
                          value: "",
                          label: "--- Select a Category ---",
                        },
                        {
                          value: "SMART_PHONE",
                          label: "Smart Phone",
                        },
                        {
                          value: "TABLET",
                          label: "Tablet",
                        },
                        {
                          value: "LAPTOP",
                          label: "Laptop",
                        },
                        {
                          value: "TV",
                          label: "TV",
                        },
                      ].map((option, i) => (
                        <option
                          value={option.value}
                          key={`category-option-${i}`}
                          disabled={option.value === ""}
                          className="bg-(--bg-clr) text-(--text-clr)"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <em className="text-xs text-red-500 font-medium ml-1">
                          {field.state.meta.errors
                            .map((err: unknown) =>
                              err instanceof Error ? err.message : String(err),
                            )
                            .join(", ")}
                        </em>
                      )}
                  </div>
                )}
              </addProductForm.Field>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="reset"
                  onClick={() => addProductForm.reset()}
                  className="cursor-pointer py-3 px-6 rounded-lg font-bold border border-(--primary-clr)/30 hover:bg-(--text-clr)/10 active:scale-[97%]"
                >
                  Reset
                </button>
                <addProductForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) flex-1 rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Adding product..." : "Add Product"}
                      <Save className="size-5" />
                    </button>
                  )}
                </addProductForm.Subscribe>
              </div>
            </form>
          </fieldset>
        </div>
      </dialog>
    </div>
  );
}

export default ProductsPage;
