import { Search } from "lucide-react";

type NoResultsFoundProps = {
  title?: string;
  description?: string;
  Icon?: React.ElementType;
};

const NoResultsFound = ({
  title = "No products found",
  description = "We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.",
  Icon = Search,
}: NoResultsFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center py-20 bg-(--primary-clr)/10 rounded-2xl border-2 border-(--primary-clr)/20">
      <div className="p-6 bg-(--primary-clr)/10 rounded-full">
        <Icon className="size-12 text-(--primary-clr)/40" />
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-(--text-clr-muted) max-w-md mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default NoResultsFound;
