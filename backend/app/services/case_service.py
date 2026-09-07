import json

from app.database.database import SessionLocal
from app.database.models import Case


def save_case(filename: str, analysis: dict):
    db = SessionLocal()

    try:
        new_case = Case(
            filename=filename,
            summary=analysis.get("summary", ""),
            case_type=analysis.get("case_type", ""),
            people_involved=json.dumps(
                analysis.get("people_involved", [])
            ),
            locations=json.dumps(
                analysis.get("locations", [])
            ),
            important_dates=json.dumps(
                analysis.get("important_dates", [])
            ),
            legal_sections=json.dumps(
                analysis.get("legal_sections", [])
            )
        )

        db.add(new_case)
        db.commit()
        db.refresh(new_case)

        return new_case

    finally:
        db.close()