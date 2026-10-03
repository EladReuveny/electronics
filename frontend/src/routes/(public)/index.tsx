import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  lazyRouteComponent,
  Link,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  ChevronRight,
  Headphones,
  Heart,
  Laptop,
  Layers,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  Truck,
  Tv,
  Users,
  Zap,
} from "lucide-react";
import { ordersApi } from "../../features/orders/orders.api";
import { ordersKeys } from "../../features/orders/orders.keys";
import { type Category } from "../../features/products/product.types";
import { productsApi } from "../../features/products/products.api";
import { productsKeys } from "../../features/products/products.keys";
import { usersApi } from "../../features/users/users.api";
import { usersKeys } from "../../features/users/users.keys";
import { handleError } from "../../lib/utils/utils";

const CATEGORIES_DATA: {
  id: Category;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  badge: string;
}[] = [
  {
    id: "SMART_PHONE",
    slug: "smart-phones",
    name: "Smart Phones",
    subtitle: "Mobile Flagships",
    description:
      "Next-generation smartphones featuring lightning-fast processors, pro-grade camera systems, and vibrant OLED displays.",
    icon: Smartphone,
    gradient: "from-purple-900/40 via-(--primary-clr)/20 to-transparent",
    badge: "Top Rated",
  },
  {
    id: "TABLET",
    slug: "tablets",
    name: "Tablets",
    subtitle: "Portability & Power",
    description:
      "Versatile tablets designed for digital creators, note-taking, high-resolution media, and on-the-go productivity.",
    icon: Tablet,
    gradient: "from-amber-900/30 via-(--secondary-clr)/10 to-transparent",
    badge: "Versatile",
  },
  {
    id: "LAPTOP",
    slug: "laptops",
    name: "Laptops",
    subtitle: "Computing Beasts",
    description:
      "Engineered ultrabooks, powerful developer workstations, and high-performance machines built for demanding workloads.",
    icon: Laptop,
    gradient: "from-blue-900/40 via-(--primary-clr)/20 to-transparent",
    badge: "Performance",
  },
  {
    id: "TV",
    slug: "televisions",
    name: "Televisions",
    subtitle: "Cinematic Visuals",
    description:
      "Ultra HD 4K & OLED smart televisions bringing theater-grade picture clarity and Dolby sound right to your living room.",
    icon: Tv,
    gradient: "from-emerald-900/30 via-emerald-600/10 to-transparent",
    badge: "4K / OLED",
  },
];

const APP_FEATURES: {
  icon: React.ElementType;
  title: string;
  description: string;
}[] = [
  {
    icon: SlidersHorizontal,
    title: "Smart Catalog & Filters",
    description:
      "Instantly search by keywords, filter by price ranges, and toggle real-time stock availability with zero friction.",
  },
  {
    icon: Heart,
    title: "Personalized Wishlist",
    description:
      "Save your favorite gadgets with a single click and access your curated wishlist anytime, anywhere.",
  },
  {
    icon: ShoppingCart,
    title: "Seamless Shopping Cart",
    description:
      "Effortless item quantity management, transparent pricing breakdown, and a lightning-quick checkout process.",
  },
  {
    icon: PackageCheck,
    title: "Live Order Tracking",
    description:
      "Monitor your order progression in real time from confirmation to doorstep delivery with complete history logs.",
  },
  {
    icon: ShieldCheck,
    title: "100% Certified Authentic",
    description:
      "All electronic devices come directly from verified manufacturers with full warranty and official support.",
  },
  {
    icon: Zap,
    title: "Blazing Fast Experience",
    description:
      "Engineered on modern web technologies ensuring instant client-side transitions and fluid responsiveness.",
  },
];

const VALUE_PROPS: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}[] = [
  {
    icon: Truck,
    title: "Free Express Shipping",
    subtitle: "On all orders above $50",
  },
  {
    icon: ShieldCheck,
    title: "2-Year Official Warranty",
    subtitle: "Full manufacturer coverage",
  },
  {
    icon: RotateCcw,
    title: "30-Day Hassle-Free Returns",
    subtitle: "Satisfaction guaranteed",
  },
  {
    icon: Headphones,
    title: "24/7 Dedicated Support",
    subtitle: "Expert tech assistance",
  },
];

export const Route = createFileRoute("/(public)/")({
  component: lazyRouteComponent(() => import("./index.tsx")),
});

function HomePage() {
  const {
    data: productsAndCategoriesCount,
    isLoading: isProductsAndCategoriesCountLoading,
    error: productsAndCategoriesCountError,
  } = useQuery({
    queryKey: productsKeys.all,
    queryFn: () => productsApi.findProductsAndCategoriesCount(),
  });

  const {
    data: usersCount,
    isLoading: isUsersCountLoading,
    error: usersCountError,
  } = useQuery({
    queryKey: usersKeys.count(),
    queryFn: () => usersApi.findUsersCount(),
  });

  const {
    data: ordersCount,
    isLoading: isOrdersCountLoading,
    error: ordersCountError,
  } = useQuery({
    queryKey: ordersKeys.count(),
    queryFn: () => ordersApi.findOrdersCount(),
  });

  if (productsAndCategoriesCountError || usersCountError || ordersCountError) {
    handleError(
      productsAndCategoriesCountError || usersCountError || ordersCountError,
    );
  }

  return (
    <div className="space-y-24 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-(--primary-clr)/30 bg-linear-to-b from-(--primary-clr)/15 via-(--bg-clr) to-(--bg-clr) p-8 md:p-14 shadow-[0_0_30px_0_var(--primary-clr)]">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-(--primary-clr)/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-(--secondary-clr)/10 blur-3xl" />

        <div className="relative z-1 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-(--secondary-clr)/40 bg-(--secondary-clr)/10 px-4 py-1.5 text-xs md:text-sm font-bold uppercase tracking-wider text-(--secondary-clr) shadow-sm">
            <Sparkles className="size-4 animate-pulse" />
            <span>Next-Gen Electronics Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Empower Your Digital World with{" "}
            <span className="text-(--secondary-clr) drop-shadow-[0_0_15px_var(--secondary-clr)]">
              Electron⚡cs
            </span>
          </h1>

          <p className="text-lg md:text-xl text-(--text-clr-muted) max-w-2xl mx-auto leading-relaxed">
            Discover a curated collection of cutting-edge smartphones, powerful
            laptops, immersive televisions, and versatile tablets.
            High-performance hardware backed by authentic warranties and rapid
            delivery.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="flex items-center gap-2.5 bg-(--primary-clr) text-(--text-clr) font-bold text-base md:text-lg py-3.5 px-8 rounded-xl shadow-lg hover:brightness-110 hover:shadow-[0_0_20px_5px_var(--primary-clr)] hover:scale-105 active:scale-[97%]"
            >
              <ShoppingBag className="size-5" />
              Explore All Products
              <ArrowRight className="size-5" />
            </Link>

            <a
              href="#categories"
              className="flex items-center gap-2.5 border-2 border-(--primary-clr)/40 bg-(--primary-clr)/10 font-bold text-base md:text-lg py-3.5 px-8 rounded-xl hover:bg-(--primary-clr)/25 hover:border-(--secondary-clr) active:scale-[97%]"
            >
              <Layers className="size-5 text-(--secondary-clr)" />
              Browse Categories
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-center flex-wrap gap-4 pt-10 border-t border-(--primary-clr)/20">
            {[
              {
                title: "Products",
                value: isProductsAndCategoriesCountLoading
                  ? "-"
                  : (productsAndCategoriesCount?.productsCount ?? 0),
                Icon: ShoppingBag,
              },
              {
                title: "Categories",
                value: isProductsAndCategoriesCountLoading
                  ? "-"
                  : (productsAndCategoriesCount?.categoriesCount ?? 0),
                Icon: Layers,
              },
              {
                title: "Users",
                value: isUsersCountLoading
                  ? "-"
                  : (usersCount?.usersCount ?? 0),
                Icon: Users,
              },
              {
                title: "Orders",
                value: isOrdersCountLoading
                  ? "-"
                  : (ordersCount?.ordersCount ?? 0),
                Icon: PackageCheck,
              },
            ].map(({ title, value, Icon }, i) => (
              <div
                key={`quick-metric-${i}`}
                className="p-3.5 min-w-[120px] bg-(--primary-clr)/5 rounded-xl border border-(--primary-clr)/20 text-center hover:bg-(--primary-clr)/10 transition-colors"
              >
                <div className="flex items-center justify-center gap-2 mb-0.5">
                  <Icon className="size-5 text-(--secondary-clr)" />
                  <span className="text-2xl font-black text-(--secondary-clr)">
                    {value}
                  </span>
                </div>
                <span className="text-xs text-(--text-clr-muted) uppercase font-semibold tracking-wider">
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / VALUE PROPOSITIONS BAR */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUE_PROPS.map((prop, idx) => (
          <div
            key={`value-prop-${idx}`}
            className="flex items-center gap-4 p-5 rounded-2xl border border-(--primary-clr)/20 bg-(--primary-clr)/5 hover:bg-(--primary-clr)/10 "
          >
            <div className="p-3 rounded-xl bg-(--primary-clr)/20 text-(--secondary-clr)">
              <prop.icon className="size-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-(--text-clr)">
                {prop.title}
              </h4>
              <p className="text-xs text-(--text-clr-muted)">{prop.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CATEGORIES SECTION*/}
      <section id="categories" className="space-y-8 scroll-mt-28">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-(--secondary-clr)">
            Curated Collections
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Shop By Category
          </h2>
          <p className="text-(--text-clr-muted) text-sm md:text-base">
            Explore premium hardware categorized according to your lifestyle and
            productivity needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES_DATA.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to="/products/categories/$category"
                params={{ category: category.slug }}
                className="group relative flex flex-col justify-between p-6 rounded-2xl border-2 border-(--primary-clr)/30 bg-linear-to-b from-(--primary-clr)/10 to-(--bg-clr) hover:border-(--secondary-clr) hover:shadow-[0_0_25px_var(--primary-clr)] hover:scale-102  overflow-hidden"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-linear-to-br ${category.gradient} opacity-20 group-hover:opacity-40 transition-opacity`}
                />

                <div className="relative z-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3.5 rounded-xl bg-(--primary-clr)/20 text-(--secondary-clr) border border-(--primary-clr)/30 group-hover:scale-110 transition-transform">
                      <Icon className="size-7" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider py-1 px-2.5 rounded-full bg-(--secondary-clr)/15 text-(--secondary-clr) border border-(--secondary-clr)/20">
                      {category.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-(--secondary-clr) uppercase tracking-wide">
                      {category.subtitle}
                    </span>
                    <h3 className="text-2xl font-bold text-(--text-clr) mt-0.5 group-hover:text-(--secondary-clr) transition-colors">
                      {category.name}
                    </h3>
                  </div>

                  <p className="text-sm text-(--text-clr-muted) line-clamp-3 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="relative z-1 mt-6 pt-4 border-t border-(--primary-clr)/20 flex items-center justify-between text-sm font-semibold text-(--secondary-clr)">
                  <span>Explore Catalog</span>
                  <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* APP FEATURES GRID */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-(--secondary-clr)">
            Why Shop With Us
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Built For Seamless Tech Shopping
          </h2>
          <p className="text-(--text-clr-muted) text-sm md:text-base">
            From smart inventory filtering to one-tap wishlist sync, every
            feature is crafted for maximum ease and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APP_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={`app-feature-${idx}`}
                className="flex flex-col gap-3 p-6 rounded-2xl border border-(--primary-clr)/25 bg-(--primary-clr)/5 hover:bg-(--primary-clr)/10 hover:border-(--primary-clr)/50 hover:shadow-[0_0_20px_var(--primary-clr)] "
              >
                <div className="size-12 rounded-xl bg-(--primary-clr)/20 border border-(--primary-clr)/30 flex items-center justify-center text-(--secondary-clr)">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-(--text-clr)">
                  {feature.title}
                </h3>
                <p className="text-sm text-(--text-clr-muted) leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT & MISSION STORY SECTION */}
      <section className="rounded-3xl border-2 border-(--primary-clr)/30 bg-(--primary-clr)/5 p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-(--secondary-clr)/30 bg-(--secondary-clr)/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-(--secondary-clr)">
              <Award className="size-4" />
              <span>About Electron⚡cs</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Pioneering the Next Generation of Consumer Hardware
            </h2>

            <p className="text-(--text-clr-muted) text-base md:text-lg leading-relaxed">
              Founded on the belief that acquiring top-tier technology should be
              effortless, reliable, and transparent. Electron⚡cs bridges tech
              enthusiasts, everyday power users, and creators with world-class
              gadgets.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-(--secondary-clr)/20 text-(--secondary-clr) flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="size-3.5 fill-(--secondary-clr)" />
                </div>
                <p className="text-sm text-(--text-clr-muted)">
                  <strong className="text-(--text-clr)">
                    Uncompromising Quality:
                  </strong>{" "}
                  Every product undergoes strict inspection and comes with
                  genuine OEM support.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-(--secondary-clr)/20 text-(--secondary-clr) flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="size-3.5 fill-(--secondary-clr)" />
                </div>
                <p className="text-sm text-(--text-clr-muted)">
                  <strong className="text-(--text-clr)">
                    Real-Time Stock Accuracy:
                  </strong>{" "}
                  Live inventory tracking guarantees that if it's shown in
                  stock, it's ready to ship.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-(--secondary-clr)/20 text-(--secondary-clr) flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="size-3.5 fill-(--secondary-clr)" />
                </div>
                <p className="text-sm text-(--text-clr-muted)">
                  <strong className="text-(--text-clr)">
                    Customer-First Philosophy:
                  </strong>{" "}
                  Dedicated support teams ready to answer setup, compatibility,
                  and ordering queries.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-(--secondary-clr) text-(--primary-clr) font-bold py-3 px-6 rounded-xl hover:brightness-110 active:scale-[97%] "
              >
                Start Shopping Now
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl border border-(--primary-clr)/30 bg-(--primary-clr)/10 text-center space-y-2">
              <span className="text-4xl font-black text-(--secondary-clr)">
                15k+
              </span>
              <p className="text-xs md:text-sm text-(--text-clr-muted) font-medium">
                Satisfied Tech Customers
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-(--primary-clr)/30 bg-(--primary-clr)/10 text-center space-y-2">
              <span className="text-4xl font-black text-(--secondary-clr)">
                99.8%
              </span>
              <p className="text-xs md:text-sm text-(--text-clr-muted) font-medium">
                On-Time Delivery Rate
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-(--primary-clr)/30 bg-(--primary-clr)/10 text-center space-y-2">
              <span className="text-4xl font-black text-(--secondary-clr)">
                100%
              </span>
              <p className="text-xs md:text-sm text-(--text-clr-muted) font-medium">
                Secure Encrypted Checkout
              </p>
            </div>
            <div className="p-6 rounded-2xl border border-(--primary-clr)/30 bg-(--primary-clr)/10 text-center space-y-2">
              <span className="text-4xl font-black text-(--secondary-clr)">
                24/7
              </span>
              <p className="text-xs md:text-sm text-(--text-clr-muted) font-medium">
                Human Tech Support
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
