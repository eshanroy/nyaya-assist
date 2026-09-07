from pypdf import PdfReader
from fastapi import UploadFile


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text from an uploaded PDF file.
    """

    reader = PdfReader(file.file)

    extracted_text = ""

    for page in reader.pages:
        text = page.extract_text()

        if text:
            extracted_text += text + "\n"

    return extracted_text