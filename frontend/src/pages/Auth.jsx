
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Scale,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Languages,
} from 'lucide-react'
import api from '../api/client'
import { LANGUAGES, useLanguage } from '../context/LanguageContext'
import './Auth.css'

const AUTH_TEXT = {
  english: {
    chooseLanguage: 'Choose your preferred language',
    signin: 'WELCOME BACK',
    signup: 'JOIN NYAYAASSIST AI',
    signinTitle: 'Sign in to your account',
    signupTitle: 'Create your account',
    signinSubtitle: 'Continue to your legal document workspace.',
    signupSubtitle: 'Set up your personal legal document workspace.',
    back: '← Back to home',
    name: 'Full name',
    namePlaceholder: 'Enter your full name',
    email: 'Email address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    confirm: 'Confirm password',
    confirmPlaceholder: 'Enter your password again',
    signinButton: 'Sign in',
    signupButton: 'Create account',
    waiting: 'Please wait...',
    already: 'Already have an account?',
    noAccount: "Don't have an account?",
    signinLink: 'Sign in',
    signupLink: 'Sign up',
    trust: 'Authentication-protected personal workspace',
    panelDescription:
      'Organise legal information, explore case summaries and keep your document analysis in one secure workspace.',
    panelFooter: 'AI-generated information should be reviewed carefully.',
    security:
      'Your password is sent to the backend over the API connection and is hashed before storage.',
    missingName: 'Please enter your name.',
    shortPassword: 'Password must be at least 8 characters long.',
    passwordMismatch: 'Passwords do not match.',
    created: 'Account created! You can now sign in.',
    connectionError: 'Unable to connect. Check that the backend is running.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  hindi: {
    chooseLanguage: 'अपनी पसंदीदा भाषा चुनें',
    signin: 'वापसी पर स्वागत है',
    signup: 'नया खाता बनाएँ',
    signinTitle: 'अपने खाते में साइन इन करें',
    signupTitle: 'अपना खाता बनाएँ',
    signinSubtitle: 'अपने कानूनी दस्तावेज़ों के कार्यक्षेत्र में आगे बढ़ें।',
    signupSubtitle: 'अपना व्यक्तिगत कानूनी दस्तावेज़ कार्यक्षेत्र बनाएँ।',
    back: '← होम पर वापस जाएँ',
    name: 'पूरा नाम',
    namePlaceholder: 'अपना पूरा नाम दर्ज करें',
    email: 'ईमेल पता',
    emailPlaceholder: 'you@example.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'कम से कम 8 अक्षर',
    confirm: 'पासवर्ड की पुष्टि करें',
    confirmPlaceholder: 'पासवर्ड दोबारा दर्ज करें',
    signinButton: 'साइन इन करें',
    signupButton: 'खाता बनाएँ',
    waiting: 'कृपया प्रतीक्षा करें...',
    already: 'क्या आपका पहले से खाता है?',
    noAccount: 'क्या आपका खाता नहीं है?',
    signinLink: 'साइन इन',
    signupLink: 'साइन अप',
    trust: 'सुरक्षित व्यक्तिगत कार्यक्षेत्र',
    panelDescription:
      'कानूनी जानकारी व्यवस्थित करें और केस सारांश एक सुरक्षित स्थान पर देखें।',
    panelFooter: 'AI से मिली जानकारी की सावधानीपूर्वक समीक्षा करें।',
    security: 'आपका पासवर्ड संग्रहित करने से पहले हैश किया जाता है।',
    missingName: 'कृपया अपना नाम दर्ज करें।',
    shortPassword: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।',
    passwordMismatch: 'दोनों पासवर्ड मेल नहीं खाते।',
    created: 'खाता बन गया! अब आप साइन इन कर सकते हैं।',
    connectionError: 'कनेक्शन नहीं हो पाया। जाँचें कि बैकएंड चालू है।',
    showPassword: 'पासवर्ड दिखाएँ',
    hidePassword: 'पासवर्ड छिपाएँ',
  },
  kannada: {
    chooseLanguage: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    signin: 'ಮರಳಿ ಸ್ವಾಗತ',
    signup: 'ನ್ಯಾಯಅಸಿಸ್ಟ್ AI ಗೆ ಸೇರಿ',
    signinTitle: 'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    signupTitle: 'ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ',
    signinSubtitle: 'ನಿಮ್ಮ ಕಾನೂನು ದಾಖಲೆಗಳ ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ.',
    signupSubtitle: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕಾನೂನು ದಾಖಲೆಗಳ ಕಾರ್ಯಕ್ಷೇತ್ರವನ್ನು ರಚಿಸಿ.',
    back: '← ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
    name: 'ಪೂರ್ಣ ಹೆಸರು',
    namePlaceholder: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
    email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    emailPlaceholder: 'you@example.com',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    passwordPlaceholder: 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು',
    confirm: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
    confirmPlaceholder: 'ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಮತ್ತೆ ನಮೂದಿಸಿ',
    signinButton: 'ಸೈನ್ ಇನ್',
    signupButton: 'ಖಾತೆ ರಚಿಸಿ',
    waiting: 'ದಯವಿಟ್ಟು ಕಾಯಿರಿ...',
    already: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
    noAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?',
    signinLink: 'ಸೈನ್ ಇನ್',
    signupLink: 'ಸೈನ್ ಅಪ್',
    trust: 'ಸುರಕ್ಷಿತ ವೈಯಕ್ತಿಕ ಕಾರ್ಯಕ್ಷೇತ್ರ',
    panelDescription:
      'ಕಾನೂನು ಮಾಹಿತಿಯನ್ನು ವ್ಯವಸ್ಥಿತಗೊಳಿಸಿ ಮತ್ತು ಪ್ರಕರಣದ ಸಾರಾಂಶಗಳನ್ನು ಒಂದೇ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.',
    panelFooter: 'AI ರಚಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪರಿಶೀಲಿಸಿ.',
    security: 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಸಂಗ್ರಹಿಸುವ ಮೊದಲು ಹ್ಯಾಶ್ ಮಾಡಲಾಗುತ್ತದೆ.',
    missingName: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.',
    shortPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು.',
    passwordMismatch: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.',
    created: 'ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ಈಗ ಸೈನ್ ಇನ್ ಮಾಡಬಹುದು.',
    connectionError: 'ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಬ್ಯಾಕೆಂಡ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಪರಿಶೀಲಿಸಿ.',
    showPassword: 'ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ',
    hidePassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ',
  },
  telugu: {
    chooseLanguage: 'మీకు నచ్చిన భాషను ఎంచుకోండి',
    signin: 'తిరిగి స్వాగతం',
    signup: 'న్యాయఅసిస్ట్ AIలో చేరండి',
    signinTitle: 'మీ ఖాతాలోకి సైన్ ఇన్ చేయండి',
    signupTitle: 'మీ ఖాతాను సృష్టించండి',
    signinSubtitle: 'మీ న్యాయ పత్రాల కార్యస్థలానికి కొనసాగండి.',
    signupSubtitle: 'మీ వ్యక్తిగత న్యాయ పత్రాల కార్యస్థలాన్ని సృష్టించండి.',
    back: '← హోమ్‌కు తిరిగి వెళ్లండి',
    name: 'పూర్తి పేరు',
    namePlaceholder: 'మీ పూర్తి పేరును నమోదు చేయండి',
    email: 'ఈమెయిల్ చిరునామా',
    emailPlaceholder: 'you@example.com',
    password: 'పాస్‌వర్డ్',
    passwordPlaceholder: 'కనీసం 8 అక్షరాలు',
    confirm: 'పాస్‌వర్డ్‌ను నిర్ధారించండి',
    confirmPlaceholder: 'పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి',
    signinButton: 'సైన్ ఇన్',
    signupButton: 'ఖాతా సృష్టించండి',
    waiting: 'దయచేసి వేచి ఉండండి...',
    already: 'ఇప్పటికే ఖాతా ఉందా?',
    noAccount: 'ఖాతా లేదా?',
    signinLink: 'సైన్ ఇన్',
    signupLink: 'సైన్ అప్',
    trust: 'సురక్షిత వ్యక్తిగత కార్యస్థలం',
    panelDescription:
      'న్యాయ సమాచారాన్ని క్రమబద్ధీకరించి, కేసు సారాంశాలను ఒకే సురక్షిత స్థలంలో చూడండి.',
    panelFooter: 'AI రూపొందించిన సమాచారాన్ని జాగ్రత్తగా సమీక్షించండి.',
    security: 'మీ పాస్‌వర్డ్ నిల్వ చేయడానికి ముందు హ్యాష్ చేయబడుతుంది.',
    missingName: 'దయచేసి మీ పేరును నమోదు చేయండి.',
    shortPassword: 'పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి.',
    passwordMismatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.',
    created: 'ఖాతా సృష్టించబడింది! ఇప్పుడు సైన్ ఇన్ చేయవచ్చు.',
    connectionError: 'కనెక్ట్ కాలేదు. బ్యాకెండ్ నడుస్తోందో లేదో చూడండి.',
    showPassword: 'పాస్‌వర్డ్ చూపించు',
    hidePassword: 'పాస్‌వర్డ్ దాచు',
  },
}

export default function Auth({ mode = 'signin' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()
  const t = AUTH_TEXT[language] || AUTH_TEXT.english

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (isSignup && !name.trim()) {
      setError(t.missingName)
      return
    }

    if (password.length < 8) {
      setError(t.shortPassword)
      return
    }

    if (isSignup && password !== confirmPassword) {
      setError(t.passwordMismatch)
      return
    }

    setLoading(true)

    try {
      if (isSignup) {
        await api.post('/api/auth/register', {
          name: name.trim(),
          email: email.trim(),
          password,
        })

        setSuccess(t.created)
        window.setTimeout(() => navigate('/signin'), 900)
      } else {
        const form = new URLSearchParams()
        form.append('username', email.trim())
        form.append('password', password)

        const response = await api.post('/api/auth/login', form, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        localStorage.setItem('access_token', response.data.access_token)
        navigate('/dashboard')
      }
    } catch (err) {
      const detail = err.response?.data?.detail

      setError(
        typeof detail === 'string' ? detail : t.connectionError
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon"><Scale size={25} /></span>
          <span>NyayaAssist <strong>AI</strong></span>
        </Link>

        <div className="auth-brand-content">
          <span className="auth-eyebrow">YOUR LEGAL DOCUMENT ASSISTANT</span>
          <h1>Clarity for complex legal documents.</h1>
          <p>{t.panelDescription}</p>

          <div className="auth-trust">
            <ShieldCheck size={19} />
            <span>{t.trust}</span>
          </div>
        </div>

        <p className="auth-panel-footer">{t.panelFooter}</p>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-language-picker">
            <label htmlFor="preferred-language">
              <Languages size={17} />
              {t.chooseLanguage}
            </label>

            <select
              id="preferred-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              {LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.native} — {item.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/" className="auth-back-link">{t.back}</Link>

          <span className="auth-form-kicker">
            {isSignup ? t.signup : t.signin}
          </span>

          <h2>{isSignup ? t.signupTitle : t.signinTitle}</h2>

          <p className="auth-subtitle">
            {isSignup ? t.signupSubtitle : t.signinSubtitle}
          </p>

          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message auth-success" role="status">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignup && (
              <label className="auth-field">
                {t.name}
                <input
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="auth-field">
              {t.email}
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              {t.password}
              <span className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {isSignup && (
              <label className="auth-field">
                {t.confirm}
                <input
                  type="password"
                  placeholder={t.confirmPlaceholder}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? t.waiting
                : isSignup
                  ? t.signupButton
                  : t.signinButton}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? t.already : t.noAccount}{' '}
            <Link to={isSignup ? '/signin' : '/signup'}>
              {isSignup ? t.signinLink : t.signupLink}
            </Link>
          </p>

          <p className="auth-security-note">
            <ShieldCheck size={15} />
            {t.security}
          </p>
        </div>
      </section>
    </main>
  )
}
