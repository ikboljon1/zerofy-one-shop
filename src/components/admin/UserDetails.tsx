
import { useState, useEffect } from "react";
import { User, updateUser, getTrialDaysRemaining } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  User as UserIcon, 
  Save, 
  ShieldAlert, 
  Calendar, 
  Mail, 
  Clock,
  AlertTriangle,
  BadgeDollarSign,
  Badge as BadgeIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDetailsProps {
  user: User;
  onBack: () => void;
  onUserUpdated: (user: User) => void;
}

export default function UserDetails({ user, onBack, onUserUpdated }: UserDetailsProps) {
  const [formData, setFormData] = useState<User>(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(user);
    
    if (user.isInTrial && user.trialEndDate) {
      getTrialDaysRemaining(user.id).then(days => {
        setTrialDaysRemaining(days);
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: 'admin' | 'user') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedUser = await updateUser(user.id, formData);
      if (updatedUser) {
        toast({
          title: "Успешно",
          description: "Информация о пользователе обновлена",
        });
        onUserUpdated(updatedUser);
      } else {
        throw new Error("Не удалось обновить пользователя");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию о пользователе",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getTrialProgress = (): number => {
    if (!formData.trialEndDate) return 0;
    
    const startDate = new Date(formData.registeredAt);
    const endDate = new Date(formData.trialEndDate);
    const currentDate = new Date();
    
    const trialDuration = 3 * 24 * 60 * 60 * 1000;
    const elapsed = currentDate.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / trialDuration) * 100));
  };

  const getTariffName = (tariffId?: string): string => {
    if (!tariffId) return 'Не выбран';
    
    switch (tariffId) {
      case '1': return 'Базовый';
      case '2': return 'Профессиональный';
      case '3': return 'Бизнес';
      case '4': return 'Корпоративный';
      default: return `Тариф ${tariffId}`;
    }
  };

  return (
    <Card className="h-full overflow-hidden border shadow-xl rounded-3xl bg-white dark:bg-gray-900">
      <CardHeader className="p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full text-white hover:bg-white/20 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <span>Информация о пользователе</span>
          </CardTitle>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6 overflow-auto h-[calc(100%-14rem)]">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={formData.avatar} alt={formData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="w-full rounded-full">
                Изменить фото
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">ФИО</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange}
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-sm font-medium">Роль пользователя</Label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleRoleChange(value as 'admin' | 'user')}
                    >
                      <SelectTrigger className="pl-9 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Администратор</SelectItem>
                        <SelectItem value="user">Пользователь</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Статус аккаунта</Label>
                  <div className="flex items-center justify-between border p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{formData.status === 'active' ? 'Активен' : 'Неактивен'}</span>
                    </div>
                    <Switch 
                      checked={formData.status === 'active'} 
                      onCheckedChange={handleStatusChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-blue-500" />
              Тарифный план и пробный период
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BadgeIcon className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Текущий тарифный план</span>
                </div>
                <div className="relative">
                  <Select 
                    value={formData.tariffId || '1'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tariffId: value }))}
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Базовый (1 магазин)</SelectItem>
                      <SelectItem value="2">Профессиональный (3 магазина)</SelectItem>
                      <SelectItem value="3">Бизнес (10 магазинов)</SelectItem>
                      <SelectItem value="4">Корпоративный (без ограничений)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Текущий тариф:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {getTariffName(formData.tariffId)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className={`h-5 w-5 ${formData.isInTrial ? 'text-yellow-500' : 'text-green-500'}`} />
                  <span className="font-medium">Пробный период</span>
                  {formData.isInTrial && (
                    <Badge className="ml-auto bg-yellow-500">
                      Активен
                    </Badge>
                  )}
                </div>
                
                {formData.isInTrial && formData.trialEndDate ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Прогресс</span>
                        <span>{Math.round(getTrialProgress())}%</span>
                      </div>
                      <Progress value={getTrialProgress()} className="h-2" />
                      
                      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800/30 dark:text-yellow-300 mt-3">
                        <AlertDescription className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span>Осталось дней:</span>
                            <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300">
                              {trialDaysRemaining !== null ? trialDaysRemaining : '...'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Дата окончания:</span>
                            <span className="font-medium">{formatDate(formData.trialEndDate)}</span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <span className="text-sm text-muted-foreground">
                      Пробный период неактивен или истек
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Системная информация
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Дата регистрации</span>
                </div>
                <p className="font-medium">{formatDate(formData.registeredAt)}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Последний вход</span>
                </div>
                <p className="font-medium">{formData.lastLogin ? formatDate(formData.lastLogin) : "Нет данных"}</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-5 bg-gray-50 dark:bg-gray-800 border-t flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} className="rounded-xl">
            Отмена
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            {isSubmitting && <span className="animate-spin">&#8230;</span>}
            <Save className="h-4 w-4" />
            <span>Сохранить</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
