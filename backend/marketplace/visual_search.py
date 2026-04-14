"""
Visual Search Service using Vision LLM + Existing RAG Embeddings.

Flow:
1. Accept an image (file upload)
2. Use Groq Vision (Llama 4 Scout) to generate a text description of the image
3. Embed that text using Gemini text embedding (same model as RAG)
4. Compare with existing ProductEmbedding vectors (already computed for RAG)
5. Return the most similar products

No new model, no GPU, no new embeddings table needed!
Uses the same infrastructure as the existing RAG system.
"""

import os
import logging
import math
import base64
import requests as http_requests

logger = logging.getLogger(__name__)

# Vision model config
GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

VISION_PROMPT = """وصف هذا المنتج بالتفصيل باللغة العربية والإنجليزية. اذكر:
- نوع المنتج (مثل: غسالة، ثلاجة، سيارة، أثاث، خردة، كتاب، لابتوب، إلكترونيات، إلخ)
- الماركة إن وجدت
- الحالة (جديد، مستعمل، إلخ)
- اللون والحجم
- أي تفاصيل مميزة

اكتب الوصف في فقرة واحدة مختصرة."""


def describe_image(image_bytes: bytes) -> str:
    """
    Use Groq Vision (Llama 4 Scout) to generate a product description from an image.
    Falls back to Gemini if Groq fails.
    """
    # Try Groq first (fast + free)
    try:
        return _describe_with_groq(image_bytes)
    except Exception as e:
        logger.warning(f"[VisualSearch] Groq vision failed: {e}, trying Gemini...")

    # Fallback to Gemini
    try:
        return _describe_with_gemini(image_bytes)
    except Exception as e:
        logger.error(f"[VisualSearch] All vision models failed: {e}")
        raise Exception("فشل تحليل الصورة. يرجى المحاولة مرة أخرى.")


def _describe_with_groq(image_bytes: bytes) -> str:
    """Use Groq's Llama 4 Scout vision model to describe an image."""
    groq_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_key:
        raise ValueError("GROQ_API_KEY not set")

    img_b64 = base64.b64encode(image_bytes).decode()

    response = http_requests.post(
        GROQ_API_URL,
        headers={
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_VISION_MODEL,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": VISION_PROMPT},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/jpeg;base64,{img_b64}"
                    }}
                ]
            }],
            "max_tokens": 300,
        },
        timeout=30,
    )

    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.status_code}")

    description = response.json()["choices"][0]["message"]["content"].strip()
    logger.info(f"[VisualSearch] Groq described image: {description[:80]}...")
    return description


def _describe_with_gemini(image_bytes: bytes) -> str:
    """Fallback: Use Gemini Vision to describe an image."""
    import google.generativeai as genai

    api_key = os.environ.get("GEMINI_API_KEY", "")
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.0-flash")
    img_b64 = base64.b64encode(image_bytes).decode()

    response = model.generate_content([
        VISION_PROMPT,
        {"mime_type": "image/jpeg", "data": img_b64}
    ])

    description = response.text.strip()
    logger.info(f"[VisualSearch] Gemini described image: {description[:80]}...")
    return description


def search_by_image(image_bytes: bytes, top_k: int = 12):
    """
    Full visual search pipeline:
    1. Describe image with Vision LLM
    2. Embed description with Gemini text embedding
    3. Compare with stored ProductEmbedding vectors
    4. Return top_k similar products with scores + AI description
    """
    from rag.embeddings import generate_query_embedding
    from rag.models import ProductEmbedding

    # Step 1: Describe the image
    description = describe_image(image_bytes)
    logger.info(f"[VisualSearch] Image description: {description[:100]}")

    # Step 2: Embed the description (same model as RAG queries)
    query_vector = generate_query_embedding(description)
    logger.info(f"[VisualSearch] Query embedding generated: {len(query_vector)} dims")

    # Step 3: Compare with all product embeddings
    all_embeddings = ProductEmbedding.objects.select_related(
        'product', 'product__owner', 'product__owner__profile'
    ).prefetch_related('product__images').all()

    scored = []
    for emb in all_embeddings:
        try:
            score = cosine_similarity(query_vector, emb.embedding)
            scored.append((emb.product, score))
        except Exception as e:
            logger.warning(f"[VisualSearch] Skipping product #{emb.product_id}: {e}")
            continue

    # Sort by similarity (highest first)
    scored.sort(key=lambda x: x[1], reverse=True)

    return scored[:top_k], description


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
