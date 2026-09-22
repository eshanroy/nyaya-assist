import io

import pytesseract
import fitz
from PIL import Image
from pypdf import PdfReader
from fastapi import UploadFile


# Tell pytesseract where Tesseract is installed
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text from a PDF.

    First tries normal PDF text extraction using pypdf.
    If no text is found, uses OCR with Tesseract.
    """

    # -----------------------------------------
    # STEP 1: Try normal text extraction
    # -----------------------------------------

    reader = PdfReader(file.file)

    extracted_text = ""

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text += text + "\n"

    # If normal extraction worked, return the text
    if extracted_text.strip():
        return extracted_text


    # -----------------------------------------
    # STEP 2: OCR for scanned PDFs
    # -----------------------------------------

    # Move file pointer back to beginning
    file.file.seek(0)

    pdf_bytes = file.file.read()

    # Open PDF using PyMuPDF
    pdf_document = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )

    ocr_text = ""

    for page in pdf_document:

        # Render PDF page as image
        pix = page.get_pixmap(
            matrix=fitz.Matrix(2, 2)
        )

        # Convert rendered page to PIL image
        image = Image.open(
            io.BytesIO(pix.tobytes("png"))
        )

        # Run OCR
        text = pytesseract.image_to_string(
            image,
            lang="eng"
        )

        if text:
            ocr_text += text + "\n"

    pdf_document.close()

    return ocr_text