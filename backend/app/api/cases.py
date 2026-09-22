import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database.database import SessionLocal
from app.database.models import Case
from app.services.translation_service import translate_analysis


router = APIRouter()


# Request model for translation
class TranslationRequest(BaseModel):
    language: str


# Get all cases
@router.get("/cases")
def get_all_cases():

    db = SessionLocal()

    try:
        cases = db.query(Case).all()

        result = []

        for case in cases:
            result.append({
                "id": case.id,
                "filename": case.filename,
                "summary": case.summary,
                "case_type": case.case_type,
                "people_involved": json.loads(case.people_involved),
                "locations": json.loads(case.locations),
                "important_dates": json.loads(case.important_dates),
                "legal_sections": json.loads(case.legal_sections)
            })

        return result

    finally:
        db.close()


# Get a specific case by ID
@router.get("/cases/{case_id}")
def get_case_by_id(case_id: int):

    db = SessionLocal()

    try:
        case = db.query(Case).filter(Case.id == case_id).first()

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        return {
            "id": case.id,
            "filename": case.filename,
            "summary": case.summary,
            "case_type": case.case_type,
            "people_involved": json.loads(case.people_involved),
            "locations": json.loads(case.locations),
            "important_dates": json.loads(case.important_dates),
            "legal_sections": json.loads(case.legal_sections)
        }

    finally:
        db.close()


# Translate a case analysis
@router.post("/cases/{case_id}/translate")
def translate_case(
    case_id: int,
    request: TranslationRequest
):

    db = SessionLocal()

    try:

        # Find the case
        case = db.query(Case).filter(
            Case.id == case_id
        ).first()

        if not case:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        # Reconstruct the stored analysis
        analysis = {
            "summary": case.summary,
            "case_type": case.case_type,
            "people_involved": json.loads(
                case.people_involved
            ),
            "locations": json.loads(
                case.locations
            ),
            "important_dates": json.loads(
                case.important_dates
            ),
            "legal_sections": json.loads(
                case.legal_sections
            )
        }

        # Translate the analysis
        translated_analysis = translate_analysis(
            analysis,
            request.language
        )

        return {
            "case_id": case.id,
            "filename": case.filename,
            "language": request.language,
            "translated_analysis": translated_analysis
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()