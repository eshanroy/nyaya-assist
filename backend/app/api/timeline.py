
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import SessionLocal
from app.database.models import Case, TimelineEvent


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TimelineEventCreate(BaseModel):
    event_date: date
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    source_excerpt: str | None = Field(default=None, max_length=5000)
    is_verified: bool = False


class TimelineEventUpdate(BaseModel):
    event_date: date
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    source_excerpt: str | None = Field(default=None, max_length=5000)
    is_verified: bool = False


def get_owned_case(db: Session, case_id: int, user_id: int):
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == user_id,
    ).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return case


def serialize_event(event: TimelineEvent):
    return {
        "id": event.id,
        "case_id": event.case_id,
        "event_date": event.event_date,
        "title": event.title,
        "description": event.description,
        "source_excerpt": event.source_excerpt,
        "is_verified": bool(event.is_verified),
    }


@router.get("/cases/{case_id}/timeline")
def list_timeline_events(
    case_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    get_owned_case(db, case_id, current_user.id)

    events = db.query(TimelineEvent).filter(
        TimelineEvent.case_id == case_id
    ).all()

    events.sort(key=lambda event: (event.event_date, event.id))
    return [serialize_event(event) for event in events]


@router.post("/cases/{case_id}/timeline")
def create_timeline_event(
    case_id: int,
    request: TimelineEventCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    get_owned_case(db, case_id, current_user.id)

    event = TimelineEvent(
        case_id=case_id,
        event_date=request.event_date.isoformat(),
        title=request.title.strip(),
        description=request.description.strip(),
        source_excerpt=request.source_excerpt,
        is_verified=int(request.is_verified),
    )

    if not event.title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")

    db.add(event)
    db.commit()
    db.refresh(event)

    return serialize_event(event)


@router.put("/cases/{case_id}/timeline/{event_id}")
def update_timeline_event(
    case_id: int,
    event_id: int,
    request: TimelineEventUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    get_owned_case(db, case_id, current_user.id)

    event = db.query(TimelineEvent).filter(
        TimelineEvent.id == event_id,
        TimelineEvent.case_id == case_id,
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Timeline event not found")

    title = request.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be empty")

    event.event_date = request.event_date.isoformat()
    event.title = title
    event.description = request.description.strip()
    event.source_excerpt = request.source_excerpt
    event.is_verified = int(request.is_verified)

    db.commit()
    db.refresh(event)

    return serialize_event(event)


@router.delete("/cases/{case_id}/timeline/{event_id}")
def delete_timeline_event(
    case_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    get_owned_case(db, case_id, current_user.id)

    event = db.query(TimelineEvent).filter(
        TimelineEvent.id == event_id,
        TimelineEvent.case_id == case_id,
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Timeline event not found")

    db.delete(event)
    db.commit()

    return {"message": "Timeline event deleted successfully"}
