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
  'Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Tucumán',
  'Salta',
  'Entre Ríos',
  'Misiones',
  'Chaco',
  'Corrientes',
  'Santiago del Estero',
  'San Juan',
  'Jujuy',
  'Río Negro',
  'Neuquén',
  'Formosa',
  'Chubut',
  'San Luis',
  'Catamarca',
  'La Rioja',
  'La Pampa',
  'Santa Cruz',
  'Tierra del Fuego',
  'Rosario',
];

const TIPOS_MOVIMIENTO: {
  value: TipoEvento;
  label: string;
  direction: 'in' | 'out' | 'neutral';
}[] = [
  { value: 'INGRESO', label: 'Ingreso de Stock', direction: 'in' },
  { value: 'ENVIO', label: 'Envío a Provincia', direction: 'out' },
  { value: 'DEVOLUCION', label: 'Devolución', direction: 'in' },
  { value: 'AJUSTE_STOCK', label: 'Ajuste de Stock', direction: 'neutral' },
  { value: 'MODIFICACION', label: 'Modificación de Datos', direction: 'neutral' },
  { value: 'CORRECCION', label: 'Corrección de Registro', direction: 'neutral' },
  { value: 'BAJA', label: 'Baja Lógica', direction: 'out' },
];

const MovementDialog = ({
  open,
  onClose,
  onSave,
  bookTitle,
  currentStock,
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

  const stockCambio =
    selectedTipo.direction === 'out'
      ? -cantidad
      : cantidad;

  const newStock = currentStock + stockCambio;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!descripcion.trim()) {
      errs.descripcion = 'La descripción es obligatoria.';
    }

    if (selectedTipo.direction === 'neutral') {
      if (cantidad === 0) {
        errs.cantidad = 'Ingresá una variación distinta de 0.';
      }
    } else {
      if (cantidad <= 0) {
        errs.cantidad = 'La cantidad debe ser mayor a 0.';
      }
    }

    if (selectedTipo.direction === 'out' && cantidad > currentStock) {
      errs.cantidad = `No hay suficiente stock (disponible: ${currentStock}).`;
    }

    if (tipo === 'ENVIO' && !provincia) {
      errs.provincia = 'Seleccioná una provincia de destino.';
    }

    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      tipo_evento: tipo,
      descripcion_evento: descripcion.trim(),
      stock_cambio: stockCambio,
      provincia_destino: provincia || undefined,
      observaciones: observaciones.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>
            {bookTitle} — Stock actual: <strong>{currentStock} u.</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS_MOVIMIENTO.map((t) => {
                const tc = EVENT_CONFIG[t.value];

                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setTipo(t.value);
                      setCantidad(0);
                      setProvincia('');
                      setErrors({});
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                      tipo === t.value
                        ? `${tc.bgClass} ${tc.colorClass} ring-2 ring-current`
                        : 'bg-secondary text-muted-foreground hover:text-foreground ring-1 ring-border'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedTipo.direction !== 'neutral' || tipo === 'AJUSTE_STOCK' || tipo === 'CORRECCION') && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {selectedTipo.direction === 'neutral' ? 'Variación de Stock' : 'Cantidad'}
              </label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => {
                  setCantidad(parseInt(e.target.value) || 0);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.cantidad;
                    return next;
                  });
                }}
                className="w-full h-10 px-3 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm"
                min={selectedTipo.direction === 'neutral' ? undefined : '0'}
              />
              {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad}</p>}
              {cantidad !== 0 && (
                <p className="text-xs text-muted-foreground">
                  Stock resultante:{' '}
                  <strong className={newStock < 0 ? 'text-destructive' : 'text-foreground'}>
                    {newStock} u.
                  </strong>
                </p>
              )}
            </div>
          )}

          {(tipo === 'ENVIO' || tipo === 'DEVOLUCION') && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Provincia {tipo === 'ENVIO' ? 'de Destino' : 'de Origen'}
              </label>
              <select
                value={provincia}
                onChange={(e) => {
                  setProvincia(e.target.value);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.provincia;
                    return next;
                  });
                }}
                className="w-full h-10 px-3 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="">Seleccionar...</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.provincia && <p className="text-xs text-destructive">{errors.provincia}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Descripción del Movimiento
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.descripcion;
                  return next;
                });
              }}
              className="w-full h-20 px-3 py-2 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
              placeholder="Detalle del movimiento realizado..."
            />
            {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Observaciones <span className="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full h-16 px-3 py-2 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
              placeholder="Comentarios adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`h-10 px-6 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] ${config.bgClass} ${config.colorClass} hover:opacity-90`}
            >
              Registrar Movimiento
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementDialog;