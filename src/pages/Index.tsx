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
  Zap,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Stats from "@/components/Stats";
import Chart from "@/components/Chart";
import Stores from "@/components/Stores";
import CalculatorModal from "@/components/CalculatorModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Profile from "@/components/Profile";
import ProductsList from "@/components/ProductsList";
import Products from "@/pages/Products";

const salesData = [
  { name: "Jan", value: 300000 },
  { name: "Feb", value: 320000 },
  { name: "Mar", value: 310000 },
  { name: "Apr", value: 325000 },
  { name: "May", value: 330000 },
  { name: "Jun", value: 348261 },
];

const returnsData = [
  { name: "Jan", returns: 120 },
  { name: "Feb", returns: 150 },
  { name: "Mar", returns: 140 },
  { name: "Apr", returns: 130 },
  { name: "May", returns: 145 },
  { name: "Jun", returns: 150 },
];

const profitData = [
  { name: "Jan", profit: 50000 },
  { name: "Feb", profit: 55000 },
  { name: "Mar", profit: 53000 },
  { name: "Apr", profit: 54000 },
  { name: "May", profit: 56000 },
  { name: "Jun", profit: 58000 },
];

const salesTableData = [
  {
    name: "Product 1",
    sku: "SKU12345",
    quantity: 100,
    sales: 10000,
    avgPrice: 100,
    profit: 2000,
    profitMargin: "20%",
    orders: 120,
    returns: 10,
    returnRate: "8.33%",
  },
  {
    name: "Product 2",
    sku: "SKU67890",
    quantity: 50,
    sales: 5000,
    avgPrice: 100,
    profit: 1000,
    profitMargin: "20%",
    orders: 60,
    returns: 5,
    returnRate: "8.33%",
  },
];

const returnsTableData = [
  {
    name: "Product 1",
    sku: "SKU12345",
    orders: 120,
    returns: 10,
    returnRate: "8.33%"
  },
  {
    name: "Product 2",
    sku: "SKU67890",
    orders: 60,
    returns: 5,
    returnRate: "8.33%"
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showCalculator, setShowCalculator] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [selectedStore, setSelectedStore] = useState<{id: string; apiKey: string} | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    toast({
      title: "Navigation",
      description: `Switched to ${tab} view`,
    });
  };

  const productSubMenu = [
    { icon: ShoppingBag, label: "Магазины", value: "stores" },
    { icon: FileText, label: "Отчеты", value: "reports" },
    { icon: Sticker, label: "Наклейки", value: "stickers" },
  ];

  const profileMenu = [
    { icon: CreditCard, label: "История платежей", value: "payment-history" },
    { icon: User, label: "Профиль", value: "profile" },
    { icon: DollarSign, label: "Тарифы", value: "rates" },
  ];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Общий анализ продаж</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex justify-between items-start mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>8.35%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Общий объем продаж
            </h3>
            <p className="text-2xl font-bold">$348,261</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-2">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>5.25%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Количество заказов
            </h3>
            <p className="text-2xl font-bold">1,200</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-2">
              <Package className="h-5 w-5 text-red-500" />
              <div className="flex items-center text-red-500">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>2.75%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Количество возвратов
            </h3>
            <p className="text-2xl font-bold">150</p>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start mb-2">
              <BarChart2 className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Процент возврата
            </h3>
            <p className="text-2xl font-bold">12.5%</p>
          </Card>
        </div>
      </div>

      <Card className="p-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Анализ продаж по товарам</h3>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Название товара</th>
                <th className="text-left p-2">Артикул</th>
                <th className="text-right p-2">Количество проданных товаров</th>
                <th className="text-right p-2">Сумма продаж</th>
                <th className="text-right p-2">Средняя цена</th>
                <th className="text-right p-2">Прибыль</th>
                <th className="text-right p-2">Рентабельность</th>
                <th className="text-right p-2">Количество заказов</th>
                <th className="text-right p-2">Количество возвратов</th>
                <th className="text-right p-2">Процент возврата</th>
              </tr>
            </thead>
            <tbody>
              {salesTableData.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.sku}</td>
                  <td className="text-right p-2">{item.quantity}</td>
                  <td className="text-right p-2">${item.sales}</td>
                  <td className="text-right p-2">${item.avgPrice}</td>
                  <td className="text-right p-2">${item.profit}</td>
                  <td className="text-right p-2">{item.profitMargin}</td>
                  <td className="text-right p-2">{item.orders}</td>
                  <td className="text-right p-2">{item.returns}</td>
                  <td className="text-right p-2">{item.returnRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Таблица возвратов по товарам</h3>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Название товара</th>
                <th className="text-left p-2">Артикул</th>
                <th className="text-right p-2">Количество заказов</th>
                <th className="text-right p-2">Количество возвратов</th>
                <th className="text-right p-2">Процент возврата</th>
              </tr>
            </thead>
            <tbody>
              {returnsTableData.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.sku}</td>
                  <td className="text-right p-2">{item.orders}</td>
                  <td className="text-right p-2">{item.returns}</td>
                  <td className="text-right p-2">{item.returnRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>График динамики продаж</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8B5CF6"
                    fill="#8B5CF680"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Анализ возвратов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={returnsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="returns"
                    stroke="#EC4899"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>График динамики прибыли</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    fill="#10B98180"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const mockTopProfitableProducts = [
    {
      name: "Товар 1",
      price: "1000",
      profit: "200",
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
    },
    {
      name: "Товар 2",
      price: "800",
      profit: "150",
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
    },
    {
      name: "Товар 3",
      price: "1200",
      profit: "180",
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
    }
  ];

  const mockTopUnprofitableProducts = [
    {
      name: "Товар 4",
      price: "500",
      profit: "-100",
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
    },
    {
      name: "Товар 5",
      price: "600",
      profit: "-80",
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
    },
    {
      name: "Товар 6",
      price: "400",
      profit: "-60",
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
    }
  ];

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
                  onClick={() => handleTabChange("products")}
                  className={activeTab === "products" ? "bg-accent" : ""}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Товары
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
            <Chart />
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
        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Products />
          </motion.div>
        )}
        {activeTab === "stores" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Stores onStoreSelect={setSelectedStore} />
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
              className={`flex flex-col items-center space-y-1 ${activeTab === "products" ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => handleTabChange("products")}
            >
              <Package className="h-5 w-5" />
              <span className="text-xs">Товары</span>
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
