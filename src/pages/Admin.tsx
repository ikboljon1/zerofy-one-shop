
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
          className="max-w-md mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-2xl"
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
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Панель администратора</h1>
            <p className="text-gray-600 dark:text-gray-300">Управление пользователями и системными настройками</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-md border">
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
              <Users className="h-4 w-4" />
              <span>Пользователи</span>
              <span className="ml-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs rounded-full px-2 py-0.5">
                {userCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="tariffs" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
              <BadgeDollarSign className="h-4 w-4" />
              <span>Тарифы</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
              <ShieldAlert className="h-4 w-4" />
              <span>Роли и права</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
              <FileText className="h-4 w-4" />
              <span>Журналы</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
              <Database className="h-4 w-4" />
              <span>База данных</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30">
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
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 dark:text-gray-400">
              <ShieldAlert className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Управление ролями и правами</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 dark:text-gray-400">
              <FileText className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Журналы действий</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 dark:text-gray-400">
              <Database className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Управление базой данных</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 dark:text-gray-400">
              <Settings className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Настройки системы</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 dark:text-gray-400">
              <BarChart3 className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Статистика использования</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
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
