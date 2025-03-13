
import React from "react";
import { Search } from "lucide-react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends Omit<InputProps, 'size'> {
  icon?: React.ReactNode;
  sizeVariant?: "default" | "sm" | "lg"; // Changed from 'size' to 'sizeVariant'
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon = <Search className="h-4 w-4 text-gray-400" />, sizeVariant = "default", variant = "default", ...props }, ref) => {
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
        <div className={`absolute inset-y-0 left-0 ${iconContainerSizes[sizeVariant]} flex items-center pointer-events-none`}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement, { 
                className: cn(iconSizes[sizeVariant], (icon as React.ReactElement).props.className) 
              })
            : icon}
        </div>
        <Input
          ref={ref}
          className={cn(paddingSizes[sizeVariant], className)}
          sizeVariant={sizeVariant}
          variant={variant}
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
