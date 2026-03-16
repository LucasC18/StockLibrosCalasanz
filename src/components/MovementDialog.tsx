import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TipoEvento, EVENT_CONFIG } from '@/types/book';

interface MovementDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (movement: {
    tipo_evento: TipoEvento;
    descripcion_evento: string;
    stock_cambio: number;
    provincia_destino?: string;
    observaciones?: string;
  }) => void;
  bookTitle: string;
  currentStock: number;
}

const PROVINCIAS = [
  'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán',
  'Salta', 'Entre Ríos', 'Misiones', 'Chaco', 'Corrientes',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Río Negro', 'Neuquén',
  'Formosa', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja',
  'La Pampa', 'Santa Cruz', 'Tierra del Fuego', 'Rosario',
];

const TIPOS_MOVIMIENTO: {
  value: TipoEvento;
  label: string;
  direction: 'in' | 'out' | 'neutral';
}[] = [
  { value: 'INGRESO',      label: 'Ingreso de Stock',        direction: 'in'      },
  { value: 'ENVIO',        label: 'Envío a Provincia',       direction: 'out'     },
  { value: 'DEVOLUCION',   label: 'Devolución',              direction: 'in'      },
  { value: 'AJUSTE_STOCK', label: 'Ajuste de Stock',         direction: 'neutral' },
  { value: 'MODIFICACION', label: 'Modificación de Datos',   direction: 'neutral' },
  { value: 'CORRECCION',   label: 'Corrección de Registro',  direction: 'neutral' },
  { value: 'BAJA',         label: 'Baja Lógica',             direction: 'out'     },
];

/* Direction → visual style for the selected chip */
const DIRECTION_STYLE = {
  in:      { bg: '#f0fdf4', color: '#15803d', border: '#86efac', dot: '#16a34a' },
  out:     { bg: '#fff8f0', color: '#9a3412', border: '#fdba74', dot: '#ea580c' },
  neutral: { bg: '#f0f4ff', color: '#1e40af', border: '#93c5fd', dot: '#3b82f6' },
};

const MovementDialog = ({
  open, onClose, onSave, bookTitle, currentStock,
}: MovementDialogProps) => {
  const [tipo, setTipo] = useState<TipoEvento>('INGRESO');
  const [cantidad, setCantidad] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [provincia, setProvincia] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTipo('INGRESO');
      setCantidad(0);
      setDescripcion('');
      setProvincia('');
      setObservaciones('');
      setErrors({});
    }
  }, [open]);

  const selectedTipo = TIPOS_MOVIMIENTO.find((t) => t.value === tipo)!;
  const config = EVENT_CONFIG[tipo];
  const dirStyle = DIRECTION_STYLE[selectedTipo.direction];

  const stockCambio = selectedTipo.direction === 'out' ? -cantidad : cantidad;
  const newStock = currentStock + stockCambio;

  const clearError = (field: string) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!descripcion.trim()) errs.descripcion = 'La descripción es obligatoria.';
    if (selectedTipo.direction === 'neutral') {
      if (cantidad === 0) errs.cantidad = 'Ingresá una variación distinta de 0.';
    } else {
      if (cantidad <= 0) errs.cantidad = 'La cantidad debe ser mayor a 0.';
    }
    if (selectedTipo.direction === 'out' && cantidad > currentStock)
      errs.cantidad = `No hay suficiente stock (disponible: ${currentStock}).`;
    if (tipo === 'ENVIO' && !provincia) errs.provincia = 'Seleccioná una provincia de destino.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      tipo_evento: tipo,
      descripcion_evento: descripcion.trim(),
      stock_cambio: stockCambio,
      provincia_destino: provincia || undefined,
      observaciones: observaciones.trim() || undefined,
    });
  };

  const showCantidad =
    selectedTipo.direction !== 'neutral' ||
    tipo === 'AJUSTE_STOCK' ||
    tipo === 'CORRECCION';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');

        /* ── Dialog shell ── */
        .md-dialog [role="dialog"] {
          font-family: 'Lato', sans-serif !important;
          border-radius: 20px !important;
          border: 1px solid #e8ddd8 !important;
          box-shadow: 0 24px 64px rgba(0,0,0,0.14) !important;
          padding: 0 !important;
          overflow: hidden !important;
          max-width: 520px !important;
        }

        /* ── Header ── */
        .md-header {
          background: #6b1228;
          padding: 26px 30px 22px;
          position: relative;
          overflow: hidden;
        }

        .md-header::before {
          content: '';
          position: absolute;
          top: -50px; right: -50px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .md-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }

        .md-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 5px;
        }

        .md-header h2 {
          font-family: 'Playfair Display', serif !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          color: #fff !important;
          margin: 0 0 10px !important;
          line-height: 1.2 !important;
        }

        /* Stock pill */
        .md-stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 99px;
          padding: 5px 14px 5px 10px;
          font-size: 12px;
          color: rgba(255,255,255,0.85);
          font-weight: 400;
        }

        .md-stock-pill strong {
          font-weight: 700;
          color: #fff;
        }

        .md-stock-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          flex-shrink: 0;
        }

        .md-book-name {
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          font-weight: 300;
          margin-right: 4px;
        }

        /* ── Body ── */
        .md-body {
          padding: 26px 30px 30px;
          background: #f7f4f0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── Section label ── */
        .md-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6b1228;
          display: block;
          margin-bottom: 10px;
          padding-bottom: 7px;
          border-bottom: 1px solid #e6ddd8;
        }

        /* ── Type grid ── */
        .md-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .md-type-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          font-family: 'Lato', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
          background: #fff;
          border: 1.5px solid #e6ddd8;
          color: #5a5a5a;
        }

        .md-type-btn:hover:not(.selected) {
          border-color: #c9b8b0;
          color: #3a3a3a;
          background: #faf7f5;
        }

        .md-type-btn.selected {
          border-width: 2px;
        }

        .md-type-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          background: #c9b8b0;
        }

        .md-type-btn.selected .md-type-dot {
          /* color set inline */
        }

        /* ── Field ── */
        .md-field {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .md-field input,
        .md-field select,
        .md-field textarea {
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          color: #1a1a1a;
          background: #fff;
          border: 1.5px solid #e6ddd8;
          border-radius: 9px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          width: 100%;
          box-sizing: border-box;
        }

        .md-field input,
        .md-field select { height: 40px; padding: 0 12px; }
        .md-field textarea { padding: 10px 12px; resize: none; line-height: 1.55; }

        .md-field input::placeholder,
        .md-field textarea::placeholder { color: #c0b0a8; }

        .md-field input:focus,
        .md-field select:focus,
        .md-field textarea:focus {
          border-color: #6b1228;
          box-shadow: 0 0 0 3px rgba(107,18,40,0.1);
        }

        .md-field input.err,
        .md-field select.err { border-color: #c0392b; background: #fff8f7; }

        .md-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b1228' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          cursor: pointer;
        }

        .md-field-error {
          font-size: 11px;
          color: #6b1228;
          margin-top: 5px;
          font-weight: 400;
        }

        /* ── Stock preview ── */
        .md-stock-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border: 1px solid #e6ddd8;
          border-radius: 10px;
          padding: 12px 16px;
          margin-top: 10px;
        }

        .md-stock-preview-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8a8a8a;
        }

        .md-stock-preview-val {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .md-stock-preview-val.neg { color: #b91c1c; }

        .md-stock-arrow {
          font-size: 20px;
          color: #c9b8b0;
          line-height: 1;
        }

        /* ── Footer ── */
        .md-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .md-btn-cancel {
          height: 40px;
          padding: 0 20px;
          border-radius: 9px;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #7a6a64;
          background: #fff;
          border: 1.5px solid #e6ddd8;
          cursor: pointer;
          transition: background 0.15s;
        }

        .md-btn-cancel:hover { background: #f0ebe6; }

        .md-btn-submit {
          height: 40px;
          padding: 0 24px;
          border-radius: 9px;
          font-family: 'Lato', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          background: #6b1228;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(107,18,40,0.28);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          letter-spacing: 0.04em;
        }

        .md-btn-submit:hover { background: #7d1630; box-shadow: 0 6px 18px rgba(107,18,40,0.36); }
        .md-btn-submit:active { transform: scale(0.985); }
      `}</style>

      <div className="md-dialog">
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
          <DialogContent className="p-0 gap-0 max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="md-header">
              <span className="md-eyebrow">Registrar operación</span>
              <DialogTitle asChild>
                <h2>Nuevo Movimiento</h2>
              </DialogTitle>
              <div className="md-stock-pill">
                <div className="md-stock-dot" />
                <span className="md-book-name">{bookTitle}</span>
                <strong>{currentStock} u.</strong>
              </div>
              <DialogDescription className="sr-only">
                {bookTitle} — Stock actual: {currentStock} u.
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="md-body">
              <form onSubmit={handleSubmit} style={{ display: 'contents' }}>

                {/* Type selector */}
                <div>
                  <span className="md-label">Tipo de Movimiento</span>
                  <div className="md-type-grid">
                    {TIPOS_MOVIMIENTO.map((t) => {
                      const isSelected = tipo === t.value;
                      const ds = DIRECTION_STYLE[t.direction];
                      return (
                        <button
                          key={t.value}
                          type="button"
                          className={`md-type-btn${isSelected ? ' selected' : ''}`}
                          style={isSelected
                            ? { background: ds.bg, borderColor: ds.border, color: ds.color }
                            : {}}
                          onClick={() => {
                            setTipo(t.value);
                            setCantidad(0);
                            setProvincia('');
                            setErrors({});
                          }}
                        >
                          <span
                            className="md-type-dot"
                            style={isSelected ? { background: ds.dot } : {}}
                          />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cantidad */}
                {showCantidad && (
                  <div>
                    <span className="md-label">
                      {selectedTipo.direction === 'neutral' ? 'Variación de Stock' : 'Cantidad'}
                    </span>
                    <div className="md-field">
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => { setCantidad(parseInt(e.target.value) || 0); clearError('cantidad'); }}
                        className={errors.cantidad ? 'err' : ''}
                        min={selectedTipo.direction === 'neutral' ? undefined : '0'}
                      />
                      {errors.cantidad && <span className="md-field-error">{errors.cantidad}</span>}
                    </div>

                    {cantidad !== 0 && (
                      <div className="md-stock-preview">
                        <div>
                          <div className="md-stock-preview-label">Stock actual</div>
                          <div className="md-stock-preview-val">{currentStock} u.</div>
                        </div>
                        <div className="md-stock-arrow">→</div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="md-stock-preview-label">Stock resultante</div>
                          <div className={`md-stock-preview-val${newStock < 0 ? ' neg' : ''}`}>
                            {newStock} u.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Provincia */}
                {(tipo === 'ENVIO' || tipo === 'DEVOLUCION') && (
                  <div>
                    <span className="md-label">
                      Provincia {tipo === 'ENVIO' ? 'de Destino' : 'de Origen'}
                    </span>
                    <div className="md-field">
                      <select
                        value={provincia}
                        onChange={(e) => { setProvincia(e.target.value); clearError('provincia'); }}
                        className={errors.provincia ? 'err' : ''}
                      >
                        <option value="">Seleccionar...</option>
                        {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.provincia && <span className="md-field-error">{errors.provincia}</span>}
                    </div>
                  </div>
                )}

                {/* Descripción */}
                <div>
                  <span className="md-label">Descripción del Movimiento</span>
                  <div className="md-field">
                    <textarea
                      rows={3}
                      value={descripcion}
                      onChange={(e) => { setDescripcion(e.target.value); clearError('descripcion'); }}
                      className={errors.descripcion ? 'err' : ''}
                      placeholder="Detalle del movimiento realizado..."
                    />
                    {errors.descripcion && <span className="md-field-error">{errors.descripcion}</span>}
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <span className="md-label">
                    Observaciones{' '}
                    <span style={{ textTransform: 'none', fontWeight: 400, letterSpacing: 0 }}>
                      (opcional)
                    </span>
                  </span>
                  <div className="md-field">
                    <textarea
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Comentarios adicionales..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="md-footer">
                  <button type="button" className="md-btn-cancel" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="md-btn-submit">
                    Registrar Movimiento
                  </button>
                </div>

              </form>
            </div>

          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default MovementDialog;