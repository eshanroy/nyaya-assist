import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import './StoredCases.css'

export default function StoredCases() {
  const navigate = useNavigate()
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

      setError(
        err.response?.data?.detail ||
          'Unable to load stored cases. Please try again.'
      )
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
  }
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
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </header>

      <main className="stored-main">
        <div className="stored-heading-row">
          <div className="stored-heading">
            <span className="stored-kicker">YOUR WORKSPACE</span>
            <h1>Stored Cases</h1>
            <p>Revisit your saved legal document analyses.</p>
          </div>

          <Link to="/upload" className="stored-upload-button">
            <Upload size={17} /> Upload document
          </Link>
        </div>

        {!loading && !error && (
          <div className="stored-count">
            <FolderOpen size={18} />
            {cases.length} {cases.length === 1 ? 'case' : 'cases'} saved
          </div>
        )}

        {loading && (
          <div className="stored-state">
            <RefreshCw className="stored-spinner" size={25} />
            <p>Loading your stored cases...</p>
          </div>
        )}

        {error && (
          <div className="stored-error" role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button type="button" onClick={loadCases}>Try again</button>
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div className="stored-empty">
            <span className="stored-empty-icon">
              <FileText size={30} />
            </span>
            <h2>No stored cases yet</h2>
            <p>Upload a legal PDF to create your first case analysis.</p>
            <Link to="/upload" className="stored-upload-button">
              <Upload size={17} /> Upload your first document
            </Link>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="stored-grid">
            {cases.map((item, index) => {
              const analysis = getAnalysis(item)
              const filename =
                item.filename || item.file_name || item.document_name ||
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
                    {analysis.case_type || 'Legal document'}
                  </span>

                  
<div className="stored-summary">
  <p>{analysis.summary || 'No summary is available for this saved case.'}</p>

  {analysis.summary && analysis.summary.length > 160 && (
    <button
      type="button"
      className="stored-read-more"
      onClick={(event) => {
        const summary = event.currentTarget.previousElementSibling
        const expanded = event.currentTarget.dataset.expanded === 'true'

        summary.classList.toggle('expanded', !expanded)
        event.currentTarget.dataset.expanded = String(!expanded)
        event.currentTarget.textContent = expanded ? 'Read more' : 'Read less'
      }}
    >
      Read more
    </button>
  )}
</div>


                  
<button
  type="button"
  className="stored-view-button"
  onClick={() =>
    navigate(`/cases/${item.id ?? item.case_id}`)
  }
>
  Open analysis <ArrowLeft size={16} />
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
