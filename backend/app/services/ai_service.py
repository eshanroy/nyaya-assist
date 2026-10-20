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


def extract_timeline_events(text: str):
    """
    Extract dated case events from a legal document.
    Dates and descriptions must be supported by the source text.
    Returned events are suggestions and must remain unverified.
    """
    from datetime import date
    import re

    if not text or not text.strip():
        return []

    prompt = f"""
You are extracting a factual chronology from a legal document.

Return ONLY valid JSON in this exact structure:
{{
  "events": [
    {{
      "event_date": "YYYY-MM-DD",
      "title": "Short factual event title",
      "description": "Concise explanation supported by the document",
      "source_excerpt": "Exact supporting excerpt copied from the document"
    }}
  ]
}}

STRICT RULES:
1. Include only meaningful events related to the case.
2. Include an event only when its date is explicitly supported by the text.
3. Convert a date to YYYY-MM-DD only when its day, month, and year
   are unambiguous. If ambiguous, omit that event.
4. Do not include a person's date of birth, age, document-signing date,
   or other administrative date as a case event unless the document
   explicitly makes it relevant to the case chronology.
5. A report date and an incident date are different events when the
   document distinguishes them. Do not merge them.
6. Do not invent events, dates, people, actions, or outcomes.
7. Preserve allegations as allegations. Do not imply guilt.
8. source_excerpt must be copied verbatim from the supplied text and
   must directly support the event and its date.
9. Do not infer an event solely from a date listed in a personal profile.
10. Avoid duplicate events. Return an empty events array if no suitable
    dated events can be supported.
11. Do not mark events as verified; verification is handled separately.
12. Return JSON only, without Markdown fences or commentary.

Document:
{text[:12000]}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    result = response.choices[0].message.content
    if not result:
        raise ValueError("The AI returned no timeline events.")

    result = result.strip()
    if result.startswith("```"):
        result = re.sub(r"^```(?:json)?\s*", "", result)
        result = re.sub(r"\s*```$", "", result).strip()

    parsed = json.loads(result)
    if not isinstance(parsed, dict):
        raise ValueError("Invalid timeline extraction response.")

    raw_events = parsed.get("events", [])
    if not isinstance(raw_events, list):
        return []

    # Normalize whitespace so quoted excerpts can be checked reliably.
    normalized_document = " ".join(text.split())
    validated_events = []
    seen = set()

    for item in raw_events:
        if not isinstance(item, dict):
            continue

        event_date = str(item.get("event_date", "")).strip()
        title = str(item.get("title", "")).strip()
        description = str(item.get("description", "")).strip()
        excerpt = str(item.get("source_excerpt", "")).strip()

        try:
            parsed_date = date.fromisoformat(event_date)
            if parsed_date.isoformat() != event_date:
                continue
        except (ValueError, TypeError):
            continue

        if not title or not excerpt or len(title) > 200:
            continue

        # Require the cited excerpt to occur in the source document.
        if " ".join(excerpt.split()) not in normalized_document:
            continue

        dedupe_key = (event_date, title.casefold())
        if dedupe_key in seen:
            continue

        seen.add(dedupe_key)
        validated_events.append({
            "event_date": event_date,
            "title": title,
            "description": description[:5000],
            "source_excerpt": excerpt[:5000],
            "is_verified": False,
        })

    return validated_events
