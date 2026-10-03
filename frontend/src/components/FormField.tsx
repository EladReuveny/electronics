import type { AnyFieldApi } from "@tanstack/react-form";
import React, { type HTMLInputTypeAttribute } from "react";

type FormFieldProps = {
  field: AnyFieldApi;
  label: string;
  children?: React.ReactNode;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  [key: string]: unknown;
};

const getFieldErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return JSON.stringify(error);
};

const FormField = ({
  field,
  label,
  children,
  type = "text",
  required = false,
  ...rest
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        {children ? (
          children
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={type}
            {...(type !== "file" && {
              value: field.state.value,
            })}
            onChange={(e) => {
              if (type === "file") {
                const file = e.target.files?.[0];
                field.handleChange(file);
              } else {
                field.handleChange(e.target.value);
              }
            }}
            onBlur={field.handleBlur}
            required={required}
            placeholder=""
            className="peer w-full py-2.5 px-3 border-2 border-(--primary-clr)/30 rounded-lg outline-none focus:border-(--secondary-clr)"
            {...rest}
          />
        )}
        <label
          htmlFor={field.name}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500
            peer-focus:top-0 peer-focus:text-xs peer-focus:px-1 peer-focus:bg-(--bg-clr) peer-focus:text-(--secondary-clr)
            peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-(--bg-clr)"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <em className="text-xs text-red-500 font-medium ml-1">
          {field.state.meta.errors
            .map((error) => getFieldErrorMessage(error))
            .join(", ")}
        </em>
      )}
    </div>
  );
};

export default FormField;
