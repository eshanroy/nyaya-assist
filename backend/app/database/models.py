
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database.database import Base


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)

    # Original extracted document text for RAG-based chat
    document_text = Column(Text)

    # Existing AI analysis fields
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
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)

    case_id = Column(
        Integer,
        ForeignKey("cases.id"),
        nullable=False,
        index=True,
    )

    event_date = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False, default="")
    source_excerpt = Column(Text, nullable=True)

    # False until a user verifies the event
    is_verified = Column(Integer, nullable=False, default=0)
