
import React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart2,
  Package,
  Store,
  Warehouse,
  Megaphone,
  User,
  Brain
} from "lucide-react";

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const MobileNavigation = ({
  items,
  activeTab,
  onTabChange,
}: MobileNavigationProps) => {
  // Map для быстрого доступа к значкам по ID (на случай, если items не содержит все возможные вкладки)
  const defaultIcons: Record<string, React.ReactNode> = {
    home: <Home className="h-5 w-5" />,
    analytics: <BarChart2 className="h-5 w-5" />,
    products: <Package className="h-5 w-5" />,
    stores: <Store className="h-5 w-5" />,
    warehouses: <Warehouse className="h-5 w-5" />,
    advertising: <Megaphone className="h-5 w-5" />,
    ai_models: <Brain className="h-5 w-5" />,
    profile: <User className="h-5 w-5" />,
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="grid grid-cols-5 py-2">
        {items.slice(0, 5).map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1",
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            )}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon || defaultIcons[item.id] || <div className="h-5 w-5" />}
            <span className="mt-1 text-[10px]">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MobileNavigation;
