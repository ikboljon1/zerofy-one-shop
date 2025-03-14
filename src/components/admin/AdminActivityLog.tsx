
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, UserPlus, Settings, Lock, UserCog, Database, RefreshCw, Download, AlertCircle } from "lucide-react";
import axios from "axios";

interface ActivityLogEntry {
  id: number | string;
  action: string;
  user: string;
  timestamp: string;
  icon?: React.ElementType;
}

const AdminActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchActivityLogs();
  }, []);
  
  const fetchActivityLogs = async () => {
    setIsLoading(true);
    
    try {
      // Replace with actual API endpoint
      const response = await axios.get('/api/admin/activity-logs');
      
      if (response.data && Array.isArray(response.data)) {
        // Map icon based on action type
        const logsWithIcons = response.data.map((log: ActivityLogEntry) => {
          const icon = getActionIcon(log.action);
          return { ...log, icon };
        });
        
        setActivities(logsWithIcons);
      }
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
  
  const getActionIcon = (action: string) => {
    if (action.includes("пользователь")) return UserPlus;
    if (action.includes("настройк")) return Settings;
    if (action.includes("пароль")) return Lock;
    if (action.includes("прав")) return UserCog;
    if (action.includes("данны")) return Database;
    return Database; // Default icon
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
  
  const handleExport = async () => {
    try {
      toast({
        title: "Экспорт",
        description: "Журнал активности экспортируется...",
      });
      
      // Replace with actual API endpoint
      const response = await axios.get('/api/admin/activity-logs/export', {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting activity logs:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать журнал активности",
        variant: "destructive",
      });
    }
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
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const ActivityIcon = activity.icon || Database;
              
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
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Нет активности</h3>
            <p className="text-sm text-muted-foreground mt-1">История активности администраторов пока пуста</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport} disabled={activities.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Экспорт журнала
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminActivityLog;
