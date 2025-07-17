import React from 'react';
import { useTranslation } from 'react-i18next';

const WordCard = ({ word, meaning, pronunciation, example, isLoading, isSessionActive, onPrev, onNext, onPronounce }) => {
  const { t } = useTranslation();

  return (
    <div className="word-card">
      {isSessionActive && word ? (
        <>
          <h2>{word}</h2>
          {meaning && <p><strong>{t('meaning')}:</strong> {meaning}</p>}
          {pronunciation && <p><strong>{t('pronunciation')}:</strong> {pronunciation}</p>}
          {example && <p><strong>{t('example_sentence')}:</strong> {example}</p>}
          {isLoading && <p>{t('loading_ai_response')}</p>}
        </>
      ) : (
        <p>{t('press_start_button')}</p>
      )}
      <div className="word-controls">
        <button onClick={onPrev} disabled={!isSessionActive}>&lt; {t('prev_word_button')}</button>
        <button onClick={onPronounce} disabled={!isSessionActive}>{t('pronounce_button')}</button>
        <button onClick={onNext} disabled={!isSessionActive}>&gt; {t('next_word_button')}</button>
      </div>
    </div>
  );
};

export default WordCard;
