import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const ChatWindow = ({ chatHistory, isLoading, isSessionActive, userInput, onUserInput, onSendMessage }) => {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-section">
      <div ref={chatContainerRef} className="chat-history">
        {!isSessionActive && (
          <div className="chat-message model">
            <p className="message-bubble">
              안녕하세요! Voca NK입니다. 단어 공부를 시작해 볼까요?
            </p>
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            <p className="message-bubble">
              <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
            </p>
          </div>
        ))}
        {isLoading && <p>Voca NK가 입력 중...</p>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={onUserInput}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          disabled={isLoading || !isSessionActive}
          placeholder={isSessionActive ? "답변을 입력하세요..." : ""}
        />
        <button onClick={onSendMessage} disabled={isLoading || !isSessionActive}>전송</button>
      </div>
    </div>
  );
};

export default ChatWindow;
