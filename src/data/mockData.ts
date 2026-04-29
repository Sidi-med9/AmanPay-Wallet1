export const mockUser = {
  id: "USR-001",
  name: "Mohamed Ahmed",
  email: "mohamed@amanpay.demo",
  phone: "+222 30 12 34 56",
  avatar: "https://i.pravatar.cc/150?u=mohamed",
  language: "ar",
  theme: "dark"
};

export const mockDashboardData = {
  appName: "AmanPay",
  balance: 24500,
  currency: "MRU",
  activeEnvelopes: 4,
  pendingApprovals: 2,
  envelopes: [
    { categoryId: "cat1", balance: 2000, mode: "flexible" },
    { categoryId: "cat2", balance: 1500, mode: "strict" },
    { categoryId: "cat3", balance: 1000, mode: "strict" },
    { categoryId: "cat4", balance: 1000, mode: "flexible" },
    { categoryId: "cat9", balance: 500, mode: "flexible" }
  ]
};

export const mockCategories = [
  { id: "cat1", name: "الطعام", icon: "utensils", color: "#FF9800", description: "للبقالة والمطاعم" },
  { id: "cat2", name: "التعليم", icon: "book-open", color: "#2196F3", description: "للكتب، المدرسة، والدورات" },
  { id: "cat3", name: "النقل", icon: "bus", color: "#4CAF50", description: "للتاكسي والتنقل اليومي" },
  { id: "cat4", name: "الطوارئ", icon: "alert-triangle", color: "#F44336", description: "لا تُستخدم إلا للضرورة" },
  { id: "cat5", name: "الصحة", icon: "heart", color: "#E91E63", description: "للعلاج والأدوية" },
  { id: "cat6", name: "الإيجار", icon: "home", color: "#9C27B0", description: "مصاريف السكن" },
  { id: "cat7", name: "الملابس", icon: "shopping-bag", color: "#FFC107", description: "للملابس" },
  { id: "cat8", name: "الفواتير", icon: "file-text", color: "#607D8B", description: "للكهرباء والماء" },
  { id: "cat9", name: "الرصيد المرن", icon: "wallet", color: "#00BCD4", description: "يمكن استخدامها في أي مكان" },
];

export const mockTransactions = [
  {
    id: "TRX-101",
    type: "local",
    sender: "Mohamed Ahmed",
    receiver: "Fatima",
    amount: 2000,
    currency: "MRU",
    date: "2024-05-15T10:30:00Z",
    status: "مكتمل",
    transferMode: "envelope",
    envelopeMode: "strict"
  },
  {
    id: "TRX-102",
    type: "international",
    sender: "Mohamed Ahmed",
    receiver: "Ali",
    amount: 150,
    currency: "USD",
    date: "2024-05-12T14:20:00Z",
    status: "مكتمل",
    transferMode: "normal",
    intermediary: "Western Union"
  },
  {
    id: "TRX-103",
    type: "local",
    sender: "Sidi",
    receiver: "Mohamed Ahmed",
    amount: 5000,
    currency: "MRU",
    date: "2024-05-10T09:15:00Z",
    status: "مكتمل",
    transferMode: "normal"
  }
];

export const mockIntermediaries = [
  {
    id: "int1",
    name: "AmanPay Global",
    supportedCountries: ["Senegal", "Mali", "France", "USA"],
    fee: "1.5%",
    speed: "فورية",
    rate: "ممتاز",
    reliability: "99.9%",
    rating: 4.9,
    status: "available",
    tags: ["Fastest", "Recommended"]
  },
  {
    id: "int2",
    name: "Money Express",
    supportedCountries: ["Senegal", "Mali", "Cote d'Ivoire"],
    fee: "1.0%",
    speed: "١٥ دقيقة",
    rate: "جيد",
    reliability: "98.5%",
    rating: 4.5,
    status: "available",
    tags: ["Cheapest"]
  },
  {
    id: "int3",
    name: "Bank Transfer",
    supportedCountries: ["Global"],
    fee: "2.5%",
    speed: "١-٣ أيام",
    rate: "متوسط",
    reliability: "99.0%",
    rating: 4.2,
    status: "busy",
    tags: []
  }
];

export const mockReports = {
  totalSent: 15000,
  totalReceived: 25000,
  totalFees: 150,
  transfersCount: 45,
  localCount: 30,
  internationalCount: 15,
  envelopeCount: 20
};
