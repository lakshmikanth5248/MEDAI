import React, { createContext, useState, useCallback, useRef, useContext } from 'react';
import { createMessage } from '../utils/chatbotUtils';
import { processUserMessage, handleQuickAction } from '../services/chatbotService';

const ChatbotContext = createContext(null);

export function ChatbotProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesRef = useRef(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text, role) => {
    if (!text.trim()) return;
    const userMsg = createMessage('user', 'text', text.trim());
    addMessage(userMsg);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 900));
    const response = processUserMessage(text, role || 'patient');
    const botMsg = createMessage('bot', response.type, response.content);
    addMessage(botMsg);
    setIsTyping(false);
  }, [addMessage]);

  const triggerQuickAction = useCallback(async (actionId, role) => {
    const response = handleQuickAction(actionId, role);
    const userLabel = document.querySelector(`[data-action-id="${actionId}"]`)?.textContent || actionId;
    const userMsg = createMessage('user', 'text', `🔘 ${userLabel}`);
    addMessage(userMsg);
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
    const botMsg = createMessage('bot', response.type, response.content);
    addMessage(botMsg);
    setIsTyping(false);
  }, [addMessage]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const value = {
    isOpen,
    messages,
    isTyping,
    darkMode,
    messagesRef,
    toggleOpen,
    close,
    sendMessage,
    triggerQuickAction,
    clearMessages,
    toggleDarkMode,
    addMessage,
  };

  return React.createElement(ChatbotContext.Provider, { value }, children);
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return ctx;
}
