import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { wordList } from '../data/words';
import { systemPrompt } from '../prompts/systemPrompt';
import WordCard from '../components/WordCard';
import ChatWindow from '../components/ChatWindow';

const Learning = () => {
  const { t } = useTranslation();
  const [sessionWords, setSessionWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWordInfo, setCurrentWordInfo] = useState({ meaning: '', pronunciation: '', example: '' });

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

  const parseAIResponse = (text) => {
    try {
      // Attempt to find the JSON part of the response
      const jsonMatch = text.match(/```json\n(.+?)\n```/s);
      if (jsonMatch && jsonMatch[1]) {
        const parsedJson = JSON.parse(jsonMatch[1]);
        return {
          ...parsedJson,
          chatMessage: parsedJson.chatMessage || text.replace(jsonMatch[0], '').trim(),
        };
      }
      // Fallback for non-JSON responses
      return { chatMessage: text };
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return { chatMessage: text }; // Return the raw text if JSON parsing fails
    }
  };

  const sendToAI = useCallback(async (messageToSend, currentChatHistory) => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: systemPrompt });
      const chat = model.startChat({ history: currentChatHistory });
      const result = await chat.sendMessage(messageToSend);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("API Error:", error);
      return t('api_error_message');
    } finally {
      setIsLoading(false);
    }
  }, [genAI, t]);

  const startNewSession = useCallback(async () => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    const newWords = shuffled.slice(0, 5);
    setSessionWords(newWords);
    setCurrentWordIndex(0);
    setChatHistory([]);
    setIsSessionActive(true);
    setUserInput('');
    setCurrentWordInfo({ meaning: '', pronunciation: '', example: '' });

    const firstWord = newWords[0];
    const aiResponseText = await sendToAI(`새로운 단어: ${firstWord}`, []);
    const parsed = parseAIResponse(aiResponseText);

    setCurrentWordInfo({ meaning: parsed.meaning, pronunciation: parsed.pronunciation, example: parsed.example });
    setChatHistory([{ role: "model", parts: [{ text: parsed.chatMessage }] }]);
  }, [sendToAI]);


  const handleWordChange = useCallback(async (newIndex) => {
    setCurrentWordIndex(newIndex);
    const newWord = sessionWords[newIndex];
    const aiResponseText = await sendToAI(`새로운 단어: ${newWord}`, []);
    const parsed = parseAIResponse(aiResponseText);

    setCurrentWordInfo({ meaning: parsed.meaning, pronunciation: parsed.pronunciation, example: parsed.example });
    setChatHistory([{ role: "model", parts: [{ text: parsed.chatMessage }] }]);
  }, [sessionWords, sendToAI]);

  const handleUserInput = async () => {
    if (!userInput.trim() || isLoading || !isSessionActive) return;

    const currentUserInput = userInput;
    const newUserMessage = { role: "user", parts: [{ text: currentUserInput }] };
    const historyForApi = [...chatHistory, newUserMessage];

    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput('');

    const aiResponseText = await sendToAI(currentUserInput, historyForApi);
    const parsed = parseAIResponse(aiResponseText);

    if (parsed.proceedToNext) {
      if (currentWordIndex < sessionWords.length - 1) {
        handleWordChange(currentWordIndex + 1);
      } else {
        alert(t('session_complete_alert'));
        startNewSession();
      }
    } else {
      setChatHistory(prev => [...prev, { role: "model", parts: [{ text: parsed.chatMessage }] }]);
    }
  };

  const handlePronounceWord = () => {
    if (sessionWords.length > 0) {
      const utterance = new SpeechSynthesisUtterance(sessionWords[currentWordIndex]);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <Link to="/">
            <button>{t('back_button')}</button>
          </Link>
        </div>

        <div className="learning-container">
          <WordCard
            word={sessionWords[currentWordIndex]}
            meaning={currentWordInfo.meaning}
            pronunciation={currentWordInfo.pronunciation}
            example={currentWordInfo.example}
            isLoading={isLoading && !currentWordInfo.meaning}
            isSessionActive={isSessionActive}
            onPrev={() => handleWordChange(currentWordIndex > 0 ? currentWordIndex - 1 : sessionWords.length - 1)}
            onNext={() => handleWordChange(currentWordIndex < sessionWords.length - 1 ? currentWordIndex + 1 : 0)}
            onPronounce={handlePronounceWord}
          />
          <ChatWindow
            chatHistory={chatHistory}
            isLoading={isLoading}
            isSessionActive={isSessionActive}
            userInput={userInput}
            onUserInput={(e) => setUserInput(e.target.value)}
            onSendMessage={handleUserInput}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={startNewSession} disabled={isLoading}>
            {isSessionActive ? t('start_new_session_button') : t('start_learning_button')}
          </button>
        </div>
      </header>
    </div>
  );
};

export default Learning;
