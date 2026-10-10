import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const indianMarketProducts = [
  // Electronics & Computing
  {
    name: 'Apple MacBook Air 15" M3 (Starlight, 16GB / 512GB)',
    description: 'Strikingly thin design with the lightning-fast M3 chip. Liquid Retina display, MagSafe 3 charging, and up to 18 hours of battery life.',
    price: 134900,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    stock: 12,
    rating: 4.9,
    numReviews: 248,
  },
  {
    name: 'Sony Bravia 55" 4K Ultra HD Smart Google TV (XR-55A80L)',
    description: 'Cognitive Processor XR brings lifelike depth. Acoustic Surface Audio+ turns the entire screen into a multi-channel speaker.',
    price: 129990,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80',
    stock: 8,
    rating: 4.8,
    numReviews: 142,
  },
  {
    name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor (U2723QE)',
    description: 'Brilliant IPS Black panel with 2000:1 contrast ratio, 98% DCI-P3 coverage, and built-in RJ45 Ethernet + 90W power delivery.',
    price: 54999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    stock: 15,
    rating: 4.7,
    numReviews: 89,
  },
  {
    name: 'OnePlus 12 5G (Silky Black, 16GB RAM + 512GB)',
    description: 'Snapdragon 8 Gen 3 flagship with 4th Gen Hasselblad Camera System and 100W SUPERVOOC hyper-fast wired charging.',
    price: 69999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    stock: 24,
    rating: 4.8,
    numReviews: 412,
  },
  {
    name: 'Kindle Paperwhite (16 GB, Black) with 6.8" Display',
    description: 'Glare-free 300 ppi display reads like real paper even in bright sunlight. Adjustable warm light and IPX8 waterproof rating.',
    price: 14999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=800&auto=format&fit=crop&q=80',
    stock: 35,
    rating: 4.6,
    numReviews: 830,
  },

  // Audio
  {
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Industry benchmark active noise cancellation powered by Dual Processors and 8 microphones. Hi-Res Audio Wireless with LDAC.',
    price: 29990,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stock: 30,
    rating: 4.8,
    numReviews: 320,
  },
  {
    name: 'boAt Airdopes 141 ANC TWS Earbuds',
    description: 'Crystal clear calls with ENx quad mics, 32dB active noise cancellation, and Beast mode 50ms low latency for gaming.',
    price: 1699,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    stock: 80,
    rating: 4.5,
    numReviews: 1250,
  },
  {
    name: 'Marshall Stanmore III Bluetooth Home Speaker',
    description: 'Legendary room-filling sound with wide stereo soundstage, RCA input, Bluetooth 5.2, and iconic brass textured controls.',
    price: 34999,
    category: 'Audio',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    stock: 10,
    rating: 4.9,
    numReviews: 95,
  },

  // Accessories & Desk Gear
  {
    name: 'Logitech MX Master 3S Performance Wireless Mouse',
    description: 'Quiet Click switches with MagSpeed electromagnetic scrolling and an 8000 DPI Darkfield glass-tracking sensor.',
    price: 8995,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    stock: 45,
    rating: 4.8,
    numReviews: 615,
  },
  {
    name: 'Keychron K2 V2 Wireless Mechanical Keyboard (RGB Hot-Swap)',
    description: '75% compact layout with Mac & Windows legends, Gateron G Pro Brown switches, and 4000mAh battery for 240 hours use.',
    price: 8499,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    stock: 22,
    rating: 4.7,
    numReviews: 184,
  },
  {
    name: 'Ambrane 20000mAh 65W Fast Charging Power Bank',
    description: 'Power Delivery multi-output power bank engineered for laptops, iPhones, and Android devices with digital LED battery indicator.',
    price: 2999,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1609592426867-0c7f8972828b?w=800&auto=format&fit=crop&q=80',
    stock: 50,
    rating: 4.6,
    numReviews: 740,
  },
  {
    name: 'Noise ColorFit Pro 5 Smartwatch with AMOLED Display',
    description: '1.96" vibrant AMOLED display, Bluetooth calling with Tru Sync, 100+ sports modes, and real-time biometric tracking.',
    price: 3499,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    stock: 40,
    rating: 4.5,
    numReviews: 512,
  },

  // Bags & Daily Carry
  {
    name: 'Mokobara The Transit Backpack (Hazelnut)',
    description: 'Minimalist water-resistant vegan leather daily pack with dedicated 16" laptop sleeve, magnetic sternum strap, and luggage pass-through.',
    price: 5499,
    category: 'Bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    stock: 28,
    rating: 4.8,
    numReviews: 290,
  },
  {
    name: 'Wildcraft 45L Camo Trail Rucksack',
    description: 'Ergonomic heavy-duty trek pack with rain cover, padded lumbar support, walking stick attachments, and ripstop fabric.',
    price: 3299,
    category: 'Bags',
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
    stock: 35,
    rating: 4.7,
    numReviews: 440,
  },
  {
    name: 'DailyObjects Leatherette Laptop Sleeve (14-16 Inch)',
    description: 'Handcrafted premium dual-tone sleeve with magnetic flap closure and plush microfiber lining preventing scratches.',
    price: 1899,
    category: 'Bags',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    stock: 60,
    rating: 4.6,
    numReviews: 175,
  },

  // Lifestyle & Wellness
  {
    name: 'Milton Thermosteel Flip Lid 1000ml Flask',
    description: 'Grade 304 rust-proof stainless steel bottle. Keeps piping hot tea or chilled water for up to 24 hours with copper insulation.',
    price: 1199,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    stock: 100,
    rating: 4.8,
    numReviews: 1890,
  },
  {
    name: 'Blue Tokai Specialty Coffee Beans (Attikan Estate, 250g)',
    description: 'Freshly roasted whole beans from Biligirirangana Hills, Karnataka. Tasting notes of dark chocolate, figs, and roasted almond.',
    price: 520,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    stock: 45,
    rating: 4.9,
    numReviews: 310,
  },
  {
    name: 'Forest Essentials Soundarya Radiance Cream with 24K Gold',
    description: 'Luxury Ayurvedic natural anti-aging formulation with pure cow ghee, saffron, sweet almond oil, and 24-karat gold bhasma.',
    price: 6275,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&auto=format&fit=crop&q=80',
    stock: 18,
    rating: 4.9,
    numReviews: 185,
  },
  {
    name: 'Philips Air Purifier Series 1000i with HEPA Filter',
    description: 'Removes 99.97% of airborne pollutants down to 0.003 microns. Smart app control with live PM2.5 real-time ambient display.',
    price: 11499,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
    stock: 20,
    rating: 4.7,
    numReviews: 240,
  },
];

export const seedInMemory = async () => {
  await Product.deleteMany({});
  await Product.insertMany(indianMarketProducts);

  const adminAccounts = [
    { name: 'Aetheria Admin', email: 'admin@aetheria.in', password: 'AdminPass123!', role: 'admin' },
    { name: 'System Admin', email: 'admin@codealpha.com', password: 'AdminPass123!', role: 'admin' },
  ];

  for (const acc of adminAccounts) {
    const exists = await User.findOne({ email: acc.email });
    if (!exists) {
      await User.create(acc);
    }
  }
};
