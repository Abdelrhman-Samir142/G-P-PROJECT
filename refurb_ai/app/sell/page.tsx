'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Camera, Sparkles, Upload, X, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI, classifyAPI } from '@/lib/api';

export default function SellPage() {
    const router = useRouter();
    const { dict } = useLanguage();
    const [step, setStep] = useState(1);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        condition: 'good',
        description: '',
        location: '',
        phone_number: '',
        is_auction: false,
        auction_end_time: '',
    });
    const { user, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [classifying, setClassifying] = useState(false);
    const [aiCategory, setAiCategory] = useState<{ category: string; category_label: string; confidence: number; detected_class: string | null } | null>(null);

    // Redirect if not authenticated
    if (!authLoading && !user) {
        router.push('/login?redirect=/sell');
        return null;
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
    };

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        setUploadedImages(prev => [...prev, ...imageFiles]);

        imageFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImagePreviews((prev) => [...prev, e.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });

        // Auto-classify the first image uploaded
        if (imageFiles.length > 0 && uploadedImages.length === 0) {
            setClassifying(true);
            setAiCategory(null);
            classifyAPI.classifyImage(imageFiles[0])
                .then((result) => {
                    setAiCategory(result);
                    if (result.category && result.category !== 'other') {
                        setFormData(prev => ({ ...prev, category: result.category }));
                    }
                })
                .catch((err) => {
                    console.error('AI classification failed:', err);
                })
                .finally(() => {
                    setClassifying(false);
                });
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const getCurrentLocalTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    };

    const validateStep = (currentStep: number) => {
        setError(null);
        if (currentStep === 2) {
            if (!formData.title.trim()) return 'يرجى إدخال اسم المنتج';
            if (!formData.price || Number(formData.price) <= 0) return 'يرجى إدخال سعر صحيح';
            if (!formData.category) return 'يرجى اختيار القسم';
            if (!formData.location.trim()) return 'يرجى إدخال الموقع';
            if (!formData.phone_number.trim()) return 'يرجى إدخال رقم الهاتف للتواصل';
            if (formData.is_auction) {
                if (!formData.auction_end_time) return 'يرجى تحديد وقت وتاريخ انتهاء المزاد';
                if (new Date(formData.auction_end_time) <= new Date()) {
                    return 'تاريخ الانتهاء يجب أن يكون في المستقبل';
                }
            }
            return null;
        }
        return null;
    };

    const handleNextStep = () => {
        const stepError = validateStep(step);
        if (stepError) {
            setError(stepError);
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.description.trim()) {
            setError('يرجى إضافة وصف للمنتج');
            return;
        }

        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('phone_number', formData.phone_number);
            formDataToSend.append('is_auction', formData.is_auction.toString());
            if (formData.is_auction && formData.auction_end_time) {
                formDataToSend.append('auction_end_time', new Date(formData.auction_end_time).toISOString());
            }

            uploadedImages.forEach((file) => {
                formDataToSend.append('uploaded_images', file);
            });

            await productsAPI.create(formDataToSend);

            // Redirect based on product type
            if (formData.is_auction) {
                router.push('/auctions');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error('Error creating product:', err);
            setError(err.message || 'حدث خطأ في نشر الإعلان');
            setSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 flex justify-center items-start">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-[var(--color-accent)]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                
                <div className="max-w-3xl mx-auto relative z-10">
                    <div className="glass-surface p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)]/50 shadow-[var(--shadow-glow)]">
                        <div className="mb-8">
                            <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] mb-2 text-center text-[var(--color-text-primary)] tracking-[-0.02em]">{dict.addItem.title}</h2>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-[6px] rounded-full transition-all duration-400 ${s <= step ? 'w-14 gradient-accent shadow-[var(--shadow-glow)]' : 'w-8 bg-[var(--color-border)]'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`relative border-2 border-dashed rounded-[var(--radius-xl)] p-10 text-center transition-all duration-300 ${isDragging ? 'border-[var(--color-accent)] bg-emerald-50/30' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'}`}
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileInput}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-emerald-50/60 p-4 rounded-[var(--radius-lg)]">
                                                    {isDragging ? <Upload className="text-[var(--color-accent)]" size={32} /> : <Camera className="text-[var(--color-text-muted)]" size={32} />}
                                                </div>
                                                <div>
                                                    <p className="font-[700] mb-1 text-[var(--color-text-primary)]">{dict.addItem.uploadImages}</p>
                                                    <p className="text-[13px] text-[var(--color-text-muted)] font-[400]">اسحب الصور هنا أو اضغط للاختيار</p>
                                                </div>
                                            </div>
                                        </div>
                                        {imagePreviews.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {imagePreviews.map((img, index) => (
                                                    <div key={index} className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden group">
                                                        <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {error && (
                                            <div className="p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-[var(--radius-xl)] shadow-[var(--shadow-glow)]">
                                                <p className="text-[var(--color-danger)] text-[13px] font-[700] text-center">{error}</p>
                                            </div>
                                        )}
                                        {classifying && (
                                            <div className="relative overflow-hidden flex items-center justify-center gap-3 p-4 glass-surface border border-[var(--color-accent)]/30 rounded-[var(--radius-xl)] shadow-[var(--shadow-glow)]">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent)]/10 to-transparent animate-[shimmer_2s_infinite]" />
                                                <div className="relative flex items-center gap-3">
                                                    <Loader2 className="animate-spin text-[var(--color-accent)]" size={20} />
                                                    <span className="text-transparent bg-clip-text gradient-accent text-[14px] font-[800] tracking-wide">جاري تحليل الصورة بالذكاء الاصطناعي...</span>
                                                </div>
                                            </div>
                                        )}
                                        {aiCategory && !classifying && (
                                            <div className="relative overflow-hidden flex items-center gap-3 p-4 glass-surface border border-[var(--color-primary)]/40 rounded-[var(--radius-xl)] shadow-[var(--shadow-glow-lg)]">
                                                <div className="absolute inset-0 bg-[var(--color-primary)]/5" />
                                                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)] shadow-[var(--shadow-glow)]">
                                                    <Bot className="text-[var(--color-primary)]" size={20} />
                                                </div>
                                                <div className="relative flex flex-col">
                                                    <span className="text-[var(--color-text-primary)] text-[14px] font-[800]">
                                                        تم التصنيف: {aiCategory.category_label}
                                                    </span>
                                                    <span className="text-[var(--color-primary)] text-[12px] font-[600]">
                                                        دقة الذكاء الاصطناعي: {Math.round(aiCategory.confidence * 100)}%
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            disabled={imagePreviews.length === 0 || classifying}
                                            className="w-full gradient-accent text-white py-4 rounded-[var(--radius-lg)] font-[700] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            التالي
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-2">{dict.addItem.productName}</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder={dict.addItem.productNamePlaceholder}
                                                className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-[var(--color-text-primary)] font-[500] text-[14px]"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-2">{dict.addItem.expectedPrice}</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="٠٠٠"
                                                    className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-[var(--color-text-primary)] font-[500] text-[14px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-2">
                                                    {dict.addItem.category}
                                                    {aiCategory && (
                                                        <span className="mr-2 text-green-600 dark:text-green-400 text-[10px]">🤖 AI</span>
                                                    )}
                                                </label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, category: e.target.value });
                                                    }}
                                                    className={`w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all text-[var(--color-text-primary)] font-[500] text-[14px] border ${aiCategory && formData.category === aiCategory.category
                                                            ? 'border-[var(--color-primary)] shadow-[var(--shadow-glow)]'
                                                            : 'border-[var(--color-border)]'
                                                        }`}
                                                >
                                                    <option value="">اختر التصنيف</option>
                                                    <option value="scrap_metals">خردة ومعادن</option>
                                                    <option value="electronics">إلكترونيات وأجهزة</option>
                                                    <option value="furniture">أثاث وديكور</option>
                                                    <option value="cars">سيارات للبيع</option>
                                                    <option value="real_estate">عقارات</option>
                                                    <option value="books">كتب</option>
                                                    <option value="other">أخرى</option>
                                                </select>
                                            </div>
                                        </div>


                                        {/* Phone Number */}
                                        <div>
                                            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-2">رقم الهاتف للتواصل</label>
                                            <input
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                                placeholder="مثلاً: 010xxxxxxxx"
                                                className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-[var(--color-text-primary)] font-[500] text-[14px]"
                                            />
                                        </div>

                                        {/* Listing Type Toggle */}
                                        <div className="p-5 glass-surface border border-[var(--color-border)]/60 rounded-[var(--radius-xl)] shadow-sm">
                                            <label className="block text-[13px] font-[700] text-[var(--color-text-primary)] mb-3">نوع الإعلان</label>
                                            <div className="flex bg-[var(--color-bg)] p-1 rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, is_auction: false })}
                                                    className={`flex-1 py-2.5 rounded-[var(--radius-md)] text-[13px] font-[800] tracking-wide transition-all ${!formData.is_auction
                                                        ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]'
                                                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                                                        }`}
                                                >
                                                    بيع مباشر
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, is_auction: true })}
                                                    className={`flex-1 py-2.5 rounded-[var(--radius-md)] text-[13px] font-[800] tracking-wide transition-all ${formData.is_auction
                                                        ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]'
                                                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                                                        }`}
                                                >
                                                    مزاد علني
                                                </button>
                                            </div>

                                            {/* Auction Dates */}
                                            {formData.is_auction && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-4"
                                                >
                                                    <div>
                                                        <label className="block text-[12px] font-[700] text-[var(--color-text-secondary)] mb-2">تاريخ ووقت انتهاء المزاد</label>
                                                        <input
                                                            type="datetime-local"
                                                            value={formData.auction_end_time}
                                                            onChange={(e) => setFormData({ ...formData, auction_end_time: e.target.value })}
                                                            min={getCurrentLocalTime()}
                                                            className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all text-[var(--color-text-primary)] font-[600] border border-[var(--color-border)] text-[14px] ltr-input"
                                                        />
                                                        <p className="text-[11px] font-[600] text-[var(--color-text-muted)] mt-2">⏱️ المزاد سيبدأ فوراً بعد نشر الإعلان</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">الموقع</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="مثلاً: القاهرة، مدينة نصر"
                                                className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-[var(--color-text-primary)] font-[500] text-[14px]"
                                            />
                                        </div>
                                        {error && (
                                            <div className="p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-[var(--radius-xl)] shadow-[var(--shadow-glow)]">
                                                <p className="text-[var(--color-danger)] text-[13px] font-[700] text-center">{error}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex-1 border-2 border-[var(--color-border)]/60 bg-[var(--color-surface)] py-4 rounded-[var(--radius-lg)] font-[700] hover:bg-white hover:text-slate-900 transition-all duration-300 text-[var(--color-text-primary)]"
                                            >
                                                السابق
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="flex-1 gradient-accent text-white py-4 rounded-[var(--radius-lg)] font-[700] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)]"
                                            >
                                                التالي
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div>
                                            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-2">الحالة</label>
                                            <select
                                                value={formData.condition}
                                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                                className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all text-[var(--color-text-primary)] font-[500] border border-[var(--color-border)] text-[14px]"
                                            >
                                                <option value="new">جديد</option>
                                                <option value="like-new">كالجديد</option>
                                                <option value="good">جيد</option>
                                                <option value="fair">مقبول</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[12px] font-[600] text-[var(--color-text-secondary)] mb-2">الوصف</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="اكتب وصف مفصل للمنتج..."
                                                rows={5}
                                                className="w-full glass-surface rounded-[var(--radius-lg)] p-3 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all text-[var(--color-text-primary)] font-[500] border border-[var(--color-border)] text-[14px] resize-none"
                                            />
                                        </div>
                                        <div className="relative overflow-hidden p-5 rounded-[var(--radius-xl)] flex items-start gap-4 glass-surface border border-[var(--color-accent)]/20 shadow-[var(--shadow-sm)]">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent pointer-events-none" />
                                            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mt-0.5">
                                                <Sparkles className="text-[var(--color-accent)]" size={18} />
                                            </div>
                                            <div className="relative">
                                                <p className="text-[13px] text-[var(--color-text-secondary)] font-[500] leading-[1.7]">
                                                    {dict.addItem.aiNotice}
                                                </p>
                                            </div>
                                        </div>
                                        {error && (
                                            <div className="p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-[var(--radius-xl)] shadow-[var(--shadow-glow)]">
                                                <p className="text-[var(--color-danger)] text-[13px] font-[700] text-center">{error}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="flex-1 border-2 border-[var(--color-border)]/60 bg-[var(--color-surface)] py-4 rounded-[var(--radius-lg)] font-[700] hover:bg-white hover:text-slate-900 transition-all duration-300 text-[var(--color-text-primary)]"
                                            >
                                                السابق
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 gradient-accent text-white py-4 rounded-[var(--radius-lg)] font-[700] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {submitting && <Loader2 className="animate-spin" size={20} />}
                                                {submitting ? 'جار النشر...' : dict.addItem.publish}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>
            </main >
            <Footer />
        </>
    );
}
