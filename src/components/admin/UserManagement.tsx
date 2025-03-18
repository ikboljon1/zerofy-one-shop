
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsers, User } from "@/services/userService";
import UserList from "./UserList";
import UserDetails from "./UserDetails";
import AddUserModal from "./AddUserModal";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    fetchUsers(); // Refresh user list when returning to it
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    setSelectedUser(updatedUser);
  };

  const handleUserAdded = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    toast({
      title: "Успешно",
      description: "Пользователь успешно добавлен",
    });
  };

  return (
    <Card>
      {selectedUser ? (
        <UserDetails 
          user={selectedUser} 
          onBack={handleBackToList} 
          onUserUpdated={handleUserUpdated} 
        />
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>Просмотр и редактирование пользователей системы</CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddUserModalOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Добавить пользователя</span>
            </Button>
          </CardHeader>
          <CardContent>
            <UserList 
              users={users} 
              isLoading={isLoading} 
              onUserSelect={handleUserSelect} 
            />
          </CardContent>
        </>
      )}
      
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </Card>
  );
};

export default UserManagement;
