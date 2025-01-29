import { useState } from "react";
import { 
  Home, 
  BarChart2, 
  Package, 
  ShoppingBag, 
  FileText, 
  Sticker,
  User,
  CreditCard,
  DollarSign,
  Calculator,
  Sun,
  Moon,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Stats from "@/components/Stats";
import Chart from "@/components/Chart";
import Products from "@/components/Products";
import Stores from "@/components/Stores";
import Profile from "@/components/Profile";
import CalculatorModal from "@/components/CalculatorModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { usePeriod } from "@/hooks/use-period";
import { calculateAnalytics } from "@/utils/analytics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showCalculator, setShowCalculator] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { period } = usePeriod();

  const analytics = calculateAnalytics(period.startDate, period.endDate);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    toast({
      title: "Navigation",
      description: `Switched to ${tab} view`,
    });
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Общий объем продаж
            </h3>
            <p className="text-2xl font-bold">
              ₽{analytics.generalSalesAnalytics.totalSalesVolume.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Количество заказов
            </h3>
            <p className="text-2xl font-bold">
              {analytics.generalSalesAnalytics.totalOrdersCount}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-red-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Количество возвратов
            </h3>
            <p className="text-2xl font-bold">
              {analytics.generalSalesAnalytics.totalReturnsCount}
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Процент возврата
            </h3>
            <p className="text-2xl font-bold">
              {analytics.generalSalesAnalytics.returnRate.toFixed(2)}%
            </p>
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Анализ продаж по товарам</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Название товара</th>
                <th className="text-right p-2">Количество</th>
                <th className="text-right p-2">Сумма продаж</th>
                <th className="text-right p-2">Средняя цена</th>
                <th className="text-right p-2">Прибыль</th>
                <th className="text-right p-2">Рентабельность</th>
                <th className="text-right p-2">Заказы</th>
                <th className="text-right p-2">Возвраты</th>
                <th className="text-right p-2">% возврата</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.productSalesAnalysis).map(([id, product]) => (
                <tr key={id} className="border-b">
                  <td className="p-2">{product.productName}</td>
                  <td className="text-right p-2">{product.quantitySold}</td>
                  <td className="text-right p-2">₽{product.salesAmount.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</td>
                  <td className="text-right p-2">₽{product.averagePrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</td>
                  <td className="text-right p-2">₽{product.profit.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</td>
                  <td className="text-right p-2">{product.profitability.toFixed(2)}%</td>
                  <td className="text-right p-2">{product.ordersCount}</td>
                  <td className="text-right p-2">{product.returnsCount}</td>
                  <td className="text-right p-2">{product.returnRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur">
        {isMobile ? (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Zerofy</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setShowCalculator(true)}>
                <Calculator className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Zerofy</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("home")}
                  className={activeTab === "home" ? "bg-accent" : ""}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("analytics")}
                  className={activeTab === "analytics" ? "bg-accent" : ""}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("stores")}
                  className={activeTab === "stores" ? "bg-accent" : ""}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Магазины
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleTabChange("profile")}
                  className={activeTab === "profile" ? "bg-accent" : ""}
                >
                  <User className="mr-2 h-4 w-4" />
                  Профиль
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowCalculator(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Calculator
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {profileMenu.map((item) => (
                    <DropdownMenuItem key={item.value} onClick={() => handleTabChange(item.value)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </header>

      <main className={`container px-4 py-6 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={isMobile ? 'space-y-4' : 'space-y-6'}
          >
            <Stats />
            <Chart salesTrend={mockSalesTrend} productSales={mockProductSales} />
            <Products 
              topProfitableProducts={mockTopProfitableProducts}
              topUnprofitableProducts={mockTopUnprofitableProducts}
            />
          </motion.div>
        )}
        {activeTab === "analytics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderAnalytics()}
          </motion.div>
        )}
        {activeTab === "stores" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stores />
          </motion.div>
        )}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Profile />
          </motion.div>
        )}
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur">
          <div className="container flex items-center justify-around py-2">
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "home" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("home")}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "analytics" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("analytics")}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="text-xs">Analytics</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "stores" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("stores")}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs">Магазины</span>
            </button>
            <button
              className={`flex flex-col items-center space-y-1 ${activeTab === "profile" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("profile")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Профиль</span>
            </button>
          </div>
        </nav>
      )}

      <CalculatorModal open={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default Index;
