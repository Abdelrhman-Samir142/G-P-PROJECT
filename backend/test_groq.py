import os
from dotenv import load_dotenv

# Load .env explicitly for the test
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from ai.agent_graph import smart_agent_evaluator

print("TESTING GROQ LLM IN AGENT GRAPH...")
try:
    result = smart_agent_evaluator.invoke({
        "product_title": "غسالة توشيبا 10 كيلو",
        "product_desc": "غسالة فوق اوتوماتيك بحالة جيدة",
        "product_condition": "مستعمل",
        "product_price": "4500",
        "agent_requirements": "عايز غسالة توشيبا 10 كيلو حالتها كويسة"
    })
    print("\n✅ SUCCESS!")
    print(f"Is Match: {result.get('is_match')}")
    print(f"Confidence: {result.get('confidence')}")
    print(f"Reason: {result.get('reason')}")
except Exception as e:
    print("\n❌ ERROR:")
    import traceback
    traceback.print_exc()
