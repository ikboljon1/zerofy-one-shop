
import React, { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import MobileNavigation from "./MobileNavigation";
import { ensureStoreSelectionPersistence, ensureAIModelSelectionPersistence } from "@/utils/storeUtils";
import {
  Home,
  BarChart2,
  Package,
  Store,
  Warehouse,
  Megaphone,
  User,
  LogOut,
  Brain
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MainLayout({ children, activeTab, onTabChange }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  React.useEffect(() => {
    // Ensure store selection is persisted
    ensureStoreSelectionPersistence();
    
    // Ensure AI model selection is persisted
    ensureAIModelSelectionPersistence();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const navigationItems = [
    {
      id: "home",
      name: "Дашборд",
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: "analytics",
      name: "Аналитика",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      id: "products",
      name: "Товары",
      icon: <Package className="h-5 w-5" />,
    },
    {
      id: "stores",
      name: "Магазины",
      icon: <Store className="h-5 w-5" />,
    },
    {
      id: "warehouses",
      name: "Склады",
      icon: <Warehouse className="h-5 w-5" />,
    },
    {
      id: "advertising",
      name: "Реклама",
      icon: <Megaphone className="h-5 w-5" />,
    },
    {
      id: "ai_models",
      name: "AI Модели",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      id: "profile",
      name: "Профиль",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const handleNavigationClick = (id: string) => {
    onTabChange(id);
  };

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex-1 p-4">{children}</div>
        <MobileNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={handleNavigationClick}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden border-r lg:block">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Селлер Панель</h2>
            </div>
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="mt-4 flex flex-col space-y-1 px-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => handleNavigationClick(item.id)}
                >
                  {item.icon}
                  {item.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto p-4">
            <Separator className="mb-4" />
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Выйти
            </Button>
          </div>
        </div>
      </Sidebar>
      <div className="flex w-full flex-col">
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
