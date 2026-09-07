import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def analyze_document(text: str):
    """
    Analyze a legal document and return structured information.
    """

    prompt = f"""
You are an AI assistant for analyzing legal documents.

Analyze the following document and extract the information in JSON format.

Return ONLY valid JSON in this exact structure:

{{
    "summary": "",
    "case_type": "",
    "people_involved": [],
    "locations": [],
    "important_dates": [],
    "legal_sections": []
}}

Document:
{text[:12000]}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2
    )

    result = response.choices[0].message.content

    # Remove accidental markdown formatting if returned
    result = result.replace("```json", "").replace("```", "").strip()

    return json.loads(result)