
import axios from "axios";

/**
 * Проверяет, принадлежит ли номер телефона известному оператору
 * @param phone - Полный номер телефона с кодом страны
 * @returns - Promise с результатом проверки
 */
export const checkOperatorExists = async (phone: string): Promise<{
  exists: boolean;
  operatorName?: string;
}> => {
  try {
    const response = await axios.post("http://localhost:3001/api/check-operator", {
      phone: phone
    });
    
    return {
      exists: response.data.exists,
      operatorName: response.data.operatorName
    };
  } catch (error) {
    console.error("Ошибка при проверке оператора:", error);
    return { exists: false };
  }
};
