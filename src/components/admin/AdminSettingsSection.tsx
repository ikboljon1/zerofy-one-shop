
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PasswordChangeForm from "@/components/PasswordChangeForm";
import { User, updateUser } from "@/services/userService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminSettingsSectionProps {
  userData: User | null;
}

const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({ userData }) => {
  const [email, setEmail] = useState(userData?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-gray-400">Необходимо войти в систему для доступа к настройкам</p>
      </div>
    );
  }

  const handleEmailUpdate = async () => {
    if (!userData) return;
    
    if (!email.trim()) {
      toast.error("Email не может быть пустым");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Введите корректный email адрес");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedUser = await updateUser(userData.id, { email });
      if (updatedUser) {
        // Update local storage with new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success("Email успешно обновлен");
      }
    } catch (error) {
      toast.error("Не удалось обновить email");
      console.error("Error updating email:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border border-gray-800 bg-gray-900 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Настройки профиля администратора</CardTitle>
          <CardDescription className="text-gray-400">
            Управление учетными данными администратора
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Изменение логина (email)</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col space-y-1">
                <label htmlFor="admin-email" className="text-sm text-gray-400">
                  Email адрес
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="admin@example.com"
                />
              </div>
              <Button 
                onClick={handleEmailUpdate}
                disabled={isUpdating || email === userData.email}
                className="w-full md:w-auto"
              >
                {isUpdating ? "Обновление..." : "Обновить email"}
              </Button>
            </div>
          </div>
          
          <div className="my-4">
            <div className="border-t border-gray-800"></div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Изменение пароля</h3>
            <PasswordChangeForm userId={userData.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsSection;
