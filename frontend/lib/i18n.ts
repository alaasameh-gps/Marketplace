export type Locale = 'en' | 'ar';

export const locales: Locale[] = ['en', 'ar'];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'ar';
}

export function isRtl(locale: Locale): boolean {
  return locale === 'ar';
}

export type Dict = {
  dir: 'ltr' | 'rtl';
  nav: {
    home: string;
    products: string;
    categories: string;
    brands: string;
    vendors: string;
    cart: string;
    account: string;
    login: string;
    register: string;
    logout: string;
    dashboard: string;
    vendor: string;
    admin: string;
    shop: string;
  };
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    next: string;
    previous: string;
    back: string;
    search: string;
    all: string;
    actions: string;
    status: string;
    date: string;
    noData: string;
    confirm: string;
    total: string;
    yes: string;
    no: string;
  };
  home: {
    heroTag: string;
    heroTitle: string;
    heroSubtitle: string;
    shopNow: string;
    featuredProducts: string;
    browseCategories: string;
    browseBrands: string;
    viewAll: string;
  };
  products: {
    title: string;
    subtitle: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    results: string;
    noResults: string;
    addToCart: string;
    outOfStock: string;
    price: string;
    vendor: string;
    category: string;
    brand: string;
    description: string;
    quantity: string;
    addedToCart: string;
    buyNow: string;
    shipping: string;
    verified: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: string;
    customerRole: string;
    vendorRole: string;
    storeName: string;
    login: string;
    register: string;
    noAccount: string;
    haveAccount: string;
    createAccount: string;
    signIn: string;
    loginSubtitle: string;
    registerSubtitle: string;
    error: string;
  };
  cart: {
    title: string;
    empty: string;
    browseProducts: string;
    subtotal: string;
    checkout: string;
    remove: string;
    clear: string;
    keepShopping: string;
  };
  checkout: {
    title: string;
    shippingAddress: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    region: string;
    postalCode: string;
    placeOrder: string;
    orderSummary: string;
    paymentMethod: string;
    payNow: string;
    simulatingNote: string;
    paid: string;
    orderCreated: string;
    orderNumber: string;
  };
  account: {
    title: string;
    profile: string;
    name: string;
    email: string;
    phone: string;
    saveProfile: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    orders: string;
    myOrders: string;
    order: string;
    noOrders: string;
    viewOrder: string;
    paymentStatus: string;
    orderStatus: string;
    cancelOrder: string;
    total: string;
  };
  vendor: {
    dashboard: string;
    overview: string;
    products: string;
    addProduct: string;
    productCreated: string;
    editProduct: string;
    orders: string;
    commissions: string;
    settings: string;
    storeName: string;
    slug: string;
    description: string;
    logo: string;
    saveStore: string;
    salesOverview: string;
    totalSales: string;
    totalCommissions: string;
    totalEarnings: string;
  };
  productForm: {
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    category: string;
    brand: string;
    price: string;
    compareAtPrice: string;
    sku: string;
    stock: string;
    status: string;
    images: string;
    create: string;
    update: string;
    optional: string;
  };
  admin: {
    dashboard: string;
    overview: string;
    users: string;
    vendors: string;
    products: string;
    categories: string;
    brands: string;
    orders: string;
    commissions: string;
    payments: string;
    settings: string;
    commissionRate: string;
    saveSettings: string;
    approve: string;
    reject: string;
    suspend: string;
    activate: string;
    platformOverview: string;
  };
  errors: {
    generic: string;
    invalidCredentials: string;
    unauthorized: string;
    notFound: string;
  };
};

export const dictionaries: Record<Locale, Dict> = {
  en: {
    dir: 'ltr',
    nav: {
      home: 'Home',
      products: 'Products',
      categories: 'Categories',
      brands: 'Brands',
      vendors: 'Vendors',
      cart: 'Cart',
      account: 'Account',
      login: 'Sign in',
      register: 'Create account',
      logout: 'Sign out',
      dashboard: 'Dashboard',
      vendor: 'Vendor',
      admin: 'Admin',
      shop: 'Shop',
    },
    common: {
      loading: 'Loading…',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      next: 'Next',
      previous: 'Previous',
      back: 'Back',
      search: 'Search',
      all: 'All',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      noData: 'No records found.',
      confirm: 'Confirm',
      total: 'Total',
      yes: 'Yes',
      no: 'No',
    },
    home: {
      heroTitle: 'Shop the marketplace',
      heroSubtitle: 'Thousands of products from verified local vendors, delivered across the region.',
      heroTag: 'Verified local vendors',
      shopNow: 'Shop now',
      featuredProducts: 'Featured products',
      browseCategories: 'Browse categories',
      browseBrands: 'Browse brands',
      viewAll: 'View all',
    },
    products: {
      title: 'Products',
      subtitle: 'Discover everything from local vendors.',
      sortNewest: 'Newest',
      sortPriceAsc: 'Price: low to high',
      sortPriceDesc: 'Price: high to low',
      results: 'results',
      noResults: 'No products match your filters.',
      addToCart: 'Add to cart',
      outOfStock: 'Out of stock',
      price: 'Price',
      vendor: 'Vendor',
      category: 'Category',
      brand: 'Brand',
      description: 'Description',
      quantity: 'Quantity',
      addedToCart: 'Added to cart',
      buyNow: 'Buy now',
      shipping: 'Fast shipping',
      verified: 'Verified vendor',
    },
    auth: {
      loginTitle: 'Sign in',
      registerTitle: 'Create an account',
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      phone: 'Phone (optional)',
      role: 'I am a…',
      customerRole: 'Customer',
      vendorRole: 'Vendor',
      storeName: 'Store name',
      login: 'Sign in',
      register: 'Create account',
      noAccount: 'No account yet?',
      haveAccount: 'Already have an account?',
      createAccount: 'Create account',
      signIn: 'Sign in',
      loginSubtitle: 'Welcome back — sign in to continue to your account.',
      registerSubtitle: 'Create your account to start shopping or selling.',
      error: 'Something went wrong. Please try again.',
    },
    cart: {
      title: 'Your cart',
      empty: 'Your cart is empty.',
      browseProducts: 'Browse products',
      subtotal: 'Subtotal',
      checkout: 'Proceed to checkout',
      remove: 'Remove',
      clear: 'Clear cart',
      keepShopping: 'Keep shopping',
    },
    checkout: {
      title: 'Checkout',
      shippingAddress: 'Shipping address',
      fullName: 'Full name',
      phone: 'Phone',
      line1: 'Address line 1',
      line2: 'Address line 2 (optional)',
      city: 'City',
      region: 'Region',
      postalCode: 'Postal code (optional)',
      placeOrder: 'Place order',
      orderSummary: 'Order summary',
      paymentMethod: 'Payment',
      payNow: 'Pay now (sandbox)',
      simulatingNote: 'Sandbox webhook: click “Mark paid” to simulate the payment provider confirming the payment.',
      paid: 'Paid',
      orderCreated: 'Order created successfully',
      orderNumber: 'Order number',
    },
    account: {
      title: 'My account',
      profile: 'Profile',
      name: 'Full name',
      email: 'Email',
      phone: 'Phone',
      saveProfile: 'Save profile',
      changePassword: 'Change password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      orders: 'Orders',
      myOrders: 'My orders',
      order: 'Order',
      noOrders: 'You have no orders yet.',
      viewOrder: 'View order',
      paymentStatus: 'Payment',
      orderStatus: 'Status',
      cancelOrder: 'Cancel order',
      total: 'Total',
    },
    vendor: {
      dashboard: 'Vendor dashboard',
      overview: 'Overview',
      products: 'Products',
      addProduct: 'Add product',
      productCreated: 'Product created successfully',
      editProduct: 'Edit product',
      orders: 'Orders',
      commissions: 'Commissions',
      settings: 'Settings',
      storeName: 'Store name',
      slug: 'Slug',
      description: 'Description',
      logo: 'Logo URL',
      saveStore: 'Save store',
      salesOverview: 'Sales overview',
      totalSales: 'Total sales (subtotal)',
      totalCommissions: 'Total commissions',
      totalEarnings: 'Total earnings',
    },
    productForm: {
      nameEn: 'Name (English)',
      nameAr: 'Name (Arabic)',
      descriptionEn: 'Description (English)',
      descriptionAr: 'Description (Arabic)',
      category: 'Category',
      brand: 'Brand',
      price: 'Price (SAR)',
      compareAtPrice: 'Compare-at price (SAR)',
      sku: 'SKU',
      stock: 'Available stock',
      status: 'Status',
      images: 'Image URLs (comma separated)',
      create: 'Create product',
      update: 'Update product',
      optional: 'Optional',
    },
    admin: {
      dashboard: 'Admin dashboard',
      overview: 'Overview',
      users: 'Users',
      vendors: 'Vendors',
      products: 'Products',
      categories: 'Categories',
      brands: 'Brands',
      orders: 'Orders',
      commissions: 'Commissions',
      payments: 'Payments',
      settings: 'Settings',
      commissionRate: 'Platform commission rate (%)',
      saveSettings: 'Save settings',
      approve: 'Approve',
      reject: 'Reject',
      suspend: 'Suspend',
      activate: 'Activate',
      platformOverview: 'Marketplace overview',
    },
    errors: {
      generic: 'Something went wrong. Please try again.',
      invalidCredentials: 'Invalid email or password.',
      unauthorized: 'You must be signed in to view this page.',
      notFound: 'Page not found.',
    },
  },
  ar: {
    dir: 'rtl',
    nav: {
      home: 'الرئيسية',
      products: 'المنتجات',
      categories: 'التصنيفات',
      brands: 'العلامات',
      vendors: 'المتاجر',
      cart: 'السلة',
      account: 'حسابي',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      dashboard: 'لوحة التحكم',
      vendor: 'بائع',
      admin: 'مشرف',
      shop: 'التسوق',
    },
    common: {
      loading: 'جارٍ التحميل…',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      next: 'التالي',
      previous: 'السابق',
      back: 'رجوع',
      search: 'بحث',
      all: 'الكل',
      actions: 'إجراءات',
      status: 'الحالة',
      date: 'التاريخ',
      noData: 'لا توجد سجلات.',
      confirm: 'تأكيد',
      total: 'الإجمالي',
      yes: 'نعم',
      no: 'لا',
    },
    home: {
      heroTitle: 'تسوّق من السوق',
      heroSubtitle: 'آلاف المنتجات من متاجر محلية موثوقة، توصيل لجميع أنحاء المنطقة.',
      heroTag: 'متاجر محلية موثوقة',
      shopNow: 'تسوّق الآن',
      featuredProducts: 'منتجات مميزة',
      browseCategories: 'تصفح التصنيفات',
      browseBrands: 'تصفح العلامات',
      viewAll: 'عرض الكل',
    },
    products: {
      title: 'المنتجات',
      subtitle: 'اكتشف كل ما يقدمه المتاجر المحلية.',
      sortNewest: 'الأحدث',
      sortPriceAsc: 'السعر: من الأقل للأعلى',
      sortPriceDesc: 'السعر: من الأعلى للأقل',
      results: 'نتيجة',
      noResults: 'لا توجد منتجات تطابق بحثك.',
      addToCart: 'أضف إلى السلة',
      outOfStock: 'غير متوفر',
      price: 'السعر',
      vendor: 'البائع',
      category: 'التصنيف',
      brand: 'العلامة',
      description: 'الوصف',
      quantity: 'الكمية',
      addedToCart: 'تمت الإضافة إلى السلة',
      buyNow: 'اشترِ الآن',
      shipping: 'توصيل سريع',
      verified: 'بائع موثوق',
    },
    auth: {
      loginTitle: 'تسجيل الدخول',
      registerTitle: 'إنشاء حساب',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      phone: 'الهاتف (اختياري)',
      role: 'أنا…',
      customerRole: 'عميل',
      vendorRole: 'بائع',
      storeName: 'اسم المتجر',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      noAccount: 'ليس لديك حساب؟',
      haveAccount: 'لديك حساب بالفعل؟',
      createAccount: 'إنشاء حساب',
      signIn: 'تسجيل الدخول',
      loginSubtitle: 'مرحباً بعودتك — سجّل دخولك للمتابعة إلى حسابك.',
      registerSubtitle: 'أنشئ حسابك لبدء التسوق أو البيع.',
      error: 'حدث خطأ. حاول مرة أخرى.',
    },
    cart: {
      title: 'سلة التسوق',
      empty: 'سلتك فارغة.',
      browseProducts: 'تصفح المنتجات',
      subtotal: 'الإجمالي الفرعي',
      checkout: 'متابعة الدفع',
      remove: 'إزالة',
      clear: 'إفراغ السلة',
      keepShopping: 'متابعة التسوق',
    },
    checkout: {
      title: 'الدفع',
      shippingAddress: 'عنوان الشحن',
      fullName: 'الاسم الكامل',
      phone: 'الهاتف',
      line1: 'العنوان سطر ١',
      line2: 'العنوان سطر ٢ (اختياري)',
      city: 'المدينة',
      region: 'المنطقة',
      postalCode: 'الرمز البريدي (اختياري)',
      placeOrder: 'إتمام الطلب',
      orderSummary: 'ملخص الطلب',
      paymentMethod: 'الدفع',
      payNow: 'ادفع الآن (تجريبي)',
      simulatingNote: 'تجريبي: اضغط «تأكيد الدفع» لمحاكاة مزود الدفع عند نجاح العملية.',
      paid: 'مدفوع',
      orderCreated: 'تم إنشاء الطلب بنجاح',
      orderNumber: 'رقم الطلب',
    },
    account: {
      title: 'حسابي',
      profile: 'الملف الشخصي',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      saveProfile: 'حفظ الملف',
      changePassword: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      orders: 'الطلبات',
      myOrders: 'طلباتي',
      order: 'طلب',
      noOrders: 'لا توجد طلبات بعد.',
      viewOrder: 'عرض الطلب',
      paymentStatus: 'الدفع',
      orderStatus: 'الحالة',
      cancelOrder: 'إلغاء الطلب',
      total: 'الإجمالي',
    },
    vendor: {
      dashboard: 'لوحة البائع',
      overview: 'نظرة عامة',
      products: 'المنتجات',
      addProduct: 'إضافة منتج',
      productCreated: 'تم إنشاء المنتج بنجاح',
      editProduct: 'تعديل منتج',
      orders: 'الطلبات',
      commissions: 'العمولات',
      settings: 'الإعدادات',
      storeName: 'اسم المتجر',
      slug: 'المعرّف',
      description: 'الوصف',
      logo: 'رابط الشعار',
      saveStore: 'حفظ المتجر',
      salesOverview: 'نظرة عامة على المبيعات',
      totalSales: 'إجمالي المبيعات',
      totalCommissions: 'إجمالي العمولات',
      totalEarnings: 'إجمالي الأرباح',
    },
    productForm: {
      nameEn: 'الاسم (إنجليزي)',
      nameAr: 'الاسم (عربي)',
      descriptionEn: 'الوصف (إنجليزي)',
      descriptionAr: 'الوصف (عربي)',
      category: 'التصنيف',
      brand: 'العلامة',
      price: 'السعر (ر.س)',
      compareAtPrice: 'السعر قبل الخصم (ر.س)',
      sku: 'رمز المنتج',
      stock: 'المخزون المتاح',
      status: 'الحالة',
      images: 'روابط الصور (مفصولة بفاصلة)',
      create: 'إنشاء المنتج',
      update: 'تحديث المنتج',
      optional: 'اختياري',
    },
    admin: {
      dashboard: 'لوحة المشرف',
      overview: 'نظرة عامة',
      users: 'المستخدمون',
      vendors: 'المتاجر',
      products: 'المنتجات',
      categories: 'التصنيفات',
      brands: 'العلامات',
      orders: 'الطلبات',
      commissions: 'العمولات',
      payments: 'المدفوعات',
      settings: 'الإعدادات',
      commissionRate: 'نسبة عمولة المنصة (٪)',
      saveSettings: 'حفظ الإعدادات',
      approve: 'موافقة',
      reject: 'رفض',
      suspend: 'إيقاف',
      activate: 'تفعيل',
      platformOverview: 'نظرة عامة على السوق',
    },
    errors: {
      generic: 'حدث خطأ. حاول مرة أخرى.',
      invalidCredentials: 'البريد أو كلمة المرور غير صحيحة.',
      unauthorized: 'يجب تسجيل الدخول لعرض هذه الصفحة.',
      notFound: 'الصفحة غير موجودة.',
    },
  },
};

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale] ?? dictionaries.en;
}