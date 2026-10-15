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

    result = []

    for case in cases:
        result.append({
            "id": case.id,
            "filename": case.filename,
            "summary": case.summary,
            "case_type": case.case_type,
            "people_involved": json.loads(case.people_involved or "[]"),
            "locations": json.loads(case.locations or "[]"),
            "important_dates": json.loads(case.important_dates or "[]"),
            "legal_sections": json.loads(case.legal_sections or "[]"),
        })

    return result


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
        raise HTTPException(status_code=404, detail="Case not found")

    return {
        "id": case.id,
        "filename": case.filename,
        "summary": case.summary,
        "case_type": case.case_type,
        "people_involved": json.loads(case.people_involved or "[]"),
        "locations": json.loads(case.locations or "[]"),
        "important_dates": json.loads(case.important_dates or "[]"),
        "legal_sections": json.loads(case.legal_sections or "[]"),
    }


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
        raise HTTPException(status_code=404, detail="Case not found")

    try:
        analysis = {
            "summary": case.summary,
            "case_type": case.case_type,
            "people_involved": json.loads(case.people_involved or "[]"),
            "locations": json.loads(case.locations or "[]"),
            "important_dates": json.loads(case.important_dates or "[]"),
            "legal_sections": json.loads(case.legal_sections or "[]"),
        }

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
        raise HTTPException(status_code=400, detail=str(e))

    except (json.JSONDecodeError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="Stored case data could not be read.",
        )
