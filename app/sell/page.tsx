'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/components/providers/language-provider';
import { Camera, Sparkles, Upload, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI, authAPI } from '@/lib/api';

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
        category: 'electronics',
        condition: 'good',
        description: '',
        location: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                await authAPI.getCurrentUser();
                setCheckingAuth(false);
            } catch (err) {
                router.push('/login');
            }
        };
        verifyAuth();
    }, [router]);

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
    };

    const removeImage = (index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const validateStep = (currentStep: number) => {
        setError(null);
        if (currentStep === 2) {
            if (!formData.title.trim()) return 'يرجى إدخال اسم المنتج';
            if (!formData.price || Number(formData.price) <= 0) return 'يرجى إدخال سعر صحيح';
            if (!formData.category) return 'يرجى اختيار القسم';
            if (!formData.location.trim()) return 'يرجى إدخال الموقع';
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

        // Final validation
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

            uploadedImages.forEach((file) => {
                formDataToSend.append('uploaded_images', file);
            });

            await productsAPI.create(formDataToSend);
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Error creating product:', err);
            setError(err.message || 'Failed to create product');
            setSubmitting(false);
        }
    };

    if (checkingAuth) {
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
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">{dict.addItem.title}</h2>
                            <div className="flex items-center justify-center gap-2 mt-6">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-2 rounded-full transition-all ${s <= step ? 'w-12 bg-primary' : 'w-8 bg-slate-200 dark:bg-slate-700'}`}
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
                                            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${isDragging ? 'border-primary bg-primary-50 dark:bg-primary-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-primary'}`}
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileInput}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full">
                                                    {isDragging ? <Upload className="text-primary" size={32} /> : <Camera className="text-slate-400" size={32} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold mb-1">{dict.addItem.uploadImages}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">اسحب الصور هنا أو اضغط للاختيار</p>
                                                </div>
                                            </div>
                                        </div>
                                        {imagePreviews.length > 0 && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {imagePreviews.map((img, index) => (
                                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
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
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            disabled={imagePreviews.length === 0}
                                            className="w-full bg-primary hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{dict.addItem.productName}</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder={dict.addItem.productNamePlaceholder}
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{dict.addItem.expectedPrice}</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="٠٠٠"
                                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{dict.addItem.category}</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                                >
                                                    <option value="electronics">{dict.addItem.electronics}</option>
                                                    <option value="furniture">{dict.addItem.furniture}</option>
                                                    <option value="scrap">{dict.addItem.scrap}</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">الموقع</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="مثلاً: القاهرة، مدينة نصر"
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        {error && (
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex-1 border-2 border-slate-300 dark:border-slate-700 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                            >
                                                السابق
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="flex-1 bg-primary hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
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
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">الحالة</label>
                                            <select
                                                value={formData.condition}
                                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                            >
                                                <option value="new">جديد</option>
                                                <option value="like-new">كالجديد</option>
                                                <option value="good">جيد</option>
                                                <option value="fair">مقبول</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">الوصف</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="اكتب وصف مفصل للمنتج..."
                                                rows={5}
                                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 resize-none"
                                            />
                                        </div>
                                        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl flex items-start gap-3 border border-primary-200 dark:border-primary-800">
                                            <Sparkles className="text-primary flex-shrink-0 mt-1" size={20} />
                                            <p className="text-xs text-primary-800 dark:text-primary-300 leading-relaxed">
                                                {dict.addItem.aiNotice}
                                            </p>
                                        </div>
                                        {error && (
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="flex-1 border-2 border-slate-300 dark:border-slate-700 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                            >
                                                السابق
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 bg-primary hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            </main>
            <Footer />
        </>
    );
}
