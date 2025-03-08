
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User, getUsers } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, UserPlus, RefreshCw, UserCheck, UserX } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface UserListProps {
  onSelectUser: (user: User) => void;
  onAddUser: () => void;
}

export default function UserList({ onSelectUser, onAddUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          user => 
            user.name.toLowerCase().includes(lowerQuery) || 
            user.email.toLowerCase().includes(lowerQuery)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  return (
    <Card className="h-full overflow-hidden border-0 shadow-xl rounded-3xl">
      <CardHeader className="p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-500" />
            <span>Пользователи</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchUsers}
              disabled={loading}
              className="rounded-full"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              onClick={onAddUser}
              size="sm"
              className="gap-1 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Добавить</span>
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-800"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[calc(100%-10rem)] overflow-auto">
        <AnimatePresence>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => onSelectUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        <Badge variant={user.status === 'active' ? "success" : "destructive"} className="ml-2">
                          {user.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>Регистрация: {formatDate(user.registeredAt)}</div>
                      <div>Последний вход: {user.lastLogin ? formatDate(user.lastLogin) : "—"}</div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onSelectUser(user);
                        }}>
                          Подробнее
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toast({
                            title: "Действие",
                            description: `Блокировка пользователя ${user.name}`,
                          });
                        }}>
                          {user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <UserX className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Пользователи не найдены</h3>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery ? "Попробуйте изменить параметры поиска" : "В системе еще нет зарегистрированных пользователей"}
              </p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
