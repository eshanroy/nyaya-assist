
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Scale,
  ArrowLeft,
  FileText,
  Upload,
  RefreshCw,
  AlertCircle,
  FolderOpen,
} from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import './StoredCases.css'

const STORED_TEXT = {
  english: {
    back: 'Dashboard',
    kicker: 'YOUR WORKSPACE',
    heading: 'Stored Cases',
    description: 'Revisit your saved legal document analyses.',
    upload: 'Upload document',
    case: 'case',
    cases: 'cases',
    saved: 'saved',
    loading: 'Loading your stored cases...',
    retry: 'Try again',
    empty: 'No stored cases yet',
    emptyDescription: 'Upload a legal PDF to create your first case analysis.',
    firstUpload: 'Upload your first document',
    legalDocument: 'Legal document',
    noSummary: 'No summary is available for this saved case.',
    readMore: 'Read more',
    readLess: 'Read less',
    open: 'Open analysis',
    unable: 'Unable to load stored cases. Please try again.',
  },
  hindi: {
    back: 'डैशबोर्ड',
    kicker: 'आपका कार्यक्षेत्र',
    heading: 'सहेजे गए केस',
    description: 'अपने सहेजे गए कानूनी दस्तावेज़ों के विश्लेषण फिर से देखें।',
    upload: 'दस्तावेज़ अपलोड करें',
    case: 'केस',
    cases: 'केस',
    saved: 'सहेजे गए',
    loading: 'आपके सहेजे गए केस लोड हो रहे हैं...',
    retry: 'पुनः प्रयास करें',
    empty: 'अभी कोई केस सहेजा नहीं गया है',
    emptyDescription: 'अपना पहला केस विश्लेषण बनाने के लिए कानूनी PDF अपलोड करें।',
    firstUpload: 'अपना पहला दस्तावेज़ अपलोड करें',
    legalDocument: 'कानूनी दस्तावेज़',
    noSummary: 'इस सहेजे गए केस का सारांश उपलब्ध नहीं है।',
    readMore: 'और पढ़ें',
    readLess: 'कम पढ़ें',
    open: 'विश्लेषण खोलें',
    unable: 'सहेजे गए केस लोड नहीं हो सके। कृपया पुनः प्रयास करें।',
  },
  kannada: {
    back: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    kicker: 'ನಿಮ್ಮ ಕಾರ್ಯಕ್ಷೇತ್ರ',
    heading: 'ಉಳಿಸಿದ ಪ್ರಕರಣಗಳು',
    description: 'ಉಳಿಸಿದ ಕಾನೂನು ದಾಖಲೆಗಳ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಮತ್ತೆ ವೀಕ್ಷಿಸಿ.',
    upload: 'ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    case: 'ಪ್ರಕರಣ',
    cases: 'ಪ್ರಕರಣಗಳು',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    loading: 'ಉಳಿಸಿದ ಪ್ರಕರಣಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    empty: 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಕರಣಗಳನ್ನು ಉಳಿಸಿಲ್ಲ',
    emptyDescription: 'ನಿಮ್ಮ ಮೊದಲ ಪ್ರಕರಣದ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಕಾನೂನು PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    firstUpload: 'ನಿಮ್ಮ ಮೊದಲ ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    legalDocument: 'ಕಾನೂನು ದಾಖಲೆ',
    noSummary: 'ಉಳಿಸಿದ ಈ ಪ್ರಕರಣದ ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ.',
    readMore: 'ಇನ್ನಷ್ಟು ಓದಿ',
    readLess: 'ಕಡಿಮೆ ಓದಿ',
    open: 'ವಿಶ್ಲೇಷಣೆ ತೆರೆಯಿರಿ',
    unable: 'ಉಳಿಸಿದ ಪ್ರಕರಣಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
  telugu: {
    back: 'డాష్‌బోర్డ్',
    kicker: 'మీ కార్యస్థలం',
    heading: 'సేవ్ చేసిన కేసులు',
    description: 'మీరు సేవ్ చేసిన చట్టపరమైన పత్రాల విశ్లేషణలను మళ్లీ చూడండి.',
    upload: 'పత్రాన్ని అప్‌లోడ్ చేయండి',
    case: 'కేసు',
    cases: 'కేసులు',
    saved: 'సేవ్ చేయబడ్డాయి',
    loading: 'సేవ్ చేసిన కేసులు లోడ్ అవుతున్నాయి...',
    retry: 'మళ్లీ ప్రయత్నించండి',
    empty: 'ఇంకా కేసులు సేవ్ చేయలేదు',
    emptyDescription: 'మీ మొదటి కేసు విశ్లేషణ కోసం చట్టపరమైన PDF అప్‌లోడ్ చేయండి.',
    firstUpload: 'మీ మొదటి పత్రాన్ని అప్‌లోడ్ చేయండి',
    legalDocument: 'చట్టపరమైన పత్రం',
    noSummary: 'ఈ సేవ్ చేసిన కేసుకు సారాంశం అందుబాటులో లేదు.',
    readMore: 'మరింత చదవండి',
    readLess: 'తక్కువ చదవండి',
    open: 'విశ్లేషణను తెరవండి',
    unable: 'సేవ్ చేసిన కేసులను లోడ్ చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి.',
  },
}

export default function StoredCases() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedSection = searchParams.get('section')

  const validSections = ['classification', 'next-steps', 'faqs']
  const targetSection = validSections.includes(requestedSection)
    ? requestedSection
    : null

  const { language } = useLanguage()
  const t = STORED_TEXT[language] || STORED_TEXT.english

  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCases() {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('access_token')
      const response = await api.get('/api/cases', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data
      setCases(Array.isArray(data) ? data : data.cases || [])
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        navigate('/signin', { replace: true })
        return
      }

      setError(err.response?.data?.detail || t.unable)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCases()
  }, [])

  function getAnalysis(item) {
    return {
      summary: item.summary || '',
      case_type: item.case_type || '',
      people_involved: item.people_involved || [],
      locations: item.locations || [],
      important_dates: item.important_dates || [],
      legal_sections: item.legal_sections || [],
      document_classification: item.document_classification || {},
      next_steps: item.next_steps || [],
      faqs: item.faqs || [],
    }
  }

  function openCase(item) {
    const id = item.id ?? item.case_id
    if (id === undefined || id === null) return

    const hash = targetSection ? `#${targetSection}` : ''
    navigate(`/cases/${id}${hash}`)
  }

  return (
    <div className="stored-page">
      <header className="stored-navbar">
        <Link to="/dashboard" className="stored-brand">
          <span className="stored-brand-icon">
            <Scale size={23} />
          </span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>

        <Link to="/dashboard" className="stored-back-link">
          <ArrowLeft size={16} /> {t.back}
        </Link>
      </header>

      <main className="stored-main">
        <div className="stored-heading-row">
          <div className="stored-heading">
            <span className="stored-kicker">{t.kicker}</span>
            <h1>{t.heading}</h1>
            <p>{t.description}</p>

            {targetSection && (
              <p>
                Select a case to open its{' '}
                {targetSection === 'classification'
                  ? 'Document Type & Classification'
                  : targetSection === 'next-steps'
                    ? 'Next Steps'
                    : 'FAQs'}{' '}
                section.
              </p>
            )}
          </div>

          <Link to="/upload" className="stored-upload-button">
            <Upload size={17} /> {t.upload}
          </Link>
        </div>

        {!loading && !error && (
          <div className="stored-count">
            <FolderOpen size={18} />
            {cases.length}{' '}
            {cases.length === 1 ? t.case : t.cases} {t.saved}
          </div>
        )}

        {loading && (
          <div className="stored-state">
            <RefreshCw className="stored-spinner" size={25} />
            <p>{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="stored-error" role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button type="button" onClick={loadCases}>
              {t.retry}
            </button>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="stored-empty">
            <span className="stored-empty-icon">
              <FileText size={30} />
            </span>
            <h2>{t.empty}</h2>
            <p>{t.emptyDescription}</p>
            <Link to="/upload" className="stored-upload-button">
              <Upload size={17} /> {t.firstUpload}
            </Link>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="stored-grid">
            {cases.map((item, index) => {
              const analysis = getAnalysis(item)
              const filename =
                item.filename ||
                item.file_name ||
                item.document_name ||
                `Case ${item.id ?? index + 1}`

              return (
                <article
                  className="stored-card"
                  key={item.id ?? item.case_id ?? index}
                >
                  <div className="stored-card-top">
                    <span className="stored-file-icon">
                      <FileText size={23} />
                    </span>
                    <span className="stored-case-id">
                      ID: {item.id ?? item.case_id ?? '—'}
                    </span>
                  </div>

                  <h2 title={filename}>{filename}</h2>

                  <span className="stored-case-type">
                    {analysis.case_type || t.legalDocument}
                  </span>

                  <div className="stored-summary">
                    <p>{analysis.summary || t.noSummary}</p>

                    {analysis.summary &&
                      analysis.summary.length > 160 && (
                        <button
                          type="button"
                          className="stored-read-more"
                          onClick={(event) => {
                            const summary =
                              event.currentTarget.previousElementSibling
                            const expanded =
                              event.currentTarget.dataset.expanded === 'true'

                            summary.classList.toggle('expanded', !expanded)
                            event.currentTarget.dataset.expanded =
                              String(!expanded)
                            event.currentTarget.textContent =
                              expanded ? t.readMore : t.readLess
                          }}
                        >
                          {t.readMore}
                        </button>
                      )}
                  </div>

                  <button
                    type="button"
                    className="stored-view-button"
                    onClick={() => openCase(item)}
                  >
                    {targetSection
                      ? `Open ${targetSection === 'classification'
                          ? 'classification'
                          : targetSection === 'next-steps'
                            ? 'next steps'
                            : 'FAQs'}`
                      : t.open}
                    <ArrowLeft size={16} />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
