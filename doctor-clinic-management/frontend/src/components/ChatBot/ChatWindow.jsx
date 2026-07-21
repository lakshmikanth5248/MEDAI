import React, { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import TypingIndicator from './TypingIndicator';
import { createMessage } from '../../utils/chatbotUtils';
import { welcomeMessages } from '../../services/chatbotResponses';
import { processUserMessage, handleQuickAction as handleQuickActionService } from '../../services/chatbotService';

const ACTION_LABELS = {
  patient: {
    symptoms: 'Check Symptoms', tips: 'Health Tips', faq: 'FAQs',
    reminder: 'Medicine Reminder', diet: 'Diet Tips',
  },
  reception: {
    find_patient: 'Find Patient', book_appointment: 'Book Appointment',
    doctor_availability: 'Doctor Availability', today_summary: 'Today Summary',
    billing_help: 'Billing Help',
  },
  doctor: {
    patient_history: 'Patient History', prescriptions: 'Prescriptions',
    medicine_info: 'Medicine Info', treatment_guide: 'Treatment Guide',
    followup: 'Follow-up',
  },
  medical_store: {
    check_stock: 'Check Stock', verify_prescription: 'Verify Prescription',
    low_stock: 'Low Stock Alerts', expiry: 'Expiry Alerts',
    generic: 'Generic Suggestions',
  },
  admin: {
    today_summary: 'Today Summary', analytics: 'Analytics',
    search: 'Search Patient', reports: 'Generate Report',
    insights: 'AI Insights',
  },
};

export default function ChatWindow({ onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'patient';
  const scrollRef = useRef(null);
  const seededRef = useRef(false);

  const [messages, setMessages] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    if (!seededRef.current && messages.length === 0) {
      seededRef.current = true;
      const welcome = welcomeMessages[role] || welcomeMessages.patient;
      const greetings = [
        createMessage('bot', 'welcome', `👋 **${welcome.title}**\n${welcome.subtitle}`),
        createMessage('bot', 'hint', '💡 Try clicking a quick action button below or type your question.'),
      ];
      greetings.forEach((g) => addMessage(g));
    }
  }, [role, addMessage, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text) => {
    const userMsg = createMessage('user', 'text', text);
    addMessage(userMsg);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 800));
    const response = processUserMessage(text, role);
    const botMsg = createMessage('bot', response.type, response.content);
    addMessage(botMsg);
    setIsTyping(false);
  }, [role, addMessage]);

  const handleQuickAction = useCallback(async (actionId) => {
    const labels = ACTION_LABELS[role] || ACTION_LABELS.patient;
    const label = labels[actionId] || actionId;
    const userMsg = createMessage('user', 'text', `🔘 ${label}`);
    addMessage(userMsg);
    setIsTyping(true);
    const response = handleQuickActionService(actionId, role);
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 500));
    const botMsg = createMessage('bot', response.type, response.content);
    addMessage(botMsg);
    setIsTyping(false);
  }, [role, addMessage]);

  const handleClear = useCallback(() => {
    setMessages([]);
    seededRef.current = false;
  }, []);

  return (
    <div className={`cb-panel ${darkMode ? 'cb-dark' : ''}`}>
      <ChatHeader
        onClose={onClose}
        onClear={handleClear}
        onToggleDark={() => setDarkMode((p) => !p)}
        darkMode={darkMode}
      />
      <div className="cb-body" ref={scrollRef}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <QuickActions role={role} onAction={handleQuickAction} />
      </div>
      <ChatInput onSend={handleSend} disabled={isTyping} />
      <div className="cb-disclaimer">
        This is not a substitute for professional medical advice.
      </div>
    </div>
  );
}
