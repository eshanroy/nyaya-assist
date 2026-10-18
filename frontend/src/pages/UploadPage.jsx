
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
import './UploadPage.css'

export default function UploadPage() {
  const navigate = useNavigate()
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
      setError('Please select a PDF file.')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null)
      setError('The PDF must not exceed 10 MB.')
      return
    }

    setFile(selectedFile)
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (!file) {
      setError('Choose a PDF file before uploading.')
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

      let message = 'Upload failed. Please try again.'

      if (typeof detail === 'string') {
        message = detail
      } else if (Array.isArray(detail)) {
        message = detail
          .map((item) => `${item.loc?.join('.') || 'Request'}: ${item.msg}`)
          .join(' | ')
      } else if (!err.response) {
        message = 'Cannot connect to the backend. Check that it is running.'
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
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </header>

      <main className="upload-main">
        <div className="upload-heading">
          <span className="upload-kicker">DOCUMENT ANALYSIS</span>
          <h1>Upload a legal document</h1>
          <p>
            Upload a PDF to extract its text and generate a structured
            AI-powered case analysis.
          </p>
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
              <strong>Choose your PDF file</strong>
              <span>Click to browse or drag and drop here</span>
              <small>PDF only · Maximum file size 10 MB</small>
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
                Remove
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
                <strong>Document analyzed successfully!</strong>
                <span>Case ID: {result.case_id}</span>
                <span>{result.characters_extracted} characters extracted</span>
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
                Analyzing document...
              </>
            ) : (
              <>
                <Upload size={18} /> Upload and analyze
              </>
            )}
          </button>
        </form>

        {analysis && (
          <section className="analysis-result">
            <div className="analysis-result-heading">
              <span className="upload-kicker">ANALYSIS RESULT</span>
              <h2>{result.filename}</h2>
            </div>

            <div className="analysis-result-card">
              <h3>Summary</h3>
              <p>{analysis.summary || 'No summary was returned.'}</p>
            </div>

            <div className="analysis-result-card">
              <h3>Case type</h3>
              <p>{analysis.case_type || 'Not specified'}</p>
            </div>

            {[
              ['People involved', analysis.people_involved],
              ['Locations', analysis.locations],
              ['Important dates', analysis.important_dates],
              ['Legal sections', analysis.legal_sections],
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
                  <p>None provided.</p>
                )}
              </div>
            ))}

            <button
              className="upload-secondary-button"
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Return to dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  )
}
