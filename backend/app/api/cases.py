
import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import Case
from app.api.auth import get_current_user
from app.services.translation_service import translate_analysis


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def parse_json_field(value, default):
    """Safely read JSON fields, including older or empty records."""
    if not value:
        return default

    try:
        parsed = json.loads(value)
        return parsed if parsed is not None else default
    except (json.JSONDecodeError, TypeError):
        return default


def serialize_case(case):
    """Return all stored analysis fields for a case."""
    return {
        "id": case.id,
        "filename": case.filename,
        "summary": case.summary,
        "case_type": case.case_type,
        "people_involved": parse_json_field(
            case.people_involved, []
        ),
        "locations": parse_json_field(
            case.locations, []
        ),
        "important_dates": parse_json_field(
            case.important_dates, []
        ),
        "legal_sections": parse_json_field(
            case.legal_sections, []
        ),
        "document_classification": parse_json_field(
            case.document_classification, {}
        ),
        "next_steps": parse_json_field(
            case.next_steps, []
        ),
        "faqs": parse_json_field(
            case.faqs, []
        ),
    }


class TranslationRequest(BaseModel):
    language: str


# Get only the logged-in user's cases
@router.get("/cases")
def get_all_cases(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    cases = db.query(Case).filter(
        Case.user_id == current_user.id
    ).all()

    return [serialize_case(case) for case in cases]


# Get one of the logged-in user's cases
@router.get("/cases/{case_id}")
def get_case_by_id(
    case_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == current_user.id,
    ).first()

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    return serialize_case(case)


# Translate one of the logged-in user's cases
@router.post("/cases/{case_id}/translate")
def translate_case(
    case_id: int,
    request: TranslationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == current_user.id,
    ).first()

    if not case:
        raise HTTPException(
            status_code=404,
            detail="Case not found",
        )

    try:
        analysis = serialize_case(case)

        translated_analysis = translate_analysis(
            analysis,
            request.language,
        )

        return {
            "case_id": case.id,
            "filename": case.filename,
            "language": request.language,
            "translated_analysis": translated_analysis,
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except (json.JSONDecodeError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="Stored case data could not be read.",
        )
