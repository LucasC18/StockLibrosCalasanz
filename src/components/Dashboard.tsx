import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, BookOpen, AlertTriangle, Send, Activity, LogOut, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { Libro } from '@/types/book';
import BookFormDialog from '@/components/BookFormDialog';

interface DashboardProps {
  books: Libro[];
  onSelectBook: (book: Libro) => void;
  onLogout: () => void;
  onAddBook: (data: Partial<Libro>) => void;
  onEditBook: (bookId: string, data: Partial<Libro>) => void;
  onDeleteBook: (bookId: string) => void;
}

const estadoConfig = {
  activo: { label: 'Activo', className: 'bg-emerald-50 text-emerald-700' },
  bajo_stock: { label: 'Stock Bajo', className: 'bg-amber-50 text-amber-700' },
  inactivo: { label: 'Inactivo', className: 'bg-slate-100 text-slate-500' },
};

const Dashboard = ({ books, onSelectBook, onLogout, onAddBook, onEditBook, onDeleteBook }: DashboardProps) => {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Libro | null>(null);
  const [deletingBook, setDeletingBook] = useState<Libro | null>(null);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !search ||
        b.titulo.toLowerCase().includes(search.toLowerCase()) ||
        b.autor.toLowerCase().includes(search.toLowerCase()) ||
        b.codigo.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase());
      const matchEstado = filterEstado === 'todos' || b.estado === filterEstado;
      return matchSearch && matchEstado;
    });
  }, [books, search, filterEstado]);

  const totalLibros = books.length;
  const stockBajo = books.filter((b) => b.estado === 'bajo_stock').length;
  const enviosRecientes = books.filter((b) => {
    const last = b.historial[b.historial.length - 1];
    return last?.tipo_evento === 'ENVIO';
  }).length;
  const movimientosHoy = books.reduce((acc, b) => {
    const today = new Date().toISOString().slice(0, 10);
    return acc + b.historial.filter((h) => h.fecha_evento.startsWith(today)).length;
  }, 0);

  const kpis = [
    { label: 'Total Libros', value: totalLibros, icon: BookOpen, variant: 'default' as const },
    { label: 'Stock Bajo', value: stockBajo, icon: AlertTriangle, variant: 'warning' as const },
    { label: 'Envíos Recientes', value: enviosRecientes, icon: Send, variant: 'default' as const },
    { label: 'Movimientos Hoy', value: movimientosHoy, icon: Activity, variant: 'default' as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-svh bg-background"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="text-primary-foreground" size={16} />
            </div>
            <span className="font-semibold text-foreground text-sm">Depósito Norte</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Inventario General</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Monitoreo de existencias y movimientos en tiempo real.
            </p>
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            className="h-10 px-5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Nuevo Libro
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`px-5 py-4 rounded-xl shadow-card ${
                kpi.variant === 'warning' ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-card ring-1 ring-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon size={14} className={kpi.variant === 'warning' ? 'text-amber-500' : 'text-muted-foreground'} />
                <span className={`text-xs font-medium ${kpi.variant === 'warning' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {kpi.label}
                </span>
              </div>
              <p className={`text-2xl font-bold ${kpi.variant === 'warning' ? 'text-amber-700' : 'text-foreground'}`}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card ring-1 ring-border focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
              placeholder="Buscar por título, ISBN, autor o código..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 px-4 flex items-center gap-2 bg-card ring-1 ring-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Filter size={16} /> Filtros
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex gap-2 flex-wrap"
          >
            {['todos', 'activo', 'bajo_stock', 'inactivo'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFilterEstado(estado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterEstado === estado
                    ? 'bg-foreground text-background'
                    : 'bg-card ring-1 ring-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {estado === 'todos' ? 'Todos' : estado === 'bajo_stock' ? 'Stock Bajo' : estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
            {filterEstado !== 'todos' && (
              <button onClick={() => setFilterEstado('todos')} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X size={12} /> Limpiar
              </button>
            )}
          </motion.div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  {['Libro', 'ISBN', 'Stock', 'Última Prov.', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Acciones' ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No se encontraron libros que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((book) => {
                    const est = estadoConfig[book.estado];
                    return (
                      <tr
                        key={book.id}
                        className="group hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectBook(book)}>
                          <div className="flex items-center gap-3">
                            {(book as any).imagen ? (
                              <img src={(book as any).imagen} alt="" className="w-8 h-10 rounded object-cover ring-1 ring-border" />
                            ) : null}
                            <div>
                              <div className="font-medium text-foreground text-sm">{book.titulo}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {book.autor} • {book.codigo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground cursor-pointer" onClick={() => onSelectBook(book)}>{book.isbn}</td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectBook(book)}>
                          <span className={`text-sm font-semibold ${book.stock_actual <= 10 ? 'text-amber-600' : 'text-foreground'}`}>
                            {book.stock_actual} u.
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground cursor-pointer" onClick={() => onSelectBook(book)}>{book.ultima_provincia}</td>
                        <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectBook(book)}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${est.className}`}>
                            {est.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBook(book);
                              }}
                              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingBook(book);
                              }}
                              className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => onSelectBook(book)}
                              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                              title="Ver historial"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Book Dialog */}
      {showAddDialog && (
        <BookFormDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={(data) => {
            onAddBook(data);
            setShowAddDialog(false);
          }}
        />
      )}

      {/* Edit Book Dialog */}
      {editingBook && (
        <BookFormDialog
          open={!!editingBook}
          onClose={() => setEditingBook(null)}
          book={editingBook}
          onSave={(data) => {
            onEditBook(editingBook.id, data);
            setEditingBook(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setDeletingBook(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-6 rounded-xl shadow-elevated max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground">Eliminar libro</h3>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que querés eliminar <strong>"{deletingBook.titulo}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingBook(null)}
                className="h-9 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteBook(deletingBook.id);
                  setDeletingBook(null);
                }}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-all"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
