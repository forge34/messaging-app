import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  input?: {
    className?: string;
  };
};

export type InputRef = HTMLInputElement;

const Input = React.forwardRef<InputRef, InputProps>(
  ({ className, type, disabled, readOnly, icon, input, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-10 items-center rounded-md border border-input  text-sm ",
          icon && "pl-3",
          readOnly || disabled
            ? ""
            : "ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
          className,
        )}
      >
        {icon && <div className="mr-2">{icon}</div>}
        <input
          type={type}
          className={cn(
            "w-full rounded-md bg-transparent p-3 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            input?.className,
          )}
          ref={ref}
          readOnly={readOnly}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
