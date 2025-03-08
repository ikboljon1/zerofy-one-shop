
import { useState, useEffect } from "react";
import { User, getUsers } from "@/services/userService";
import UserList from "@/components/admin/UserList";
import UserDetails from "@/components/admin/UserDetails";
import AddUserModal from "@/components/admin/AddUserModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserCheck, 
  Settings, 
  ShieldAlert, 
  BarChart3,
  Database,
  FileText, 
  Users,
  User as UserIcon,
  BadgeDollarSign,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import TariffSection from "@/components/admin/TariffSection";

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Fetch the user count
    getUsers().then(users => setUserCount(users.length));
  }, []);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleUserUpdated = (user: User) => {
    setSelectedUser(user);
    // Refresh user count
    getUsers().then(users => setUserCount(users.length));
  };

  const handleUserAdded = (user: User) => {
    setSelectedUser(null);
    // Refresh user count
    getUsers().then(users => setUserCount(users.length));
  };

  // Check if admin is logged in
  const userDataStr = localStorage.getItem('user');
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  const isAdmin = userData?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="mb-6 text-red-500">
            <UserIcon className="w-16 h-16 mx-auto opacity-70" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-muted-foreground mb-6">
            У вас нет прав для доступа к панели администратора. Пожалуйста, войдите в систему с учетной записью администратора.
          </p>
          <a 
            href="/" 
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Панель администратора</h1>
            <p className="text-gray-600 dark:text-gray-300">Управление пользователями и системными настройками</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-white dark:bg-gray-900 p-1.5 rounded-xl shadow-md border flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Users className="h-4 w-4" />
              <span>Пользователи</span>
              <span className="ml-1 bg-white/20 text-white dark:bg-blue-900 dark:text-blue-100 text-xs rounded-full px-2 py-0.5">
                {userCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="tariffs" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BadgeDollarSign className="h-4 w-4" />
              <span>Тарифы</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Роли и права</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <FileText className="h-4 w-4" />
              <span>Журналы</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Database className="h-4 w-4" />
              <span>База данных</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2">
              <BarChart3 className="h-4 w-4" />
              <span>Статистика</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-8">
            <div className="h-[70vh]">
              {selectedUser ? (
                <UserDetails
                  user={selectedUser}
                  onBack={handleBack}
                  onUserUpdated={handleUserUpdated}
                />
              ) : (
                <UserList 
                  onSelectUser={handleSelectUser} 
                  onAddUser={() => setIsAddModalOpen(true)} 
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="tariffs">
            <TariffSection />
          </TabsContent>

          <TabsContent value="roles">
            <div className="flex flex-col items-center justify-center h-[50vh] bg-white dark:bg-gray-900 rounded-3xl p-10 border shadow-sm">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <ShieldAlert className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Управление ролями и правами</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Этот раздел находится в разработке. Скоро здесь появится возможность управлять ролями пользователей и их правами доступа.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="flex flex-col items-center justify-center h-[50vh] bg-white dark:bg-gray-900 rounded-3xl p-10 border shadow-sm">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <FileText className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Журналы действий</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Этот раздел находится в разработке. Здесь будет доступна история всех действий пользователей в системе.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="flex flex-col items-center justify-center h-[50vh] bg-white dark:bg-gray-900 rounded-3xl p-10 border shadow-sm">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <Database className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Управление базой данных</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Этот раздел находится в разработке. В будущем здесь появятся инструменты для работы с базой данных системы.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="flex flex-col items-center justify-center h-[50vh] bg-white dark:bg-gray-900 rounded-3xl p-10 border shadow-sm">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <Settings className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Настройки системы</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Этот раздел находится в разработке. Здесь будут доступны основные настройки и конфигурации системы.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="flex flex-col items-center justify-center h-[50vh] bg-white dark:bg-gray-900 rounded-3xl p-10 border shadow-sm">
              <div className="w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                <BarChart3 className="h-12 w-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-medium mb-2">Статистика использования</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Этот раздел находится в разработке. В будущем здесь будут доступны отчеты и графики об использовании системы.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
