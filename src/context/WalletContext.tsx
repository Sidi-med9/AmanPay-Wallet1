import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDashboardData, getTransactions, getCategories, getIntermediaries, getReports } from '../services/amanpayApi';

interface WalletContextType {
  dashboard: any;
  transactions: any[];
  categories: any[];
  intermediaries: any[];
  reports: any;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (trx: any) => void;
  addCategory: (cat: any) => void;
  updateDashboard: (newDashboard: any) => void;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export const WalletProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [intermediaries, setIntermediaries] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const storedCategories = await AsyncStorage.getItem('@categories');
      const storedTransactions = await AsyncStorage.getItem('@transactions');
      const storedDashboard = await AsyncStorage.getItem('@dashboard');

      const [dash, trans, cats, inters, reps] = await Promise.all([
        getDashboardData(),
        getTransactions(),
        getCategories(),
        getIntermediaries(),
        getReports(),
      ]);

      const finalCategories = storedCategories ? JSON.parse(storedCategories) : cats;
      const finalTransactions = storedTransactions ? JSON.parse(storedTransactions) : trans;
      const finalDashboard = storedDashboard ? JSON.parse(storedDashboard) : dash;

      setCategories(finalCategories);
      setTransactions(finalTransactions);
      setDashboard(finalDashboard);
      setIntermediaries(inters);
      setReports(reps);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addTransaction = async (trx: any) => {
    const newTrans = [trx, ...transactions];
    setTransactions(newTrans);
    await AsyncStorage.setItem('@transactions', JSON.stringify(newTrans));

    const newDash = {
      ...dashboard,
      balance: dashboard.balance - trx.amount,
    };
    setDashboard(newDash);
    await AsyncStorage.setItem('@dashboard', JSON.stringify(newDash));
  };

  const addCategory = async (cat: any) => {
    const newCats = [...categories, cat];
    setCategories(newCats);
    await AsyncStorage.setItem('@categories', JSON.stringify(newCats));
  };

  const updateDashboard = async (newDash: any) => {
    setDashboard(newDash);
    await AsyncStorage.setItem('@dashboard', JSON.stringify(newDash));
  };

  return (
    <WalletContext.Provider value={{ dashboard, transactions, categories, intermediaries, reports, isLoading, refreshData, addTransaction, addCategory, updateDashboard }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
