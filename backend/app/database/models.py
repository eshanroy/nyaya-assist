from sqlalchemy import Column, Integer, String, Text, ForeignKey
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
    document_classification = Column(Text)
    next_steps = Column(Text)
    faqs = Column(Text)

    # Account that owns this case
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
