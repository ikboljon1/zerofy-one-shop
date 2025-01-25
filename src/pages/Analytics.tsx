import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, Search, Share, User } from "lucide-react";

const salesData = [
  { name: "Jan", value: 30000 },
  { name: "Feb", value: 35000 },
  { name: "Mar", value: 45000 },
  { name: "Apr", value: 40000 },
  { name: "May", value: 50000 },
  { name: "Jun", value: 48000 },
];

const returnsData = [
  { name: "Jan", returns: 120 },
  { name: "Feb", returns: 150 },
  { name: "Mar", returns: 140 },
  { name: "Apr", returns: 130 },
  { name: "May", returns: 145 },
  { name: "Jun", returns: 135 },
];

const profitData = [
  { name: "Jan", profit: 5000 },
  { name: "Feb", profit: 6000 },
  { name: "Mar", profit: 7500 },
  { name: "Apr", profit: 7000 },
  { name: "May", profit: 8000 },
  { name: "Jun", profit: 7800 },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur p-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex items-center space-x-4">
          <Input className="bg-secondary" placeholder="Type here to search" />
          <Button>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-6">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Общий анализ продаж</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Общий объем продаж</h3>
                <p className="text-2xl font-semibold">$348,261</p>
                <p className="text-green-500">+8.35%</p>
                <p className="text-muted-foreground">Compared to last month</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Количество заказов</h3>
                <p className="text-2xl font-semibold">1,200</p>
                <p className="text-green-500">+5.25%</p>
                <p className="text-muted-foreground">Compared to last month</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Количество возвратов</h3>
                <p className="text-2xl font-semibold">150</p>
                <p className="text-red-500">-2.75%</p>
                <p className="text-muted-foreground">Compared to last month</p>
              </Card>
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Процент возврата</h3>
                <p className="text-2xl font-semibold">12.5%</p>
                <p className="text-muted-foreground">Compared to last month</p>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">График динамики продаж</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#8B5CF680" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">График динамики возвратов</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={returnsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="returns" stroke="#EC4899" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">График динамики прибыли</h2>
            <Card className="p-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1F2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="profit" stroke="#10B981" fill="#10B98180" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;