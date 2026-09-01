import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

type StartcartProps = {
  text: string;
  description?: string;
  primaryLinkText?: string;
  primaryLinkTo?: string;
  Icon?: React.ElementType;
  secondaryLinkText?: string;
  secondaryLinkTo?: string;
  SecondaryLinkIcon?: React.ElementType;
};

const StartShopping = ({
  text,
  description,
  primaryLinkText = "Shop Now",
  primaryLinkTo = "/",
  Icon,
  secondaryLinkText,
  secondaryLinkTo,
  SecondaryLinkIcon,
}: StartcartProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-(--primary-clr)/30 bg-(--primary-clr)/5 shadow-md py-10 px-5 mt-10">
      {Icon && <Icon className="size-10" />}

      <h3 className="text-2xl font-semibold">{text}</h3>

      {description && (
        <p className="text-(--text-clr-muted) mt-2">{description}</p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Link
          to={primaryLinkTo}
          className="flex items-center gap-2 bg-(--primary-clr) py-2 px-6 rounded-lg hover:brightness-110 active:scale-[97%]"
        >
          {primaryLinkText}
          <ArrowRight className="size-5 hover:translate-x-1" />
        </Link>

        {secondaryLinkText && secondaryLinkTo && (
          <Link
            to={secondaryLinkTo}
            className="flex items-center gap-2 border border-(--primary-clr)/30 py-2 px-6 rounded-lg hover:bg-(--primary-clr)/10"
          >
            {SecondaryLinkIcon && <SecondaryLinkIcon className="size-5" />}
            {secondaryLinkText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default StartShopping;
