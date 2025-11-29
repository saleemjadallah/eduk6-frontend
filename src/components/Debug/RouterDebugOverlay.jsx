import React, { useEffect, useState } from 'react';
import { useLocation, useMatches, useNavigation } from 'react-router-dom';

/**
 * Lightweight router debug overlay for production troubleshooting.
 * Toggle persists in localStorage under `router_debug_overlay`.
 */
const RouterDebugOverlay = () => {
  const location = useLocation();
  const matches = useMatches();
  const navigation = useNavigation();

  const [open, setOpen] = useState(false);

  // Restore persisted toggle
  useEffect(() => {
    try {
      const stored = localStorage.getItem('router_debug_overlay');
      if (stored === '1') {
        setOpen(true);
      }
    } catch {
      // Ignore storage errors (incognito)
    }
  }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem('router_debug_overlay', next ? '1' : '0');
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}>
      <button
        onClick={toggle}
        style={{
          background: '#111827',
          color: '#fbbf24',
          border: '1px solid #4b5563',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}
        aria-expanded={open}
        aria-label="Toggle router debug overlay"
      >
        🐞 Router Debug
      </button>

      {open && (
        <div
          style={{
            marginTop: 8,
            background: '#0f172a',
            color: '#e5e7eb',
            border: '1px solid #1f2937',
            borderRadius: 10,
            padding: 12,
            maxWidth: 420,
            maxHeight: '50vh',
            overflow: 'auto',
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#fbbf24' }}>
            Location (router)
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {JSON.stringify(
              {
                pathname: location.pathname,
                search: location.search,
                hash: location.hash,
                key: location.key,
              },
              null,
              2
            )}
          </pre>

          <div style={{ fontWeight: 700, margin: '12px 0 8px', color: '#fbbf24' }}>
            Window location
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {JSON.stringify(
              {
                href: window.location.href,
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
              },
              null,
              2
            )}
          </pre>

          <div style={{ fontWeight: 700, margin: '12px 0 8px', color: '#fbbf24' }}>
            Navigation
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {JSON.stringify(
              {
                state: navigation.state,
                location: navigation.location
                  ? {
                      pathname: navigation.location.pathname,
                      search: navigation.location.search,
                    }
                  : null,
              },
              null,
              2
            )}
          </pre>

          <div style={{ fontWeight: 700, margin: '12px 0 8px', color: '#fbbf24' }}>
            Matches
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
            {JSON.stringify(
              matches.map((m) => ({
                id: m.id,
                path: m.route?.path ?? '(index)',
                hasRoute: !!m.route,
                pathname: m.pathname,
                pathnameBase: m.pathnameBase,
                params: m.params,
              })),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RouterDebugOverlay;
