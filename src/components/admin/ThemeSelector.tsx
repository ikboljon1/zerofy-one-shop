
import React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeSelectorProps {
  currentTheme: "light" | "dark";
  onToggle: () => void;
}

const ThemeSelector = ({ currentTheme, onToggle }: ThemeSelectorProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      {currentTheme === "dark" ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Светлая тема</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Тёмная тема</span>
        </>
      )}
    </Button>
  );
};

export default ThemeSelector;
