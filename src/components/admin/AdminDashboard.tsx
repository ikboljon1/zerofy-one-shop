
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersRound, ShoppingCart, DollarSign, BarChart3 } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    revenue: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // В реальном приложении данные будут приходить с сервера
        // Здесь используем задержку для имитации загрузки
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Демо-данные
        setStats({
          totalUsers: 1547,
          activeUsers: 892,
          totalOrders: 324,
          revenue: 15920
        });
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  const statCards = [
    {
      title: "Всего пользователей",
      value: stats.totalUsers,
      icon: UsersRound,
      color: "bg-blue-500",
      trend: "+12.5%"
    },
    {
      title: "Активные пользователи",
      value: stats.activeUsers,
      icon: UsersRound,
      color: "bg-green-500",
      trend: "+5.2%"
    },
    {
      title: "Общие заказы",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-purple-500",
      trend: "+8.9%"
    },
    {
      title: "Доход",
      value: `${stats.revenue.toLocaleString()} ₽`,
      icon: DollarSign,
      color: "bg-amber-500",
      trend: "+15.3%"
    }
  ];
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: stat.color.replace('bg-', '') }}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{isLoading ? "-" : stat.value}</h3>
                  <p className="text-xs text-green-500 mt-1">{stat.trend} за месяц</p>
                </div>
                <div className={`p-2 rounded-full ${stat.color} text-white`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Регистрации пользователей</CardTitle>
              <CardDescription>Количество новых пользователей за последние 30 дней</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="flex items-end justify-between h-full px-2">
                {Array.from({ length: 15 }, (_, i) => {
                  const height = Math.floor(Math.random() * 70) + 30;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className="w-6 bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-[10px] mt-1">{i + 1}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
