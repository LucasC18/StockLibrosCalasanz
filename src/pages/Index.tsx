import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoginView from '@/components/LoginView';
import Dashboard from '@/components/Dashboard';
import HistoryView from '@/components/HistoryView';
import { mockBooks } from '@/data/mockBooks';
import { Libro } from '@/types/book';

type View = 'login' | 'dashboard' | 'detail';

const Index = () => {
  const [view, setView] = useState<View>('login');
  const [selectedBook, setSelectedBook] = useState<Libro | null>(null);

  const handleLogin = () => setView('dashboard');
  const handleLogout = () => {
    setView('login');
    setSelectedBook(null);
  };
  const handleSelectBook = (book: Libro) => {
    setSelectedBook(book);
    setView('detail');
  };
  const handleBack = () => {
    setView('dashboard');
    setSelectedBook(null);
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'login' && <LoginView key="login" onLogin={handleLogin} />}
      {view === 'dashboard' && (
        <Dashboard key="dashboard" books={mockBooks} onSelectBook={handleSelectBook} onLogout={handleLogout} />
      )}
      {view === 'detail' && selectedBook && (
        <HistoryView key="detail" book={selectedBook} onBack={handleBack} />
      )}
    </AnimatePresence>
  );
};

export default Index;
