import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { getConnectionUri } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Vendor } from '../models/Vendor.model.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { hashPassword } from '../utils/password.js';

interface SeedCategory {
  slug: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
}

interface SeedProduct {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  categorySlug: string;
  price: number;
  compareAt?: number;
  stock: number;
}

interface SeedVendor {
  slug: string;
  storeName: string;
  email: string;
  description: string;
  products: SeedProduct[];
}

const CATEGORIES: SeedCategory[] = [
  { slug: 'handmade', nameEn: 'Handmade', nameAr: 'أعمال يدوية', sortOrder: 1 },
  { slug: 'beauty-care', nameEn: 'Beauty & Care', nameAr: 'الجمال والعناية', sortOrder: 2 },
  { slug: 'groceries', nameEn: 'Groceries', nameAr: 'بقالة وطلبات يومية', sortOrder: 3 },
  { slug: 'books-stationery', nameEn: 'Books & Stationery', nameAr: 'كتب وقرطاسية', sortOrder: 4 },
  { slug: 'sports-fitness', nameEn: 'Sports & Fitness', nameAr: 'رياضة ولياقة', sortOrder: 5 },
  { slug: 'toys-games', nameEn: 'Toys & Games', nameAr: 'ألعاب', sortOrder: 6 },
];

const VENDORS: SeedVendor[] = [
  {
    slug: 'scandinavian-home-co',
    storeName: 'Scandinavian Home Co.',
    email: 'vendor.scandi.home@example.com',
    description: 'Modern furniture and Nordic-inspired decor made for everyday living.',
    products: [
      {
        slug: 'nordic-oak-coffee-table',
        nameEn: 'Nordic Oak Coffee Table',
        nameAr: 'طاولة قهوة بلوط نوردية',
        descriptionEn: 'A solid-oak coffee table with clean lines that works in any living room.',
        categorySlug: 'home-living',
        price: 129999,
        compareAt: 159999,
        stock: 12,
      },
      {
        slug: 'linen-throw-cushion-set',
        nameEn: 'Linen Throw Cushion Set',
        nameAr: 'طقم وسائد كتان',
        descriptionEn: 'Soft washed-linen cushions that add a cozy texture to your sofa.',
        categorySlug: 'home-living',
        price: 7999,
        stock: 40,
      },
    ],
  },
  {
    slug: 'city-shop-electronics',
    storeName: 'City Shop Electronics',
    email: 'vendor.city.electronics@example.com',
    description: 'Everyday gadgets and accessories, priced fairly and tested by our team.',
    products: [
      {
        slug: 'bluetooth-soundbar-pro',
        nameEn: 'Bluetooth Soundbar Pro',
        nameAr: 'مكبر صوت بلوتوث برو',
        descriptionEn: 'Room-filling sound with a slim profile and easy Bluetooth pairing.',
        categorySlug: 'electronics',
        price: 49999,
        compareAt: 59999,
        stock: 20,
      },
      {
        slug: 'usb-c-fast-charger-65w',
        nameEn: 'USB-C Fast Charger 65W',
        nameAr: 'شاحن سريع 65 واط',
        descriptionEn: 'Compact GaN charger that powers your laptop, tablet, and phone.',
        categorySlug: 'electronics',
        price: 12999,
        stock: 150,
      },
    ],
  },
  {
    slug: 'everyday-threads',
    storeName: 'Everyday Threads',
    email: 'vendor.everyday.threads@example.com',
    description: 'Quality basics and easy-wear fashion for everyone, every day.',
    products: [
      {
        slug: 'classic-denim-jacket',
        nameEn: 'Classic Denim Jacket',
        nameAr: 'جاكيت دنيم كلاسيكي',
        descriptionEn: 'A timeless denim jacket with a comfortable, everyday fit.',
        categorySlug: 'fashion',
        price: 89999,
        compareAt: 109999,
        stock: 18,
      },
      {
        slug: 'organic-cotton-basics-set',
        nameEn: 'Organic Cotton Basics Set',
        nameAr: 'طقم أساسيات قطن عضوي',
        descriptionEn: 'Three soft tees in organic cotton — the foundation of a capsule wardrobe.',
        categorySlug: 'fashion',
        price: 24999,
        stock: 60,
      },
    ],
  },
  {
    slug: 'aroma-hue',
    storeName: 'Aroma & Hue',
    email: 'vendor.aroma.hue@example.com',
    description: 'Handmade candles, artisan gifts, and small-batch home goods.',
    products: [
      {
        slug: 'hand-poured-soy-candle-cedar',
        nameEn: 'Hand-Poured Soy Candle — Cedar',
        nameAr: 'شمعة صويا بيد سيدر',
        descriptionEn: 'A slow-burning soy candle with a warm cedar scent.',
        categorySlug: 'handmade',
        price: 4599,
        stock: 80,
      },
      {
        slug: 'speckled-ceramic-vase',
        nameEn: 'Speckled Ceramic Vase',
        nameAr: 'مزهرية سيراميك منقطة',
        descriptionEn: 'Glazed ceramic vase with a speckled finish, perfect for dried stems.',
        categorySlug: 'handmade',
        price: 5599,
        stock: 25,
      },
    ],
  },
  {
    slug: 'green-leaf-market',
    storeName: 'Green Leaf Market',
    email: 'vendor.green.leaf@example.com',
    description: 'Fresh finds and everyday essentials, delivered fast and neatly packed.',
    products: [
      {
        slug: 'porter-stainless-tumbler',
        nameEn: 'Porter Stainless Tumbler',
        nameAr: 'كوب ستانلس معزول',
        descriptionEn: 'Double-wall stainless tumbler that keeps drinks cold for hours.',
        categorySlug: 'home-living',
        price: 7499,
        stock: 90,
      },
      {
        slug: 'espresso-starter-kit',
        nameEn: 'Espresso Starter Kit',
        nameAr: 'طقم إسبريسو للمبتدئين',
        descriptionEn: 'Everything you need to pull your first great shot at home.',
        categorySlug: 'home-living',
        price: 17999,
        stock: 30,
      },
    ],
  },
];

function slugToImageKey(slug: string): string {
  return slug;
}

async function main(): Promise<void> {
  await mongoose.connect(await getConnectionUri());
  console.log('Connected to MongoDB.');

  let createdCategories = 0;
  let updatedCategories = 0;
  for (const c of CATEGORIES) {
    const existing = await Category.findOne({ slug: c.slug });
    const doc = {
      slug: c.slug,
      name: { en: c.nameEn, ar: c.nameAr },
      sortOrder: c.sortOrder,
      status: 'active' as const,
      parent: null,
    };
    if (existing) {
      await Category.updateOne({ _id: existing._id }, doc);
      updatedCategories++;
    } else {
      await Category.create(doc);
      createdCategories++;
    }
  }
  console.log(`Categories: ${createdCategories} created, ${updatedCategories} updated.`);

  const existingHomeLiving = await Category.findOne({ slug: 'home-living-68ce' });
  const existingElectronics = await Category.findOne({ slug: 'electronics-68cc' });
  const existingFashion = await Category.findOne({ slug: 'fashion-68cd' });
  const categoryBySlug = new Map<string, { _id: mongoose.Types.ObjectId }>();
  for (const slug of [
    'electronics',
    'fashion',
    'home-living',
    'handmade',
    'beauty-care',
    'groceries',
    'books-stationery',
    'sports-fitness',
    'toys-games',
  ]) {
    const cat =
      slug === 'electronics'
        ? existingElectronics
        : slug === 'fashion'
          ? existingFashion
          : slug === 'home-living'
            ? existingHomeLiving
            : await Category.findOne({ slug });
    if (cat) categoryBySlug.set(slug, cat as unknown as { _id: mongoose.Types.ObjectId });
  }

  let createdVendors = 0;
  let updatedVendors = 0;
  let createdProducts = 0;
  let updatedProducts = 0;

  for (const v of VENDORS) {
    let user = await User.findOne({ email: v.email });
    if (!user) {
      user = await User.create({
        name: v.storeName,
        email: v.email,
        passwordHash: await hashPassword('TestVendor1234!'),
        role: 'vendor',
        status: 'active',
      });
    }

    let vendor = await Vendor.findOne({ slug: v.slug });
    if (vendor) {
      await Vendor.updateOne(
        { _id: vendor._id },
        {
          owner: user._id,
          storeName: v.storeName,
          slug: v.slug,
          description: v.description,
          status: 'approved',
        },
      );
      updatedVendors++;
    } else {
      vendor = await Vendor.create({
        owner: user._id,
        storeName: v.storeName,
        slug: v.slug,
        description: v.description,
        status: 'approved',
      });
      createdVendors++;
    }

    for (const p of v.products) {
      const category = categoryBySlug.get(p.categorySlug);
      if (!category) {
        console.warn(`  [skip] no category for ${p.categorySlug}`);
        continue;
      }
      const image = `https://picsum.photos/seed/${slugToImageKey(p.slug)}/600/600`;
      const existing = await Product.findOne({ slug: p.slug });
      const doc = {
        vendor: vendor!._id,
        category: category._id,
        name: { en: p.nameEn, ar: p.nameAr },
        slug: p.slug,
        description: { en: p.descriptionEn, ar: p.nameAr },
        images: [image],
        sku: undefined,
        price: p.price,
        compareAtPrice: p.compareAt ?? undefined,
        currency: 'SAR',
        status: 'active' as const,
        isFeatured: false,
        inventory: { availableStock: p.stock, reservedStock: 0, purchasedStock: 0 },
      };
      if (existing) {
        await Product.updateOne({ _id: existing._id }, doc);
        updatedProducts++;
      } else {
        await Product.create(doc);
        createdProducts++;
      }
    }
  }

  console.log(
    `Vendors: ${createdVendors} created, ${updatedVendors} updated. Products: ${createdProducts} created, ${updatedProducts} updated.`,
  );

  await mongoose.disconnect();
  console.log('Seed portfolio: done.');
}

main().catch((err: unknown) => {
  console.error('Failed to seed portfolio:', err);
  process.exit(1);
});