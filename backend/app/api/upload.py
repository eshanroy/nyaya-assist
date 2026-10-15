
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.api.auth import get_current_user
from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import analyze_document
from app.services.case_service import save_case


router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
PDF_SIGNATURE = b"%PDF-"


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    try:
        # Check the declared file type
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed.",
            )

        # Read at most 10 MB + 1 byte to detect oversized files
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

        # Verify the PDF signature
        if not content.startswith(PDF_SIGNATURE):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid PDF file.",
            )

        # Reset the file position before text extraction
        await file.seek(0)

        extracted_text = await extract_text_from_pdf(file)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF.",
            )

        # Analyze document using AI
        analysis = analyze_document(extracted_text)

        # Save the case under the authenticated user
        saved_case = save_case(
            filename=file.filename or "uploaded.pdf",
            analysis=analysis,
            user_id=current_user.id,
        )

        return {
            "case_id": saved_case.id,
            "filename": file.filename or "uploaded.pdf",
            "characters_extracted": len(extracted_text),
            "analysis": analysis,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the uploaded PDF.",
        )

    finally:
        await file.close()
