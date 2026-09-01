import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, FileText, Heart, Save, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import FormField from "../../../components/FormField";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PageTitle from "../../../components/PageTitle";
import { cartsApi } from "../../../features/carts/carts.api";
import { cartsKeys } from "../../../features/carts/carts.keys";
import type { Category } from "../../../features/products/product.types";
import { productsApi } from "../../../features/products/products.api";
import { productsKeys } from "../../../features/products/products.keys";
import { usersApi } from "../../../features/users/users.api";
import { wishlistsApi } from "../../../features/wishlists/wishlists.api";
import { wishlistsKeys } from "../../../features/wishlists/wishlists.keys";
import { useAuthStore } from "../../../lib/store/auth.store";
import { handleError } from "../../../lib/utils/utils";

const editProductSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  description: z.string().min(5, "Description is too short"),
  price: z.number().min(0, "Price must be positive"),
  imageUrl: z.url("Invalid URL"),
  stockQuantity: z.number().min(0),
  category: z.enum(["SMART_PHONE", "TABLET", "LAPTOP", "TV"]),
});

export const Route = createFileRoute("/(public)/products/$productId")({
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const { productId } = Route.useParams();
  const user = useAuthStore((state) => state.user);
  const editProductDialog = useRef<HTMLDialogElement | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useQuery({
    queryKey: productsKeys.detail(productId ?? ""),
    queryFn: () => productsApi.findOne(productId ?? ""),
    enabled: !!productId,
  });

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

  const addProductToCartMutation = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity?: number;
    }) => cartsApi.addProductToCart(productId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartsKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: (err) => handleError(err),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      productUpdateDto,
    }: {
      productId: string;
      productUpdateDto: Parameters<typeof productsApi.update>[1];
    }) => productsApi.update(productId, productUpdateDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
      queryClient.invalidateQueries({
        queryKey: productsKeys.detail(productId ?? ""),
      });
    },
    onError: (err) => handleError(err),
  });

  useEffect(() => {
    const closeEditProductDialog = (e: MouseEvent) => {
      if (
        editProductDialog.current &&
        editProductDialog.current.open &&
        e.target === editProductDialog.current
      ) {
        editProductDialog.current?.close();
      }
    };

    document.addEventListener("click", closeEditProductDialog);

    return () => {
      document.removeEventListener("click", closeEditProductDialog);
    };
  }, []);

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

  const editProductForm = useForm({
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      imageUrl: product?.imageUrl ?? "",
      stockQuantity: product?.stockQuantity ?? 0,
      category: product?.category ?? "SMART_PHONE",
    },
    validators: {
      onChange: editProductSchema,
      onBlur: editProductSchema,
      onSubmit: editProductSchema,
    },
    onSubmit: ({ value }) => {
      updateProductMutation.mutate({
        productId: String(productId),
        productUpdateDto: value,
      });
      editProductDialog.current?.close();
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.info("You need to be logged in to add products to cart");
      navigate({ to: "/login" });
      return;
    }

    const formData = new FormData(e.currentTarget);

    addProductToCartMutation.mutate(
      {
        productId: String(productId),
        quantity: Number(formData.get("quantity")),
      },
      {
        onSuccess: () => navigate({ to: "/cart" }),
      },
    );
  };

  if (isProductLoading || isWishlistProductsIdsLoading) {
    return <LoadingSpinner />;
  }

  if (productError || wishlistProductsIdsError) {
    handleError(productError || wishlistProductsIdsError);
    return;
  }

  return (
    <div>
      <PageTitle title="Product Details" />

      {user?.role === "ADMIN" && (
        <button
          type="button"
          className="ml-auto outline-none cursor-pointer flex items-center gap-2 bg-(--primary-clr) py-2 px-6 rounded-lg mb-6 hover:brightness-110 active:scale-[97%]"
          onClick={() => editProductDialog.current?.showModal()}
        >
          Edit Product <Edit className="size-5" />
        </button>
      )}

      <div className="flex flex-col md:flex-row gap-12 bg-(--primary-clr)/5 rounded-2xl p-6 border border-(--primary-clr)/30">
        <div className="relative group rounded-2xl overflow-hidden">
          <img
            src={product?.imageUrl}
            alt={product?.name}
            className="w-150 h-125 object-cover hover:scale-105"
          />
          <button
            type="button"
            title={
              wishlistProductsIds?.includes(product?.id ?? "")
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className="cursor-pointer absolute bottom-2 right-2 bg-(--primary-clr)/50 backdrop-blur-md p-3 rounded-full hover:bg-(--primary-clr)"
            onClick={() => handleToggleProductInWishlist(product?.id ?? "")}
          >
            <Heart
              className={`size-6 ${
                wishlistProductsIds?.includes(product?.id ?? "")
                  ? "fill-(--secondary-clr) text-(--secondary-clr)"
                  : ""
              }`}
            />
          </button>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex flex-col justify-between flex-1"
        >
          <div>
            <div className="flex flex-col gap-2.5">
              <h3 className="text-4xl font-extrabold text-(--secondary-clr) tracking-tight">
                {product?.name}
              </h3>
              <span className="bg-(--secondary-clr)/15 text-(--secondary-clr) font-bold py-2 px-4 rounded-md w-fit">
                {product?.category
                  .split("_")
                  .map(
                    (word) =>
                      word[0].toUpperCase() + word.slice(1).toLowerCase(),
                  )
                  .join(" ")}
              </span>
              <div className="flex items-center gap-4">
                <span
                  className={`bg-(--secondary-clr)/15 text-(--secondary-clr) text-sm font-bold py-1 px-4 rounded-full border border-(--secondary-clr)/20
                    ${(product?.stockQuantity ?? 0) > 0 ? "" : "line-through"}`}
                >
                  {(product?.stockQuantity ?? 0) > 0
                    ? `${product?.stockQuantity} in stock`
                    : "Out of stock"}
                </span>
                <span className="text-3xl">${product?.price.toFixed(2)}</span>
              </div>
            </div>

            <p className="mt-4 text-lg text-(--text-clr-muted)">
              {product?.description}
            </p>
          </div>

          <div className="pt-6 border-t border-(--primary-clr)/35">
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="font-semibold text-lg">
                Quantity:
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                defaultValue={1}
                min={1}
                max={product?.stockQuantity}
                className="outline-none text-center bg-(--primary-clr)/10 rounded-lg py-2 px-4 font-bold border border-(--primary-clr)/30 focus:border-(--secondary-clr)"
              />
            </div>

            <button
              type="submit"
              className="mt-6 cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) w-full rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart <ShoppingCart className="size-6" />
            </button>
          </div>
        </form>
      </div>

      <dialog
        ref={editProductDialog}
        className="bg-(--bg-clr) text-(--text-clr) fixed top-1/2 left-1/2 -translate-1/2 p-8 rounded-xl w-3/4 backdrop:backdrop-blur-md shadow-2xl border-2 border-(--primary-clr)/30"
        onClick={(e) => {
          if (e.target === editProductDialog.current)
            editProductDialog.current?.close();
        }}
      >
        <button
          type="button"
          className="cursor-pointer bg-(--primary-clr)/10 hover:bg-(--primary-clr)/30 text-(--primary-clr) p-2 rounded-full absolute top-2 right-2"
          onClick={() => editProductDialog.current?.close()}
        >
          <X className="size-5" />
        </button>

        <h2 className="font-bold text-3xl text-center text-(--secondary-clr)">
          Edit Product
        </h2>

        <fieldset className="border-2 border-(--primary-clr)/30 rounded-xl p-6 mt-8">
          <legend className="px-4 text-lg font-bold text-(--primary-clr) flex items-center gap-2">
            <FileText className="size-5" />
            Product Details
          </legend>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              editProductForm.handleSubmit();
            }}
          >
            <div className="space-y-6">
              <editProductForm.Field name="name">
                {(field) => (
                  <FormField field={field} label="Product Name" required />
                )}
              </editProductForm.Field>

              <editProductForm.Field name="description">
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
                      className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/30 rounded-lg outline-none focus:border-(--secondary-clr) resize-none"
                    />
                  </FormField>
                )}
              </editProductForm.Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <editProductForm.Field name="price">
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
                </editProductForm.Field>

                <editProductForm.Field name="stockQuantity">
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
                </editProductForm.Field>
              </div>

              <editProductForm.Field name="imageUrl">
                {(field) => (
                  <FormField
                    field={field}
                    label="Image URL"
                    type="url"
                    required
                  />
                )}
              </editProductForm.Field>

              <editProductForm.Field name="category">
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
                      className="outline-none cursor-pointer border-2 border-(--primary-clr)/30 rounded-lg py-2.5 px-3 hover:bg-(--text-clr)/10 focus:border-(--secondary-clr)"
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
                          {(field.state.meta.errors[0] as Error).message}
                        </em>
                      )}
                  </div>
                )}
              </editProductForm.Field>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                type="reset"
                onClick={() => editProductForm.reset()}
                className="cursor-pointer py-3 px-6 rounded-lg font-bold border border-(--primary-clr)/30 hover:bg-(--text-clr)/10 active:scale-[97%]"
              >
                Reset
              </button>

              <editProductForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="cursor-pointer flex items-center justify-center gap-2 text-xl py-3 bg-(--primary-clr) flex-1 rounded-lg hover:brightness-110 active:scale-[97%] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving changes..." : "Save Changes"}
                    <Save className="size-5" />
                  </button>
                )}
              </editProductForm.Subscribe>
            </div>
          </form>
        </fieldset>
      </dialog>
    </div>
  );
}
