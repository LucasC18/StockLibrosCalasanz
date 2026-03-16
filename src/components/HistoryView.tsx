import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Book, MapPin, Calendar, Tag,
  User, Hash, Layers, Pencil, Plus,
} from 'lucide-react';
import { LibroDetalle, EVENT_CONFIG, EventoHistorial, LibroResumen } from '@/types/book';
import BookFormDialog from '@/components/BookFormDialog';
import MovementDialog from '@/components/MovementDialog';

interface HistoryViewProps {
  book: LibroDetalle;
  onBack: () => void;
  onEditBook: (data: Partial<LibroResumen> & { imagen?: string }) => void;
  onAddMovement: (movement: {
    tipo_evento: EventoHistorial['tipo_evento'];
    descripcion_evento: string;
    stock_cambio: number;
    provincia_destino?: string;
    observaciones?: string;
  }) => void;
}

const estadoConfig: Record<string, { label: string; dot: string; bg: string; color: string }> = {
  activo:     { label: 'Activo',     dot: '#16a34a', bg: '#f0fdf4', color: '#15803d' },
  bajo_stock: { label: 'Stock Bajo', dot: '#d97706', bg: '#fffbeb', color: '#b45309' },
  inactivo:   { label: 'Inactivo',   dot: '#94a3b8', bg: '#f1f5f9', color: '#64748b' },
};

const HistoryView = ({ book, onBack, onEditBook, onAddMovement }: HistoryViewProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);

  const sortedHistory = [...book.historial].sort(
    (a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
  );

  const est = estadoConfig[book.estado] ?? estadoConfig.inactivo;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');

        .hv-root {
          min-height: 100svh;
          background: #f7f4f0;
          font-family: 'Lato', sans-serif;
        }

        /* ── Top bar ── */
        .hv-topbar {
          background: #fff;
          border-bottom: 1px solid #e8ddd8;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .hv-topbar-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .hv-back-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #7a6a64;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 0;
          transition: color 0.15s;
        }

        .hv-back-btn:hover { color: #6b1228; }

        .hv-topbar-actions {
          display: flex;
          gap: 8px;
        }

        .hv-btn-secondary {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 16px;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #5a5a5a;
          background: #fff;
          border: 1.5px solid #e6ddd8;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }

        .hv-btn-secondary:hover {
          background: #f5eeeb;
          border-color: #c9b8b0;
          color: #6b1228;
        }

        .hv-btn-primary {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 36px;
          padding: 0 18px;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #fff;
          background: #6b1228;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(107,18,40,0.26);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
        }

        .hv-btn-primary:hover { background: #7d1630; box-shadow: 0 5px 14px rgba(107,18,40,0.34); }
        .hv-btn-primary:active { transform: scale(0.985); }

        /* ── Page body ── */
        .hv-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 28px 56px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 28px;
          align-items: start;
        }

        @media (max-width: 860px) {
          .hv-body { grid-template-columns: 1fr; }
        }

        /* ── Book card (left) ── */
        .hv-book-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e8ddd8;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          position: sticky;
          top: 76px;
        }

        /* Header strip inside card */
        .hv-card-strip {
          background: #6b1228;
          padding: 20px 22px 18px;
          position: relative;
          overflow: hidden;
        }

        .hv-card-strip::after {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 140px; height: 140px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .hv-card-strip-eyebrow {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 4px;
          display: block;
        }

        .hv-card-strip h2 {
          font-family: 'Playfair Display', serif;
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 3px;
          line-height: 1.25;
          position: relative;
          z-index: 1;
        }

        .hv-card-strip p {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin: 0;
          font-weight: 300;
          position: relative;
          z-index: 1;
        }

        /* Cover */
        .hv-cover-wrap {
          padding: 20px 22px 0;
        }

        .hv-cover {
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 10px;
          overflow: hidden;
          background: #f0ebe6;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e6ddd8;
        }

        .hv-cover img { width: 100%; height: 100%; object-fit: cover; }

        /* Description */
        .hv-description {
          padding: 16px 22px 0;
          font-size: 12px;
          color: #8a8a8a;
          line-height: 1.65;
          font-weight: 300;
        }

        /* Detail grid */
        .hv-details {
          padding: 18px 22px 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          border-top: 1px solid #f0ebe6;
          margin-top: 16px;
        }

        .hv-detail-item {}

        .hv-detail-label {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 3px;
        }

        .hv-detail-label span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a89890;
        }

        .hv-detail-value {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.3;
        }

        .hv-detail-value.highlight {
          color: #6b1228;
          font-size: 14px;
        }

        /* Estado badge inline */
        .hv-estado-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 9px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .hv-estado-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Timeline (right) ── */
        .hv-timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .hv-timeline-header h3 {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b1228;
          margin: 0;
        }

        .hv-timeline-count {
          font-size: 11px;
          color: #a89890;
          background: #fff;
          border: 1px solid #e6ddd8;
          border-radius: 99px;
          padding: 2px 10px;
          font-weight: 700;
        }

        /* Timeline list */
        .hv-timeline {
          position: relative;
          padding-left: 0;
        }

        .hv-timeline-line {
          position: absolute;
          left: 17px;
          top: 18px;
          bottom: 18px;
          width: 2px;
          background: linear-gradient(180deg, #e8ddd8 0%, transparent 100%);
        }

        .hv-event {
          position: relative;
          padding-left: 52px;
          padding-bottom: 22px;
        }

        .hv-event:last-child { padding-bottom: 0; }

        /* Node */
        .hv-event-node {
          position: absolute;
          left: 0; top: 0;
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 3px solid #f7f4f0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .hv-event-node-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }

        /* Card */
        .hv-event-card {
          background: #fff;
          border-radius: 13px;
          border: 1px solid #e8ddd8;
          padding: 16px 18px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .hv-event-card:hover {
          border-color: #c9b8b0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .hv-event-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          gap: 8px;
        }

        .hv-event-type {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hv-event-date {
          font-size: 11px;
          color: #a89890;
          font-weight: 300;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .hv-event-desc {
          font-size: 13px;
          color: #3a3a3a;
          line-height: 1.6;
          margin-bottom: 12px;
          font-weight: 400;
        }

        /* Meta strip */
        .hv-event-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          background: #f7f4f0;
          border-radius: 8px;
          border: 1px solid #ede8e4;
          padding: 10px 14px;
        }

        .hv-meta-item {}

        .hv-meta-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #a89890;
          display: block;
          margin-bottom: 2px;
        }

        .hv-meta-value {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* Stock arrow */
        .hv-stock-change {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .hv-stock-arrow {
          font-size: 10px;
          color: #a89890;
        }

        /* Observaciones */
        .hv-event-obs {
          margin-top: 10px;
          font-size: 11px;
          font-style: italic;
          color: #8a8a8a;
          padding-left: 12px;
          border-left: 2px solid #e6ddd8;
          font-weight: 300;
          line-height: 1.5;
        }

        /* Empty */
        .hv-empty {
          text-align: center;
          padding: 48px 20px;
          color: #a89890;
          font-size: 13px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e8ddd8;
        }
      `}</style>

      <motion.div
        className="hv-root"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Top bar */}
        <div className="hv-topbar">
          <div className="hv-topbar-inner">
            <button className="hv-back-btn" onClick={onBack}>
              <ArrowLeft size={14} /> Volver al inventario
            </button>
            <div className="hv-topbar-actions">
              <button className="hv-btn-secondary" onClick={() => setShowEditDialog(true)}>
                <Pencil size={13} /> Editar
              </button>
              <button className="hv-btn-primary" onClick={() => setShowMovementDialog(true)}>
                <Plus size={13} /> Registrar Movimiento
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="hv-body">

          {/* Left: Book card */}
          <div className="hv-book-card">
            <div className="hv-card-strip">
              <span className="hv-card-strip-eyebrow">Ficha del libro</span>
              <h2>{book.titulo}</h2>
              <p>{book.autor}</p>
            </div>

            <div className="hv-cover-wrap">
              <div className="hv-cover">
                {book.imagen
                  ? <img src={book.imagen} alt={book.titulo} />
                  : <Book size={40} color="#c0b0a8" />
                }
              </div>
            </div>

            {book.descripcion && (
              <p className="hv-description">{book.descripcion}</p>
            )}

            <div className="hv-details">
              <DetailItem icon={Hash}     label="Código"      value={book.codigo} />
              <DetailItem icon={Layers}   label="Stock"       value={`${book.stock_actual} u.`} highlight />
              <DetailItem icon={Tag}      label="ISBN"        value={book.isbn} />
              <DetailItem icon={Tag}      label="Editorial"   value={book.editorial} />
              <DetailItem icon={Tag}      label="Categoría"   value={book.categoria} />
              <DetailItem icon={MapPin}   label="Ubicación"   value={book.ubicacion} />
              <DetailItem icon={Calendar} label="Fecha Alta"  value={book.fecha_alta} />
              <div className="hv-detail-item">
                <div className="hv-detail-label">
                  <User size={9} color="#a89890" />
                  <span>Estado</span>
                </div>
                <span
                  className="hv-estado-badge"
                  style={{ background: est.bg, color: est.color }}
                >
                  <span className="hv-estado-dot" style={{ background: est.dot }} />
                  {est.label}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Timeline */}
          <div>
            <div className="hv-timeline-header">
              <h3>Historial de Trazabilidad</h3>
              <span className="hv-timeline-count">{sortedHistory.length} eventos</span>
            </div>

            <div className="hv-timeline">
              <div className="hv-timeline-line" />

              {sortedHistory.length === 0 ? (
                <div className="hv-empty">No hay eventos registrados aún.</div>
              ) : sortedHistory.map((event, idx) => {
                const config = EVENT_CONFIG[event.tipo_evento];
                return (
                  <motion.div
                    key={event.id}
                    className="hv-event"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.045, duration: 0.28 }}
                  >
                    <div className={`hv-event-node ${config.bgClass}`}>
                      <div className={`hv-event-node-dot ${config.dotClass}`} />
                    </div>

                    <div className="hv-event-card">
                      <div className="hv-event-top">
                        <span className={`hv-event-type ${config.colorClass}`}>
                          {config.label}
                        </span>
                        <time className="hv-event-date">{event.fecha_evento}</time>
                      </div>

                      <p className="hv-event-desc">{event.descripcion_evento}</p>

                      <div className="hv-event-meta">
                        <div className="hv-meta-item">
                          <span className="hv-meta-label">Responsable</span>
                          <span className="hv-meta-value">{event.usuario_responsable}</span>
                        </div>

                        {event.provincia_destino && (
                          <div className="hv-meta-item">
                            <span className="hv-meta-label">Destino</span>
                            <span className="hv-meta-value">{event.provincia_destino}</span>
                          </div>
                        )}

                        <div className="hv-meta-item">
                          <span className="hv-meta-label">Variación Stock</span>
                          <span className="hv-stock-change">
                            {event.stock_anterior}
                            <span className="hv-stock-arrow">→</span>
                            {event.stock_nuevo}
                          </span>
                        </div>
                      </div>

                      {event.observaciones && (
                        <p className="hv-event-obs">{event.observaciones}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {showEditDialog && (
        <BookFormDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          book={book}
          onSave={(data) => { onEditBook(data); setShowEditDialog(false); }}
        />
      )}

      {showMovementDialog && (
        <MovementDialog
          open={showMovementDialog}
          onClose={() => setShowMovementDialog(false)}
          bookTitle={book.titulo}
          currentStock={book.stock_actual}
          onSave={(m) => { onAddMovement(m); setShowMovementDialog(false); }}
        />
      )}
    </>
  );
};

const DetailItem = ({
  icon: Icon, label, value, highlight,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="hv-detail-item">
    <div className="hv-detail-label">
      <Icon size={9} color="#a89890" />
      <span>{label}</span>
    </div>
    <p className={`hv-detail-value${highlight ? ' highlight' : ''}`}>{value}</p>
  </div>
);

export default HistoryView;