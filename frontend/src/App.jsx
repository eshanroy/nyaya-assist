
import UploadPage from './pages/UploadPage'
import StoredCases from './pages/StoredCases'
import CaseDetails from './pages/CaseDetails'
import SessionTimer from './components/SessionTimer'

import { useEffect, useState } from 'react'
import {
  Scale,
  FileText,
  Upload,
  FolderOpen,
  Languages,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import Auth from './pages/Auth'
import api from './api/client'
import './App.css'


function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  const features = [
    {
      icon: Upload,
      title: 'Upload Documents',
      description: 'Upload a legal PDF for AI-powered analysis.',
    },
    {
      icon: FileText,
      title: 'View Case Analysis',
      description: 'Understand summaries, dates, people and legal sections.',
    },
    {
      icon: FolderOpen,
      title: 'Stored Cases',
      description: 'Access your saved legal-document analyses.',
    },
    {
      icon: Languages,
      title: 'Language Selection',
      description: 'Translate case analysis into your preferred language.',
    },
  ]

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-icon"><Scale size={25} /></span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <Link className="nav-login" to="/signin" onClick={() => setMenuOpen(false)}>
            Sign in
          </Link>
          <Link className="nav-signup" to="/signup" onClick={() => setMenuOpen(false)}>
            Get started <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <ShieldCheck size={16} /> YOUR LEGAL DOCUMENT ASSISTANT
            </div>
            <h1>
              Understand legal documents.
              <span> With greater clarity.</span>
            </h1>
            <p className="hero-description">
              Turn complex legal documents into clear, structured summaries.
              Explore important dates, people involved and legal sections
              through one simple workspace.
            </p>
            <div className="hero-actions">
              <Link className="primary-button" to="/signup">
                Get started free <ArrowRight size={18} />
              </Link>
              <a className="secondary-button" href="#features">
                Explore features
              </a>
            </div>
            <p className="hero-note">
              <ShieldCheck size={15} /> Secure account access · Your personal case workspace
            </p>
          </div>

          <div className="hero-visual" aria-label="Legal document dashboard illustration">
            <div className="visual-glow" />
            <div className="document-card">
              <div className="document-top">
                <span className="document-symbol"><Scale size={25} /></span>
                <span className="document-status">AI WORKSPACE</span>
              </div>
              <div className="document-label">LEGAL DOCUMENT</div>
              <div className="document-heading">Case overview</div>
              <div className="skeleton-line wide" />
              <div className="skeleton-line medium" />
              <div className="document-divider" />
              <div className="document-section-title">KEY INFORMATION</div>
              <div className="info-row"><span>Case summary</span><span className="info-tag">Summary</span></div>
              <div className="info-row"><span>Important dates</span><span className="info-tag">Timeline</span></div>
              <div className="info-row"><span>Legal sections</span><span className="info-tag">References</span></div>
              <div className="document-footer"><ShieldCheck size={15} /> Organised for clarity</div>
            </div>
            <div className="floating-badge"><FileText size={18} /> Structured analysis</div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-kicker">YOUR WORKSPACE</span>
            <h2>Everything you need, in one place.</h2>
            <p>Move from document upload to a more organised understanding of your case.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon"><Icon size={23} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link to="/signin" className="feature-link">
                  Explore feature <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-icon"><Scale size={30} /></div>
          <div>
            <span className="section-kicker">BUILT FOR CLARITY</span>
            <h2>Legal information, made easier to navigate.</h2>
            <p>
              NyayaAssist AI helps organise information extracted from legal
              documents. Always review AI-generated information carefully;
              it is not a substitute for advice from a qualified lawyer.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Link className="brand footer-brand" to="/">
          <span className="brand-icon"><Scale size={21} /></span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>
        <p>Making legal documents easier to understand.</p>
        <span>© {new Date().getFullYear()} NyayaAssist AI</span>
      </footer>
    </div>
  )
}


function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/signin" replace />
}


function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  async function loadProfile() {
    try {
      const response = await api.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      })
      setProfile(response.data)
      setError('')
    } catch {
      localStorage.removeItem('access_token')
      navigate('/signin', { replace: true })
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  function signOut() {
    localStorage.removeItem('access_token')
    navigate('/signin', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-icon"><Scale size={25} /></span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>
        <button className="secondary-button" onClick={signOut}>
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <main className="features-section">
        <span className="section-kicker">YOUR PERSONAL WORKSPACE</span>
        <h1>Welcome{profile?.name ? `, ${profile.name}` : ' back'}!</h1>
        <p className="hero-description">
          Your account is connected. Upload legal documents, view saved
          cases, and translate your case analyses.
        </p>

        {error && <p role="alert">{error}</p>}

        <div className="feature-grid" style={{ marginTop: 32 }}>
          <article
            className="feature-card"
            onClick={() => navigate('/upload')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon"><Upload size={23} /></div>
            <h3>Upload Documents</h3>
            <p>Upload a PDF for analysis.</p>
            <span className="feature-link">
              Upload a document <ArrowRight size={16} />
            </span>
          </article>

          <article
            className="feature-card"
            onClick={() => navigate('/cases')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon"><FolderOpen size={23} /></div>
            <h3>Stored Cases</h3>
            <p>Access your previous analyses.</p>
            <span className="feature-link">
              View stored cases <ArrowRight size={16} />
            </span>
          </article>

          <article className="feature-card">
            <div className="feature-icon"><Languages size={23} /></div>
            <h3>Translate Analysis</h3>
            <p>Choose a language for your case summary.</p>
            <span className="feature-link">Open a saved case to translate</span>
          </article>
        </div>
      </main>
    </div>
  )
}


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/signin" element={<Auth mode="signin" />} />

      <Route path="/signup" element={<Auth mode="signup" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <StoredCases />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cases/:caseId"
        element={
          <ProtectedRoute>
            <CaseDetails />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


export default function App() {
  return (
    <BrowserRouter>
      <SessionTimer />
      <AppRoutes />
    </BrowserRouter>
  )
}
