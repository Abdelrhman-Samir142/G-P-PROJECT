# RefurbAI - AI-Powered Sustainable Marketplace

A professional, production-ready marketplace built with Next.js 14+ (App Router), TypeScript, and Tailwind CSS. RefurbAI is designed for Egypt's circular economy, enabling users to buy and sell used items and scrap with AI-powered pricing analysis.

## 🚀 Features

### Core Features
- **🌓 Dark/Light Mode**: Seamless theme switching with `next-themes`
- **🌍 Bilingual Support**: Arabic (RTL) and English (LTR) with dictionary-based i18n
- **🤖 AI Pricing Analysis**: Futuristic scanning animation with glassmorphism effects
- **⏰ Live Auctions**: Real-time countdown timers and bidding system
- **📱 Mobile-First**: Responsive design with bottom navigation for mobile
- **🎨 Modern UI/UX**: Framer Motion animations, glassmorphism, and smooth transitions

### Pages
1. **Landing Page** (`/`) - High-conversion hero with AI feature showcase
2. **Dashboard** (`/dashboard`) - Product grid with advanced sidebar filters
3. **Product Details** (`/product/[id]`) - Full details with bidding history and seller profile
4. **Sell/Add Listing** (`/sell`) - Multi-step form with drag-and-drop image upload
5. **User Profile** (`/profile`) - Stats, active listings, and trust score visualization
6. **Login** (`/login`) - Authentication page

## 📁 Project Structure

```
refurbai/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   ├── dashboard/
│   │   └── page.tsx             # Products grid with filters
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx         # Product detail page
│   ├── sell/
│   │   └── page.tsx             # Multi-step listing form
│   ├── profile/
│   │   └── page.tsx             # User profile with stats
│   └── login/
│       └── page.tsx             # Login/authentication
├── components/
│   ├── layout/
│   │   ├── navbar.tsx           # Responsive navbar
│   │   └── footer.tsx           # Footer component
│   ├── providers/
│   │   ├── theme-provider.tsx   # Dark/light mode provider
│   │   └── language-provider.tsx# i18n context provider
│   ├── sections/
│   │   ├── hero.tsx             # Landing hero section
│   │   └── stats.tsx            # Statistics section
│   └── ui/
│       ├── product-card.tsx     # Animated product card
│       ├── auction-timer.tsx    # Live countdown timer
│       ├── ai-pricing.tsx       # AI analysis component
│       └── sidebar-filters.tsx  # Advanced filters
├── lib/
│   ├── types.ts                 # TypeScript interfaces
│   └── i18n/
│       └── dictionaries.ts      # Bilingual translations
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies

```

## 🎨 Design System

### Colors
- **Primary**: Emerald (#059669) - Sustainability and growth
- **Gradients**: Smooth transitions from primary to complementary colors
- **Dark Mode**: Slate-based palette for comfortable viewing

### Typography
- **Arabic**: Cairo (Google Fonts)
- **English**: Inter (Google Fonts)
- **Sizing**: Responsive with `text-xs` to `text-5xl`

### Animations
- **Framer Motion**: Page transitions and hover effects
- **Custom Keyframes**: Scan animation, float effect, pulse
- **Transitions**: Smooth cubic-bezier timing

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: next-themes
- **Package Manager**: npm

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Environment Setup

The app runs on `http://localhost:3000` by default.

## 🎯 Key Components

### 1. **Navbar**
- Sticky navigation with logo
- Language and theme toggles
- Authentication state management
- Mobile hamburger menu with animations

### 2. **AI Pricing Analysis**
- Scanning animation during analysis
- Glassmorphism background effects
- Price comparison with market average
- Confidence score visualization
- Smart recommendations

### 3. **Sidebar Filters**
- Categories, price ranges, conditions
- Auction-only toggle
- Mobile drawer with backdrop
- Desktop sticky sidebar

### 4. **Auction Timer**
- Real-time countdown
- Progress bar visualization
- Automatic formatting (days, hours, minutes)
- Animated pulse effect

### 5. **Multi-Step Form** (Sell Page)
- Step 1: Drag-and-drop image upload
- Step 2: Basic product information
- Step 3: Description and publishing
- Progress indicator
- Form validation

### 6. **Product Card**
- Hover animations (lift effect)
- Image lazy loading
- Auction badge overlay
- Quick add to cart

### 7. **Trust Score** (Profile)
- Animated progress bar
- Percentage visualization
- Color-coded (green = high trust)

## 🌍 Internationalization (i18n)

### Implementation
- Dictionary-based approach in `lib/i18n/dictionaries.ts`
- Context provider for language state
- Automatic RTL/LTR switching
- Fallback support

### Usage
```tsx
const { dict, locale, isRtl, toggleLanguage } = useLanguage();
<p>{dict.hero.title}</p>
```

## 🎨 Styling Best Practices

### Tailwind Classes
- **Spacing**: Consistent `p-4`, `gap-6`, `mb-8`
- **Rounded**: `rounded-xl` for cards, `rounded-full` for badges
- **Shadows**: `shadow-lg`, `shadow-xl` for depth
- **Dark Mode**: Always use `dark:` variants

### Component Structure
```tsx
<motion.div
  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700"
>
  {/* Content */}
</motion.div>
```

## 🚦 Development Guidelines

1. **TypeScript**: Always define interfaces for props
2. **Accessibility**: Include `aria-label` for icon buttons
3. **Performance**: Use `next/image` for optimized images
4. **SEO**: Metadata in `layout.tsx` and individual pages
5. **Mobile-First**: Start with mobile breakpoints, scale up

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Tablets */
md: 768px   /* Small laptops */
lg: 1024px  /* Desktops */
xl: 1280px  /* Large screens */
2xl: 1536px /* Extra large */
```

## 🔧 Customization

### Adding New Pages
1. Create folder in `app/`
2. Add `page.tsx` with default export
3. Include Navbar and Footer
4. Update navigation links

### Adding New Components
1. Create in appropriate folder (`ui/`, `layout/`, `sections/`)
2. Use TypeScript interfaces
3. Add Framer Motion where appropriate
4. Follow naming convention (kebab-case for files)

### Adding Translations
1. Edit `lib/i18n/dictionaries.ts`
2. Add to both `ar` and `en` objects
3. Use in components via `useLanguage()` hook

## 🎯 Future Enhancements

- [ ] Real authentication with JWT/OAuth
- [ ] Backend API integration
- [ ] WebSocket for live auctions
- [ ] Payment gateway integration
- [ ] Image upload to cloud storage (S3, Cloudinary)
- [ ] Search with Algolia/Elasticsearch
- [ ] Push notifications
- [ ] Chat system between buyers/sellers
- [ ] Admin dashboard

## 📄 License

This project is a graduation project for Egypt University - 2024

## 👥 Contributors

RefurbAI Team

---

**Built with ❤️ for a sustainable future in Egypt 🇪🇬**
