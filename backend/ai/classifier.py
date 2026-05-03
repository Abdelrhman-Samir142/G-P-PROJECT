"""
YOLO-based image classifier for product categorization.
Uses a custom YOLOv11 model (best.pt) to detect objects in product images
and map them to marketplace categories.
"""

import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Path to the YOLO model
MODEL_PATH = Path(__file__).resolve().parent.parent.parent / 'ai' / 'best.pt'

# Map detected YOLO class names → Arabic category labels
# NOTE: Variants like food_trip / "Food trip" and wardrobe / "Wardrobe" are ALL mapped.
CATEGORY_MAP = {
    # ─── أثاث وديكور (Furniture & Decor) ───
    'bed': 'أثاث وديكور',
    'chair': 'أثاث وديكور',
    'cabinet': 'أثاث وديكور',
    'cupboard': 'أثاث وديكور',
    'curtain': 'أثاث وديكور',
    'lamp': 'أثاث وديكور',
    'mirror': 'أثاث وديكور',
    'sofa': 'أثاث وديكور',
    'table': 'أثاث وديكور',
    'wardrobe': 'أثاث وديكور',
    'Wardrobe': 'أثاث وديكور',
    'Dressing Table': 'أثاث وديكور',
    'food_trip': 'أثاث وديكور',
    'Food trip': 'أثاث وديكور',
    'safe': 'أثاث وديكور',
    'office': 'أثاث وديكور',

    # ─── الكترونيات واجهزه (Electronics & Devices) ───
    'laptop': 'الكترونيات واجهزه',
    'computer': 'الكترونيات واجهزه',
    'mobile_phone': 'الكترونيات واجهزه',
    'phone': 'الكترونيات واجهزه',
    'tv': 'الكترونيات واجهزه',
    'camera': 'الكترونيات واجهزه',
    'headphone': 'الكترونيات واجهزه',
    'airpods': 'الكترونيات واجهزه',
    'speaker': 'الكترونيات واجهزه',
    'receiver': 'الكترونيات واجهزه',
    'router': 'الكترونيات واجهزه',
    'printer': 'الكترونيات واجهزه',
    'keyboard': 'الكترونيات واجهزه',
    'watch': 'الكترونيات واجهزه',
    'controller': 'الكترونيات واجهزه',
    'ps_console': 'الكترونيات واجهزه',
    'pc_case': 'الكترونيات واجهزه',

    # ─── أجهزة منزلية (Home Appliances) ───
    'washing_machine': 'أجهزة منزلية',
    'fridge': 'أجهزة منزلية',
    'refrigerator': 'أجهزة منزلية',
    'cooker': 'أجهزة منزلية',
    'stove': 'أجهزة منزلية',
    'microwave': 'أجهزة منزلية',
    'blender': 'أجهزة منزلية',
    'ac_unit': 'أجهزة منزلية',
    'fan': 'أجهزة منزلية',
    'heater': 'أجهزة منزلية',
    'water_heater': 'أجهزة منزلية',
    'iron': 'أجهزة منزلية',
    'vacuum_cleaner': 'أجهزة منزلية',
    'vacuum cleaner': 'أجهزة منزلية',
    'water_filter': 'أجهزة منزلية',
    'gas_cylinder': 'أجهزة منزلية',
    'gas_bottle': 'أجهزة منزلية',
    'freighter': 'أجهزة منزلية',

    # ─── خورده ومعادن (Scrap & Metals) ───
    'korda': 'خورده ومعادن',
    'scrap_metal': 'خورده ومعادن',
    'copper_wire': 'خورده ومعادن',
    'wire': 'خورده ومعادن',
    'aluminum': 'خورده ومعادن',
    'equipment': 'خورده ومعادن',
    'mator': 'خورده ومعادن',

    # ─── سيارات للبيع (Cars) ───
    'car': 'سيارات للبيع',

    # ─── عقارات (Real Estate) ───
    'building': 'عقارات',

    # ─── كتب (Books) ───
    'book': 'كتب',
}

# Build case-insensitive lookup (lowercase key → original Arabic label)
_CATEGORY_MAP_LOWER = {k.lower(): v for k, v in CATEGORY_MAP.items()}

# Map Arabic category labels → Django model category IDs
ARABIC_TO_CATEGORY_ID = {
    'أثاث وديكور': 'furniture',
    'الكترونيات واجهزه': 'electronics',
    'أجهزة منزلية': 'appliances',
    'خورده ومعادن': 'scrap_metals',
    'سيارات للبيع': 'cars',
    'عقارات': 'real_estate',
    'كتب': 'books',
    'أخرى': 'other',
}

# Human-readable Arabic labels for YOLO classes (for agent target dropdown)
YOLO_CLASS_LABELS = {
    # أثاث
    'bed': 'سرير', 'chair': 'كرسي', 'cabinet': 'خزانة',
    'cupboard': 'دولاب', 'curtain': 'ستارة', 'lamp': 'لمبة / أباجورة',
    'mirror': 'مرآة', 'sofa': 'كنبة', 'table': 'طاولة / ترابيزة',
    'wardrobe': 'دولاب ملابس', 'Wardrobe': 'دولاب ملابس',
    'Dressing Table': 'تسريحة', 'food_trip': 'سفرة', 'Food trip': 'سفرة',
    'safe': 'خزنة',
    # الكترونيات
    'laptop': 'لابتوب', 'computer': 'كمبيوتر',
    'mobile_phone': 'موبايل', 'phone': 'موبايل',
    'tv': 'تلفزيون', 'camera': 'كاميرا',
    'headphone': 'سماعات', 'airpods': 'سماعات إيربودز',
    'speaker': 'سبيكر', 'receiver': 'رسيفر',
    'router': 'راوتر', 'printer': 'طابعة',
    'keyboard': 'كيبورد', 'watch': 'ساعة',
    'controller': 'دراعة تحكم', 'ps_console': 'بلايستيشن',
    'pc_case': 'كيسة كمبيوتر',
    # أجهزة منزلية
    'washing_machine': 'غسالة', 'fridge': 'ثلاجة', 'refrigerator': 'ثلاجة',
    'cooker': 'بوتاجاز', 'stove': 'بوتاجاز',
    'microwave': 'ميكروويف', 'blender': 'خلاط',
    'ac_unit': 'تكييف', 'fan': 'مروحة',
    'heater': 'دفاية', 'water_heater': 'سخان مياه',
    'iron': 'مكواة',
    'vacuum_cleaner': 'مكنسة كهربائية', 'vacuum cleaner': 'مكنسة كهربائية',
    'water_filter': 'فلتر مياه',
    'gas_cylinder': 'أنبوبة غاز', 'gas_bottle': 'أنبوبة غاز',
    'freighter': 'ديب فريزر',
    # خردة
    'korda': 'خردة', 'scrap_metal': 'خردة معادن',
    'copper_wire': 'سلك نحاس', 'wire': 'سلك',
    'aluminum': 'ألومنيوم', 'equipment': 'معدات', 'mator': 'موتور',
    # سيارات
    'car': 'سيارة',
    # عقارات
    'building': 'مبنى', 'office': 'مكتب / أوفيس',
    # كتب
    'book': 'كتاب',
}


def get_available_targets():
    """
    Return a list of all YOLO classes the agent can target,
    grouped by their Arabic category, for the frontend dropdown.
    Deduplicates variant names (e.g. wardrobe/Wardrobe → one entry).
    """
    targets = []
    seen = set()  # track lowercase keys to avoid duplicates
    for class_name, arabic_category in CATEGORY_MAP.items():
        key = class_name.lower().replace(' ', '_')
        if key in seen:
            continue
        seen.add(key)
        label = YOLO_CLASS_LABELS.get(class_name, class_name)
        targets.append({
            'id': class_name,
            'label': f"{label} ({arabic_category})",
            'label_ar': label,
            'category': arabic_category,
        })
    return targets


# Lazy-loaded model instance
_model = None

def guess_item_from_text(text: str) -> str:
    """
    Fallback: If YOLO fails or HF space is down, try to guess the class from the product title.
    Matches Arabic words in the title to the YOLO classes.
    """
    if not text:
        return None
        
    text_lower = text.lower()
    
    # First check exact English keys
    for key in CATEGORY_MAP.keys():
        if key.lower() in text_lower:
            return key
            
    # Then check Arabic labels
    for key, ar_label in YOLO_CLASS_LABELS.items():
        # Split by " / " for labels like 'طاولة / ترابيزة'
        labels = [l.strip() for l in ar_label.split('/')]
        for label in labels:
            if label and label in text_lower:
                return key
                
    return None

def _lookup_category(class_name: str):
    """Case-insensitive category lookup. Returns Arabic label or None."""
    # Try exact match first
    if class_name in CATEGORY_MAP:
        return CATEGORY_MAP[class_name]
    # Try case-insensitive
    return _CATEGORY_MAP_LOWER.get(class_name.lower())


def classify_image(image_path: str) -> dict:
    """
    Run inference on an image via an external Hugging Face Space API.
    Uses gradio_client for robustness.
    """
    from gradio_client import Client, handle_file
    import os

    fallback = {
        'category': 'other',
        'category_label': 'أخرى',
        'confidence': 0.0,
        'detected_class': None,
    }

    try:
        # We can pass the HF space name directly, gradio_client handles URLs
        hf_space_id = os.getenv("HF_SPACE_URL", "Omarh353111/khorda_yolo")
        
        # If the user put a full URL in .env, extract just the namespace/name
        if "hf.space" in hf_space_id:
            # simple fallback if they used full url
            hf_space_id = "Omarh353111/khorda_yolo"
            
        print(f"[AI] 🔗 Connecting to HF Space: {hf_space_id}")
        client = Client(hf_space_id)

        print(f"[AI] 📤 Sending image to Space...")
        # predict returns a tuple: (image_path, text_label) for this specific space
        result = client.predict(
            handle_file(image_path),
            api_name="/predict"
        )
        
        # Extract class name from result tuple/list
        best_class = "other"
        if isinstance(result, tuple) or isinstance(result, list):
            if len(result) >= 2:
                best_class = str(result[1]).strip()
            elif len(result) == 1:
                best_class = str(result[0]).strip()
        elif isinstance(result, str):
            best_class = result.strip()
            
        if not best_class or best_class == "None":
            best_class = "other"

        print(f"[AI] 🔍 Hugging Face API returned YOLO class: '{best_class}'")

        arabic_label = _lookup_category(best_class)

        if not arabic_label:
            logger.warning(f"Unknown class predicted: {best_class}")
            # Try fuzzy match
            for k in CATEGORY_MAP.keys():
                if k.lower() in best_class.lower():
                    arabic_label = CATEGORY_MAP[k]
                    best_class = k
                    break

            if not arabic_label:
                return fallback

        category_id = ARABIC_TO_CATEGORY_ID.get(arabic_label, 'other')
        print(f"[AI] ✅ Result: '{best_class}' → '{arabic_label}' ({category_id})")

        return {
            'category': category_id,
            'category_label': arabic_label,
            'confidence': 0.95,
            'detected_class': best_class,
        }

    except Exception as e:
        logger.error(f"Hugging Face inference error: {e}")
        import traceback
        traceback.print_exc()
        return fallback



