import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Scale,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react'
import api from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import translations from '../context/translations'
import './UploadPage.css'

const UPLOAD_TEXT = {
  english: {
    heading: 'Upload a legal document',
    description: 'Upload a PDF to extract its text and generate a structured AI-powered case analysis.',
    back: 'Dashboard',
    kicker: 'DOCUMENT ANALYSIS',
    choose: 'Choose your PDF file',
    browse: 'Click to browse or drag and drop here',
    limit: 'PDF only · Maximum file size 10 MB',
    remove: 'Remove',
    submit: 'Upload and analyze',
    loading: 'Analyzing document...',
    success: 'Document analyzed successfully!',
    caseId: 'Case ID',
    extracted: 'characters extracted',
    result: 'ANALYSIS RESULT',
    summary: 'Summary',
    noSummary: 'No summary was returned.',
    caseType: 'Case type',
    unspecified: 'Not specified',
    people: 'People involved',
    locations: 'Locations',
    dates: 'Important dates',
    sections: 'Legal sections',
    none: 'None provided.',
    return: 'Return to dashboard',
    chooseError: 'Choose a PDF file before uploading.',
    fileError: 'Please select a PDF file.',
    sizeError: 'The PDF must not exceed 10 MB.',
    uploadError: 'Upload failed. Please try again.',
    connectionError: 'Cannot connect to the backend. Check that it is running.',
  },
  hindi: {
    heading: 'कानूनी दस्तावेज़ अपलोड करें',
    description: 'टेक्स्ट निकालने और AI से केस विश्लेषण तैयार करने के लिए PDF अपलोड करें।',
    back: 'डैशबोर्ड',
    kicker: 'दस्तावेज़ विश्लेषण',
    choose: 'अपनी PDF फ़ाइल चुनें',
    browse: 'फ़ाइल चुनने के लिए क्लिक करें या यहाँ खींचकर छोड़ें',
    limit: 'केवल PDF · अधिकतम आकार 10 MB',
    remove: 'हटाएँ',
    submit: 'अपलोड करें और विश्लेषण करें',
    loading: 'दस्तावेज़ का विश्लेषण हो रहा है...',
    success: 'दस्तावेज़ का सफलतापूर्वक विश्लेषण हुआ!',
    caseId: 'केस ID',
    extracted: 'अक्षर निकाले गए',
    result: 'विश्लेषण परिणाम',
    summary: 'सारांश',
    noSummary: 'कोई सारांश उपलब्ध नहीं है।',
    caseType: 'केस का प्रकार',
    unspecified: 'निर्दिष्ट नहीं',
    people: 'शामिल लोग',
    locations: 'स्थान',
    dates: 'महत्वपूर्ण तिथियाँ',
    sections: 'कानूनी धाराएँ',
    none: 'कोई जानकारी उपलब्ध नहीं।',
    return: 'डैशबोर्ड पर वापस जाएँ',
    chooseError: 'अपलोड करने से पहले PDF फ़ाइल चुनें।',
    fileError: 'कृपया PDF फ़ाइल चुनें।',
    sizeError: 'PDF का आकार 10 MB से अधिक नहीं होना चाहिए।',
    uploadError: 'अपलोड विफल हुआ। कृपया पुनः प्रयास करें।',
    connectionError: 'बैकएंड से कनेक्ट नहीं हो पा रहा है। जाँचें कि वह चालू है।',
  },
  kannada: {
    heading: 'ಕಾನೂನು ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    description: 'ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಲು ಮತ್ತು AI ಮೂಲಕ ಪ್ರಕರಣದ ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಲು PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    back: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    kicker: 'ದಾಖಲೆ ವಿಶ್ಲೇಷಣೆ',
    choose: 'ನಿಮ್ಮ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ',
    browse: 'ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆದು ಬಿಡಿ',
    limit: 'PDF ಮಾತ್ರ · ಗರಿಷ್ಠ ಗಾತ್ರ 10 MB',
    remove: 'ತೆಗೆದುಹಾಕಿ',
    submit: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ವಿಶ್ಲೇಷಿಸಿ',
    loading: 'ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    success: 'ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ!',
    caseId: 'ಪ್ರಕರಣ ID',
    extracted: 'ಅಕ್ಷರಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗಿದೆ',
    result: 'ವಿಶ್ಲೇಷಣೆಯ ಫಲಿತಾಂಶ',
    summary: 'ಸಾರಾಂಶ',
    noSummary: 'ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ.',
    caseType: 'ಪ್ರಕರಣದ ಪ್ರಕಾರ',
    unspecified: 'ನಿರ್ದಿಷ್ಟಪಡಿಸಿಲ್ಲ',
    people: 'ಸಂಬಂಧಪಟ್ಟ ವ್ಯಕ್ತಿಗಳು',
    locations: 'ಸ್ಥಳಗಳು',
    dates: 'ಪ್ರಮುಖ ದಿನಾಂಕಗಳು',
    sections: 'ಕಾನೂನು ವಿಧಿಗಳು',
    none: 'ಯಾವುದೇ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.',
    return: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    chooseError: 'ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಮೊದಲು PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.',
    fileError: 'ದಯವಿಟ್ಟು PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.',
    sizeError: 'PDF ಗಾತ್ರ 10 MB ಮೀರಬಾರದು.',
    uploadError: 'ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    connectionError: 'ಬ್ಯಾಕೆಂಡ್‌ಗೆ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ಅದು ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.',
  },
  telugu: {
    heading: 'చట్టపరమైన పత్రాన్ని అప్‌లోడ్ చేయండి',
    description: 'టెక్స్ట్‌ను వెలికితీసి AI ద్వారా కేసు విశ్లేషణ పొందడానికి PDF అప్‌లోడ్ చేయండి.',
    back: 'డాష్‌బోర్డ్',
    kicker: 'పత్ర విశ్లేషణ',
    choose: 'మీ PDF ఫైల్‌ను ఎంచుకోండి',
    browse: 'బ్రౌజ్ చేయడానికి క్లిక్ చేయండి లేదా ఫైల్‌ను ఇక్కడికి లాగి వదలండి',
    limit: 'PDF మాత్రమే · గరిష్ఠ పరిమాణం 10 MB',
    remove: 'తొలగించు',
    submit: 'అప్‌లోడ్ చేసి విశ్లేషించండి',
    loading: 'పత్రాన్ని విశ్లేషిస్తోంది...',
    success: 'పత్రం విజయవంతంగా విశ్లేషించబడింది!',
    caseId: 'కేసు ID',
    extracted: 'అక్షరాలు వెలికితీయబడ్డాయి',
    result: 'విశ్లేషణ ఫలితం',
    summary: 'సారాంశం',
    noSummary: 'సారాంశం అందుబాటులో లేదు.',
    caseType: 'కేసు రకం',
    unspecified: 'పేర్కొనలేదు',
    people: 'సంబంధిత వ్యక్తులు',
    locations: 'ప్రదేశాలు',
    dates: 'ముఖ్యమైన తేదీలు',
    sections: 'చట్టపరమైన సెక్షన్లు',
    none: 'సమాచారం అందుబాటులో లేదు.',
    return: 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి',
    chooseError: 'అప్‌లోడ్ చేయడానికి ముందు PDF ఫైల్‌ను ఎంచుకోండి.',
    fileError: 'దయచేసి PDF ఫైల్‌ను ఎంచుకోండి.',
    sizeError: 'PDF పరిమాణం 10 MB మించకూడదు.',
    uploadError: 'అప్‌లోడ్ విఫలమైంది. మళ్లీ ప్రయత్నించండి.',
    connectionError: 'బ్యాకెండ్‌కు కనెక్ట్ కాలేకపోతున్నాం. అది నడుస్తోందో లేదో తనిఖీ చేయండి.',
  },
}

export default function UploadPage() {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = { ...(translations[language] || translations.english), ...UPLOAD_TEXT[language] || UPLOAD_TEXT.english }

  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  function selectFile(selectedFile) {
    setError('')
    setResult(null)

    if (!selectedFile) return

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setFile(null)
      setError(t.fileError)
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null)
      setError(t.sizeError)
      return
    }

    setFile(selectedFile)
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (!file) {
      setError(t.chooseError)
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': undefined,
        },
      })

      setResult(response.data)
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail

      if (status === 401) {
        localStorage.removeItem('access_token')
        navigate('/signin', { replace: true })
        return
      }

      let message = t.uploadError

      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        message = detail
          .map((item) => `${item.loc?.join('.') || 'Request'}: ${item.msg}`)
          .join(' | ')
      } else if (!err.response) {
        message = t.connectionError
      }

      setError(status ? `Error ${status}: ${message}` : message)
    } finally {
      setLoading(false)
    }
  }

  const analysis = result?.analysis

  return (
    <div className="upload-page">
      <header className="upload-navbar">
        <Link to="/dashboard" className="upload-brand">
          <span className="upload-brand-icon">
            <Scale size={23} />
          </span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>

        <Link to="/dashboard" className="upload-back-link">
          <ArrowLeft size={16} /> {t.back}
        </Link>
      </header>

      <main className="upload-main">
        <div className="upload-heading">
          <span className="upload-kicker">{t.kicker}</span>
          <h1>{t.heading}</h1>
          <p>{t.description}</p>
        </div>

        <form onSubmit={handleUpload}>
          <div
            className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              selectFile(event.dataTransfer.files?.[0])
            }}
          >
            <input
              id="legal-pdf"
              className="upload-file-input"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />

            <label htmlFor="legal-pdf" className="upload-file-label">
              <span className="upload-icon"><Upload size={27} /></span>
              <strong>{t.choose}</strong>
              <span>{t.browse}</span>
              <small>{t.limit}</small>
            </label>
          </div>

          {file && (
            <div className="selected-file">
              <FileText size={22} />
              <div>
                <strong>{file.name}</strong>
                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <button
                type="button"
                className="remove-file"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setError('')
                }}
              >
                {t.remove}
              </button>
            </div>
          )}

          {error && (
            <div className="upload-message upload-error" role="alert">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {result && (
            <div className="upload-message upload-success" role="status">
              <CheckCircle2 size={19} />
              <div>
                <strong>{t.success}</strong>
                <span>{t.caseId}: {result.case_id}</span>
                <span>{result.characters_extracted} {t.extracted}</span>
              </div>
            </div>
          )}

          <button
            className="upload-submit"
            type="submit"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <LoaderCircle className="upload-spinner" size={18} />
                {t.loading}
              </>
            ) : (
              <>
                <Upload size={18} /> {t.submit}
              </>
            )}
          </button>
        </form>

        {analysis && (
          <section className="analysis-result">
            <div className="analysis-result-heading">
              <span className="upload-kicker">{t.result}</span>
              <h2>{result.filename}</h2>
            </div>

            <div className="analysis-result-card">
              <h3>{t.summary}</h3>
              <p>{analysis.summary || t.noSummary}</p>
            </div>

            <div className="analysis-result-card">
              <h3>{t.caseType}</h3>
              <p>{analysis.case_type || t.unspecified}</p>
            </div>

            {[
              [t.people, analysis.people_involved],
              [t.locations, analysis.locations],
              [t.dates, analysis.important_dates],
              [t.sections, analysis.legal_sections],
            ].map(([title, items]) => (
              <div className="analysis-result-card" key={title}>
                <h3>{title}</h3>
                {Array.isArray(items) && items.length > 0 ? (
                  <ul>
                    {items.map((item, index) => (
                      <li key={`${title}-${index}`}>
                        {typeof item === 'string'
                          ? item
                          : JSON.stringify(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{t.none}</p>
                )}
              </div>
            ))}

            <button
              className="upload-secondary-button"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              {t.return}
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
