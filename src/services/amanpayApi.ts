import { mockDashboardData, mockTransferData, mockReceiptData } from '../data/mockData';

const api = {
  get: async (url: string): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    throw new Error("API not available");
  },
  post: async (url: string, data?: any): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    throw new Error("API not available");
  }
};

export async function getDashboardData() {
  try {
    const response = await api.get("/dashboard");
    return response.data;
  } catch (error) {
    console.log("API failed, using mock dashboard data");
    return mockDashboardData;
  }
}

export async function getTransferData() {
  try {
    const response = await api.get("/transfer-data");
    return response.data;
  } catch (error) {
    console.log("API failed, using mock transfer data");
    return mockTransferData;
  }
}

export async function createTransfer(payload: any) {
  try {
    const response = await api.post("/transfers", payload);
    return response.data;
  } catch (error) {
    console.log("API failed, creating mock transfer receipt");
    return mockReceiptData;
  }
}
