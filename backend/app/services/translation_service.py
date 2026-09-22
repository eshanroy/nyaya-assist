import json

from app.services.ai_service import client


SUPPORTED_LANGUAGES = {
    "english": "English",
    "hindi": "Hindi",
    "kannada": "Kannada",
    "telugu": "Telugu"
}


def translate_analysis(analysis: dict, target_language: str):
    """
    Translate AI-generated case analysis into the requested language.
    """

    target_language = target_language.lower().strip()

    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            "Unsupported language. Choose English, Hindi, Kannada, or Telugu."
        )

    language_name = SUPPORTED_LANGUAGES[target_language]

    # English does not need translation
    if target_language == "english":
        return analysis

    prompt = f"""
You are a professional legal document translation assistant.

Translate the following structured legal case analysis into {language_name}.

IMPORTANT TRANSLATION RULES:

1. Translate all descriptive and explanatory text into {language_name}.
2. Translate the "summary" completely.
3. Translate the "case_type" completely.
4. Translate descriptive location names where appropriate.
5. Preserve people's names exactly as they appear in the original.
6. Preserve FIR numbers exactly as they appear.
7. Preserve LR numbers exactly as they appear.
8. Preserve case/reference numbers exactly as they appear.
9. Preserve dates exactly as they appear.
10. Preserve legal section numbers exactly as they appear.
11. Do not invent or add any information.
12. Do not remove any information.
13. Do not change the meaning of the original information.
14. Keep the exact JSON structure shown below.
15. Return ONLY valid JSON. Do not return Markdown or explanations outside the JSON.

For example:

English:
"case_type": "Road Accident"

Hindi:
"case_type": "सड़क दुर्घटना"

Kannada:
"case_type": "ರಸ್ತೆ ಅಪಘಾತ"

Telugu:
"case_type": "రోడ్డు ప్రమాదం"

Names and identifiers must remain unchanged.

Input analysis:

{json.dumps(analysis, ensure_ascii=False, indent=2)}

Return exactly this JSON structure:

{{
    "summary": "",
    "case_type": "",
    "people_involved": [],
    "locations": [],
    "important_dates": [],
    "legal_sections": []
}}
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

    # Remove accidental Markdown code blocks
    result = result.replace("```json", "").replace("```", "").strip()

    return json.loads(result)