'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Database, Download, HardDriveUpload, Lock, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import CaseCard from '../CaseCard';
import Poster from '../Poster';
import { Header } from './archive';
import { refreshArchive, useArchive, useLive } from '../../lib/useArchive';
import { formatDate } from '../../lib/analytics';

const SESSION_KEY = 'mw-admin-key';
const CATEGORIES = [
  { kind: 'game', label: 'Game', hint: 'Games shelf', color: '#ff6b7c', category: 'games', statuses: ['Owned / Played', 'Want to Play', 'Currently Playing', 'Completed'] },
  { kind: 'anime', label: 'Anime', hint: 'Anime shelf', color: '#c084fc', category: 'anime', statuses: ['Watched / In Progress', 'Want to Watch', 'Completed', 'Dropped'] },
  { kind: 'show', label: 'Show', hint: 'Shows shelf', color: '#8fa4ff', category: 'shows', statuses: ['Watched / In Progress', 'Want to Watch', 'Completed'] },
  { kind: 'movie', label: 'Movie', hint: 'Movies shelf', color: '#f0c8ff', category: 'movies', statuses: ['Watched', 'Want to Watch', 'Rewatch favourite'] },
];
const EMPTY = { title: '', kind: 'game', status: '', genre: '', rating: '', summary: '', quote: '', note: '', poster: '', hallOfFame: false, language: 'English', releaseYear: '', characterCount: '' };

export function useAdminKey() {
  const [key, setKey] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { setKey(window.sessionStorage.getItem(SESSION_KEY) || ''); setReady(true); }, []);
  const save = (value) => { window.sessionStorage.setItem(SESSION_KEY, value); setKey(value); };
  const clear = () => { window.sessionStorage.removeItem(SESSION_KEY); setKey(''); };
  return { key, ready, save, clear };
}

export function AdminGate({ children, title = 'Curator access', description = 'This area writes to the permanent archive. Enter the admin password to continue.' }) {
  const admin = useAdminKey();
  const { data: status } = useLive('/api/admin/status');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!admin.ready) return <div className="page-shell"><div className="empty-state">Checking access…</div></div>;
  if (status && status.protected === false) return children({ adminKey: '', signOut: null });
  if (admin.key) return children({ adminKey: admin.key, signOut: admin.clear });
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const response = await fetch('/api/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (response.ok) admin.save(password); else setError('That password is not correct.');
  }
  return <div className="page-shell"><div className="gate panel fade-up"><div className="lock-icon"><Lock size={22} /></div><h2>{title}</h2><p>{description}</p><form onSubmit={submit}><input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" autoFocus aria-label="Admin password" /><button className="btn btn-primary" type="submit" disabled={busy || !password}>Unlock</button></form>{error && <div className="error-message">{error}</div>}</div></div>;
}

function AddForm({ adminKey, signOut }) {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle', message: '', saved: null });
  const category = CATEGORIES.find((entry) => entry.kind === form.kind) || CATEGORIES[0];
  const set = (field) => (event) => setForm((value) => ({ ...value, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const preview = useMemo(() => ({ id: 'preview', slug: 'preview', title: form.title || 'Your next title', category: category.category, status: form.status, genre: form.genre.split(/[,/]/).map((item) => item.trim()).filter(Boolean), rating_external_num: Number(form.rating) || null, cover_url: form.poster.trim() || null, summary: form.summary || 'The summary you write will appear on the back of the card and on the detail page.', famous_quote: form.quote, hall_of_fame: form.hallOfFame, language: form.language, release_year: form.releaseYear }), [form, category]);
  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return setState({ status: 'error', message: 'A title is required.', saved: null });
    setState({ status: 'saving', message: 'Saving to the permanent archive…', saved: null });
    const response = await fetch('/api/archive', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ ...form, name: form.title, seasons: form.seasons, kind: form.kind }) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return setState({ status: 'error', message: payload.error || 'Could not save this entry.', saved: null });
    await refreshArchive();
    setState({ status: 'saved', message: `${payload.name} is now live across Home, ${category.label}s, Quotes, Stats${payload.hall_of_fame ? ', Hall of Fame' : ''} and search. Stored in ${payload.storage === 'mongodb' ? 'MongoDB' : 'the local JSON fallback'}.`, saved: payload });
    setForm({ ...EMPTY, kind: form.kind });
  }
  return (
    <div className="add-layout">
      <form className="panel" onSubmit={submit}>
        <div className="form-section" style={{ marginTop: 0 }}><div className="form-section-title">01 · Category</div><div className="category-picker">{CATEGORIES.map((entry) => <button type="button" key={entry.kind} className={`category-option ${form.kind === entry.kind ? 'active' : ''}`} style={{ '--opt-color': entry.color }} onClick={() => setForm((value) => ({ ...value, kind: entry.kind, status: '' }))}><strong>{entry.label}</strong><small>{entry.hint}</small></button>)}</div></div>
        <div className="form-section"><div className="form-section-title">02 · The basics</div><div className="form-grid">
          <div className="form-field full"><label htmlFor="title">Title <b>*</b></label><input id="title" className="form-input" value={form.title} onChange={set('title')} placeholder={`e.g. ${category.kind === 'anime' ? 'Frieren: Beyond Journey\'s End' : category.kind === 'game' ? 'Clair Obscur: Expedition 33' : category.kind === 'movie' ? 'Oppenheimer' : 'The Pitt'}`} required /></div>
          <div className="form-field"><label htmlFor="status">Status</label><select id="status" className="form-select" value={form.status} onChange={set('status')}><option value="">Choose a status</option>{category.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
          <div className="form-field"><label htmlFor="genre">Genre</label><input id="genre" className="form-input" value={form.genre} onChange={set('genre')} placeholder="Action-Adventure, Mythology" /></div>
          <div className="form-field"><label htmlFor="rating">Rating (out of 10)</label><input id="rating" className="form-input" type="number" min="0" max="10" step="0.1" value={form.rating} onChange={set('rating')} placeholder="9.2" /></div>
          <div className="form-field"><label htmlFor="releaseYear">Release year</label><input id="releaseYear" className="form-input" type="number" min="1950" max="2100" value={form.releaseYear} onChange={set('releaseYear')} placeholder="2025" /></div>
          <div className="form-field"><label htmlFor="language">Language</label><select id="language" className="form-select" value={form.language} onChange={set('language')}>{['English', 'Japanese', 'Hindi', 'Indian', 'Korean', 'Spanish', 'Other'].map((language) => <option key={language}>{language}</option>)}</select></div>
          <div className="form-field"><label htmlFor="characterCount">Character count</label><input id="characterCount" className="form-input" type="number" min="0" value={form.characterCount} onChange={set('characterCount')} placeholder="Number of notable characters" /></div>
        </div></div>
        <div className="form-section"><div className="form-section-title">03 · The story</div><div className="form-grid">
          <div className="form-field full"><label htmlFor="summary">Summary</label><textarea id="summary" className="form-textarea" value={form.summary} onChange={set('summary')} placeholder="Two or three sentences on what this story is and why it matters." /></div>
          <div className="form-field"><label htmlFor="quote">Famous quote</label><input id="quote" className="form-input" value={form.quote} onChange={set('quote')} placeholder="Appears in the Quote Room automatically" /></div>
          <div className="form-field"><label htmlFor="note">Prashant note</label><input id="note" className="form-input" value={form.note} onChange={set('note')} placeholder="Your personal take" /></div>
        </div></div>
        <div className="form-section"><div className="form-section-title">04 · Presentation</div><div className="form-grid">
          <div className="form-field full"><label htmlFor="poster">Poster URL</label><input id="poster" className="form-input" type="url" value={form.poster} onChange={set('poster')} placeholder="https://… (leave empty to use a generated title card)" /></div>
          <label className={`toggle full ${form.hallOfFame ? 'on' : ''}`}><input type="checkbox" checked={form.hallOfFame} onChange={set('hallOfFame')} /><span className="switch" /><div><strong>Induct into the Hall of Fame</strong><small>Adds the gold border and lists it on the Hall of Fame page and stats.</small></div></label>
        </div></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 26 }}><button className="btn btn-primary" type="submit" disabled={state.status === 'saving'}><Sparkles size={14} /> {state.status === 'saving' ? 'Saving…' : 'Save to archive'}</button><button className="btn btn-ghost" type="button" onClick={() => setForm({ ...EMPTY, kind: form.kind })}>Reset</button>{signOut && <button className="btn btn-ghost btn-sm" type="button" onClick={signOut} style={{ marginLeft: 'auto' }}>Lock</button>}</div>
        {state.message && <div className={state.status === 'error' ? 'error-message' : 'success-message'} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.5 }}>{state.status === 'saved' && <CheckCircle2 size={14} style={{ flex: '0 0 auto', marginTop: 1 }} />}<span>{state.message}{state.saved && <> <Link href={`/${state.saved.category}/${state.saved.slug}`} style={{ textDecoration: 'underline' }}>Open entry →</Link></>}</span></div>}
      </form>
      <aside className="preview-card"><span className="eyebrow">Live preview</span><div style={{ marginTop: 14 }}><CaseCard title={preview} interactive={false} /></div><div className="preview-meta"><div>Shelf: <b>{category.label}s</b></div><div>Card badge: <b>{form.status || 'Archived'}</b></div><div>Poster: <b>{form.poster ? 'Custom URL' : 'Generated title card'}</b></div><div>Also updates: <b>Home · Stats · Search{form.quote ? ' · Quotes' : ''}{form.hallOfFame ? ' · Hall of Fame' : ''}</b></div></div></aside>
    </div>
  );
}

export function AddPage() {
  return <div className="page-shell"><Header eyebrow="Universal intake" title="Add to Archive" description="One modern form for games, anime, shows and movies. Save once and it appears everywhere — Home, shelves, Quotes, Hall of Fame, Stats and search — with no code edits." /><AdminGate>{({ adminKey, signOut }) => <AddForm adminKey={adminKey} signOut={signOut} />}</AdminGate></div>;
}

function SyncTools({ adminKey, signOut }) {
  const archive = useArchive();
  const { data: status } = useLive('/api/admin/status');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const custom = [...archive.titles.filter((title) => title.custom), ...archive.characters.filter((character) => character.custom)];
  async function download(path) { const response = await fetch(`/api/archive/${path}`); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `mad-world-${path}-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); setMessage(`${path === 'backup' ? 'Backup' : 'Export'} downloaded.`); }
  async function restore(event) { const file = event.target.files?.[0]; if (!file) return; setBusy(true); try { const payload = JSON.parse(await file.text()); const response = await fetch('/api/archive/restore', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey }, body: JSON.stringify({ ...payload, mode: 'merge' }) }); const result = await response.json(); setMessage(response.ok ? `Restored ${result.restored} entries. Lists refreshed.` : result.error); await refreshArchive(); } catch { setMessage('That file is not valid archive JSON.'); } setBusy(false); event.target.value = ''; }
  async function remove(item) { if (!window.confirm(`Remove "${item.title || item.name}" from the archive?`)) return; const response = await fetch(`/api/archive/${item.id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } }); setMessage(response.ok ? `Removed ${item.title || item.name}.` : 'Could not remove that entry.'); await refreshArchive(); }
  return (
    <>
      <div className="status-pills"><span className="source-pill"><i />{status?.mongo ? 'MongoDB connected' : 'Local JSON mode'}</span><span className="source-pill"><i />Local JSON fallback ready</span><span className="source-pill"><i />Auto-refresh on save</span><span className="source-pill"><i />Search indexed</span>{signOut && <button className="chip" onClick={signOut}>Lock</button>}</div>
      <div className="sync-grid" style={{ marginTop: 22 }}>
        <div className="sync-card panel hover"><span className="sync-icon"><Download size={18} /></span><h2>Export JSON</h2><p>Download every entry added through the archive as a portable JSON file.</p><button className="btn btn-primary btn-sm" onClick={() => download('export')}>Export archive</button></div>
        <div className="sync-card panel hover"><span className="sync-icon"><Database size={18} /></span><h2>Backup snapshot</h2><p>Create a dated snapshot before a large restore or migration to a new database.</p><button className="btn btn-ghost btn-sm" onClick={() => download('backup')}>Download backup</button></div>
        <div className="sync-card panel hover"><span className="sync-icon"><HardDriveUpload size={18} /></span><h2>Restore JSON</h2><p>Merge a previous backup into the permanent archive. Existing entries are updated, new ones added.</p><label className="btn btn-ghost btn-sm file-button">{busy ? 'Restoring…' : 'Choose JSON'}<input type="file" accept="application/json" onChange={restore} disabled={busy} /></label></div>
        <div className="sync-card panel hover"><span className="sync-icon"><RefreshCw size={18} /></span><h2>Refresh lists</h2><p>Every page reads from one shared archive API. Force a re-sync if you edited the database directly.</p><button className="btn btn-ghost btn-sm" onClick={async () => { await refreshArchive(); setMessage('Archive re-synced.'); }}>Re-sync now</button></div>
      </div>
      {message && <div className="success-message" style={{ marginTop: 20 }}>{message}</div>}
      <div className="section-heading" style={{ marginTop: 44 }}><div><span className="eyebrow">Permanent entries</span><h2>{custom.length} added through the archive</h2></div><Link href="/add" className="text-link">Add another →</Link></div>
      <div className="custom-list">{custom.length ? custom.map((item) => <div className="custom-row panel" key={item.id}><Poster src={item.cover_url} title={item.title || item.name} category={item.category || 'characters'} compact /><div><strong>{item.title || item.name}</strong><small>{item.category || 'character'}{item.status ? ` · ${item.status}` : ''}{item.date_added ? ` · ${formatDate(item.date_added)}` : ''}</small></div><Link href={item.category && item.category !== 'characters' ? `/${item.category}/${item.slug}` : `/characters/${item.slug}`} className="btn btn-ghost btn-sm">Open</Link><button className="btn btn-ghost btn-sm" onClick={() => remove(item)} aria-label="Remove entry"><Trash2 size={13} /></button></div>) : <div className="empty-state">Nothing added yet — the first entry you save on the Add page will appear here.</div>}</div>
    </>
  );
}

export function ArchiveSyncPage() {
  return <div className="page-shell"><Header eyebrow="Keep the universe safe" title="Archive Sync" description="Permanent storage in MongoDB with a local JSON fallback, instant list refresh and search indexing — without touching source code." /><AdminGate title="Archive Sync" description="Backups, restores and deletions need the admin password.">{({ adminKey, signOut }) => <SyncTools adminKey={adminKey} signOut={signOut} />}</AdminGate></div>;
}
