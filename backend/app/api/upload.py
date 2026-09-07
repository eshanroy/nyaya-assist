from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.pdf_service import extract_text_from_pdf
from app.services.ai_service import analyze_document
from app.services.case_service import save_case

router = APIRouter()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    # Check if uploaded file is a PDF
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    try:
        # Extract text from PDF
        extracted_text = await extract_text_from_pdf(file)

        # Check if text was extracted
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF."
            )

        # Analyze document using AI
        analysis = analyze_document(extracted_text)

        # Save analyzed case in database
        saved_case = save_case(
            filename=file.filename,
            analysis=analysis
        )

        return {
            "case_id": saved_case.id,
            "filename": file.filename,
            "characters_extracted": len(extracted_text),
            "analysis": analysis
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )