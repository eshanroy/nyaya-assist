from fastapi import FastAPI

from app.api.upload import router as upload_router
from app.api.cases import router as cases_router
from app.database.database import Base, engine
from app.database import models


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="NyayaAssist",
    description="AI-Based Legal Document Analysis and Case Tracking System",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to NyayaAssist API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "NyayaAssist backend is running"
    }


app.include_router(
    upload_router,
    prefix="/api",
    tags=["Document Upload"]
)


app.include_router(
    cases_router,
    prefix="/api",
    tags=["Cases"]
)