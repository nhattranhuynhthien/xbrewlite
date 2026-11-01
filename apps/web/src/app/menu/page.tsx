'use client';

import React, { useState, useEffect } from 'react';
import { Search, Flame } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import ProductDetailModal from '../../components/ProductDetailModal';
import SkeletonCard from '../../components/SkeletonCard';
import EmptyState from '../../components/EmptyState';
import ErrorAlert from '../../components/ErrorAlert';
import { apiRequest } from '../../lib/api-client';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  description?: string;
  stock: number;
  isAvailable: boolean;
}

export default function MenuPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const categories = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'COFFEE', label: 'Cà phê' },
    { key: 'TEA', label: 'Trà & Trà sữa' },
    { key: 'SIGNATURE', label: 'Signature' },
  ];

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/products';
      const params: string[] = [];

      if (activeCategory !== 'ALL') {
        params.push(`category=${activeCategory}`);
      }
      if (searchQuery.trim()) {
        params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      }

      if (params.length > 0) {
        endpoint += `?${params.join('&')}`;
      }

      const res = await apiRequest<{ products: ProductItem[]; total: number }>(endpoint);
      setProducts(res.products || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách thực đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMenu();
  };

  return (
    <div className="p-4 pb-6">
      {/* Hero Banner / Promotion Tag */}
      <div className="bg-gradient-to-r from-brew-800 to-brew-600 rounded-3xl p-4 text-white shadow-md mb-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full w-fit mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
              Mã giảm giá hôm nay
            </span>
          </div>
          <h2 className="text-base font-black tracking-tight">Giảm 10% đơn từ 50K</h2>
          <p className="text-[11px] text-brew-100 mt-0.5">Nhập mã <span className="font-extrabold text-white bg-white/20 px-1 rounded">BREW10</span> tại bước thanh toán</p>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm món ngon: Cà phê muối, trà đào..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brew-500 transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </form>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              activeCategory === cat.key
                ? 'bg-brew-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu List & 3 UI States (Loading / Error / Empty) */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorAlert message={error} onRetry={fetchMenu} />
      ) : products.length === 0 ? (
        <EmptyState
          title="Không tìm thấy món phù hợp"
          description="Vui lòng thử tìm từ khóa khác hoặc chọn lại danh mục món."
          actionText="Xem tất cả món"
          onAction={() => {
            setActiveCategory('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-3">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              {...item}
              onSelect={(id) => setSelectedProductId(id)}
            />
          ))}
        </div>
      )}

      {/* Product Detail & Option Modal */}
      <ProductDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
}
