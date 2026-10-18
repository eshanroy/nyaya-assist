import { useEffect, useState } from 'react';
import './SessionTimer.css';

function getExpiry(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const decoded = atob(base64);
    const bytes = Uint8Array.from(
      decoded,
      (c) => c.charCodeAt(0)
    );

    const claims = JSON.parse(
      new TextDecoder().decode(bytes)
    );

    return typeof claims.exp === 'number'
      ? claims.exp * 1000
      : null;
  } catch {
    return null;
  }
}

function formatTime(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function SessionTimer() {
  const [remaining, setRemaining] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    function update() {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setLoggedIn(false);
        setRemaining(null);
        return;
      }

      setLoggedIn(true);

      const expiry = getExpiry(token);

      if (expiry === null) {
        setRemaining(null);
        return;
      }

      const timeLeft = expiry - Date.now();

      if (timeLeft <= 0) {
        localStorage.removeItem('access_token');
        window.location.reload();
        return;
      }

      setRemaining(timeLeft);
    }

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (!loggedIn || remaining === null) {
    return null;
  }

  const warning = remaining <= 5 * 60 * 1000;

  return (
    <div
      className={`session-timer ${warning ? 'session-timer-warning' : ''}`}
      role="status"
      aria-live="off"
    >
      <span className="session-timer-dot" />
      Session: {formatTime(remaining)} left
      {warning && <strong> · Expires soon</strong>}
    </div>
  );
}
