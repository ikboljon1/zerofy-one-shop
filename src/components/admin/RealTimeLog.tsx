
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Clock, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    
    // Set up simulated real-time updates
    const interval = setInterval(() => {
      const randomLog = generateRandomLog();
      setLogs(prevLogs => [randomLog, ...prevLogs.slice(0, 49)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with demo data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const demoLogs: LogEntry[] = Array.from({ length: 20 }, (_, i) => generateRandomLog(i));
      setLogs(demoLogs);
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

  const generateRandomLog = (seed = Date.now()): LogEntry => {
    const levels = ["info", "warning", "error", "success"] as const;
    const sources = ["система", "пользователь", "API", "база данных", "платежная система"];
    const messages = [
      "Пользователь вошел в систему",
      "Создан новый заказ",
      "Ошибка авторизации",
      "Обновление статуса заказа",
      "Пополнение баланса",
      "Изменение настроек системы",
      "Сброс пароля",
      "Отправка SMS сообщения",
      "Проверка API соединения",
      "Регистрация нового пользователя"
    ];
    
    const randomLevel = levels[Math.floor((seed * 7) % 4)];
    const randomSource = sources[Math.floor((seed * 13) % sources.length)];
    const randomMessage = messages[Math.floor((seed * 23) % messages.length)];
    
    return {
      id: `log-${seed}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
      level: randomLevel,
      message: randomMessage,
      source: randomSource
    };
  };

  const handleRefresh = () => {
    fetchLogs();
    toast({
      title: "Обновление",
      description: "Логи системы обновлены",
    });
  };

  const handleExportLogs = () => {
    toast({
      title: "Экспорт логов",
      description: "Файл с логами системы скачивается...",
    });
    
    // Создаем данные для экспорта
    const exportData = logs.map(log => ({
      time: log.timestamp.toLocaleString(),
      level: log.level,
      source: log.source,
      message: log.message
    }));
    
    // Создаем CSV строку
    const csvContent = [
      ["Время", "Уровень", "Источник", "Сообщение"].join(","),
      ...exportData.map(row => Object.values(row).join(","))
    ].join("\n");
    
    // Создаем и скачиваем файл
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `system-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          ) : (
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
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeLog;
