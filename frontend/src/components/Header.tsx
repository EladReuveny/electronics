import { useForm } from "@tanstack/react-form";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  DollarSign,
  Filter,
  Heart,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  PackageCheck,
  PackageX,
  RotateCcw,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  UserPlus,
  X,
} from "lucide-react";
import React, { useRef } from "react";
import { toast } from "react-toastify";
import z from "zod";
import { authApi } from "../features/auth/auth.api";
import type { Category } from "../features/products/product.types";
import { usersKeys } from "../features/users/users.keys";
import { useAuthStore } from "../lib/store/auth.store";
import { handleError } from "../lib/utils/utils";
import Logo from "./Logo";
import ToggleButton from "./ToggleButton";

const searchFormSchema = z.object({
  q: z.string(),
  category: z.enum(["SMART_PHONE", "TABLET", "LAPTOP", "TV", ""]),
  minPrice: z.string(),
  maxPrice: z.string(),
  inStock: z.boolean(),
  sortBy: z.enum(["price-asc", "price-desc", "name-asc", "name-desc", ""]),
});

const navBarLinks: {
  to: string;
  icon: React.ElementType;
  title: string;
  sublist?: { category: string; label: string }[];
}[] = [
  {
    to: "/products",
    icon: LayoutGrid,
    title: "Categories",
    sublist: [
      {
        category: "smart-phones",
        label: "Smart Phones",
      },
      {
        category: "tablets",
        label: "Tablets",
      },
      {
        category: "laptops",
        label: "Laptops",
      },
      {
        category: "televisions",
        label: "Televisions",
      },
    ],
  },
  { to: "/wishlist", icon: Heart, title: "Wishlist" },
  { to: "/cart", icon: ShoppingCart, title: "Cart" },
  { to: "/orders", icon: ShoppingBag, title: "Orders" },
  { to: "/profile", icon: User, title: "Profile" },
];

type HeaderProps = {};

const Header = ({}: HeaderProps) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const queryClient = new QueryClient();

  const location = useLocation();
  const navigate = useNavigate();

  const searchDialogRef = useRef<HTMLDialogElement | null>(null);

  const searchForm = useForm({
    defaultValues: {
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      sortBy: "",
    },
    validators: {
      onChange: searchFormSchema,
      onBlur: searchFormSchema,
      onSubmit: searchFormSchema,
    },
    onSubmit: ({ value }) => {
      const minPriceNum =
        value.minPrice !== "" && value.minPrice !== undefined
          ? Number(value.minPrice)
          : undefined;
      const maxPriceNum =
        value.maxPrice !== "" && value.maxPrice !== undefined
          ? Number(value.maxPrice)
          : undefined;

      navigate({
        to: "/products",
        search: {
          q: value.q?.trim() || undefined,
          category: (value.category as Category) || undefined,
          minPrice:
            minPriceNum !== undefined && !isNaN(minPriceNum) && minPriceNum >= 0
              ? minPriceNum
              : undefined,
          maxPrice:
            maxPriceNum !== undefined && !isNaN(maxPriceNum) && maxPriceNum >= 0
              ? maxPriceNum
              : undefined,
          inStock: value.inStock ? true : undefined,
          sortBy:
            (value.sortBy as
              | "price-asc"
              | "price-desc"
              | "name-asc"
              | "name-desc") || undefined,
        },
      });

      searchDialogRef.current?.close();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
    onError: (err: unknown) => handleError(err),
  });

  return (
    <header>
      <nav className="fixed top-0 w-screen z-100 p-4 bg-(--primary-clr) flex items-center justify-between shadow-md">
        <Logo />

        <button
          type="button"
          onClick={() => searchDialogRef.current?.showModal()}
          className="outline-none cursor-pointer relative flex items-center bg-(--text-clr) text-(--bg-clr)/85 py-1.5 pl-8 pr-12 rounded-full hover:brightness-90 active:scale-[97%]"
        >
          <Search className="size-5 absolute left-2 top-1/2 -translate-y-1/2" />
          <span className="text-sm font-medium">Search for products...</span>
          <Filter className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--primary-clr)/10 p-1 rounded-md size-5.5" />
        </button>

        <div className="flex items-center gap-5">
          {navBarLinks.map((link, i) => (
            <div
              key={`nav-item-${i}`}
              className="relative group flex flex-col items-center"
            >
              {link.title === "Categories" ? (
                <span
                  title={link.title}
                  className="cursor-pointer flex flex-col gap-0.5 items-center hover:scale-105 hover:-translate-y-0.5"
                >
                  <link.icon className="size-6" />
                  {link.title}
                </span>
              ) : (
                <Link
                  to={link.to}
                  title={link.title}
                  className={`flex flex-col gap-0.5 items-center ${location.pathname.startsWith(link.to) ? "text-(--secondary-clr)" : ""} hover:scale-105 hover:-translate-y-0.5`}
                >
                  <link.icon
                    className={`size-6 ${location.pathname.startsWith(link.to) ? "fill-(--secondary-clr)" : ""}`}
                  />
                  {link.title}
                </Link>
              )}

              {(link.sublist?.length ?? 0) > 0 && (
                <div className="hidden group-hover:flex flex-col gap-2 p-2 rounded-md absolute top-12 left-1/2 -translate-x-1/2 bg-(--bg-clr) shadow-lg z-1">
                  {link.sublist?.map((item, j) => (
                    <Link
                      key={`link-sublist-${j}`}
                      to="/products/categories/$category"
                      params={{ category: item.category }}
                      className="p-2 whitespace-nowrap border-l-2 border-transparent hover:border-l-(--primary-clr) hover:bg-(--primary-clr)/10 hover:text-(--primary-clr)"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              type="button"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: (data: { message: string }) => {
                    logout();
                    toast.success(data.message);
                    navigate({ to: "/login" });
                  },
                });
              }}
              className="cursor-pointer flex items-center justify-center gap-2 bg-(--text-clr) text-(--primary-clr) py-2 px-4 rounded-md hover:brightness-90 active:scale-[97%]"
            >
              Logout <LogOut className="size-5" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="cursor-pointer flex items-center justify-center gap-2 bg-(--text-clr) text-(--primary-clr) py-2 px-4 rounded-md hover:brightness-90 active:scale-[97%]"
              >
                Login <LogIn className="size-5" />
              </Link>
              <Link
                to="/register"
                className="cursor-pointer flex items-center justify-center gap-2 bg-(--secondary-clr) text-(--primary-clr) py-2 px-4 rounded-md hover:brightness-110 active:scale-[97%]"
              >
                Register <UserPlus className="size-5" />
              </Link>
            </>
          )}
        </div>
      </nav>

      <dialog
        ref={searchDialogRef}
        className="bg-(--bg-clr) text-(--text-clr) fixed top-1/2 left-1/2 -translate-1/2 p-0 rounded-2xl w-[90%] md:w-3/4 max-w-2xl backdrop:backdrop-blur-md shadow-2xl border-2 border-(--primary-clr)/30 overflow-y-auto"
        onClick={(e) => {
          if (e.target === searchDialogRef.current)
            searchDialogRef.current?.close();
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-(--primary-clr)/20">
          <h2 className="font-bold text-2xl text-(--secondary-clr) flex items-center gap-2">
            <Search className="size-6" />
            Find Products
          </h2>
          <button
            type="button"
            className="cursor-pointer bg-(--primary-clr)/10 hover:bg-(--primary-clr)/30 text-(--primary-clr) p-2 rounded-full"
            onClick={() => searchDialogRef.current?.close()}
          >
            <X className="size-6" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchForm.handleSubmit();
          }}
          className="p-6 space-y-6"
        >
          <searchForm.Field name="q">
            {(field) => (
              <div className="relative group flex items-center">
                <Search className="size-6 absolute left-4 top-1/2 -translate-y-1/2 text-(--primary-clr)/50 group-focus-within:text-(--secondary-clr)" />
                <input
                  id={field.name}
                  name={field.name}
                  type="search"
                  placeholder="Search by product name..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="w-full pl-12 pr-24 py-3.5 bg-(--primary-clr)/5 border-2 border-(--primary-clr)/20 rounded-xl outline-none focus:border-(--secondary-clr) text-base md:text-lg"
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {field.state.value && (
                    <button
                      type="button"
                      title="Clear search text"
                      onClick={() => field.handleChange("")}
                      className="cursor-pointer p-1.5 rounded-full hover:bg-(--primary-clr)/20 text-(--text-clr-muted) hover:text-(--text-clr) transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    title="Search"
                    className="cursor-pointer flex items-center justify-center p-2 rounded-lg bg-(--primary-clr) text-(--text-clr) hover:brightness-110 active:scale-95 shadow-sm"
                  >
                    <Search className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </searchForm.Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <searchForm.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-bold uppercase tracking-wider text-(--primary-clr) ml-1 flex items-center gap-2"
                  >
                    <Layers className="size-4" />
                    Category
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as
                          | "SMART_PHONE"
                          | "TABLET"
                          | "LAPTOP"
                          | "TV"
                          | "",
                      )
                    }
                    onBlur={field.handleBlur}
                    className="w-full py-3 px-4 bg-(--primary-clr)/5 border-2 border-(--primary-clr)/30 rounded-xl outline-none focus:border-(--secondary-clr) cursor-pointer hover:bg-(--primary-clr)/10"
                  >
                    {[
                      { label: "All Categories", value: "" },
                      { label: "Smart Phones", value: "SMART_PHONE" },
                      { label: "Tablets", value: "TABLET" },
                      { label: "Laptops", value: "LAPTOP" },
                      { label: "Televisions", value: "TV" },
                    ].map((option, i) => (
                      <option
                        key={`category-option-${i}`}
                        value={option.value}
                        className="bg-(--bg-clr) text-(--text-clr)"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </searchForm.Field>

            <searchForm.Field name="sortBy">
              {(field) => (
                <div className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-bold uppercase tracking-wider text-(--primary-clr) ml-1 flex items-center gap-2"
                  >
                    <ArrowUpDown className="size-4" />
                    Sort By
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as
                          | "price-asc"
                          | "price-desc"
                          | "name-asc"
                          | "name-desc"
                          | "",
                      )
                    }
                    onBlur={field.handleBlur}
                    className="w-full py-3 px-4 bg-(--primary-clr)/5 border-2 border-(--primary-clr)/30 rounded-xl outline-none focus:border-(--secondary-clr) cursor-pointer hover:bg-(--primary-clr)/10"
                  >
                    {[
                      { label: "Default / Featured", value: "" },
                      { label: "Price: Low to High", value: "price-asc" },
                      { label: "Price: High to Low", value: "price-desc" },
                      { label: "Name: A to Z", value: "name-asc" },
                      { label: "Name: Z to A", value: "name-desc" },
                    ].map((option, i) => (
                      <option
                        key={`sort-option-${i}`}
                        value={option.value}
                        className="bg-(--bg-clr) text-(--text-clr)"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </searchForm.Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-(--primary-clr) ml-1 flex items-center gap-2">
                <DollarSign className="size-4" />
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <searchForm.Field name="minPrice">
                  {(field) => (
                    <input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      placeholder="Min ($)"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full py-3 px-4 bg-(--primary-clr)/5 border-2 border-(--primary-clr)/30 rounded-xl outline-none focus:border-(--secondary-clr)"
                    />
                  )}
                </searchForm.Field>
                <searchForm.Field name="maxPrice">
                  {(field) => (
                    <input
                      id={field.name}
                      name={field.name}
                      type="number"
                      min="0"
                      placeholder="Max ($)"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full py-3 px-4 bg-(--primary-clr)/5 border-2 border-(--primary-clr)/30 rounded-xl outline-none focus:border-(--secondary-clr)"
                    />
                  )}
                </searchForm.Field>
              </div>
            </div>

            <searchForm.Field name="inStock">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-(--primary-clr) ml-1 flex items-center gap-2">
                    <PackageCheck className="size-4" />
                    Availability
                  </label>
                  <div className="w-full flex items-center justify-between p-2.5 bg-(--primary-clr)/5 border-2 border-(--primary-clr)/30 rounded-xl hover:bg-(--primary-clr)/10">
                    <span className="font-medium text-sm">In Stock Only</span>
                    <ToggleButton
                      id={field.name}
                      checked={!!field.state.value}
                      onChange={() => field.handleChange(!field.state.value)}
                      icons={{
                        active: PackageCheck,
                        inactive: PackageX,
                      }}
                    />
                  </div>
                </div>
              )}
            </searchForm.Field>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => searchForm.reset()}
              className="cursor-pointer flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold border-2 border-(--primary-clr)/30 hover:bg-(--text-clr)/10 active:scale-[97%]"
            >
              <RotateCcw className="size-5" />
              Clear
            </button>
            <button
              type="submit"
              className="cursor-pointer flex items-center justify-center gap-2 text-lg font-bold py-3 bg-(--primary-clr) flex-1 rounded-xl hover:brightness-110 active:scale-[97%] shadow-lg"
            >
              <Search className="size-5" />
              Search
            </button>
          </div>
        </form>
      </dialog>
    </header>
  );
};

export default Header;
