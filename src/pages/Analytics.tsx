import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  ShoppingCart,
  RefreshCcw,
  Percent,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Общий анализ продаж</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">График динамики продаж</h3>
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
        </Card>

        {/* Total Sales Card */}
        <Card className="p-4">
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
          <p className="text-sm text-muted-foreground">
            Compared to last month
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders Card */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <div className="flex items-center text-green-500">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>5.25%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Количество заказов
          </h3>
          <p className="text-2xl font-bold">1,200</p>
          <p className="text-sm text-muted-foreground">
            Compared to last month
          </p>
        </Card>

        {/* Returns Card */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <RefreshCcw className="h-5 w-5 text-red-500" />
            <div className="flex items-center text-red-500">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span>2.75%</span>
            </div>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Количество возвратов
          </h3>
          <p className="text-2xl font-bold">150</p>
          <p className="text-sm text-muted-foreground">
            Compared to last month
          </p>
        </Card>

        {/* Return Rate Card */}
        <Card className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Percent className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Процент возврата
          </h3>
          <p className="text-2xl font-bold">12.5%</p>
          <p className="text-sm text-muted-foreground">
            Compared to last month
          </p>
        </Card>
      </div>

      {/* Product Sales Analysis */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Анализ продаж по товарам</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название товара</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Количество</TableHead>
                <TableHead>Сумма продаж</TableHead>
                <TableHead>Средняя цена</TableHead>
                <TableHead>Прибыль</TableHead>
                <TableHead>Рентабельность</TableHead>
                <TableHead>Заказы</TableHead>
                <TableHead>Возвраты</TableHead>
                <TableHead>% возврата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesTableData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.sales}</TableCell>
                  <TableCell>${item.avgPrice}</TableCell>
                  <TableCell>${item.profit}</TableCell>
                  <TableCell>{item.profitMargin}</TableCell>
                  <TableCell>{item.orders}</TableCell>
                  <TableCell>{item.returns}</TableCell>
                  <TableCell>{item.returnRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Returns Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">График динамики возвратов</h3>
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
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Таблица возвратов по товарам</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название товара</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Количество заказов</TableHead>
                <TableHead>Количество возвратов</TableHead>
                <TableHead>Процент возврата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesTableData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.orders}</TableCell>
                  <TableCell>{item.returns}</TableCell>
                  <TableCell>{item.returnRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Profitability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">График динамики прибыли</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Таблица прибыльности по товарам</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Прибыль</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesTableData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>${item.profit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;