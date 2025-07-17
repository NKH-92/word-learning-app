import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Home() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <header className="App-header">
        <h1>{t('greeting')}</h1>
        <Link to="/learning">
          <button>{t('start_button')}</button>
        </Link>
      </header>
    </div>
  );
}

export default Home;
