
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import (
    analyze_document,
    extract_timeline_events,
)
from app.services.case_service import save_case
from app.database.database import SessionLocal
from app.database.models import TimelineEvent


router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
PDF_SIGNATURE = b"%PDF-"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed.",
            )

        content = await file.read(MAX_FILE_SIZE + 1)

        if not content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="PDF file size must not exceed 10 MB.",
            )

        if not content.startswith(PDF_SIGNATURE):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid PDF file.",
            )

        await file.seek(0)
        extracted_text = await extract_text_from_pdf(file)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF.",
            )

        analysis = analyze_document(extracted_text)

        saved_case = save_case(
            filename=file.filename or "uploaded.pdf",
            analysis=analysis,
            user_id=current_user.id,
            document_text=extracted_text,
        )

        # Generate timeline events after the case has been saved.
        # If extraction fails, keep the uploaded case available.
        timeline_events_created = 0
        timeline_error = None

        try:
            events = extract_timeline_events(extracted_text)

            for item in events:
                event = TimelineEvent(
                    case_id=saved_case.id,
                    event_date=item["event_date"],
                    title=item["title"],
                    description=item.get("description", ""),
                    source_excerpt=item["source_excerpt"],
                    is_verified=0,
                )
                db.add(event)

            db.commit()
            timeline_events_created = len(events)

        except Exception as exc:
            db.rollback()
            timeline_error = type(exc).__name__
            print(
                "Automatic timeline extraction failed: "
                f"{type(exc).__name__}: {exc}"
            )

        return {
            "case_id": saved_case.id,
            "filename": file.filename or "uploaded.pdf",
            "characters_extracted": len(extracted_text),
            "analysis": analysis,
            "timeline_events_created": timeline_events_created,
            "timeline_generation_status": (
                "completed" if timeline_error is None else "failed"
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"PDF upload failed: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the uploaded PDF.",
        )

    finally:
        await file.close()
