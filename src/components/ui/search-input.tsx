
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, icon = <Search className="h-4 w-4 text-gray-400" />, clearable = false, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <Input
          ref={ref}
          className={cn("pl-10", className)}
          {...props}
        />
        {clearable && props.value && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={onClear}
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
