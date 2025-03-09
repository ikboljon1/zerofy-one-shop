
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Logout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Получаем ID пользователя перед выходом из системы
    const user = localStorage.getItem("user");
    let userId = null;
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        userId = userData.id;
      } catch (error) {
        console.error("Ошибка при парсинге данных пользователя:", error);
      }
    }
    
    // Удаляем все данные пользователя из localStorage
    localStorage.removeItem("user");
    
    // Удаляем ВСЕ данные магазинов этого пользователя
    if (userId) {
      const storeKey = `marketplace_stores_${userId}`;
      localStorage.removeItem(storeKey);
      
      // Удаляем также всю статистику, связанную с магазинами этого пользователя
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith(`wb_stats_`) || 
          key.startsWith(`products_`) || 
          key.startsWith(`campaign_`) ||
          key.startsWith(`ad_`)
        )) {
          // Проверяем, относится ли ключ к магазинам этого пользователя
          if (key.includes(`_${userId}_`)) {
            localStorage.removeItem(key);
          }
        }
      }
    }
    
    toast({
      title: "Выход из системы",
      description: "Вы успешно вышли из системы",
    });
    
    navigate("/");
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      <LogOut className="h-4 w-4 mr-2" />
      Выйти
    </Button>
  );
};

export default Logout;
