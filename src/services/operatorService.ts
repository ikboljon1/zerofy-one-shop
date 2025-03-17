
import axios from "axios";

/**
 * Список операторов с их кодами для Кыргызстана
 */
const kyrgyzOperators = [
  { codes: ["55", "99"], name: "Мегаком" },
  { codes: ["22", "77"], name: "Билайн" },
  { codes: ["70", "50"], name: "О!" },
];

/**
 * Определяет оператора по номеру телефона для Кыргызстана
 * @param phone - Номер телефона (без кода страны)
 * @returns - Информация об операторе или null, если оператор не найден
 */
export const identifyKyrgyzOperator = (phone: string): { name: string } | null => {
  if (!phone || phone.length < 2) return null;
  
  // Очищаем номер от нецифровых символов
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Проверяем первые 2 цифры номера
  const prefix = cleanPhone.substring(0, 2);
  
  // Ищем соответствующего оператора
  const operator = kyrgyzOperators.find(op => op.codes.includes(prefix));
  return operator ? { name: operator.name } : null;
};

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
