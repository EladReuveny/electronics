import React from "react";

type ToggleButtonProps = {
  label?: string;
  id: string;
  checked: boolean;
  onChange: () => void;
  icons?: {
    active: React.ElementType;
    inactive: React.ElementType;
  };
};

const ToggleButton = ({
  label,
  id,
  checked,
  onChange,
  icons,
}: ToggleButtonProps) => {
  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="font-semibold text-(--text-clr)">{label}: </span>
      )}
      <div className="w-14 h-7 border-2 border-(--primary-clr)/30 rounded-full relative bg-(--primary-clr)/5">
        <label
          htmlFor={id}
          className={`size-5 rounded-full absolute top-1/2 -translate-y-1/2 cursor-pointer shadow-md hover:scale-105
            ${
              checked
                ? "bg-(--secondary-clr) left-[calc(100%-1.5rem)]"
                : "bg-(--text-clr) left-1"
            }`}
        >
          <input
            type="checkbox"
            id={id}
            className="hidden"
            checked={checked}
            onChange={onChange}
          />
        </label>

        {icons &&
          (checked ? (
            <icons.active className="size-4 text-(--text-clr) absolute left-1 top-1/2 -translate-y-1/2" />
          ) : (
            <icons.inactive className="size-4 text-(--text-clr) absolute right-1 top-1/2 -translate-y-1/2" />
          ))}
      </div>
    </div>
  );
};

export default ToggleButton;
