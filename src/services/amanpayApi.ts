import { 
  mockDashboardData, 
  mockTransactions,
  mockCategories,
  mockIntermediaries,
  mockReports,
  mockUser
} from '../data/mockData';

const api = {
  get: async (url: string): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Simulated routing
    if (url === '/user/profile') return { data: mockUser };
    if (url === '/wallet/dashboard') return { data: mockDashboardData };
    if (url === '/transactions') return { data: mockTransactions };
    if (url === '/categories') return { data: mockCategories };
    if (url === '/intermediaries') return { data: mockIntermediaries };
    if (url === '/reports') return { data: mockReports };
    
    throw new Error("API route not found");
  },
  post: async (url: string, data?: any): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (url === '/auth/login' || url === '/auth/register') return { data: mockUser };
    if (url === '/transfers/local' || url === '/transfers/international') {
      return { data: { success: true, transactionId: "TRX-" + Math.floor(Math.random() * 10000) } };
    }
    throw new Error("API route not found");
  }
};

export async function login(credentials: any) {
  try { return (await api.post("/auth/login", credentials)).data; } catch (e) { return mockUser; }
}

export async function register(data: any) {
  try { return (await api.post("/auth/register", data)).data; } catch (e) { return mockUser; }
}

export async function getProfile() {
  try { return (await api.get("/user/profile")).data; } catch (e) { return mockUser; }
}

export async function getDashboardData() {
  try { return (await api.get("/wallet/dashboard")).data; } catch (e) { return mockDashboardData; }
}

export async function getTransactions() {
  try { return (await api.get("/transactions")).data; } catch (e) { return mockTransactions; }
}

export async function getCategories() {
  try { return (await api.get("/categories")).data; } catch (e) { return mockCategories; }
}

export async function getIntermediaries() {
  try { return (await api.get("/intermediaries")).data; } catch (e) { return mockIntermediaries; }
}

export async function getReports() {
  try { return (await api.get("/reports")).data; } catch (e) { return mockReports; }
}

export async function createLocalTransfer(payload: any) {
  try { return (await api.post("/transfers/local", payload)).data; } catch (e) { return { success: true, transactionId: "TRX-MOCK-LOCAL" }; }
}

export async function createInternationalTransfer(payload: any) {
  try { return (await api.post("/transfers/international", payload)).data; } catch (e) { return { success: true, transactionId: "TRX-MOCK-INTL" }; }
}
