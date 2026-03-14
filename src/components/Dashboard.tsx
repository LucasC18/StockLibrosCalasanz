import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, BookOpen, AlertTriangle, Send, Activity, LogOut, X } from 'lucide-react';
import { Libro } from '@/types/book';

interface DashboardProps {
  books: Libro[];
  onSelectBook: (book: Libro) => void;
  onLogout: () => void;
}

const estadoConfig = {
  activo: { label: 'Activo', className: 'bg-emerald-50 text-emerald-700' },
  bajo_stock: { label: 'Stock Bajo', className: 'bg-amber-50 text-amber-700' },
  inactivo: { label: 'Inactivo', className: 'bg-slate-100 text-slate-500' },
};

const Dashboard = ({ books, onSelectBook, onLogout }: DashboardProps) => {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);

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
  const movimientosHoy = 3; // mock

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
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Inventario General</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoreo de existencias y movimientos en tiempo real.
          </p>
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
                  {['Libro', 'ISBN', 'Stock', 'Última Prov.', 'Estado', ''].map((h) => (
                    <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${h === '' ? 'text-right' : ''}`}>
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
                        className="group hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => onSelectBook(book)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground text-sm">{book.titulo}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {book.autor} • {book.codigo}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{book.isbn}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${book.stock_actual <= 10 ? 'text-amber-600' : 'text-foreground'}`}>
                            {book.stock_actual} u.
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{book.ultima_provincia}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${est.className}`}>
                            {est.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight className="inline text-border group-hover:text-primary transition-colors group-hover:translate-x-1 transform duration-150" size={20} />
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
    </motion.div>
  );
};

export default Dashboard;
