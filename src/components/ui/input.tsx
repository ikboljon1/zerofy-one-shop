
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  trackValue?: boolean;
  variant?: "default" | "price" | "sales" | "storage" | "commission";
  sizeVariant?: "default" | "sm" | "lg"; // Renamed from 'size' to 'sizeVariant' to avoid conflict
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, trackValue = false, variant = "default", sizeVariant = "default", size, ...props }, ref) => {
    // For inputs that need individual tracking, use local state
    const [localValue, setLocalValue] = React.useState<string>(props.value?.toString() || "");
    
    // Update local value when external value changes
    React.useEffect(() => {
      if (trackValue && props.value !== undefined) {
        setLocalValue(props.value.toString());
      }
    }, [props.value, trackValue]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Update local state first
      if (trackValue) {
        setLocalValue(e.target.value);
      }
      
      // Call the original onChange handler
      if (props.onChange) {
        props.onChange(e);
      }
    };

    // Set different styles based on variants
    const variantStyles = {
      default: "",
      price: "border-green-200 focus-visible:ring-green-300 dark:border-green-800 dark:focus-visible:ring-green-700",
      sales: "border-blue-200 focus-visible:ring-blue-300 dark:border-blue-800 dark:focus-visible:ring-blue-700",
      storage: "border-amber-200 focus-visible:ring-amber-300 dark:border-amber-800 dark:focus-visible:ring-amber-700",
      commission: "border-purple-200 focus-visible:ring-purple-300 dark:border-purple-800 dark:focus-visible:ring-purple-700",
    };
    
    // Set different sizes
    const sizeStyles = {
      default: "h-10 px-3 py-2 text-base md:text-sm",
      sm: "h-8 px-2 py-1 text-sm",
      lg: "h-12 px-4 py-3 text-lg",
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          sizeStyles[sizeVariant],
          variantStyles[variant],
          className
        )}
        ref={ref}
        size={size as number | undefined} // Ensure size is treated as a number as required
        {...props}
        value={trackValue ? localValue : props.value}
        onChange={handleChange}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
