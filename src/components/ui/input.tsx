
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  trackValue?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, trackValue = false, autoComplete = "off", ...props }, ref) => {
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
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        autoComplete={autoComplete}
        {...props}
        value={trackValue ? localValue : props.value}
        onChange={handleChange}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
