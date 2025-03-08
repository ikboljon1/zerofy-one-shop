import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateUser, User, getUserSubscriptionData, activateSubscription, SubscriptionData, getTrialDaysRemaining } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { TARIFF_STORE_LIMITS } from "@/services/userService";

interface UserDetailsProps {
  userId: string;
}

const UserDetails = ({ userId }: UserDetailsProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [tariffId, setTariffId] = useState('1');
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | undefined>(undefined);
  const [subscriptionMonths, setSubscriptionMonths] = useState(1);
  const [selectedTariff, setSelectedTariff] = useState<string | undefined>(undefined);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // Get users from localStorage
        const storedUsers = localStorage.getItem('users');
        if (!storedUsers) {
          console.log('No users found in localStorage');
          return;
        }
        
        const users: User[] = JSON.parse(storedUsers);
        const foundUser = users.find(u => u.id === userId);
        
        if (foundUser) {
          setUser(foundUser);
          setName(foundUser.name);
          setEmail(foundUser.email);
          setPhone(foundUser.phone || '');
          setCompany(foundUser.company || '');
          setStatus(foundUser.status || 'active');
          setRole(foundUser.role || 'user');
          setTariffId(foundUser.tariffId);
          setIsSubscriptionActive(foundUser.isSubscriptionActive);
          setSubscriptionEndDate(foundUser.subscriptionEndDate ? new Date(foundUser.subscriptionEndDate) : undefined);
          setSelectedTariff(foundUser.tariffId);
          
          getUserSubscriptionData(foundUser.id).then(subscriptionData => {
            setSubscriptionData(subscriptionData);
          });
          
          if (foundUser.isInTrial) {
            const trialDays = getTrialDaysRemaining(foundUser);
            setTrialDaysRemaining(trialDays);
          }
        } else {
          toast({
            title: "Ошибка",
            description: "Пользователь не найден",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные пользователя",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, toast]);
  
  const handleActivateSubscription = async () => {
    if (!user) return;
    
    setIsActivating(true);
    try {
      const result = await activateSubscription(
        user.id, 
        selectedTariff || user.tariffId, 
        subscriptionMonths
      );
      
      if (result.success && result.user) {
        setUser(result.user);
        
        getUserSubscriptionData(user.id).then(data => {
          setSubscriptionData(data);
        });
        
        toast({
          title: "Успешно",
          description: `Подписка активирована до ${formatDate(result.user.subscriptionEndDate || '')}`,
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось активировать подписку",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedUser: Partial<User> = {
        name,
        email,
        phone,
        company,
        status,
        role,
        tariffId,
        isSubscriptionActive,
        subscriptionEndDate: subscriptionEndDate ? subscriptionEndDate.toISOString() : undefined,
      };

      const result = await updateUser(user.id, updatedUser);

      if (result) {
        setUser(result);
        
        // Update user in localStorage
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          const users: User[] = JSON.parse(storedUsers);
          const updatedUsers = users.map(u => u.id === user.id ? result : u);
          localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
        
        toast({
          title: "Успешно",
          description: "Данные пользователя успешно обновлены",
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить данные пользователя",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные пользователя",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch (error) {
      return 'N/A';
    }
  };
  
  const getStoreLimit = () => {
    if (!tariffId) return 1;
    return tariffId in TARIFF_STORE_LIMITS ? TARIFF_STORE_LIMITS[tariffId] : 1;
  };

  if (isLoading) {
    return <Card>
      <CardContent>Загрузка...</CardContent>
    </Card>;
  }

  if (!user) {
    return <Card>
      <CardContent>Пользователь не найден</CardContent>
    </Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактирование пользователя</CardTitle>
        <CardDescription>Измените данные пользователя</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">ФИО</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="company">Компания</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Статус</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'active' | 'inactive')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="inactive">Неактивен</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="role">Роль</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'user')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="user">Пользователь</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="space-y-2">
            <Label htmlFor="tariff">Тариф</Label>
            <Select value={selectedTariff} onValueChange={setSelectedTariff}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите тариф" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Стартовый</SelectItem>
                <SelectItem value="2">Бизнес</SelectItem>
                <SelectItem value="3">Премиум</SelectItem>
                <SelectItem value="4">Корпоративный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="isSubscriptionActive"
              checked={isSubscriptionActive}
              onCheckedChange={(checked) => setIsSubscriptionActive(!!checked)}
            />
            <Label htmlFor="isSubscriptionActive">Подписка активна</Label>
          </div>
          
          <div className="mt-4">
            <Label>Дата окончания подписки</Label>
            <DatePicker
              id="subscriptionEndDate"
              value={subscriptionEndDate}
              onValueChange={setSubscriptionEndDate}
            />
          </div>
          
          <div className="mt-4">
            <Label htmlFor="subscriptionMonths">Продлить на (месяцев)</Label>
            <Input
              id="subscriptionMonths"
              type="number"
              min="1"
              value={subscriptionMonths.toString()}
              onChange={(e) => setSubscriptionMonths(parseInt(e.target.value))}
            />
          </div>
          
          <Button 
            className="mt-4" 
            onClick={handleActivateSubscription} 
            disabled={isActivating}
          >
            {isActivating ? 'Активация...' : 'Активировать подписку'}
          </Button>
        </div>
      </CardContent>
      <div className="flex justify-end space-x-2 p-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </Card>
  );
};

export default UserDetails;
