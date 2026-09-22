from app.services.translation_service import translate_analysis


analysis = {
    "summary": "Information report regarding a road accident.",
    "case_type": "Road Accident",
    "people_involved": [
        "Mamata Naik"
    ],
    "locations": [
        "Angul, Odisha"
    ],
    "important_dates": [
        "26/08/2022"
    ],
    "legal_sections": [
        "FIR No: 120/2022"
    ]
}


translated = translate_analysis(
    analysis,
    "hindi"
)

print(translated)