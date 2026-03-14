import { motion } from 'framer-motion';
import { ArrowLeft, Book, MapPin, Calendar, Tag, User, Hash, Layers } from 'lucide-react';
import { Libro, EVENT_CONFIG } from '@/types/book';

interface HistoryViewProps {
  book: Libro;
  onBack: () => void;
}

const estadoLabel: Record<string, string> = {
  activo: 'Activo',
  bajo_stock: 'Stock Bajo',
  inactivo: 'Inactivo',
};

const HistoryView = ({ book, onBack }: HistoryViewProps) => {
  const sortedHistory = [...book.historial].sort(
    (a, b) => new Date(b.fecha_evento).getTime() - new Date(a.fecha_evento).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-svh bg-background"
    >
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Volver al inventario
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar: Book Identity */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card p-6 rounded-xl shadow-card ring-1 ring-border space-y-6">
              <div className="aspect-[3/4] bg-secondary rounded-lg flex items-center justify-center">
                <Book size={48} className="text-muted-foreground/30" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{book.titulo}</h3>
                <p className="text-muted-foreground text-sm">{book.autor}</p>
              </div>
              <p className="text-xs text-muted-foreground">{book.descripcion}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <DetailItem icon={Hash} label="Código" value={book.codigo} />
                <DetailItem icon={Layers} label="Stock Actual" value={`${book.stock_actual} unidades`} highlight />
                <DetailItem icon={Tag} label="ISBN" value={book.isbn} />
                <DetailItem icon={Tag} label="Editorial" value={book.editorial} />
                <DetailItem icon={Tag} label="Categoría" value={book.categoria} />
                <DetailItem icon={MapPin} label="Ubicación" value={book.ubicacion} />
                <DetailItem icon={Calendar} label="Fecha Alta" value={book.fecha_alta} />
                <DetailItem icon={User} label="Estado" value={estadoLabel[book.estado] || book.estado} />
              </div>
            </div>
          </div>

          {/* Main: Timeline */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Historial de Trazabilidad
            </h4>

            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[17px] top-2 bottom-2 w-[2px] bg-border" />

              {sortedHistory.map((event, idx) => {
                const config = EVENT_CONFIG[event.tipo_evento];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative pl-12 pb-8 group"
                  >
                    {/* Timeline Node */}
                    <div
                      className={`absolute left-0 top-1 w-9 h-9 rounded-full border-4 border-background shadow-sm flex items-center justify-center z-10 ${config.bgClass}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                    </div>

                    <div className="bg-card p-4 rounded-lg shadow-card ring-1 ring-border group-hover:ring-muted-foreground/20 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${config.colorClass}`}>
                          {config.label}
                        </span>
                        <time className="text-[11px] text-muted-foreground tabular-nums">{event.fecha_evento}</time>
                      </div>
                      <p className="text-sm text-foreground/80 mb-3">{event.descripcion_evento}</p>

                      <div className="flex flex-wrap gap-4 py-3 px-3 bg-secondary rounded-md border border-border">
                        <MetaItem label="Responsable" value={event.usuario_responsable} />
                        {event.provincia_destino && <MetaItem label="Destino" value={event.provincia_destino} />}
                        <MetaItem label="Variación Stock" value={`${event.stock_anterior} → ${event.stock_nuevo}`} />
                      </div>

                      {event.observaciones && (
                        <p className="mt-3 text-xs italic text-muted-foreground">"{event.observaciones}"</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DetailItem = ({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div>
    <div className="flex items-center gap-1 mb-0.5">
      <Icon size={10} className="text-muted-foreground" />
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
    </div>
    <p className={`text-sm font-medium ${highlight ? 'text-primary font-bold' : 'text-foreground'}`}>{value}</p>
  </div>
);

const MetaItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-[11px]">
    <span className="text-muted-foreground block uppercase font-bold">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default HistoryView;
