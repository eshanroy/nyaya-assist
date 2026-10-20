
import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  Scale,
  ArrowLeft,
  FileText,
  RefreshCw,
  AlertCircle,
  ListChecks,
  MessageCircleQuestion,
  Send,
  Bot,
  UserRound,
  BookOpen,
} from 'lucide-react'
import api from '../api/client'
import LegalTimeline from './LegalTimeline'
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
    summary: 'సారాంశ',
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
            {renderValue(item, language, `${key}-${index}`)}
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

function ClassificationCard({ classification, analysis }) {
  const details = classification || {}

  const fields = [
    ['Document Type', details.document_type],
    ['Case Type', details.case_type || analysis?.case_type],
    ['Police Station', details.police_station],
    ['Court', details.court],
    ['FIR Number', details.fir_number],
    ['Date of FIR', details.date_of_fir],
  ]

  return (
    <section
      id="classification"
      className="case-details-card case-feature-card"
    >
      <h2>
        <FileText size={20} />
        Document Type &amp; Classification
      </h2>

      <div className="case-classification-grid">
        {fields.map(([label, value]) => (
          <div className="case-classification-field" key={label}>
            <span>{label}</span>
            <strong>
              {value && String(value).trim()
                ? value
                : 'Not specified'}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}

function NextStepsCard({ nextSteps }) {
  const steps = Array.isArray(nextSteps)
    ? nextSteps
    : typeof nextSteps === 'string' && nextSteps.trim()
      ? [nextSteps]
      : []

  return (
    <section
      id="next-steps"
      className="case-details-card case-feature-card"
    >
      <h2>
        <ListChecks size={20} />
        Next Steps / What You Can Do
      </h2>

      {steps.length > 0 ? (
        <ol className="case-next-steps">
          {steps.map((step, index) => (
            <li key={`step-${index}`}>
              {typeof step === 'string'
                ? step
                : renderValue(step, 'english', `step-${index}`)}
            </li>
          ))}
        </ol>
      ) : (
        <p>
          Next steps are not available for this saved case.
          Re-analyze the document to generate recommendations.
        </p>
      )}

      <p className="case-details-disclaimer">
        These are AI-generated suggestions, not a substitute for
        advice from a qualified lawyer.
      </p>
    </section>
  )
}

function FAQsCard({ faqs }) {
  const questions = Array.isArray(faqs) ? faqs : []

  return (
    <section
      id="faqs"
      className="case-details-card case-feature-card"
    >
      <h2>
        <MessageCircleQuestion size={20} />
        FAQs (AI Generated)
      </h2>

      {questions.length > 0 ? (
        <div className="case-faq-list">
          {questions.map((faq, index) => {
            const question =
              typeof faq === 'string'
                ? faq
                : faq?.question || `Question ${index + 1}`

            const answer =
              typeof faq === 'object' && faq !== null
                ? faq.answer
                : ''

            return (
              <details
                className="case-faq-item"
                key={`faq-${index}`}
              >
                <summary>{question}</summary>
                <div className="case-faq-answer">
                  {answer || 'No answer was provided.'}
                </div>
              </details>
            )
          })}
        </div>
      ) : (
        <p>
          FAQs are not available for this saved case.
          Re-analyze the document to generate case-specific questions.
        </p>
      )}
    </section>
  )
}

function DocumentChat({ caseId, navigate }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion || chatLoading) return

    if (trimmedQuestion.length > 2000) {
      setChatError('Please keep your question under 2,000 characters.')
      return
    }

    setChatError('')
    setChatLoading(true)

    try {
      const response = await api.post(
        `/api/cases/${caseId}/chat`,
        { question: trimmedQuestion },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )

      setMessages((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${previous.length}`,
          question: trimmedQuestion,
          answer: response.data.answer,
          sources: Array.isArray(response.data.sources)
            ? response.data.sources
            : [],
        },
      ])

      setQuestion('')
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/signin', { replace: true })
        return
      }

      setChatError(
        err.response?.data?.detail ||
          'Unable to answer your question. Please try again.'
      )
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <section id="document-chat" className="case-details-card case-feature-card">
      <h2>
        <MessageCircleQuestion size={20} />
        Chat with Your Document
      </h2>

      <p className="document-chat-intro">
        Ask questions about this document. NyayaAssist will use relevant
        passages from the uploaded document to help answer you.
      </p>

      <div className="document-chat-disclaimer">
        AI-generated explanations may be incomplete. Verify important
        information with the original document or a qualified lawyer.
      </div>

      {messages.length === 0 && (
        <div className="document-chat-empty">
          <Bot size={25} />
          <p>
            Try asking: “What date was the FIR filed?” or
            “Who is mentioned in this document?”
          </p>
        </div>
      )}

      {messages.length > 0 && (
        <div className="document-chat-messages" aria-live="polite">
          {messages.map((message) => (
            <article className="document-chat-exchange" key={message.id}>
              <div className="document-chat-question">
                <UserRound size={18} />
                <div>
                  <strong>You</strong>
                  <p>{message.question}</p>
                </div>
              </div>

              <div className="document-chat-answer">
                <Bot size={19} />
                <div className="document-chat-answer-content">
                  <strong>NyayaAssist AI</strong>
                  <p className="document-chat-answer-text">
                    {message.answer}
                  </p>
                </div>
              </div>

              {message.sources.length > 0 && (
                <details className="document-chat-sources">
                  <summary>
                    <BookOpen size={16} />
                    View source passages ({message.sources.length})
                  </summary>

                  <div className="document-chat-source-list">
                    {message.sources.map((source, index) => (
                      <div
                        className="document-chat-source"
                        key={`${message.id}-source-${source.source ?? index}`}
                      >
                        <strong>
                          Source {source.source ?? index + 1}
                        </strong>
                        <p>{source.excerpt}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </article>
          ))}
        </div>
      )}

      {chatError && (
        <div className="document-chat-error" role="alert">
          <AlertCircle size={17} />
          <span>{chatError}</span>
        </div>
      )}

      <form className="document-chat-form" onSubmit={handleSubmit}>
        <label htmlFor="document-chat-question">
          Your question
        </label>

        <textarea
          id="document-chat-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask something about this legal document..."
          rows={3}
          maxLength={2000}
          disabled={chatLoading}
          required
        />

        <div className="document-chat-form-footer">
          <span>{question.length}/2000 characters</span>

          <button
            type="submit"
            disabled={chatLoading || !question.trim()}
          >
            {chatLoading ? (
              <>
                <RefreshCw size={16} className="case-details-spinner" />
                Thinking...
              </>
            ) : (
              <>
                <Send size={16} />
                Ask question
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}

export default function CaseDetails() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

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

  useEffect(() => {
    if (loading || !caseData || !location.hash) return

    const sectionId = decodeURIComponent(location.hash.slice(1))

    if (
      ![
        'classification',
        'next-steps',
        'faqs',
        'document-chat',
        'legal-timeline',
      ].includes(sectionId)
    ) {
      return
    }

    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 250)

    return () => window.clearTimeout(timer)
  }, [loading, caseData, location.hash, translatedAnalysis])

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
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/signin', { replace: true })
        return
      }

      setTranslationError(
        err.response?.data?.detail ||
          'Unable to translate this analysis. Please try again.'
      )
    } finally {
      setTranslating(false)
    }
  }

  const isTranslated =
    language !== 'english' && translatedAnalysis !== null

  const analysis = isTranslated
    ? translatedAnalysis
    : caseData?.analysis && typeof caseData.analysis === 'object'
      ? caseData.analysis
      : caseData

  const labels = SECTION_LABELS[language] || SECTION_LABELS.english
  const summary = analysis?.summary || caseData?.summary || ''
  const classification = analysis?.document_classification
  const nextSteps = analysis?.next_steps
  const faqs = analysis?.faqs

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
    'document_classification',
    'next_steps',
    'faqs',
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
              {analysis?.case_type ? ` · ${analysis.case_type}` : ''}
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
              <p>{summary || 'No summary is available.'}</p>
            </section>

            {preferredSections.map((key) => {
              const items = analysis?.[key]

              if (items === undefined || items === null) {
                return null
              }

              return (
                <section className="case-details-card" key={key}>
                  <h2>{formatLabel(key, language)}</h2>
                  {renderValue(items, language, key) || (
                    <p>No information available.</p>
                  )}
                </section>
              )
            })}

            {additionalSections.map((key) => (
              <section className="case-details-card" key={key}>
                <h2>{formatLabel(key, language)}</h2>
                {renderValue(analysis[key], language, key) || (
                  <p>No information available.</p>
                )}
              </section>
            ))}

            <ClassificationCard
              classification={classification}
              analysis={analysis}
            />

            <NextStepsCard nextSteps={nextSteps} />

            <FAQsCard faqs={faqs} />

            <LegalTimeline caseId={caseId} navigate={navigate} />

            <DocumentChat caseId={caseId} navigate={navigate} />
          </>
        )}
      </main>
    </div>
  )
}
