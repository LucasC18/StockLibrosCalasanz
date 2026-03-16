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
  { value: 'INGRESO',      label: 'Ingreso de Stock',       direction: 'in'      },
  { value: 'ENVIO',        label: 'Envío a Provincia',      direction: 'out'     },
  { value: 'DEVOLUCION',   label: 'Devolución',             direction: 'in'      },
  { value: 'AJUSTE_STOCK', label: 'Ajuste de Stock',        direction: 'neutral' },
  { value: 'MODIFICACION', label: 'Modificación de Datos',  direction: 'neutral' },
  { value: 'CORRECCION',   label: 'Corrección de Registro', direction: 'neutral' },
  { value: 'BAJA',         label: 'Baja Lógica',            direction: 'out'     },
];

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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        * { box-sizing: border-box; }

        /* ── Dialog shell ── */
        .mdv-wrap [role="dialog"] {
          font-family: 'DM Sans', sans-serif !important;
          border-radius: 22px !important;
          border: 1px solid #e4dbd6 !important;
          box-shadow: 0 24px 64px rgba(0,0,0,0.13) !important;
          padding: 0 !important;
          overflow: hidden !important;
          max-width: 520px !important;
        }

        /* ── Header ── */
        .mdv-header {
          background: #6b1228;
          padding: 24px 28px 20px;
          position: relative; overflow: hidden;
        }

        .mdv-header::before {
          content: '';
          position: absolute;
          top: -50px; right: -50px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .mdv-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }

        .mdv-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.5);
          display: block; margin-bottom: 5px;
        }

        .mdv-header h2 {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 21px !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          color: #fff !important;
          margin: 0 0 12px !important;
          line-height: 1.2 !important;
        }

        /* Stock pill */
        .mdv-stock-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 99px;
          padding: 5px 14px 5px 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.8);
        }

        .mdv-stock-pill strong { font-weight: 700; color: #fff; }

        .mdv-stock-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          flex-shrink: 0;
        }

        .mdv-book-name {
          color: rgba(255,255,255,0.6);
          font-weight: 400;
        }

        /* ── Body ── */
        .mdv-body {
          padding: 24px 28px 28px;
          background: #f5f1ee;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ── Section divider ── */
        .mdv-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .mdv-section-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b1228;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .mdv-section-line {
          flex: 1; height: 1px;
          background: #e4dbd6;
        }

        /* ── Type grid ── */
        .mdv-type-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .mdv-type-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          text-align: left; cursor: pointer;
          transition: all 0.15s;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          color: #5a5050;
        }

        .mdv-type-btn:hover:not(.selected) {
          border-color: #c9b8b0;
          color: #3a3030;
          background: #faf7f5;
        }

        .mdv-type-btn.selected { border-width: 2px; }

        .mdv-type-dot {
          width: 7px; height: 7px;
          border-radius: 50%; flex-shrink: 0;
          background: #c9b8b0;
        }

        /* ── Field ── */
        .mdv-field { display: flex; flex-direction: column; gap: 0; }

        .mdv-field input,
        .mdv-field select,
        .mdv-field textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 400;
          color: #1a1a1a;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          width: 100%;
          box-sizing: border-box;
        }

        .mdv-field input,
        .mdv-field select { height: 42px; padding: 0 12px; }

        .mdv-field textarea {
          padding: 10px 12px;
          resize: none; line-height: 1.55;
        }

        .mdv-field input::placeholder,
        .mdv-field textarea::placeholder { color: #c5b5ae; }

        .mdv-field input:focus,
        .mdv-field select:focus,
        .mdv-field textarea:focus {
          border-color: #6b1228;
          box-shadow: 0 0 0 3px rgba(107,18,40,0.08);
        }

        .mdv-field input.err,
        .mdv-field select.err { border-color: #c0392b; background: #fff8f7; }

        .mdv-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b1228' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          cursor: pointer;
        }

        .mdv-field-error {
          font-size: 12px; font-weight: 400;
          color: #6b1228; margin-top: 5px;
        }

        /* ── Stock preview ── */
        .mdv-stock-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          border: 1px solid #e4dbd6;
          border-radius: 12px;
          padding: 14px 18px;
          margin-top: 10px;
        }

        .mdv-preview-label {
          font-size: 11px; font-weight: 500;
          color: #b5a09a; margin-bottom: 4px;
          letter-spacing: 0.01em;
        }

        .mdv-preview-val {
          font-size: 22px; font-weight: 700;
          letter-spacing: -0.03em;
          color: #1a1a1a; line-height: 1;
        }

        .mdv-preview-val.neg { color: #b91c1c; }

        .mdv-preview-arrow {
          font-size: 18px; color: #c9b8b0; line-height: 1;
        }

        /* ── Footer ── */
        .mdv-footer {
          display: flex; justify-content: flex-end; gap: 10px;
        }

        .mdv-btn-cancel {
          height: 42px; padding: 0 20px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #7a6a64; background: #fff;
          border: 1.5px solid #e4dbd6;
          cursor: pointer; transition: background 0.15s;
        }

        .mdv-btn-cancel:hover { background: #f0ebe6; }

        .mdv-btn-submit {
          height: 42px; padding: 0 24px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff; background: #6b1228;
          border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(107,18,40,0.28);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
        }

        .mdv-btn-submit:hover  { background: #7c1530; box-shadow: 0 6px 18px rgba(107,18,40,0.36); }
        .mdv-btn-submit:active { transform: scale(0.987); }
      `}</style>

      <div className="mdv-wrap">
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
          <DialogContent className="p-0 gap-0 max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="mdv-header">
              <span className="mdv-eyebrow">Registrar operación</span>
              <DialogTitle asChild>
                <h2>Nuevo Movimiento</h2>
              </DialogTitle>
              <div className="mdv-stock-pill">
                <div className="mdv-stock-dot" />
                <span className="mdv-book-name">{bookTitle}</span>
                <strong>{currentStock} u.</strong>
              </div>
              <DialogDescription className="sr-only">
                {bookTitle} — Stock actual: {currentStock} u.
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="mdv-body">
              <form onSubmit={handleSubmit} style={{ display: 'contents' }}>

                {/* Type selector */}
                <div>
                  <div className="mdv-section">
                    <span className="mdv-section-title">Tipo de movimiento</span>
                    <div className="mdv-section-line" />
                  </div>
                  <div className="mdv-type-grid">
                    {TIPOS_MOVIMIENTO.map((t) => {
                      const isSelected = tipo === t.value;
                      const ds = DIRECTION_STYLE[t.direction];
                      return (
                        <button
                          key={t.value}
                          type="button"
                          className={`mdv-type-btn${isSelected ? ' selected' : ''}`}
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
                            className="mdv-type-dot"
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
                    <div className="mdv-section">
                      <span className="mdv-section-title">
                        {selectedTipo.direction === 'neutral' ? 'Variación de stock' : 'Cantidad'}
                      </span>
                      <div className="mdv-section-line" />
                    </div>
                    <div className="mdv-field">
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => { setCantidad(parseInt(e.target.value) || 0); clearError('cantidad'); }}
                        className={errors.cantidad ? 'err' : ''}
                        min={selectedTipo.direction === 'neutral' ? undefined : '0'}
                      />
                      {errors.cantidad && <span className="mdv-field-error">{errors.cantidad}</span>}
                    </div>

                    {cantidad !== 0 && (
                      <div className="mdv-stock-preview">
                        <div>
                          <div className="mdv-preview-label">Stock actual</div>
                          <div className="mdv-preview-val">{currentStock} u.</div>
                        </div>
                        <div className="mdv-preview-arrow">→</div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="mdv-preview-label">Stock resultante</div>
                          <div className={`mdv-preview-val${newStock < 0 ? ' neg' : ''}`}>
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
                    <div className="mdv-section">
                      <span className="mdv-section-title">
                        Provincia {tipo === 'ENVIO' ? 'de destino' : 'de origen'}
                      </span>
                      <div className="mdv-section-line" />
                    </div>
                    <div className="mdv-field">
                      <select
                        value={provincia}
                        onChange={(e) => { setProvincia(e.target.value); clearError('provincia'); }}
                        className={errors.provincia ? 'err' : ''}
                      >
                        <option value="">Seleccionar...</option>
                        {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.provincia && <span className="mdv-field-error">{errors.provincia}</span>}
                    </div>
                  </div>
                )}

                {/* Descripción */}
                <div>
                  <div className="mdv-section">
                    <span className="mdv-section-title">Descripción del movimiento</span>
                    <div className="mdv-section-line" />
                  </div>
                  <div className="mdv-field">
                    <textarea
                      rows={3}
                      value={descripcion}
                      onChange={(e) => { setDescripcion(e.target.value); clearError('descripcion'); }}
                      className={errors.descripcion ? 'err' : ''}
                      placeholder="Detalle del movimiento realizado..."
                    />
                    {errors.descripcion && <span className="mdv-field-error">{errors.descripcion}</span>}
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <div className="mdv-section">
                    <span className="mdv-section-title">
                      Observaciones <span style={{ fontWeight: 400, color: '#b5a09a' }}>(opcional)</span>
                    </span>
                    <div className="mdv-section-line" />
                  </div>
                  <div className="mdv-field">
                    <textarea
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Comentarios adicionales..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mdv-footer">
                  <button type="button" className="mdv-btn-cancel" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="mdv-btn-submit">
                    Registrar movimiento
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