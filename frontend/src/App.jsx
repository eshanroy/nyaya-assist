
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
  ListChecks,
  MessageCircleQuestion,
} from 'lucide-react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import StoredCases from './pages/StoredCases'
import CaseDetails from './pages/CaseDetails'
import SessionTimer from './components/SessionTimer'
import Auth from './pages/Auth'
import api from './api/client'
import translations from './context/translations'
import {
  useLanguage,
  LANGUAGES,
} from './context/LanguageContext'
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
          <Link
            className="nav-login"
            to="/signin"
            onClick={() => setMenuOpen(false)}
          >
            Sign in
          </Link>
          <Link
            className="nav-signup"
            to="/signup"
            onClick={() => setMenuOpen(false)}
          >
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
              <ShieldCheck size={15} /> Secure account access · Your personal
              case workspace
            </p>
          </div>

          <div
            className="hero-visual"
            aria-label="Legal document dashboard illustration"
          >
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

              <div className="info-row">
                <span>Case summary</span>
                <span className="info-tag">Summary</span>
              </div>
              <div className="info-row">
                <span>Important dates</span>
                <span className="info-tag">Timeline</span>
              </div>
              <div className="info-row">
                <span>Legal sections</span>
                <span className="info-tag">References</span>
              </div>

              <div className="document-footer">
                <ShieldCheck size={15} /> Organised for clarity
              </div>
            </div>

            <div className="floating-badge">
              <FileText size={18} /> Structured analysis
            </div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-kicker">YOUR WORKSPACE</span>
            <h2>Everything you need, in one place.</h2>
            <p>
              Move from document upload to a more organised understanding
              of your case.
            </p>
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
  const { language, setLanguage } = useLanguage()
  const t = translations[language] || translations.english
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        })

        setProfile(response.data)
      } catch {
        localStorage.removeItem('access_token')
        navigate('/signin', { replace: true })
      }
    }

    loadProfile()
  }, [navigate])

  function signOut() {
    localStorage.removeItem('access_token')
    navigate('/signin', { replace: true })
  }

  function openStoredCases() {
    navigate('/cases')
  }

  function openAnalysisSection(section) {
    navigate(`/cases?section=${section}`)
  }

  function handleCardKeyDown(event, destination) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      navigate(destination)
    }
  }

  function renderSectionCard({
    icon: Icon,
    title,
    description,
    section,
    action,
  }) {
    const destination = `/cases?section=${section}`

    return (
      <article
        className="feature-card"
        key={section}
        onClick={() => openAnalysisSection(section)}
        role="link"
        tabIndex={0}
        onKeyDown={(event) => handleCardKeyDown(event, destination)}
        style={{ cursor: 'pointer' }}
      >
        <div className="feature-icon"><Icon size={23} /></div>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="feature-link">
          {action} <ArrowRight size={16} />
        </span>
      </article>
    )
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link className="brand" to="/">
          <span className="brand-icon"><Scale size={25} /></span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>

        <label className="app-language-picker">
          <Languages size={18} />
          <select
            aria-label="Preferred language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.native} — {item.label}
              </option>
            ))}
          </select>
        </label>

        <button className="secondary-button" onClick={signOut}>
          <LogOut size={16} /> {t.signOut}
        </button>
      </header>

      <main className="features-section">
        <span className="section-kicker">{t.workspace}</span>

        <h1>
          {t.welcome}
          {profile?.name ? `, ${profile.name}` : '!'}
        </h1>

        <p className="hero-description">{t.connected}</p>

        <div className="feature-grid" style={{ marginTop: 32 }}>
          <article
            className="feature-card"
            onClick={() => navigate('/upload')}
            role="link"
            tabIndex={0}
            onKeyDown={(event) => handleCardKeyDown(event, '/upload')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon"><Upload size={23} /></div>
            <h3>{t.upload}</h3>
            <p>{t.uploadDescription}</p>
            <span className="feature-link">
              {t.uploadAction} <ArrowRight size={16} />
            </span>
          </article>

          <article
            className="feature-card"
            onClick={openStoredCases}
            role="link"
            tabIndex={0}
            onKeyDown={(event) => handleCardKeyDown(event, '/cases')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon"><FolderOpen size={23} /></div>
            <h3>{t.stored}</h3>
            <p>{t.storedDescription}</p>
            <span className="feature-link">
              {t.storedAction} <ArrowRight size={16} />
            </span>
          </article>

          <article
            className="feature-card"
            onClick={openStoredCases}
            role="link"
            tabIndex={0}
            onKeyDown={(event) => handleCardKeyDown(event, '/cases')}
            style={{ cursor: 'pointer' }}
          >
            <div className="feature-icon"><Languages size={23} /></div>
            <h3>{t.translate}</h3>
            <p>{t.translateDescription}</p>
            <span className="feature-link">
              {t.translateAction} <ArrowRight size={16} />
            </span>
          </article>

          {renderSectionCard({
            icon: FileText,
            title: t.classificationTitle,
            description: t.classificationDescription,
            section: 'classification',
            action: t.classificationAction,
          })}

          {renderSectionCard({
            icon: ListChecks,
            title: t.nextStepsTitle,
            description: t.nextStepsDescription,
            section: 'next-steps',
            action: t.nextStepsAction,
          })}

          {renderSectionCard({
            icon: MessageCircleQuestion,
            title: t.faqsTitle,
            description: t.faqsDescription,
            section: 'faqs',
            action: t.faqsAction,
          })}
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
