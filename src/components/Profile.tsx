import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  History,
  User,
  DollarSign,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const isMobile = useIsMobile();

  // Моковые данные для демонстрации
  const userData = {
    name: "Иван Иванов",
    email: "ivan@example.com",
    phone: "+7 (999) 123-45-67",
    company: "ООО Компания",
    subscription: "Бизнес",
    subscriptionEnd: "31.12.2024",
  };

  const paymentHistory = [
    {
      id: 1,
      date: "2024-02-20",
      amount: "5000 ₽",
      description: "Подписка Бизнес",
      status: "Оплачено",
    },
    {
      id: 2,
      date: "2024-01-20",
      amount: "5000 ₽",
      description: "Подписка Бизнес",
      status: "Оплачено",
    },
  ];

  const subscriptionPlans = [
    {
      name: "Стартовый",
      price: "2000 ₽/мес",
      features: ["1 магазин", "Базовая аналитика", "Email поддержка"],
    },
    {
      name: "Бизнес",
      price: "5000 ₽/мес",
      features: [
        "До 5 магазинов",
        "Расширенная аналитика",
        "Приоритетная поддержка",
        "API доступ",
      ],
    },
    {
      name: "Премиум",
      price: "10000 ₽/мес",
      features: [
        "Неограниченное количество магазинов",
        "Полная аналитика",
        "24/7 поддержка",
        "API доступ",
        "Персональный менеджер",
      ],
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Профиль</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'} w-full mb-6`}>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>Подписка</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>Оплата</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className={isMobile ? 'text-sm' : ''}>История</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">ФИО</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      defaultValue={userData.name}
                      className="pl-10"
                    />
                    <User className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userData.email}
                      className="pl-10"
                    />
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      defaultValue={userData.phone}
                      className="pl-10"
                    />
                    <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <div className="relative">
                    <Input
                      id="company"
                      defaultValue={userData.company}
                      className="pl-10"
                    />
                    <Building className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
              <Button className="w-full md:w-auto mt-6">Сохранить изменения</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.name} className="relative hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{plan.name}</span>
                    {plan.name === userData.subscription && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        Активен
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-2xl font-bold">{plan.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={plan.name === userData.subscription ? "outline" : "default"}>
                    {plan.name === userData.subscription ? "Текущий тариф" : "Выбрать"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Способы оплаты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-6 w-6" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">
                      Истекает 12/24
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full md:w-auto">Удалить</Button>
              </div>
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Добавить карту
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>История платежей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border-b py-4 last:border-0 space-y-2 md:space-y-0"
                  >
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{payment.amount}</span>
                      <span className="text-green-500">{payment.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;