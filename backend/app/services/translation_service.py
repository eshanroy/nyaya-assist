
import json
import time

from app.services.ai_service import client


SUPPORTED_LANGUAGES = {
    "english": "English",
    "hindi": "Hindi",
    "kannada": "Kannada",
    "telugu": "Telugu",
}

MODEL = "openai/gpt-oss-20b"
MAX_ATTEMPTS = 3
BATCH_SIZE = 15


def _translate_batch(texts: list[str], language: str) -> list[str]:
    """Translate a small batch of strings without changing its length."""

    if not texts:
        return []

    prompt = f"""
Translate every text value below into {language}.

Rules:
- Return a JSON array of strings with exactly {len(texts)} elements.
- Translate every descriptive sentence, phrase, heading, and label.
- Preserve names, addresses, dates, case IDs, FIR/LR numbers,
  statutory references and other identifiers accurately.
- Translate explanations surrounding identifiers where appropriate.
- Do not omit, combine, reorder, or duplicate any item.
- Keep each translated string in the same array position.
- Return valid JSON only, without Markdown fences.

Input:
{json.dumps(texts, ensure_ascii=False)}

Output:
"""

    last_error = None

    for attempt in range(MAX_ATTEMPTS):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"You are a professional translator into {language}. "
                            "Translate every supplied text value accurately. "
                            "Return only a valid JSON array of strings."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.1,
                max_tokens=4096,
            )

            if not response.choices:
                raise ValueError("The AI returned no response.")

            choice = response.choices[0]

            if getattr(choice, "finish_reason", None) == "length":
                raise ValueError("The translation response was truncated.")

            result = choice.message.content

            if not result:
                raise ValueError("The AI returned an empty translation.")

            result = result.strip()

            if result.startswith("```"):
                lines = result.splitlines()
                if lines and lines[0].strip().startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                result = "\n".join(lines).strip()

            translated = json.loads(result)

            if (
                not isinstance(translated, list)
                or len(translated) != len(texts)
                or not all(isinstance(item, str) for item in translated)
            ):
                raise ValueError(
                    "The AI returned an incomplete translation batch."
                )

            return translated

        except Exception as exc:
            last_error = exc

            if attempt < MAX_ATTEMPTS - 1:
                time.sleep(1.0 * (attempt + 1))

    raise ValueError(
        f"Unable to translate a text batch into {language}. "
        "Please try again."
    ) from last_error


def _collect_strings(value, path=()):
    """Collect every non-empty string and its path in the JSON tree."""

    collected = []

    if isinstance(value, dict):
        for key, child in value.items():
            # JSON keys are intentionally preserved.
            collected.extend(
                _collect_strings(child, path + (key,))
            )

    elif isinstance(value, list):
        for index, child in enumerate(value):
            collected.extend(
                _collect_strings(child, path + (index,))
            )

    elif isinstance(value, str) and value.strip():
        collected.append((path, value))

    return collected


def _set_path(value, path, replacement):
    """Replace a string at its original path."""

    current = value

    for part in path[:-1]:
        current = current[part]

    current[path[-1]] = replacement


def translate_analysis(analysis: dict, target_language: str) -> dict:
    """
    Translate all string values throughout a structured analysis.
    Preserve keys, identifiers, data types, list order and structure.
    """

    if not isinstance(analysis, dict):
        raise ValueError("The case analysis must be a JSON object.")

    target_language = target_language.lower().strip()

    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            "Unsupported language. Choose English, Hindi, Kannada, or Telugu."
        )

    if target_language == "english":
        return analysis

    language = SUPPORTED_LANGUAGES[target_language]

    # Work on a copy so the saved original analysis is not modified.
    translated_analysis = json.loads(
        json.dumps(analysis, ensure_ascii=False)
    )

    strings = _collect_strings(translated_analysis)

    if not strings:
        return translated_analysis

    # Translate only the string values. This prevents the model from
    # dropping fields or rebuilding the JSON structure incorrectly.
    for start in range(0, len(strings), BATCH_SIZE):
        batch = strings[start:start + BATCH_SIZE]
        original_texts = [text for _, text in batch]

        translated_texts = _translate_batch(original_texts, language)

        for (path, _), translated_text in zip(batch, translated_texts):
            _set_path(
                translated_analysis,
                path,
                translated_text,
            )

    return translated_analysis
