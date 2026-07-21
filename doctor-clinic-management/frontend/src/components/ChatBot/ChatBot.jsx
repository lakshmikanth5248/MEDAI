import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AILMENTS, ROLE_TIPS, matchAilment } from './knowledge';
import './ChatBot.css';

function Message({ from, children }) {
  return (
    <div className={`cb-msg ${from === 'bot' ? 'cb-msg-bot' : 'cb-msg-user'}`}>
      {children}
    </div>
  );
}

export default function ChatBot() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'patient';

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ageGroup, setAgeGroup] = useState('adult');
  const scrollRef = useRef(null);

  // Seed conversation when opened.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: 'bot', type: 'greeting', text: t('chatbot.greeting') }]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const pushBot = (msg) => setMessages((m) => [...m, { from: 'bot', ...msg }]);

  const showAilment = (key) => {
    const ail = AILMENTS[key];
    const name = t(ail.labelKey);
    pushBot({
      type: 'ailment',
      key,
      text: `${name} — ${t('chatbot.ageGroup')}: ${t('chatbot.' + ageGroup)}`,
    });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', type: 'text', text }]);
    setInput('');

    const key = matchAilment(text);
    if (key) {
      showAilment(key);
    } else {
      pushBot({ type: 'nomatch', text: t('chatbot.noMatch') });
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  // Navigate to the booking page with the ailment + age group so the patient
  // lands on a suitable doctor for the reported symptom.
  const goToBooking = (ailmentKey) => {
    navigate('/patient/book-appointment', { state: { ailmentKey, ageGroup } });
  };

  const ailmentKeys = Object.keys(AILMENTS);
  const tips = ROLE_TIPS[role] || ROLE_TIPS.patient;
  const isPatient = role === 'patient';

  return (
    <>
      <button
        className="cb-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t('chatbot.close') : t('chatbot.open')}
        title={open ? t('chatbot.close') : t('chatbot.open')}
      >
        {open ? '×' : '💬'}
      </button>

      {open && (
        <div className="cb-panel">
          <div className="cb-header">
            <div className="cb-avatar">🤖</div>
            <div>
              <div className="cb-title">{t('chatbot.title')}</div>
              <div className="cb-subtitle">{t('chatbot.subtitle')}</div>
            </div>
            <button className="cb-close" onClick={() => setOpen(false)} aria-label={t('chatbot.close')}>×</button>
          </div>

          <div className="cb-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <Message key={i} from={m.from}>
                {m.type === 'ailment' ? (
                  <AilmentCard
                    key2={m.key}
                    ailmentKey={m.key}
                    ageGroup={ageGroup}
                    setAgeGroup={setAgeGroup}
                    onConsult={goToBooking}
                  />
                ) : (
                  <span>{m.text}</span>
                )}
              </Message>
            ))}

            {/* Suggestions row */}
            <div className="cb-suggest">
              <div className="cb-suggest-label">{t('chatbot.suggestedForYou')}</div>
              {isPatient ? (
                <div className="cb-chips">
                  {ailmentKeys.map((k) => (
                    <button key={k} className="cb-chip" onClick={() => showAilment(k)}>
                      {t(AILMENTS[k].labelKey)}
                    </button>
                  ))}
                </div>
              ) : (
                <ul className="cb-tips">
                  {tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="cb-footer">
            <input
              className="cb-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t('chatbot.inputPlaceholder')}
            />
            <button className="cb-send" onClick={handleSend}>{t('chatbot.send')}</button>
          </div>
          <div className="cb-disclaimer">{t('chatbot.disclaimer')}</div>
        </div>
      )}
    </>
  );
}

function AilmentCard({ key2, ailmentKey, ageGroup, setAgeGroup, onConsult }) {
  const { t } = useTranslation();
  const ail = AILMENTS[key2];
  const name = t(ail.labelKey);
  const data = ail.advice[ageGroup] || ail.advice.adult;

  return (
    <div className="cb-ailment">
      <div className="cb-ailment-name">{name}</div>

      <div className="cb-age-tabs">
        {['child', 'adult', 'old'].map((g) => (
          <button
            key={g}
            className={`cb-age-tab ${ageGroup === g ? 'active' : ''}`}
            onClick={() => setAgeGroup(g)}
          >
            {t('chatbot.' + g)}
          </button>
        ))}
      </div>

      <div className="cb-section-title">{t('chatbot.precautions')}</div>
      <ul className="cb-list">
        {data.precautions.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <div className="cb-section-title cb-warn">{t('chatbot.whenToSeeDoctor')}</div>
      <ul className="cb-list cb-warn-list">
        {data.seeDoctor.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <button
        className="cb-consult"
        onClick={() => onConsult && onConsult(ailmentKey)}
      >
        👨‍⚕️ {t('chatbot.consultDoctor')}
      </button>
      <div className="cb-consult-hint">{t('chatbot.consultDoctorHint')}</div>
    </div>
  );
}
