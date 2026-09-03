'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, SkipForward, X } from 'lucide-react';
import facts from '../data/facts.json';

const ROTATE_MS = 45000;
const FIRST_DELAY_MS = 6000;

function shuffle(list) { const copy = [...list]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }

export default function FunFact() {
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  // Shuffle on the client only (keeps server/client markup identical).
  useEffect(() => {
    setOrder(shuffle(facts));
    const closed = typeof window !== 'undefined' && window.sessionStorage.getItem('mw-facts-closed') === '1';
    if (closed) { setDismissed(true); return undefined; }
    const start = setTimeout(() => setVisible(true), FIRST_DELAY_MS);
    return () => clearTimeout(start);
  }, []);

  const next = useCallback(() => setIndex((value) => value + 1), []);

  useEffect(() => {
    if (!visible || dismissed) return undefined;
    timer.current = setTimeout(next, ROTATE_MS);
    return () => clearTimeout(timer.current);
  }, [visible, dismissed, index, next]);

  function close() { setLeaving(true); setTimeout(() => { setVisible(false); setDismissed(true); setLeaving(false); window.sessionStorage.setItem('mw-facts-closed', '1'); }, 380); }
  function reopen() { window.sessionStorage.removeItem('mw-facts-closed'); setDismissed(false); setVisible(true); next(); }

  if (dismissed) return <button className="fun-fact-reopen" onClick={reopen} aria-label="Show a fun fact" title="Did you know?"><Lightbulb size={18} /></button>;
  if (!visible || !order.length) return null;
  const fact = order[index % order.length];
  return (
    <aside className={`fun-fact ${leaving ? 'leaving' : ''}`} role="status" aria-live="polite">
      <div className="fun-fact-head"><span className="fun-fact-icon"><Lightbulb size={14} /></span><span className="eyebrow">Did you know?</span><button className="icon-btn" onClick={close} aria-label="Close fun facts"><X size={14} /></button></div>
      <p key={index} className="fade-up">{fact.text}</p>
      <div className="fun-fact-foot"><span className="badge ghost">{fact.category} fact · {(index % order.length) + 1}/{order.length}</span><div className="fun-fact-actions"><button className="icon-btn" onClick={next} aria-label="Next fact" title="Next fact"><SkipForward size={14} /></button></div></div>
      <div className="fun-fact-progress"><i key={index} style={{ '--duration': `${ROTATE_MS}ms` }} /></div>
    </aside>
  );
}
