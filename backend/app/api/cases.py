import json

from fastapi import APIRouter
from app.database.database import SessionLocal
from app.database.models import Case

router = APIRouter()


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
            return {
                "message": "Case not found"
            }

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