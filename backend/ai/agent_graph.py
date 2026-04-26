import os
from typing import TypedDict
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END

# Define Schema for LLM output
class EvaluationResult(BaseModel):
    is_match: bool = Field(description="True if the product matches the agent's requirements, False otherwise.")
    confidence: str = Field(description="Confidence level: high, medium, or low")
    reason: str = Field(description="One sentence explaining why it matches or doesn't")

# Define Graph State
class AgentState(TypedDict):
    product_title: str
    product_desc: str
    product_condition: str
    product_price: str
    agent_requirements: str
    is_match: bool
    confidence: str
    reason: str

def evaluate_node(state: AgentState):
    # Groq model initialization (using llama-3.3-70b-versatile - fast and free)
    api_key = os.environ.get("GROQ_AGENT_API_KEY", "").strip('"').strip("'")
    
    llm = ChatGroq(
        api_key=api_key, 
        model="llama-3.3-70b-versatile",
        temperature=0.1
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a strict product-matching AI agent for "4Sale" - an Egyptian marketplace (سوق مصري للمستعمل والخردة).

Your ONLY job: determine if a listed product SPECIFICALLY matches a user's buying requirements.
Products are in Arabic (Egyptian dialect). Requirements may be in Arabic or English.

STRICT MATCHING RULES:
1. ITEM TYPE: Product must be the SAME type. "غسالة" ≠ "ثلاجة". "لابتوب" ≠ "موبايل".
2. BRAND / MODEL: If user specifies a brand (e.g. "توشيبا", "سامسونج", "HP"), it MUST appear in title or description. Generic items ≠ match.
3. CONDITION: If user says "جديد"/"new" or "مستعمل"/"used", it must match. Contradiction = NO match.
4. PRICE: Product price must be ≤ user's max budget. Unknown price → skeptical.
5. LOCATION: If user specifies a city (القاهرة, الإسكندرية, etc.), product location should match.
6. SPECIFICITY: Match on specific attributes (model, size, color, edition, capacity) if mentioned.
7. DOUBT RULE: Missing, vague, or contradictory info → is_match: false.

EXAMPLES:
- User: "عايز غسالة توشيبا أقل من 5000 جنيه" → Product: "غسالة توشيبا 8 كيلو نص أوتوماتيك" 4500 EGP → ✅ MATCH (brand + price match)
- User: "عايز غسالة توشيبا" → Product: "غسالة ايديال 7 كيلو" → ❌ NO MATCH (wrong brand)
- User: "لابتوب ألعاب" → Product: "لابتوب HP مكتبي" → ❌ NO MATCH (not gaming)
- User: "تلاجة حالة كويسة" → Product: "ثلاجة توشيبا 14 قدم - حالة ممتازة" → ✅ MATCH
- User: "عايز كنبة في القاهرة" → Product: "كنبة مودرن" in الإسكندرية → ❌ NO MATCH (wrong city)

OUTPUT (strict JSON only, no extra text):
{{
  "is_match": true or false,
  "confidence": "high" | "medium" | "low",
  "reason": "سبب واحد بالعربي يوضح ليه طابق أو ما طابقش"
}}
"""),
        ("user", """Product Listing:
- Title: {title}
- Description: {desc}
- Condition: {condition}
- Starting Price: {price} EGP

User's Buying Requirements:
{req}

Does this product specifically match? Reply in JSON only.""")
    ])
    
    # Using LangChain structured output for Groq
    structured_llm = llm.with_structured_output(EvaluationResult)
    chain = prompt | structured_llm
    
    try:
        result = chain.invoke({
            "title": state.get("product_title", ""),
            "desc": state.get("product_desc", ""),
            "condition": state.get("product_condition", ""),
            "price": str(state.get("product_price", "0")),
            "req": state.get("agent_requirements", "")
        })
        return {
            "is_match": result.is_match, 
            "confidence": result.confidence,
            "reason": result.reason
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[AgentGraph] Groq Evaluation Failed: {e}")
        # Default to False for safety
        return {
            "is_match": False, 
            "confidence": "low",
            "reason": f"Fallback due to error: {str(e)}"
        }

# Build LangGraph
graph_builder = StateGraph(AgentState)
graph_builder.add_node("evaluate", evaluate_node)
graph_builder.set_entry_point("evaluate")
graph_builder.add_edge("evaluate", END)

# Compiled Graph instance ready to use
smart_agent_evaluator = graph_builder.compile()
