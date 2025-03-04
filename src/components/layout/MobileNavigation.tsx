
import { 
  LayoutDashboard, 
  BarChart2, 
  ShoppingBag, 
  Megaphone,
  User
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
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "analytics" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("analytics")}
        >
          <BarChart2 className="h-5 w-5" />
          <span className="text-xs">Analytics</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "stores" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("stores")}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs">Магазин</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "advertising" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("advertising")}
        >
          <Megaphone className="h-5 w-5" />
          <span className="text-xs">Реклама</span>
        </button>
        <button
          className={`flex flex-col items-center space-y-1 ${activeTab === "profile" ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => onTabChange("profile")}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Профиль</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
