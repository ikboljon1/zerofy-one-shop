
import { 
  Home, 
  BarChart2, 
  Package, 
  ShoppingBag, 
  WarehouseIcon,
  Megaphone
} from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({ activeTab, onTabChange }: MobileNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
      <div className="container flex items-center justify-around py-2">
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "home" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("home")}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "analytics" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("analytics")}
        >
          <BarChart2 className="h-5 w-5" />
          <span className="text-xs">Analytics</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "products" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("products")}
        >
          <Package className="h-5 w-5" />
          <span className="text-xs">Товары</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "warehouses" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("warehouses")}
        >
          <WarehouseIcon className="h-5 w-5" />
          <span className="text-xs">Склады</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "stores" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("stores")}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs">Магазины</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "advertising" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("advertising")}
        >
          <Megaphone className="h-5 w-5" />
          <span className="text-xs">Реклама</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
