
import { useCallback, useEffect, useState } from 'react'
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  X,
} from 'lucide-react'
import api from '../api/client'

const EMPTY_FORM = {
  event_date: '',
  title: '',
  description: '',
  source_excerpt: '',
  is_verified: false,
}

export default function LegalTimeline({ caseId, navigate }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  }

  const handleAuthError = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      navigate('/signin', { replace: true })
      return true
    }
    return false
  }

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get(
        `/api/cases/${caseId}/timeline`,
        { headers: authHeaders },
      )

      setEvents(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      if (handleAuthError(err)) return

      setError(
        err.response?.data?.detail ||
          'Unable to load timeline events.',
      )
    } finally {
      setLoading(false)
    }
  }, [caseId, navigate])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  function startAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError('')
  }

  function startEdit(event) {
    setEditingId(event.id)
    setForm({
      event_date: event.event_date || '',
      title: event.title || '',
      description: event.description || '',
      source_excerpt: event.source_excerpt || '',
      is_verified: Boolean(event.is_verified),
    })
    setShowForm(true)
    setError('')
  }

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.event_date || !form.title.trim() || saving) return

    setSaving(true)
    setError('')

    const payload = {
      event_date: form.event_date,
      title: form.title.trim(),
      description: form.description.trim(),
      source_excerpt: form.source_excerpt.trim() || null,
      is_verified: form.is_verified,
    }

    try {
      if (editingId !== null) {
        await api.put(
          `/api/cases/${caseId}/timeline/${editingId}`,
          payload,
          { headers: authHeaders },
        )
      } else {
        await api.post(
          `/api/cases/${caseId}/timeline`,
          payload,
          { headers: authHeaders },
        )
      }

      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      await loadEvents()
    } catch (err) {
      if (handleAuthError(err)) return

      setError(
        err.response?.data?.detail ||
          'Unable to save the timeline event.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(eventId) {
    const confirmed = window.confirm(
      'Delete this timeline event? This cannot be undone.',
    )

    if (!confirmed) return

    setError('')

    try {
      await api.delete(
        `/api/cases/${caseId}/timeline/${eventId}`,
        { headers: authHeaders },
      )

      setEvents((previous) =>
        previous.filter((event) => event.id !== eventId),
      )
    } catch (err) {
      if (handleAuthError(err)) return

      setError(
        err.response?.data?.detail ||
          'Unable to delete the timeline event.',
      )
    }
  }

  return (
    <section
      id="legal-timeline"
      className="case-details-card case-feature-card legal-timeline"
    >
      <div className="legal-timeline-heading">
        <div>
          <h2>
            <CalendarDays size={20} />
            Legal Timeline
          </h2>
          <p>
            Organize important dates and events for this case.
            Check each entry against the original document.
          </p>
        </div>

        <button
          type="button"
          className="legal-timeline-add"
          onClick={startAdd}
        >
          <Plus size={17} />
          Add event
        </button>
      </div>

      <div className="legal-timeline-notice">
        <ShieldAlert size={18} />
        <span>
          Timeline entries are not legal findings. Events remain
          unverified until you explicitly verify them.
        </span>
      </div>

      {error && (
        <div className="legal-timeline-error" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <form
          className="legal-timeline-form"
          onSubmit={handleSubmit}
        >
          <div className="legal-timeline-form-heading">
            <h3>
              {editingId !== null ? 'Edit event' : 'Add timeline event'}
            </h3>
            <button
              type="button"
              className="legal-timeline-icon-button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setForm(EMPTY_FORM)
              }}
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <label htmlFor="timeline-date">Event date</label>
          <input
            id="timeline-date"
            type="date"
            value={form.event_date}
            onChange={(e) => updateField('event_date', e.target.value)}
            required
          />

          <label htmlFor="timeline-title">Event title</label>
          <input
            id="timeline-title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            maxLength={200}
            placeholder="e.g. FIR report filed"
            required
          />

          <label htmlFor="timeline-description">Description</label>
          <textarea
            id="timeline-description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            maxLength={5000}
            rows={3}
            placeholder="Describe what the document says happened."
          />

          <label htmlFor="timeline-source">Supporting document excerpt</label>
          <textarea
            id="timeline-source"
            value={form.source_excerpt}
            onChange={(e) => updateField('source_excerpt', e.target.value)}
            maxLength={5000}
            rows={3}
            placeholder="Paste the relevant text from the document."
          />

          <label className="legal-timeline-verify">
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={(e) => updateField('is_verified', e.target.checked)}
            />
            I have checked this event against the original document.
          </label>

          <div className="legal-timeline-form-actions">
            <button
              type="button"
              className="legal-timeline-cancel"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setForm(EMPTY_FORM)
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save event'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="legal-timeline-state">
          <RefreshCw size={20} className="case-details-spinner" />
          Loading timeline...
        </div>
      ) : events.length === 0 ? (
        <div className="legal-timeline-empty">
          <CalendarDays size={28} />
          <strong>No timeline events yet</strong>
          <p>Add an event using a date supported by the case documents.</p>
        </div>
      ) : (
        <ol className="legal-timeline-list">
          {events.map((event) => (
            <li className="legal-timeline-item" key={event.id}>
              <div className="legal-timeline-marker" />

              <article className="legal-timeline-event">
                <div className="legal-timeline-event-top">
                  <time dateTime={event.event_date}>
                    {new Date(`${event.event_date}T00:00:00`).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                  </time>

                  <span
                    className={
                      event.is_verified
                        ? 'legal-timeline-status is-verified'
                        : 'legal-timeline-status'
                    }
                  >
                    {event.is_verified ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <ShieldAlert size={14} />
                    )}
                    {event.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <h3>{event.title}</h3>

                {event.description && <p>{event.description}</p>}

                {event.source_excerpt && (
                  <details className="legal-timeline-source">
                    <summary>View supporting excerpt</summary>
                    <blockquote>{event.source_excerpt}</blockquote>
                  </details>
                )}

                <div className="legal-timeline-event-actions">
                  <button
                    type="button"
                    onClick={() => startEdit(event)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className="legal-timeline-delete"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
