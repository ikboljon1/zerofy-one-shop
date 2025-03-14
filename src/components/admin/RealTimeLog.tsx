
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Clock, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

type LogEntry = {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  message: string;
  source: string;
};

const RealTimeLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
    
    // Set up real-time updates - replace with WebSocket or polling as needed
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API endpoint
      const response = await axios.get('/api/system/logs');
      
      if (response.data && Array.isArray(response.data)) {
        const formattedLogs = response.data.map((log: any) => ({
          id: log.id,
          timestamp: new Date(log.timestamp),
          level: log.level,
          message: log.message,
          source: log.source
        }));
        
        setLogs(formattedLogs);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить логи системы",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
    toast({
      title: "Обновление",
      description: "Логи системы обновлены",
    });
  };

  const handleExportLogs = async () => {
    try {
      toast({
        title: "Экспорт логов",
        description: "Файл с логами системы скачивается...",
      });
      
      // Replace with actual API endpoint
      const response = await axios.get('/api/system/logs/export', {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `system-logs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать логи системы",
        variant: "destructive",
      });
    }
  };

  const getLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "info": return <Info className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "error": return <AlertTriangle className="h-4 w-4" />;
      case "success": return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "info": return "bg-blue-500";
      case "warning": return "bg-amber-500";
      case "error": return "bg-red-500";
      case "success": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getLevelText = (level: LogEntry["level"]) => {
    switch (level) {
      case "info": return "Информация";
      case "warning": return "Предупреждение";
      case "error": return "Ошибка";
      case "success": return "Успех";
      default: return level;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Логи системы (реальное время)</CardTitle>
            <CardDescription>События и действия в системе</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportLogs}
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : logs.length > 0 ? (
            <div className="p-4 space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-start p-3 border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <div className="mr-3">
                    <div className={`p-2 rounded-full ${getLevelColor(log.level)} text-white`}>
                      {getLevelIcon(log.level)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {getLevelText(log.level)}
                        </Badge>
                        <h4 className="text-sm font-medium">{log.message}</h4>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Источник: {log.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Info className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">Нет доступных логов</h3>
              <p className="text-sm text-muted-foreground mt-1">Логи системы пока отсутствуют или не загружены</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeLog;
