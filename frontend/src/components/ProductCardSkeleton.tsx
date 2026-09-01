import { Image } from "lucide-react";

type ProductCardSkeletonProps = {};

const ProductCardSkeleton = ({}: ProductCardSkeletonProps) => {
  return (
    <div className="relative shadow-[0_0_15px_0_var(--primary-clr)] bg-(--primary-clr)/15 rounded-lg animate-pulse">
      {/* Photo */}
      <Image className="w-full h-48 text-(--primary-clr)/20 rounded-t-lg" />

      <div className="p-4">
        <div className="flex flex-col gap-1">
          {/* Title - h-7 */}
          <div className="h-7 w-3/4 bg-(--secondary-clr)/20 rounded-md" />

          {/* Category - h-8 */}
          <div className="h-8 w-full bg-(--secondary-clr)/10 rounded-md my-1" />

          {/* Price */}
          <div className="h-5 w-1/4 bg-(--primary-clr)/20 rounded-md" />

          {/* Description */}
          <div className="mt-1 space-y-2">
            <div className="h-4 w-full bg-(--text-clr-muted)/20 rounded" />
            <div className="h-4 w-2/3 bg-(--text-clr-muted)/20 rounded" />
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-4 h-10 w-32 bg-(--text-clr)/20 rounded-lg" />
      </div>

      {/* Wishlist Button */}
      <div className="absolute bottom-1 right-1 size-8 bg-(--primary-clr)/30 rounded-full" />
    </div>
  );
};

export default ProductCardSkeleton;
