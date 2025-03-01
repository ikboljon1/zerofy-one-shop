
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const AnalyticsPerformance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Имитация загрузки данных
    setTimeout(() => {
      setData({
        monthlyPerformance: [
          { month: 'Январь', sales: 245000, orders: 320, visitors: 12400 },
          { month: 'Февраль', sales: 278000, orders: 350, visitors: 13200 },
          { month: 'Март', sales: 312000, orders: 380, visitors: 14800 },
          { month: 'Апрель', sales: 298000, orders: 365, visitors: 14200 },
          { month: 'Май', sales: 342000, orders: 410, visitors: 15600 },
          { month: 'Июнь', sales: 374000, orders: 435, visitors: 16900 }
        ],
        deviceStats: [
          { name: 'Мобильные', value: 65 },
          { name: 'Десктоп', value: 30 },
          { name: 'Планшеты', value: 5 }
        ],
        hourlyTraffic: [
          { hour: '00', visitors: 120 },
          { hour: '02', visitors: 80 },
          { hour: '04', visitors: 40 },
          { hour: '06', visitors: 85 },
          { hour: '08', visitors: 230 },
          { hour: '10', visitors: 310 },
          { hour: '12', visitors: 360 },
          { hour: '14', visitors: 340 },
          { hour: '16', visitors: 380 },
          { hour: '18', visitors: 420 },
          { hour: '20', visitors: 320 },
          { hour: '22', visitors: 210 }
        ]
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Обновление данных",
      description: "Данные о производительности обновлены"
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.name === 'Продажи' 
                ? `${entry.value.toLocaleString()} ₽` 
                : entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Эффективность</h2>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Обновление...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить данные
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : data ? (
        <div className="grid gap-6 grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Ежемесячная статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.monthlyPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280"
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#6B7280"
                      tickFormatter={(value) => `${value.toLocaleString()}₽`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#6B7280"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sales" 
                      name="Продажи" 
                      stroke="#8B5CF6" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="orders" 
                      name="Заказы" 
                      stroke="#EC4899" 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="visitors" 
                      name="Посетители" 
                      stroke="#10B981" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Типы устройств</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.deviceStats}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        type="number" 
                        stroke="#6B7280"
                        tickFormatter={(value) => `${value}%`}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#6B7280"
                      />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Процент посетителей']}
                      />
                      <Bar dataKey="value" name="Процент" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Посещаемость по часам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.hourlyTraffic}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#6B7280"
                      />
                      <YAxis 
                        stroke="#6B7280"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="visitors" name="Посетители" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Нет доступных данных</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPerformance;
