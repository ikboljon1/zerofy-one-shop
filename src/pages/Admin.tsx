
import { useState } from "react";
import { User } from "@/services/userService";
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
} from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleUserUpdated = (user: User) => {
    // In a real app, we might update a central state or refetch users
    setSelectedUser(user);
  };

  const handleUserAdded = (user: User) => {
    // In a real app, we might update a central state or refetch users
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Панель администратора</h1>
            <p className="text-muted-foreground">Управление пользователями и системными настройками</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Роли и права</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Журналы</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>База данных</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Настройки</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
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

          <TabsContent value="roles">
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <ShieldAlert className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Управление ролями и правами</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Журналы действий</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="database">
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <Database className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Управление базой данных</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <Settings className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-xl font-medium">Настройки системы</h3>
              <p className="mt-2">Этот раздел находится в разработке</p>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
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
