export const mockDashboardData = {
  appName: "AmanPay",
  balance: 20000,
  currency: "MRU",
  lastTransfer: 6000,
  activeEnvelopes: 5,
  pendingApprovals: 1,
  routesPreview: [
    {
      type: "تحويل دولي سريع",
      from: "نواكشوط",
      to: "داكار"
    },
    {
      type: "تحويل محلي مباشر",
      from: "نواكشوط",
      to: "نواذيبو"
    }
  ]
};

export const mockTransferData = {
  sender: "Mohamed",
  receiver: "Ahmed",
  amount: 6000,
  currency: "MRU",
  purpose: "دعم عائلي لاحتياجات طالب",
  delivery: "تحويل فوري إلى المحفظة",
  selectedRoute: {
    type: "تحويل عائلي دولي",
    from: "نواكشوط، موريتانيا",
    to: "داكار، السنغال",
    fxRate: "سعر ثابت خاص بالهاكاثون",
    settlement: "فورية"
  },
  localRoute: {
    type: "تحويل محلي بين المدن",
    from: "نواكشوط",
    to: "نواذيبو",
    settlement: "فورية"
  },
  envelopes: [
    {
      name: "الطعام",
      amount: 2000,
      type: "مقيّدة حسب الفئة",
      description: "للبقالة والمطاعم"
    },
    {
      name: "التعليم",
      amount: 1500,
      type: "مقيّدة حسب الفئة",
      description: "للكتب، المدرسة، والدورات"
    },
    {
      name: "النقل",
      amount: 1000,
      type: "مقيّدة حسب الفئة",
      description: "للتاكسي والتنقل اليومي"
    },
    {
      name: "الطوارئ",
      amount: 1000,
      type: "تحتاج موافقة",
      description: "لا تُستخدم إلا بعد موافقة المرسل"
    },
    {
      name: "الرصيد المرن",
      amount: 500,
      type: "مرنة",
      description: "يمكن استخدامها في أي مكان"
    }
  ]
};

export const mockReceiptData = {
  status: "مكتمل",
  message: "تم التحويل بنجاح",
  transactionId: "TRX-8472-991A-AMN",
  sender: "Mohamed",
  receiver: "Ahmed",
  amount: 6000,
  currency: "MRU",
  route: "نواكشوط → داكار",
  transferType: "دعم عائلي دولي",
  purpose: "دعم عائلي لاحتياجات طالب",
  settlement: "فورية",
  envelopesCreated: 5
};
