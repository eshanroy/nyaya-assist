from sqlalchemy import Column, Integer, String, Text
from app.database.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    summary = Column(Text)

    case_type = Column(String)

    people_involved = Column(Text)

    locations = Column(Text)

    important_dates = Column(Text)

    legal_sections = Column(Text)