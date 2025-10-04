# Comprehensive Prompt: Transform Standard E-Commerce to AI-First Hybrid Platform

## Project Overview
Transform the current standard e-commerce platform frontend into a revolutionary AI-first hybrid interface that combines intelligent conversational search with strategic discovery features. The platform should prioritize user intent while maintaining browsing capabilities for exploration and inspiration.

---

## Current Tech Stack

### Frontend
- **Framework**: Next.js (React-based)
- **Deployment**: Dockerized with Node.js Alpine
- **Server**: Next.js production server
- **Build**: Optimized static assets with SSR/SSG capabilities

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn ASGI server
- **Port**: 8000
- **Deployment**: Dockerized with Python Slim image

### Database
- **System**: PostgreSQL
- **Deployment**: Official Postgres Docker image
- **Storage**: Persistent volume

### Infrastructure
- **Reverse Proxy**: NGINX
- **SSL**: Let's Encrypt certificates
- **Traffic Routing**: Frontend and backend through NGINX

---

## Core Design Philosophy

### Primary Principle
The search interface is the hero element - prominent, intelligent, and multi-modal. All other UI elements serve to support, enhance, or complement the search experience rather than compete with it.

### User Journey Support
The platform must seamlessly serve three distinct user types:
1. **Task-focused users** - Know exactly what they want, need fast results
2. **Explorers/Browsers** - Want to discover, browse, and be inspired
3. **Uncertain users** - Need guidance and recommendations

---

## Landing Page Architecture

### Layout Structure

#### Primary Element: Intelligent Search Bar
**Positioning**: Center-top of viewport (similar to Google's search prominence)

**Visual Design**:
- Large, clean search input field (minimum 60% viewport width on desktop)
- Rounded corners with subtle shadow for depth
- Placeholder text that rotates through examples: "Search by product name, description, HS code, SKU, or upload an image..."
- Auto-focus on page load for immediate interaction

**Multi-Modal Input Options**:
Integrate the following search modes with clear visual indicators:

1. **Text Search** (default)
   - Natural language processing enabled
   - Support for product names, descriptions, specifications
   - Handle casual language: "blue running shoes" or technical: "ISO 9001 certified industrial bearings"

2. **HS Code Search**
   - Dedicated icon/toggle in search bar
   - Input validation for HS code format (6-10 digits)
   - Auto-suggest HS codes as user types
   - Show category description alongside code

3. **SKU Search**
   - Direct product lookup capability
   - Support for both internal SKUs and manufacturer part numbers
   - Fuzzy matching for slight variations

4. **Image Upload Search**
   - Visual icon (camera/image) within search bar
   - Drag-and-drop zone that appears on hover
   - Support formats: JPG, PNG, WEBP
   - Show image preview before search execution
   - Implement visual similarity matching algorithm

**Search Bar Behavior**:
- As user types, show real-time suggestions dropdown
- Categorize suggestions: Products | Categories | Brands | Popular Searches
- Display thumbnail images next to product suggestions
- Keyboard navigation support (arrow keys, enter to select)
- Clear/reset button (X icon) appears when text is entered

#### Secondary Elements: Discovery Features

**Positioned Below Search Bar** (in order of priority):

**1. Trending Searches Section**
- Horizontal scrollable chips/pills with popular search queries
- Update dynamically based on real-time platform data
- Click any chip to execute that search
- Format: "trending now: wireless earbuds • gaming laptops • yoga mats • smart watches"
- Limit to 8-12 trending items visible at once
- Gentle animation on page load to draw attention

**2. Smart Category Cards** (4-6 cards maximum)
- Grid layout: 2x2 on mobile, 3x2 on tablet, 4-6 in row on desktop
- Each card contains:
  - High-quality hero image
  - Category name
  - Brief tagline (5-7 words max)
  - Subtle hover effect (scale 1.05, shadow increase)
- Categories should be broad enough to encourage exploration
- Examples: "Electronics & Tech" | "Fashion & Apparel" | "Home & Living" | "Sports & Outdoors"

**3. Personalization Module** (for returning users)
- Appears only if user has previous session/account
- Compact horizontal carousel format
- "Welcome back! Based on your interests:"
- Show 4-6 product recommendations with images
- Include "Continue where you left off" if there's abandoned cart/search

**4. AI Shopping Assistant Prompt**
- Subtle, friendly CTA below other elements
- Format: "Not sure what you need? Ask our AI assistant" or "Let me help you find the perfect product"
- Opens conversational interface overlay when clicked
- Icon: friendly chat bubble or sparkle effect

---

## Search Results Page

### Results Display

**Layout**: Grid system that adapts to content and viewport

**Desktop**:
- 4 columns for small products (clothing, accessories)
- 3 columns for medium products (electronics, home goods)
- 2 columns for large products (furniture, appliances)

**Tablet**: 2-3 columns
**Mobile**: 1-2 columns

**Product Card Design**:
Each card contains:
- High-quality product image (square aspect ratio)
- Product name (truncate at 2 lines)
- Price (prominent, bold)
- Star rating + review count if available
- Quick action buttons on hover: "Quick View" | "Add to Cart" | "Compare"
- Wishlist heart icon (top-right corner)
- Badge system: "New" | "Bestseller" | "On Sale" | "Low Stock"

### Conversational Refinement Interface

**Persistent Search Bar at Top**:
- Remains visible as user scrolls (sticky header)
- Shows current search query
- Can be edited to refine search
- Contains search history dropdown (clock icon)

**AI Refinement Panel** (appears contextually):

**Position**: Sidebar on desktop (left or right), collapsible panel on mobile

**Functionality**:
- Analyzes initial search query
- Suggests relevant refinements conversationally
- Example for "running shoes" search:
  ```
  🤖 I found 234 running shoes. Want to narrow it down?
  
  [Terrain Type: Road | Trail | Track]
  [Price Range: Under $50 | $50-$100 | $100-$150 | $150+]
  [Brand: Nike | Adidas | Brooks | New Balance | Show all]
  [Size: US 7 | US 8 | US 9 | US 10 | Other]
  
  Or just tell me: "Show waterproof options" or "Under $100"
  ```

**Natural Language Refinement**:
- Text input box within refinement panel
- User can type: "show me only waterproof ones" or "under $100 from Nike"
- AI processes and updates results immediately
- Shows refinement chain: "Running shoes > Waterproof > Under $100 > Nike"

**Smart Filters**:
- Only show relevant filters based on product category
- Prioritize most commonly used filters for that category
- Collapsible sections to prevent overwhelming
- Show result count next to each filter option
- Multi-select capability with "Apply Filters" button

### Discovery Within Results

**"Related Searches" Section**:
- Horizontal scrollable bar above results
- Format: "People also searched for: trail running shoes | marathon training shoes | minimalist running shoes"
- Click to execute new search

**"Similar Products" Carousel**:
- Appears after scrolling past first 12 results
- "Based on your search, you might also like:"
- Shows 6-8 alternative products in horizontal scroll
- Distinct visual separator from main results

**"Complete The Look" / "Frequently Bought Together"**:
- Appears contextually for applicable products
- Compact module between result rows
- Shows complementary products with bundle discount option

---

## Conversational AI Shopping Assistant

### Overlay Interface

**Activation**:
- Click "AI Assistant" button from any page
- Slide-in panel from right side (desktop) or full-screen modal (mobile)
- Alternatively: persistent floating chat button (bottom-right corner)

**Interface Design**:

**Header**:
- "Shopping Assistant" title
- Close button (X)
- Minimize button (keeps chat accessible but collapsed)

**Chat Area**:
- Clean white/light background
- User messages: right-aligned, colored bubble
- AI messages: left-aligned, different color
- Timestamps (subtle, small text)
- Product cards can be embedded in AI responses
- Support for rich content: images, carousels, quick reply buttons

**Conversational Capabilities**:

1. **Open-Ended Discovery**:
   ```
   User: "I need a gift for my sister"
   AI: "I'd love to help! Tell me a bit about her:
        - What are her interests or hobbies?
        - What's your budget?
        - Any special occasion?
        
        Or choose a category: [Fashion] [Beauty] [Tech] [Home] [Books]"
   ```

2. **Guided Recommendations**:
   ```
   User: "Show me summer dresses"
   AI: "Great! I have 156 summer dresses. Let's find your perfect match:
        
        What's the occasion?
        [Casual] [Work] [Party/Event] [Beach/Vacation]
        
        Meanwhile, here are some popular styles:
        [Shows 4 dress cards with images]"
   ```

3. **Question Answering**:
   ```
   User: "What do I need for camping?"
   AI: "Essential camping gear includes:
        
        🏕️ Shelter: Tent, sleeping bag, sleeping pad
        🔦 Lighting: Headlamp, lantern
        🍳 Cooking: Portable stove, cookware, cooler
        👕 Clothing: Layers, rain gear, hiking boots
        
        Are you:
        [First-time camper] [Experienced] [Backpacking] [Car camping]
        
        I can create a customized list based on your needs!"
   ```

4. **Product Comparison**:
   ```
   User: "Compare iPhone 15 and Samsung S24"
   AI: "Here's a detailed comparison:
        [Shows comparison table with specs, prices, ratings]
        
        Key differences:
        • Camera: Samsung has higher megapixels, iPhone has better video
        • Battery: Samsung lasts longer
        • Ecosystem: iPhone for Apple users, Samsung for flexibility
        
        Which features matter most to you?"
   ```

**Quick Action Buttons**:
- AI can present buttons for common actions
- Examples: [Add to Cart] [Compare Products] [View Similar] [Show Reviews]
- Reduces typing, speeds up shopping flow

**Context Awareness**:
- AI remembers conversation history within session
- References previous questions: "Based on the camping gear we discussed..."
- Can access user's cart, wishlist, order history (with permission)
- Personalization: "I see you usually prefer Nike products"

---

## Enhanced Features

### Visual Search Deep Dive

**Image Upload Flow**:

1. **Upload Interface**:
   - Large dropzone with dashed border
   - "Drag & drop your image here or click to browse"
   - Support for mobile camera capture
   - Image size limit: 10MB

2. **Image Preview & Editing**:
   - Show uploaded image preview
   - Allow crop/zoom to focus on specific product
   - "Search this product" button prominent

3. **Visual Search Results**:
   - "Products similar to your image:"
   - Grid layout with similarity percentage (90% match, 85% match, etc.)
   - Option to refine: "Show exact matches only" vs "Show similar styles"
   - AI describes what it detected: "I found: blue denim jacket with silver buttons"

### Smart Product Discovery Quiz

**Activation**: "Find My Perfect Product" button on homepage or category pages

**Quiz Flow**:
```
Step 1: Category Selection
"What are you shopping for today?"
[Visual cards for major categories]

Step 2: Use Case
"Tell me about how you'll use it:"
[Multiple choice or free text]

Step 3: Preferences
Dynamic questions based on category:
- Budget range (slider)
- Brand preferences
- Feature priorities (rank top 3)
- Style/aesthetic (image selection)

Step 4: Results
"Based on your answers, here are your top matches:"
[Personalized product grid]
[Explanation for each: "This matches your budget and preferred features"]

Option to adjust answers or start over
```

### Advanced Filtering System

**Filter Architecture**:

**Dynamic Filter Generation**:
- Filters appear based on product category
- Hide irrelevant filters (don't show "screen size" for clothing)
- Prioritize filters by usage frequency in category

**Filter Types**:

1. **Range Filters** (Price, Size, Rating):
   - Dual-handle slider for min/max
   - Show distribution histogram
   - Input boxes for precise values

2. **Multi-Select Filters** (Brand, Color, Features):
   - Checkbox groups with search within filter
   - "Show more" button if >10 options
   - Selected filters appear as removable chips

3. **Boolean Filters** (In Stock, Free Shipping, On Sale):
   - Toggle switches
   - Show count of matching products

4. **AI-Powered Smart Filters**:
   - "Best Rated" - sorts by rating and review count
   - "Popular Now" - trending products
   - "Recommended for You" - personalized

**Filter Behavior**:
- Real-time result count updates
- "Apply" button not required (instant filtering)
- "Clear All Filters" link
- Maintain filter state on page refresh
- URL parameters for shareable filtered results

### Search History & Saved Searches

**Search History**:
- Dropdown from search bar (clock icon)
- Shows last 10 searches with timestamps
- Click to re-execute search
- Option to clear history

**Saved Searches**:
- "Save this search" button in results page
- User can name the search
- Set up alerts: "Notify me when new products match this search"
- Accessible from user account/profile
- Email notifications for saved search alerts

---

## Mobile-First Considerations

### Mobile Landing Page

**Simplified Layout**:
- Search bar takes 90% width, centered
- Reduce trending searches to 4-6 chips
- Category cards: 2 columns, larger tap targets
- Simplified AI assistant: bottom sheet instead of sidebar

**Mobile Search Bar**:
- Full-screen search overlay when tapped
- Voice search button (microphone icon)
- Camera button for immediate image search
- Recent searches appear immediately

### Mobile Results Page

**Optimizations**:
- Larger product cards (better thumb interaction)
- Infinite scroll (no pagination)
- Floating "Filter" button (bottom of screen)
- Filters open as bottom sheet modal
- Sticky "Sort by" dropdown at top
- Quick view opens as modal instead of sidebar

### Mobile AI Assistant

**Interface**:
- Full-screen takeover for focused interaction
- Larger text for readability
- Voice input prominent
- Quick reply buttons sized for thumbs
- Minimal typing required

---

## Technical Implementation Requirements - Next.js Frontend

### Project Structure

```
/frontend (Next.js)
├── /app (App Router)
│   ├── layout.tsx (Root layout with providers)
│   ├── page.tsx (Landing page - AI-first search interface)
│   ├── /search
│   │   ├── page.tsx (Search results page with SSR)
│   │   └── loading.tsx (Loading skeleton)
│   ├── /products
│   │   └── [id]
│   │       ├── page.tsx (Product detail page)
│   │       └── loading.tsx
│   ├── /api (API routes for Next.js specific needs)
│   │   ├── /search
│   │   │   └── route.ts (Server-side search proxy)
│   │   └── /upload
│   │       └── route.ts (Image upload handler)
│   └── /assistant (AI assistant dedicated route)
│       └── page.tsx
│
├── /components
│   ├── /search
│   │   ├── SearchBar.tsx
│   │   ├── MultiModalInput.tsx
│   │   ├── SearchSuggestions.tsx
│   │   ├── SearchHistory.tsx
│   │   └── VoiceSearch.tsx
│   ├── /results
│   │   ├── ProductGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── RefinementInterface.tsx
│   │   └── SortOptions.tsx
│   ├── /discovery
│   │   ├── TrendingSearches.tsx
│   │   ├── CategoryCards.tsx
│   │   ├── PersonalizationModule.tsx
│   │   └── DiscoveryQuiz.tsx
│   ├── /ai-assistant
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── QuickActions.tsx
│   │   ├── ProductEmbed.tsx
│   │   └── FloatingButton.tsx
│   ├── /shared
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── LoadingSkeleton.tsx
│   └── /ui (shadcn/ui or custom UI components)
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       └── ... (other UI primitives)
│
├── /lib
│   ├── /api
│   │   ├── client.ts (FastAPI client configuration)
│   │   ├── search.ts (Search API calls)
│   │   ├── products.ts (Product API calls)
│   │   ├── ai.ts (AI assistant API calls)
│   │   └── user.ts (User/auth API calls)
│   ├── /hooks
│   │   ├── useSearch.ts (Custom search hook)
│   │   ├── useDebounce.ts (Debounce for search)
│   │   ├── useInfiniteScroll.ts
│   │   └── useLocalStorage.ts (Search history)
│   ├── /utils
│   │   ├── formatting.ts
│   │   ├── validation.ts
│   │   └── image-processing.ts
│   └── /types
│       ├── product.ts
│       ├── search.ts
│       └── user.ts
│
├── /public
│   ├── /images
│   ├── /icons
│   └── /fonts
│
├── /styles
│   ├── globals.css (Tailwind imports)
│   └── themes.css (Color schemes, variables)
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── Dockerfile
```

### Next.js Specific Configurations

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Server Components
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: [
      'your-cdn-domain.com',
      'localhost'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // API proxy to FastAPI backend
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://backend:8000/:path*', // Docker service name
      },
    ];
  },
  
  // Compression
  compress: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  },
  
  // Production optimizations
  swcMinify: true,
  
  // Experimental features
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CDN_URL

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Key Next.js Features to Implement

#### 1. Server-Side Rendering (SSR) for Search Results
```typescript
// app/search/page.tsx
import { Suspense } from 'react';
import { searchProducts } from '@/lib/api/search';
import ProductGrid from '@/components/results/ProductGrid';
import FilterPanel from '@/components/results/FilterPanel';
import SearchResultsSkeleton from '@/components/shared/LoadingSkeleton';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  
  // Fetch data on server
  const results = await searchProducts({
    query,
    filters: {
      category: searchParams.category,
      minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    },
    page,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64">
          <FilterPanel 
            initialFilters={results.appliedFilters}
            availableFilters={results.availableFilters}
          />
        </aside>
        
        <main className="flex-1">
          <h1 className="text-2xl font-bold mb-4">
            {results.totalCount} results for "{query}"
          </h1>
          
          <Suspense fallback={<SearchResultsSkeleton />}>
            <ProductGrid 
              products={results.products}
              totalCount={results.totalCount}
              currentPage={page}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps) {
  const query = searchParams.q || 'Products';
  
  return {
    title: `${query} - Search Results | Your Store`,
    description: `Find the best ${query} at competitive prices. Browse our wide selection.`,
  };
}
```

#### 2. API Route for Image Upload
```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }
    
    // Convert to buffer and forward to FastAPI backend
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create form data for FastAPI
    const backendFormData = new FormData();
    backendFormData.append('image', new Blob([buffer]), file.name);
    
    // Forward to FastAPI backend
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
    const response = await fetch(`${backendUrl}/api/search/image`, {
      method: 'POST',
      body: backendFormData,
    });
    
    if (!response.ok) {
      throw new Error('Backend image search failed');
    }
    
    const results = await response.json();
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
```

#### 3. Client Component with Real-time Search
```typescript
// components/search/SearchBar.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { searchSuggestions } from '@/lib/api/search';
import SearchSuggestions from './SearchSuggestions';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'hs' | 'sku' | 'image'>('text');
  
  const debouncedQuery = useDebounce(query, 300);
  
  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);
  
  const fetchSuggestions = async (searchQuery: string) => {
    try {
      const results = await searchSuggestions(searchQuery, searchMode);
      setSuggestions(results);
      setIsOpen(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };
  
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      
      if (searchMode !== 'text') {
        params.set('mode', searchMode);
      }
      
      router.push(`/search?${params.toString()}`);
      setIsOpen(false);
    }
  }, [searchMode, router]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };
  
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
          {/* Search mode selector */}
          <div className="flex items-center gap-2 pl-4 pr-2 border-r border-gray-200">
            <button
              type="button"
              onClick={() => setSearchMode('text')}
              className={`p-2 rounded-full ${searchMode === 'text' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Text Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => setSearchMode('image')}
              className={`p-2 rounded-full ${searchMode === 'image' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="Image Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => setSearchMode('hs')}
              className={`p-2 rounded-full ${searchMode === 'hs' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="HS Code Search"
            >
              <span className="text-xs font-semibold">HS</span>
            </button>
            
            <button
              type="button"
              onClick={() => setSearchMode('sku')}
              className={`p-2 rounded-full ${searchMode === 'sku' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              title="SKU Search"
            >
              <span className="text-xs font-semibold">SKU</span>
            </button>
          </div>
          
          {/* Main input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={getPlaceholder(searchMode)}
            className="flex-1 px-6 py-4 text-lg outline-none rounded-full"
            autoComplete="off"
          />
          
          {/* Clear button */}
          {query && (
            <button
              type="button"