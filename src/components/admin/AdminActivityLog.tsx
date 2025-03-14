
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, UserPlus, Settings, Lock, UserCog, Database, RefreshCw, Download } from "lucide-react";

const AdminActivityLog = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchActivityLogs();
  }, []);
  
  const fetchActivityLogs = async () => {
    setIsLoading(true);
    
    try {
      // Имитация загрузки данных
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Демонстрационные данные
      const demoActivities = [
        {
          id: 1,
          action: "Добавлен новый пользователь",
          user: "admin@example.com",
          timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
          icon: UserPlus,
        },
        {
          id: 2,
          action: "Изменены настройки SMS интеграции",
          user: "admin@example.com",
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          icon: Settings,
        },
        {
          id: 3,
          action: "Сброшен пароль пользователя user@example.com",
          user: "admin@example.com",
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          icon: Lock,
        },
        {
          id: 4,
          action: "Изменены права пользователя manager@example.com",
          user: "admin@example.com",
          timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
          icon: UserCog,
        },
        {
          id: 5,
          action: "Обновлены данные тарифов",
          user: "admin@example.com",
          timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
          icon: Database,
        },
      ];
      
      setActivities(demoActivities);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить журнал активности",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} мин. назад`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ч. назад`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  const handleRefresh = () => {
    fetchActivityLogs();
    toast({
      title: "Обновление",
      description: "Журнал активности обновляется...",
    });
  };
  
  const handleExport = () => {
    // В реальном приложении здесь была бы логика экспорта
    toast({
      title: "Экспорт",
      description: "Журнал активности экспортируется...",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Журнал активности</CardTitle>
            <CardDescription>История действий администраторов в системе</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const ActivityIcon = activity.icon;
              
              return (
                <div key={activity.id} className="flex items-start gap-4 p-3 border rounded-md">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">
                      Пользователь: {activity.user}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Экспорт журнала
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminActivityLog;
