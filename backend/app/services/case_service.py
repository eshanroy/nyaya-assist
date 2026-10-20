
import json

from app.database.database import SessionLocal
from app.database.models import Case


def save_case(
    filename: str,
    analysis: dict,
    user_id: int,
    document_text: str = "",
):
    db = SessionLocal()

    try:
        new_case = Case(
            filename=filename,
            document_text=document_text,
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
            ),
            document_classification=json.dumps(
                analysis.get("document_classification", {})
            ),
            next_steps=json.dumps(
                analysis.get("next_steps", [])
            ),
            faqs=json.dumps(
                analysis.get("faqs", [])
            ),
            user_id=user_id,
        )

        db.add(new_case)
        db.commit()
        db.refresh(new_case)

        return new_case

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
