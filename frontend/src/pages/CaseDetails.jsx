
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Scale,
  ArrowLeft,
  FileText,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import api from '../api/client'
import './CaseDetails.css'

const SECTION_LABELS = {
  english: {
    summary: 'Summary',
    case_type: 'Case type',
    people_involved: 'People involved',
    locations: 'Locations',
    important_dates: 'Important dates',
    legal_sections: 'Legal sections',
  },
  hindi: {
    summary: 'सारांश',
    case_type: 'मामले का प्रकार',
    people_involved: 'शामिल व्यक्ति',
    locations: 'स्थान',
    important_dates: 'महत्वपूर्ण तिथियाँ',
    legal_sections: 'कानूनी धाराएँ',
  },
  kannada: {
    summary: 'ಸಾರಾಂಶ',
    case_type: 'ಪ್ರಕರಣದ ಪ್ರಕಾರ',
    people_involved: 'ಸಂಬಂಧಪಟ್ಟ ವ್ಯಕ್ತಿಗಳು',
    locations: 'ಸ್ಥಳಗಳು',
    important_dates: 'ಪ್ರಮುಖ ದಿನಾಂಕಗಳು',
    legal_sections: 'ಕಾನೂನು ವಿಭಾಗಗಳು',
  },
  telugu: {
    summary: 'సారాంశం',
    case_type: 'కేసు రకం',
    people_involved: 'సంబంధిత వ్యక్తులు',
    locations: 'ప్రదేశాలు',
    important_dates: 'ముఖ్యమైన తేదీలు',
    legal_sections: 'చట్టపరమైన విభాగాలు',
  },
}

const LANGUAGE_NAMES = {
  english: 'English',
  hindi: 'Hindi',
  kannada: 'Kannada',
  telugu: 'Telugu',
}

function formatLabel(key, language) {
  const labels = SECTION_LABELS[language] || SECTION_LABELS.english

  if (labels[key]) return labels[key]

  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function renderValue(value, language, key = '') {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value)
  }

  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null

    return (
      <ul>
        {value.map((item, index) => (
          <li key={`${key}-${index}`}>
            {typeof item === 'object' && item !== null
              ? renderValue(item, language, `${key}-${index}`)
              : renderValue(item, language, `${key}-${index}`)}
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(
      ([, item]) =>
        item !== null &&
        item !== undefined &&
        item !== ''
    )

    if (entries.length === 0) return null

    return (
      <div className="case-analysis-nested">
        {entries.map(([childKey, childValue]) => (
          <div
            className="case-analysis-field"
            key={`${key}-${childKey}`}
          >
            <strong>{formatLabel(childKey, language)}:</strong>{' '}
            {renderValue(childValue, language, childKey)}
          </div>
        ))}
      </div>
    )
  }

  return String(value)
}

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('english')
  const [translatedAnalysis, setTranslatedAnalysis] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [translationError, setTranslationError] = useState('')

  useEffect(() => {
    async function loadCase() {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/api/cases/${caseId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        })

        setCaseData(response.data)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token')
          navigate('/signin', { replace: true })
          return
        }

        setError(
          err.response?.data?.detail ||
            'Unable to load this case. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadCase()
  }, [caseId, navigate])

  async function handleTranslate() {
    if (language === 'english') {
      setTranslatedAnalysis(null)
      setTranslationError('')
      return
    }

    setTranslating(true)
    setTranslationError('')
    setTranslatedAnalysis(null)

    try {
      const response = await api.post(
        `/api/cases/${caseId}/translate`,
        { language },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )

      setTranslatedAnalysis(response.data.translated_analysis)
    } catch (err) {
      setTranslationError(
        err.response?.data?.detail ||
          'Unable to translate this analysis. Please try again.'
      )
    } finally {
      setTranslating(false)
    }
  }

  const isTranslated = language !== 'english' && translatedAnalysis !== null

  const analysis = isTranslated
    ? translatedAnalysis
    : caseData?.analysis && typeof caseData.analysis === 'object'
      ? caseData.analysis
      : caseData

  const labels = SECTION_LABELS[language] || SECTION_LABELS.english

  const summary =
    analysis?.summary ||
    caseData?.summary ||
    ''

  const excludedKeys = new Set([
    'id',
    'case_id',
    'user_id',
    'filename',
    'created_at',
    'updated_at',
    'summary',
    'case_type',
    'people_involved',
    'locations',
    'important_dates',
    'legal_sections',
    'analysis',
  ])

  const preferredSections = [
    'people_involved',
    'locations',
    'important_dates',
    'legal_sections',
  ]

  const additionalSections = analysis
    ? Object.keys(analysis).filter(
        (key) => !excludedKeys.has(key) && analysis[key] !== null
      )
    : []

  return (
    <div className="case-details-page">
      <header className="case-details-navbar">
        <Link to="/dashboard" className="case-details-brand">
          <span className="case-details-brand-icon">
            <Scale size={23} />
          </span>
          <span>
            NyayaAssist <strong>AI</strong>
          </span>
        </Link>

        <Link to="/cases" className="case-details-back">
          <ArrowLeft size={16} /> Stored Cases
        </Link>
      </header>

      <main className="case-details-main">
        {loading && (
          <div className="case-details-state">
            <RefreshCw size={25} className="case-details-spinner" />
            <p>Loading case analysis...</p>
          </div>
        )}

        {error && !loading && (
          <div className="case-details-error" role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              type="button"
            >
              Try again
            </button>
          </div>
        )}

        {caseData && !loading && !error && (
          <>
            <span className="case-details-kicker">
              SAVED CASE ANALYSIS
            </span>

            <div className="case-translation-controls">
              <label htmlFor="case-language">
                Translate analysis into
              </label>

              <select
                id="case-language"
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value)
                  setTranslatedAnalysis(null)
                  setTranslationError('')
                }}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi (हिन्दी)</option>
                <option value="kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="telugu">Telugu (తెలుగు)</option>
              </select>

              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating}
              >
                {translating
                  ? 'Translating...'
                  : language === 'english'
                    ? 'Show English Analysis'
                    : 'Translate Analysis'}
              </button>
            </div>

            {translationError && (
              <p role="alert" className="case-translation-error">
                {translationError}
              </p>
            )}

            <h1>{caseData.filename || `Case ${caseData.id}`}</h1>

            <p className="case-details-subtitle">
              Case ID: {caseData.id}
              {analysis?.case_type
                ? ` · ${analysis.case_type}`
                : ''}
            </p>

            {isTranslated && (
              <div className="case-details-translation-heading">
                <h2>
                  Translated Analysis ({LANGUAGE_NAMES[language]})
                </h2>
              </div>
            )}

            <section className="case-details-card">
              <h2>
                <FileText size={20} /> {labels.summary}
              </h2>
              <p>
                {summary || 'No summary is available.'}
              </p>
            </section>

            {preferredSections.map((key) => {
              const items = analysis?.[key]

              if (items === undefined || items === null) {
                return null
              }

              return (
                <section
                  className="case-details-card"
                  key={key}
                >
                  <h2>{formatLabel(key, language)}</h2>
                  {renderValue(items, language, key) || (
                    <p>No information available.</p>
                  )}
                </section>
              )
            })}

            {additionalSections.map((key) => (
              <section
                className="case-details-card"
                key={key}
              >
                <h2>{formatLabel(key, language)}</h2>
                {renderValue(analysis[key], language, key) || (
                  <p>No information available.</p>
                )}
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
