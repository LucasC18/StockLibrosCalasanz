import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, ChevronRight, BookOpen, AlertTriangle,
  Send, Activity, LogOut, X, Plus, Pencil, Trash2,
} from 'lucide-react';
import { LibroResumen, Usuario } from '@/types/book';
import { DashboardSummary } from '@/lib/api';
import BookFormDialog from '@/components/BookFormDialog';

interface DashboardProps {
  books: LibroResumen[];
  summary: DashboardSummary;
  user: Usuario | null;
  onSelectBook: (book: LibroResumen) => void;
  onLogout: () => void;
  onAddBook: (data: Partial<LibroResumen> & { imagen?: string }) => void;
  onEditBook: (bookId: string, data: Partial<LibroResumen> & { imagen?: string }) => void;
  onDeleteBook: (bookId: string) => void;
}

const estadoConfig = {
  activo:     { label: 'Activo',     dot: '#16a34a', bg: '#f0fdf4', color: '#15803d' },
  bajo_stock: { label: 'Stock Bajo', dot: '#d97706', bg: '#fffbeb', color: '#b45309' },
  inactivo:   { label: 'Inactivo',   dot: '#94a3b8', bg: '#f1f5f9', color: '#64748b' },
};

const Dashboard = ({
  books, summary, user, onSelectBook, onLogout,
  onAddBook, onEditBook, onDeleteBook,
}: DashboardProps) => {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<LibroResumen | null>(null);
  const [deletingBook, setDeletingBook] = useState<LibroResumen | null>(null);

  const filtered = useMemo(() => books.filter((b) => {
    const matchSearch = !search ||
      b.titulo.toLowerCase().includes(search.toLowerCase()) ||
      b.autor.toLowerCase().includes(search.toLowerCase()) ||
      b.codigo.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'todos' || b.estado === filterEstado;
    return matchSearch && matchEstado;
  }), [books, search, filterEstado]);

  const kpis = [
    { label: 'Total Libros',     value: summary.totalBooks,      icon: BookOpen,      warning: false },
    { label: 'Stock Bajo',       value: summary.lowStockBooks,   icon: AlertTriangle, warning: true  },
    { label: 'Envíos Recientes', value: summary.recentShipments, icon: Send,          warning: false },
    { label: 'Movimientos Hoy',  value: summary.todayMovements,  icon: Activity,      warning: false },
  ];

  const filterLabels: Record<string, string> = {
    todos: 'Todos', activo: 'Activo', bajo_stock: 'Stock Bajo', inactivo: 'Inactivo',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        * { box-sizing: border-box; }

        .db-root {
          min-height: 100svh;
          background: #f5f1ee;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Navbar ── */
        .db-nav {
          position: sticky;
          top: 0; z-index: 20;
          background: #6b1228;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .db-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .db-nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .db-nav-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .db-nav-title {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #fff;
          line-height: 1.2;
        }

        .db-nav-sub {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
          line-height: 1;
          margin-top: 2px;
        }

        .db-nav-logout {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
          background: none;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 8px;
          padding: 6px 14px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .db-nav-logout:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        /* ── Body ── */
        .db-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 28px 48px;
        }

        /* ── Title row ── */
        .db-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 26px;
        }

        .db-title-row h2 {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #1a1a1a;
          margin: 0 0 4px;
          line-height: 1.15;
        }

        .db-title-row p {
          font-size: 13px;
          font-weight: 400;
          color: #9e8e88;
          margin: 0;
        }

        .db-btn-add {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 20px;
          background: #6b1228;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(107,18,40,0.28);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          white-space: nowrap;
        }

        .db-btn-add:hover  { background: #7c1530; box-shadow: 0 6px 18px rgba(107,18,40,0.36); }
        .db-btn-add:active { transform: scale(0.987); }

        /* ── KPI grid ── */
        .db-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 26px;
        }

        @media (max-width: 860px) { .db-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .db-kpi-grid { grid-template-columns: 1fr; } }

        .db-kpi {
          background: #fff;
          border-radius: 14px;
          padding: 20px 22px;
          border: 1px solid #e4dbd6;
          position: relative;
          overflow: hidden;
        }

        .db-kpi.warning { background: #fff8f0; border-color: #f0d8c0; }

        .db-kpi-accent {
          position: absolute;
          top: 0; left: 0;
          width: 3px; height: 100%;
          background: #6b1228;
          border-radius: 14px 0 0 14px;
        }

        .db-kpi.warning .db-kpi-accent { background: #d97706; }

        .db-kpi-top {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
        }

        .db-kpi-icon { color: #6b1228; }
        .db-kpi.warning .db-kpi-icon { color: #d97706; }

        .db-kpi-label {
          font-size: 12px;
          font-weight: 500;
          color: #9e8e88;
        }

        .db-kpi.warning .db-kpi-label { color: #92600a; }

        .db-kpi-value {
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #1a1a1a;
          line-height: 1;
        }

        .db-kpi.warning .db-kpi-value { color: #92600a; }

        /* ── Search & filter ── */
        .db-search-row {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .db-search-wrap {
          flex: 1; min-width: 200px; position: relative;
        }

        .db-search-icon {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          color: #b5a09a;
          pointer-events: none;
        }

        .db-search-input {
          width: 100%;
          height: 42px;
          padding: 0 14px 0 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }

        .db-search-input::placeholder { color: #c5b5ae; }

        .db-search-input:focus {
          border-color: #6b1228;
          box-shadow: 0 0 0 3px rgba(107,18,40,0.08);
        }

        .db-filter-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 42px;
          padding: 0 16px;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #5a5050;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }

        .db-filter-btn:hover, .db-filter-btn.active {
          background: #f5eeeb;
          border-color: #c9b8b0;
          color: #6b1228;
        }

        /* Filter chips panel */
        .db-filter-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 18px;
          padding: 14px 16px;
          background: #fff;
          border: 1px solid #e4dbd6;
          border-radius: 12px;
        }

        .db-filter-chip {
          height: 32px;
          padding: 0 14px;
          border-radius: 99px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #e4dbd6;
          background: #fff;
          color: #7a6a64;
          transition: all 0.15s;
        }

        .db-filter-chip:hover { border-color: #6b1228; color: #6b1228; }
        .db-filter-chip.active { background: #6b1228; border-color: #6b1228; color: #fff; }

        .db-clear-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #b5a09a;
          background: none; border: none;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 6px;
          transition: color 0.15s;
        }

        .db-clear-btn:hover { color: #6b1228; }

        /* ── Table card ── */
        .db-table-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e4dbd6;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .db-table-card table { width: 100%; border-collapse: collapse; }

        .db-table-card thead tr {
          background: #f5f1ee;
          border-bottom: 1px solid #e4dbd6;
        }

        .db-table-card th {
          padding: 12px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #9e8e88;
          text-align: left;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .db-table-card th.right { text-align: right; }

        .db-table-card tbody tr {
          border-bottom: 1px solid #f0ebe6;
          transition: background 0.12s;
          cursor: pointer;
        }

        .db-table-card tbody tr:last-child { border-bottom: none; }
        .db-table-card tbody tr:hover { background: #faf7f5; }

        .db-table-card td {
          padding: 14px 20px;
          font-size: 13px;
          color: #3a3a3a;
          vertical-align: middle;
        }

        /* Book cell */
        .db-book-cell { display: flex; align-items: center; gap: 12px; }

        .db-book-thumb {
          width: 30px; height: 40px;
          border-radius: 5px; object-fit: cover;
          border: 1px solid #e4dbd6; flex-shrink: 0;
        }

        .db-book-title {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .db-book-meta {
          font-size: 12px;
          font-weight: 400;
          color: #b5a09a;
          margin-top: 2px;
        }

        .db-isbn {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #9e8e88;
          letter-spacing: 0.02em;
        }

        .db-stock { font-weight: 700; font-size: 14px; }
        .db-stock.low { color: #d97706; }
        .db-stock.ok  { color: #1a1a1a; }

        /* Estado badge */
        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
        }

        .db-badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%; flex-shrink: 0;
        }

        /* Row actions */
        .db-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        tr:hover .db-actions { opacity: 1; }

        .db-action-btn {
          width: 30px; height: 30px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none;
          cursor: pointer; color: #b5a09a;
          transition: background 0.12s, color 0.12s;
        }

        .db-action-btn:hover        { background: #f0ebe6; color: #6b1228; }
        .db-action-btn.danger:hover { background: #fdf2f4; color: #b91c1c; }

        /* Empty state */
        .db-empty {
          padding: 64px 20px;
          text-align: center;
          color: #b5a09a;
          font-size: 13px;
          font-weight: 400;
        }

        .db-empty strong {
          display: block;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #5a5050;
          margin-bottom: 6px;
        }

        /* ── Delete modal ── */
        .db-modal-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(30,10,15,0.42);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }

        .db-modal {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          max-width: 400px; width: 100%;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          border: 1px solid #e4dbd6;
        }

        .db-modal-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #fdf2f4;
          border: 1px solid #f0c8d0;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }

        .db-modal h3 {
          font-size: 19px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1a1a1a;
          margin: 0 0 10px;
        }

        .db-modal p {
          font-size: 14px;
          font-weight: 400;
          color: #6a6060;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        .db-modal p strong { font-weight: 700; color: #1a1a1a; }

        .db-modal-footer { display: flex; justify-content: flex-end; gap: 10px; }

        .db-modal-cancel {
          height: 40px; padding: 0 18px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #7a6a64;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          cursor: pointer;
          transition: background 0.15s;
        }

        .db-modal-cancel:hover { background: #f0ebe6; }

        .db-modal-delete {
          height: 40px; padding: 0 20px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
          background: #b91c1c;
          border: none; cursor: pointer;
          box-shadow: 0 4px 12px rgba(185,28,28,0.28);
          transition: background 0.15s, transform 0.1s;
        }

        .db-modal-delete:hover  { background: #991b1b; }
        .db-modal-delete:active { transform: scale(0.987); }
      `}</style>

      <motion.div
        className="db-root"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Navbar */}
        <header className="db-nav">
          <div className="db-nav-inner">
            <div className="db-nav-brand">
              <div className="db-nav-icon">
                <BookOpen color="#fff" size={16} />
              </div>
              <div>
                <div className="db-nav-title">Escuelas Pías Colegio Calasanz - C.A.B.A</div>
                {user && <div className="db-nav-sub">{user.nombre} · {user.rol}</div>}
              </div>
            </div>

            <button className="db-nav-logout" onClick={onLogout}>
              <LogOut size={13} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </header>

        <div className="db-body">

          {/* Title row */}
          <div className="db-title-row">
            <div>
              <h2>Inventario General</h2>
              <p>Monitoreo de existencias y movimientos en tiempo real.</p>
            </div>
            <button className="db-btn-add" onClick={() => setShowAddDialog(true)}>
              <Plus size={15} /> Nuevo libro
            </button>
          </div>

          {/* KPIs */}
          <div className="db-kpi-grid">
            {kpis.map((kpi) => (
              <div key={kpi.label} className={`db-kpi${kpi.warning ? ' warning' : ''}`}>
                <div className="db-kpi-accent" />
                <div className="db-kpi-top">
                  <kpi.icon size={13} className="db-kpi-icon" />
                  <span className="db-kpi-label">{kpi.label}</span>
                </div>
                <div className="db-kpi-value">{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Search & filter */}
          <div className="db-search-row">
            <div className="db-search-wrap">
              <Search size={15} className="db-search-icon" />
              <input
                className="db-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, ISBN, autor o código..."
              />
            </div>
            <button
              className={`db-filter-btn${showFilters ? ' active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} /> Filtros
            </button>
          </div>

          {showFilters && (
            <motion.div
              className="db-filter-chips"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {['todos', 'activo', 'bajo_stock', 'inactivo'].map((estado) => (
                <button
                  key={estado}
                  className={`db-filter-chip${filterEstado === estado ? ' active' : ''}`}
                  onClick={() => setFilterEstado(estado)}
                >
                  {filterLabels[estado]}
                </button>
              ))}
              {filterEstado !== 'todos' && (
                <button className="db-clear-btn" onClick={() => setFilterEstado('todos')}>
                  <X size={11} /> Limpiar
                </button>
              )}
            </motion.div>
          )}

          {/* Table */}
          <div className="db-table-card">
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    {['Libro', 'ISBN', 'Stock', 'Última Prov.', 'Estado', 'Acciones'].map((h) => (
                      <th key={h} className={h === 'Acciones' ? 'right' : ''}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, cursor: 'default' }}>
                        <div className="db-empty">
                          <strong>Sin resultados</strong>
                          No se encontraron libros con los filtros aplicados.
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((book) => {
                    const est = estadoConfig[book.estado];
                    return (
                      <tr key={book.id}>
                        <td onClick={() => onSelectBook(book)}>
                          <div className="db-book-cell">
                            {book.imagen && (
                              <img src={book.imagen} alt={book.titulo} className="db-book-thumb" />
                            )}
                            <div>
                              <div className="db-book-title">{book.titulo}</div>
                              <div className="db-book-meta">{book.autor} · {book.codigo}</div>
                            </div>
                          </div>
                        </td>

                        <td onClick={() => onSelectBook(book)}>
                          <span className="db-isbn">{book.isbn}</span>
                        </td>

                        <td onClick={() => onSelectBook(book)}>
                          <span className={`db-stock ${book.stock_actual <= 10 ? 'low' : 'ok'}`}>
                            {book.stock_actual} u.
                          </span>
                        </td>

                        <td onClick={() => onSelectBook(book)} style={{ color: '#9e8e88', fontWeight: 400 }}>
                          {book.ultima_provincia}
                        </td>

                        <td onClick={() => onSelectBook(book)}>
                          <span className="db-badge" style={{ background: est.bg, color: est.color }}>
                            <span className="db-badge-dot" style={{ background: est.dot }} />
                            {est.label}
                          </span>
                        </td>

                        <td>
                          <div className="db-actions">
                            <button
                              className="db-action-btn"
                              title="Editar"
                              onClick={(e) => { e.stopPropagation(); setEditingBook(book); }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className="db-action-btn danger"
                              title="Eliminar"
                              onClick={(e) => { e.stopPropagation(); setDeletingBook(book); }}
                            >
                              <Trash2 size={13} />
                            </button>
                            <button
                              className="db-action-btn"
                              title="Ver historial"
                              onClick={() => onSelectBook(book)}
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Add dialog */}
      {showAddDialog && (
        <BookFormDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSave={(data) => { onAddBook(data); setShowAddDialog(false); }}
        />
      )}

      {/* Edit dialog */}
      {editingBook && (
        <BookFormDialog
          open={!!editingBook}
          onClose={() => setEditingBook(null)}
          book={editingBook}
          onSave={(data) => { onEditBook(editingBook.id, data); setEditingBook(null); }}
        />
      )}

      {/* Delete confirm */}
      {deletingBook && (
        <div className="db-modal-overlay" onClick={() => setDeletingBook(null)}>
          <motion.div
            className="db-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="db-modal-icon">
              <Trash2 size={18} color="#b91c1c" />
            </div>
            <h3>Eliminar libro</h3>
            <p>
              ¿Estás seguro de que querés eliminar{' '}
              <strong>"{deletingBook.titulo}"</strong>?
              Esta acción no se puede deshacer y eliminará todo el historial asociado.
            </p>
            <div className="db-modal-footer">
              <button className="db-modal-cancel" onClick={() => setDeletingBook(null)}>
                Cancelar
              </button>
              <button
                className="db-modal-delete"
                onClick={() => { onDeleteBook(deletingBook.id); setDeletingBook(null); }}
              >
                Sí, eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Dashboard;