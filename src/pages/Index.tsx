import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import LoginView from '@/components/LoginView';
import Dashboard from '@/components/Dashboard';
import HistoryView from '@/components/HistoryView';
import { mockBooks } from '@/data/mockBooks';
import { Libro, EventoHistorial } from '@/types/book';

type View = 'login' | 'dashboard' | 'detail';

const Index = () => {
  const [view, setView] = useState<View>('login');
  const [books, setBooks] = useState<Libro[]>(mockBooks);
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

  const handleAddBook = (data: Partial<Libro>) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newBook: Libro = {
      id: crypto.randomUUID(),
      codigo: data.codigo || '',
      titulo: data.titulo || '',
      autor: data.autor || '',
      editorial: data.editorial || '',
      isbn: data.isbn || '',
      categoria: data.categoria || '',
      descripcion: data.descripcion || '',
      stock_actual: data.stock_actual ?? 0,
      ubicacion: data.ubicacion || '',
      estado: data.estado || 'activo',
      fecha_alta: now,
      fecha_ultima_modificacion: now,
      ultima_provincia: '—',
      imagen: (data as any).imagen,
      historial: [
        {
          id: crypto.randomUUID(),
          libro_id: '',
          tipo_evento: 'ALTA',
          descripcion_evento: 'Registro inicial del libro en el sistema.',
          stock_anterior: 0,
          stock_nuevo: data.stock_actual ?? 0,
          usuario_responsable: 'Admin',
          fecha_evento: now,
        },
      ],
    } as any;
    newBook.historial[0].libro_id = newBook.id;
    setBooks((prev) => [newBook, ...prev]);
    toast.success(`Libro "${newBook.titulo}" registrado correctamente.`);
  };

  const handleEditBook = (bookId: string, data: Partial<Libro>) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const updated = {
          ...b,
          ...data,
          fecha_ultima_modificacion: now,
          historial: [
            ...b.historial,
            {
              id: crypto.randomUUID(),
              libro_id: b.id,
              tipo_evento: 'MODIFICACION' as const,
              descripcion_evento: 'Datos del libro modificados.',
              stock_anterior: b.stock_actual,
              stock_nuevo: data.stock_actual ?? b.stock_actual,
              usuario_responsable: 'Admin',
              fecha_evento: now,
              observaciones: 'Edición desde el panel de administración.',
            },
          ],
        };
        // Update selectedBook if viewing it
        if (selectedBook?.id === bookId) {
          setSelectedBook(updated as Libro);
        }
        return updated as Libro;
      })
    );
    toast.success('Libro actualizado correctamente.');
  };

  const handleDeleteBook = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
      setView('dashboard');
    }
    toast.success(`"${book?.titulo}" eliminado del sistema.`);
  };

  const handleAddMovement = (
    bookId: string,
    movement: {
      tipo_evento: EventoHistorial['tipo_evento'];
      descripcion_evento: string;
      stock_cambio: number;
      provincia_destino?: string;
      observaciones?: string;
    }
  ) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const newStock = Math.max(0, b.stock_actual + movement.stock_cambio);
        const newEvent: EventoHistorial = {
          id: crypto.randomUUID(),
          libro_id: b.id,
          tipo_evento: movement.tipo_evento,
          descripcion_evento: movement.descripcion_evento,
          stock_anterior: b.stock_actual,
          stock_nuevo: newStock,
          provincia_destino: movement.provincia_destino,
          usuario_responsable: 'Admin',
          fecha_evento: now,
          observaciones: movement.observaciones,
        };
        const updated = {
          ...b,
          stock_actual: newStock,
          estado: newStock === 0 ? 'inactivo' as const : newStock <= 10 ? 'bajo_stock' as const : 'activo' as const,
          fecha_ultima_modificacion: now,
          ultima_provincia: movement.provincia_destino || b.ultima_provincia,
          historial: [...b.historial, newEvent],
        };
        if (selectedBook?.id === bookId) {
          setSelectedBook(updated);
        }
        return updated;
      })
    );
    toast.success('Movimiento registrado correctamente.');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'login' && <LoginView key="login" onLogin={handleLogin} />}
      {view === 'dashboard' && (
        <Dashboard
          key="dashboard"
          books={books}
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
          onAddMovement={(m) => handleAddMovement(selectedBook.id, m)}
        />
      )}
    </AnimatePresence>
  );
};

export default Index;
