
import React from "react";
import { Search } from "lucide-react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<InputProps, 'size'> {
  icon?: React.ReactNode;
  size?: "default" | "sm" | "lg";
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon = <Search className="h-4 w-4 text-gray-400" />, size = "default", variant = "default", ...props }, ref) => {
    const iconSizes = {
      default: "h-4 w-4",
      sm: "h-3.5 w-3.5",
      lg: "h-5 w-5"
    };
    
    const paddingSizes = {
      default: "pl-10",
      sm: "pl-8",
      lg: "pl-12"
    };
    
    const iconContainerSizes = {
      default: "pl-3",
      sm: "pl-2.5",
      lg: "pl-4"
    };

    return (
      <div className="relative">
        <div className={`absolute inset-y-0 left-0 ${iconContainerSizes[size]} flex items-center pointer-events-none`}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement, { 
                className: cn(iconSizes[size], (icon as React.ReactElement).props.className) 
              })
            : icon}
        </div>
        <Input
          ref={ref}
          className={cn(paddingSizes[size], className)}
          size={size}
          variant={variant}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
