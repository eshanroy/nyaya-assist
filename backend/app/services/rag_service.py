
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 900
CHUNK_OVERLAP = 150
TOP_K = 4

_model = None


def get_embedding_model():
    """Load the embedding model once per backend process."""
    global _model

    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)

    return _model


def chunk_document(text: str) -> list[str]:
    """Split document text into overlapping chunks."""
    text = text.strip()

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + CHUNK_SIZE, len(text))
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        if end >= len(text):
            break

        start = end - CHUNK_OVERLAP

    return chunks


def retrieve_relevant_chunks(
    document_text: str,
    question: str,
    top_k: int = TOP_K,
) -> list[dict]:
    """
    Retrieve semantically relevant chunks from one document.

    The index is created from the supplied document only and is
    discarded after the request. No shared index is used.
    """
    if not document_text or not document_text.strip():
        return []

    if not question or not question.strip():
        return []

    chunks = chunk_document(document_text)

    if not chunks:
        return []

    model = get_embedding_model()

    document_vectors = model.encode(
        chunks,
        convert_to_numpy=True,
        normalize_embeddings=True,
    ).astype("float32")

    question_vector = model.encode(
        [question],
        convert_to_numpy=True,
        normalize_embeddings=True,
    ).astype("float32")

    index = faiss.IndexFlatIP(document_vectors.shape[1])
    index.add(document_vectors)

    count = min(max(top_k, 1), len(chunks))
    scores, indices = index.search(question_vector, count)

    results = []

    for score, index_position in zip(scores[0], indices[0]):
        if index_position < 0:
            continue

        results.append(
            {
                "chunk": chunks[int(index_position)],
                "relevance_score": float(score),
                "chunk_index": int(index_position),
            }
        )

    return results
