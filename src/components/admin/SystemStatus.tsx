
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSMSSettings, getVerificationSettings } from "@/services/smsService";

const SystemStatus = () => {
  const [statuses, setStatuses] = useState({
    smsService: "checking",
    emailService: "checking",
    databaseConnection: "checking",
    apiConnection: "checking"
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    checkSystemStatus();
  }, []);
  
  const checkSystemStatus = async () => {
    setIsRefreshing(true);
    
    // Имитация проверки различных сервисов
    try {
      // Проверка SMS сервиса
      const smsSettings = await getSMSSettings();
      const smsStatus = smsSettings?.apiKey ? "operational" : "warning";
      
      // Проверка Email сервиса (демонстрационная)
      await new Promise(resolve => setTimeout(resolve, 600));
      const emailStatus = Math.random() > 0.2 ? "operational" : "warning";
      
      // Проверка соединения с базой данных (демонстрационная)
      await new Promise(resolve => setTimeout(resolve, 400));
      const dbStatus = "operational";
      
      // Проверка API соединения (демонстрационная)
      await new Promise(resolve => setTimeout(resolve, 500));
      const apiStatus = Math.random() > 0.1 ? "operational" : "error";
      
      setStatuses({
        smsService: smsStatus,
        emailService: emailStatus,
        databaseConnection: dbStatus,
        apiConnection: apiStatus
      });
      
    } catch (error) {
      console.error("Error checking system status:", error);
      toast({
        title: "Ошибка проверки статуса",
        description: "Не удалось проверить статус некоторых сервисов",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    checkSystemStatus();
    toast({
      title: "Обновление",
      description: "Статусы системы обновляются...",
    });
  };
  
  const handleExportLogs = () => {
    // В реальном приложении здесь будет логика экспорта логов
    toast({
      title: "Экспорт логов",
      description: "Файл с логами системы скачивается...",
    });
  };
  
  const statusIcons = {
    operational: { icon: CheckCircle, color: "text-green-500" },
    warning: { icon: AlertCircle, color: "text-amber-500" },
    error: { icon: XCircle, color: "text-red-500" },
    checking: { icon: RefreshCw, color: "text-blue-500" }
  };
  
  const statusItems = [
    { id: "smsService", name: "SMS сервис" },
    { id: "emailService", name: "Email сервис" },
    { id: "databaseConnection", name: "Соединение с БД" },
    { id: "apiConnection", name: "API соединение" }
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Статус системы</CardTitle>
              <CardDescription>Текущее состояние сервисов и компонентов</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusItems.map(item => {
              const status = statuses[item.id as keyof typeof statuses];
              const StatusIcon = statusIcons[status as keyof typeof statusIcons].icon;
              const statusColor = statusIcons[status as keyof typeof statusIcons].color;
              
              return (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm capitalize ${statusColor}`}>
                      {status === "operational" && "Работает"}
                      {status === "warning" && "Внимание"}
                      {status === "error" && "Ошибка"}
                      {status === "checking" && "Проверка..."}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт логов
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Настройки мониторинга
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus;
