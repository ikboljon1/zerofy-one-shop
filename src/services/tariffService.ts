
import axios from 'axios';
import { Tariff, initialTariffs } from '@/data/tariffs';

const API_URL = 'http://localhost:3001/api';
const TARIFFS_STORAGE_KEY = "app_tariffs";

// Получение списка тарифов
export const fetchTariffs = async (): Promise<Tariff[]> => {
  try {
    const response = await axios.get(`${API_URL}/tariffs`);
    
    // Сохраняем тарифы в localStorage для оффлайн-доступа
    localStorage.setItem(TARIFFS_STORAGE_KEY, JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tariffs:', error);
    
    // Если не удалось получить тарифы с сервера, пробуем загрузить из localStorage
    const savedTariffsJson = localStorage.getItem(TARIFFS_STORAGE_KEY);
    
    if (savedTariffsJson) {
      return JSON.parse(savedTariffsJson);
    }
    
    // Если нет данных в localStorage, возвращаем начальные тарифы
    return initialTariffs;
  }
};

// Обновление тарифа
export const updateTariff = async (id: string, tariffData: Tariff): Promise<Tariff> => {
  try {
    const response = await axios.put(`${API_URL}/tariffs/${id}`, tariffData);
    
    // Обновляем тарифы в localStorage
    const existingTariffs = await fetchTariffs();
    const updatedTariffs = existingTariffs.map(tariff => 
      tariff.id === id ? tariffData : tariff
    );
    localStorage.setItem(TARIFFS_STORAGE_KEY, JSON.stringify(updatedTariffs));
    
    return response.data;
  } catch (error) {
    console.error('Error updating tariff:', error);
    
    // Если не удалось обновить тариф на сервере, обновляем только в localStorage
    const existingTariffs = await fetchTariffs();
    const updatedTariffs = existingTariffs.map(tariff => 
      tariff.id === id ? tariffData : tariff
    );
    localStorage.setItem(TARIFFS_STORAGE_KEY, JSON.stringify(updatedTariffs));
    
    return tariffData;
  }
};

// Получение тарифа по ID
export const getTariff = async (id: string): Promise<Tariff | undefined> => {
  try {
    const response = await axios.get(`${API_URL}/tariffs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tariff:', error);
    
    // Если не удалось получить тариф с сервера, пробуем найти в localStorage
    const tariffs = await fetchTariffs();
    return tariffs.find(tariff => tariff.id === id);
  }
};

// Получение лимита магазинов для тарифа
export const getStoreLimitForTariff = async (tariffId: string): Promise<number> => {
  try {
    const tariff = await getTariff(tariffId);
    return tariff?.storeLimit || 1;
  } catch (error) {
    console.error('Error getting store limit for tariff:', error);
    
    // Если не удалось получить лимит, возвращаем значение по умолчанию
    return 1;
  }
};
