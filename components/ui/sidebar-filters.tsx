'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
    { id: 'electronics', label: 'إلكترونيات', count: 245 },
    { id: 'furniture', label: 'أثاث', count: 182 },
    { id: 'scrap', label: 'خردة', count: 523 },
    { id: 'other', label: 'أخرى', count: 89 },
];

const priceRanges = [
    { id: 'under-1000', label: 'أقل من 1000 ج.م', min: 0, max: 1000 },
    { id: '1000-5000', label: '1000 - 5000 ج.م', min: 1000, max: 5000 },
    { id: '5000-10000', label: '5000 - 10000 ج.م', min: 5000, max: 10000 },
    { id: 'over-10000', label: 'أكثر من 10000 ج.م', min: 10000, max: Infinity },
];

const conditions = [
    { id: 'new', label: 'جديد' },
    { id: 'like-new', label: 'كالجديد' },
    { id: 'good', label: 'جيد' },
    { id: 'fair', label: 'مقبول' },
];

interface SidebarFiltersProps {
    onFilterChange?: (filters: {
        category?: string;
        min_price?: number;
        max_price?: number;
        condition?: string;
        auctions_only?: boolean;
    }) => void;
}

export function SidebarFilters({ onFilterChange }: SidebarFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [showAuctionsOnly, setShowAuctionsOnly] = useState(false);

    // Notify parent of filter changes
    useEffect(() => {
        if (onFilterChange) {
            const priceRange = priceRanges.find(r => r.id === selectedPriceRange);

            const filters: {
                category?: string;
                min_price?: number;
                max_price?: number;
                condition?: string;
                auctions_only?: boolean;
            } = {};

            if (selectedCategories.length > 0) filters.category = selectedCategories[0]; // Take first category
            if (priceRange) {
                filters.min_price = priceRange.min;
                if (priceRange.max !== Infinity) filters.max_price = priceRange.max;
            }
            if (selectedConditions.length > 0) filters.condition = selectedConditions[0]; // Take first condition
            if (showAuctionsOnly) filters.auctions_only = true;

            onFilterChange(filters);
        }
    }, [selectedCategories, selectedPriceRange, selectedConditions, showAuctionsOnly, onFilterChange]);

    const toggleCategory = (id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const toggleCondition = (id: string) => {
        setSelectedConditions((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedPriceRange(null);
        setSelectedConditions([]);
        setShowAuctionsOnly(false);
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-primary" />
                    <h3 className="font-bold text-lg">تصفية النتائج</h3>
                </div>
                <button
                    onClick={clearFilters}
                    className="text-xs text-slate-500 hover:text-primary transition-colors font-semibold"
                >
                    مسح الكل
                </button>
            </div>

            {/* Auctions Only Toggle */}
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <input
                    type="checkbox"
                    id="auctions-only"
                    checked={showAuctionsOnly}
                    onChange={(e) => setShowAuctionsOnly(e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="auctions-only" className="text-sm font-semibold cursor-pointer">
                    المزادات النشطة فقط
                </label>
            </div>

            {/* Categories */}
            <div>
                <h4 className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-300">التصنيفات</h4>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label
                            key={category.id}
                            className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => toggleCategory(category.id)}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                />
                                <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                    {category.label}
                                </span>
                            </div>
                            <span className="text-xs text-slate-400 font-semibold">{category.count}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h4 className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-300">النطاق السعري</h4>
                <div className="space-y-2">
                    {priceRanges.map((range) => (
                        <label
                            key={range.id}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group"
                        >
                            <input
                                type="radio"
                                name="price-range"
                                checked={selectedPriceRange === range.id}
                                onChange={() => setSelectedPriceRange(range.id)}
                                className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {range.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Condition */}
            <div>
                <h4 className="font-bold text-sm mb-3 text-slate-700 dark:text-slate-300">الحالة</h4>
                <div className="space-y-2">
                    {conditions.map((condition) => (
                        <label
                            key={condition.id}
                            className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={selectedConditions.includes(condition.id)}
                                onChange={() => toggleCondition(condition.id)}
                                className="w-4 h-4 text-primary rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                {condition.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <Filter size={18} />
                    تصفية النتائج
                </button>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                <FilterContent />
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 z-50 lg:hidden overflow-y-auto shadow-2xl"
                        >
                            <div className="p-6">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 left-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                                <FilterContent />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
