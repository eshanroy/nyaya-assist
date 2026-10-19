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
    Analyze a legal document and return structured information,
    classification, suggested next steps, and case-specific FAQs.
    """

    prompt = f"""
You are NyayaAssist AI, an assistant that analyzes legal documents.

Analyze the supplied document carefully. It may be an FIR or another
type of legal document.

Return ONLY valid JSON using exactly this structure:

{{
    "summary": "",
    "case_type": "",
    "people_involved": [],
    "locations": [],
    "important_dates": [],
    "legal_sections": [],
    "document_classification": {{
        "document_type": "",
        "case_type": "",
        "police_station": "",
        "court": "",
        "fir_number": "",
        "date_of_fir": ""
    }},
    "next_steps": [],
    "faqs": [
        {{
            "question": "",
            "answer": ""
        }}
    ]
}}

INSTRUCTIONS:

1. SUMMARY
Provide a concise, factual summary of the document.

2. CASE DETAILS
Extract the case type, people involved, locations, important dates,
and legal sections mentioned in the document.
Use arrays for the list fields.

3. DOCUMENT TYPE AND CLASSIFICATION
Identify the document type, such as FIR, complaint, court order,
or other legal document, only when supported by the document.
Extract the case type, police station, court, FIR number, and
date of FIR where available.
If a field is not present or cannot be established, return
"Not specified".
Do not invent missing details.

4. NEXT STEPS
Generate 3 to 5 practical, relevant next steps based on the
document and its procedural context.
Use clear, simple language.
Distinguish suggestions from confirmed facts.
Do not assume that someone is guilty merely because an allegation
has been made.
Do not present uncertain procedural steps as mandatory.
Where appropriate, suggest consulting a qualified lawyer.
Do not guarantee a legal outcome.

5. FAQs
Generate 3 to 5 questions and answers relevant to THIS document.
Questions may cover the document's purpose, recorded allegations,
mentioned legal provisions, and reasonable procedural questions.
Only answer factual questions using information supported by
the document.
For general legal questions, clearly indicate when the answer
depends on additional facts or professional legal advice.
Do not invent hearing dates, bail eligibility, court orders,
or procedural events.
Each FAQ must have "question" and "answer" fields.

6. OUTPUT RULES
Return valid JSON only, without Markdown code fences.
Keep every field in the specified structure.
Use empty arrays when no relevant list information is available.
Do not include any text before or after the JSON.

Document:
{text[:12000]}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.2,
    )

    result = response.choices[0].message.content

    if not result:
        raise ValueError("The AI returned an empty analysis.")

    # Remove accidental Markdown formatting.
    result = result.strip()
    if result.startswith("```"):
        result = result.replace("```json", "", 1)
        result = result.replace("```", "").strip()

    analysis = json.loads(result)

    if not isinstance(analysis, dict):
        raise ValueError("The AI returned an invalid analysis format.")

    # Ensure all expected fields exist even if the model omits one.
    analysis.setdefault("summary", "")
    analysis.setdefault("case_type", "")
    analysis.setdefault("people_involved", [])
    analysis.setdefault("locations", [])
    analysis.setdefault("important_dates", [])
    analysis.setdefault("legal_sections", [])

    analysis.setdefault(
        "document_classification",
        {
            "document_type": "Not specified",
            "case_type": analysis.get("case_type") or "Not specified",
            "police_station": "Not specified",
            "court": "Not specified",
            "fir_number": "Not specified",
            "date_of_fir": "Not specified",
        },
    )

    analysis.setdefault("next_steps", [])
    analysis.setdefault("faqs", [])

    return analysis
