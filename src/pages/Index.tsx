import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import LoginView from '@/components/LoginView';
import Dashboard from '@/components/Dashboard';
import HistoryView from '@/components/HistoryView';
import { api, CreateBookPayload, MovementPayload, DashboardSummary } from '@/lib/api';
import { LibroResumen, LibroDetalle, Usuario } from '@/types/book';

type View = 'login' | 'dashboard' | 'detail';

const Index = () => {
  const [view, setView] = useState<View>('login');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const [books, setBooks] = useState<LibroResumen[]>([]);
  const [selectedBook, setSelectedBook] = useState<LibroDetalle | null>(null);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBooks: 0,
    lowStockBooks: 0,
    recentShipments: 0,
    todayMovements: 0,
  });

  const loadDashboard = async (authToken: string) => {
    const [booksRes, summaryRes] = await Promise.all([
      api.getBooks(authToken),
      api.getSummary(authToken),
    ]);

    setBooks(booksRes.items);
    setSummary(summaryRes);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return;

      try {
        await loadDashboard(token);
        setView('dashboard');
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setView('login');
      }
    };

    bootstrap();
  }, [token]);

  const handleLogin = async (authToken: string, authUser: Usuario) => {
    setToken(authToken);
    setUser(authUser);
    await loadDashboard(authToken);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setBooks([]);
    setSelectedBook(null);
    setView('login');
  };

  const handleSelectBook = async (book: LibroResumen) => {
    if (!token) return;

    try {
      const res = await api.getBookById(book.id, token);
      setSelectedBook(res.item);
      setView('detail');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo cargar el detalle del libro.');
    }
  };

  const handleBack = () => {
    setSelectedBook(null);
    setView('dashboard');
  };

  const handleAddBook = async (data: Partial<LibroResumen> & { imagen?: string }) => {
    if (!token) return;

    try {
      const payload: CreateBookPayload = {
        codigo: data.codigo || '',
        titulo: data.titulo || '',
        autor: data.autor || '',
        editorial: data.editorial || '',
        isbn: data.isbn || '',
        categoria: data.categoria || '',
        descripcion: data.descripcion || '',
        stock_actual: data.stock_actual ?? 0,
        stock_minimo: data.stock_minimo ?? 0,
        ubicacion: data.ubicacion || '',
        ultima_provincia: data.ultima_provincia || '',
        imagen_url: data.imagen || '',
      };

      await api.createBook(payload, token);
      await loadDashboard(token);
      toast.success('Libro registrado correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo registrar el libro.');
    }
  };

  const handleEditBook = async (bookId: string, data: Partial<LibroResumen> & { imagen?: string }) => {
    if (!token) return;

    try {
      const payload: Partial<CreateBookPayload> & { imagen?: string } = {
        ...data,
        imagen_url: data.imagen,
      };

      delete payload.imagen;

      await api.updateBook(bookId, payload, token);
      await loadDashboard(token);

      if (selectedBook?.id === bookId) {
        const detailRes = await api.getBookById(bookId, token);
        setSelectedBook(detailRes.item);
      }

      toast.success('Libro actualizado correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar el libro.');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!token) return;

    try {
      await api.deleteBook(bookId, token);
      await loadDashboard(token);

      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
        setView('dashboard');
      }

      toast.success('Libro eliminado correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar el libro.');
    }
  };

  const handleAddMovement = async (bookId: string, movement: MovementPayload) => {
    if (!token) return;

    try {
      await api.addMovement(bookId, movement, token);
      await loadDashboard(token);

      const detailRes = await api.getBookById(bookId, token);
      setSelectedBook(detailRes.item);

      toast.success('Movimiento registrado correctamente.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'login' && <LoginView key="login" onLogin={handleLogin} />}

      {view === 'dashboard' && (
        <Dashboard
          key="dashboard"
          books={books}
          summary={summary}
          user={user}
          onSelectBook={handleSelectBook}
          onLogout={handleLogout}
          onAddBook={handleAddBook}
          onEditBook={handleEditBook}
          onDeleteBook={handleDeleteBook}
        />
      )}

      {view === 'detail' && selectedBook && (
        <HistoryView
          key="detail"
          book={selectedBook}
          onBack={handleBack}
          onEditBook={(data) => handleEditBook(selectedBook.id, data)}
          onAddMovement={(movement) => handleAddMovement(selectedBook.id, movement)}
        />
      )}
    </AnimatePresence>
  );
};

export default Index;