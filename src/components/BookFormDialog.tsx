import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Book, ImagePlus, X } from 'lucide-react';
import { Libro } from '@/types/book';

interface BookFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (book: Partial<Libro> & { imagen?: string }) => void;
  book?: Libro | null;
}

const CATEGORIAS = ['Novela', 'Cuento', 'Poesía', 'Ensayo', 'Clásico', 'Infantil', 'Educativo', 'Otro'];
const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'bajo_stock', label: 'Stock Bajo' },
  { value: 'inactivo', label: 'Inactivo' },
] as const;

const BookFormDialog = ({ open, onClose, onSave, book }: BookFormDialogProps) => {
  const isEditing = !!book;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    codigo: book?.codigo || '',
    titulo: book?.titulo || '',
    autor: book?.autor || '',
    editorial: book?.editorial || '',
    isbn: book?.isbn || '',
    categoria: book?.categoria || 'Novela',
    descripcion: book?.descripcion || '',
    stock_actual: book?.stock_actual ?? 0,
    ubicacion: book?.ubicacion || '',
    estado: book?.estado || 'activo' as Libro['estado'],
  });
  const [imagen, setImagen] = useState<string | undefined>((book as any)?.imagen);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imagen: 'La imagen no debe superar 5MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagen(ev.target?.result as string);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imagen;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.titulo.trim()) errs.titulo = 'El título es obligatorio.';
    if (!form.autor.trim()) errs.autor = 'El autor es obligatorio.';
    if (!form.codigo.trim()) errs.codigo = 'El código es obligatorio.';
    if (!form.isbn.trim()) errs.isbn = 'El ISBN es obligatorio.';
    if (!form.editorial.trim()) errs.editorial = 'La editorial es obligatoria.';
    if (form.stock_actual < 0) errs.stock_actual = 'El stock no puede ser negativo.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({ ...form, imagen } as any);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Libro' : 'Nuevo Libro'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modificá los datos del libro.' : 'Completá los datos para registrar un nuevo libro.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Image upload */}
          <div className="flex items-start gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-32 rounded-lg bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/70 transition-colors overflow-hidden ring-1 ring-border relative group"
            >
              {imagen ? (
                <>
                  <img src={imagen} alt="Portada" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagen(undefined);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-foreground/80 text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImagePlus size={20} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Portada</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs text-muted-foreground">
                Hacé clic para subir una imagen de portada. Máx 5MB.
              </p>
              {errors.imagen && <p className="text-xs text-destructive">{errors.imagen}</p>}
            </div>
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Código" value={form.codigo} onChange={(v) => handleChange('codigo', v)} error={errors.codigo} placeholder="LIB-009" />
            <FormField label="Título" value={form.titulo} onChange={(v) => handleChange('titulo', v)} error={errors.titulo} placeholder="Nombre del libro" />
            <FormField label="Autor" value={form.autor} onChange={(v) => handleChange('autor', v)} error={errors.autor} placeholder="Nombre del autor" />
            <FormField label="Editorial" value={form.editorial} onChange={(v) => handleChange('editorial', v)} error={errors.editorial} placeholder="Editorial" />
            <FormField label="ISBN" value={form.isbn} onChange={(v) => handleChange('isbn', v)} error={errors.isbn} placeholder="978-X-XXX-XXXXX-X" />
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Categoría</label>
              <select
                value={form.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <FormField label="Stock Actual" value={String(form.stock_actual)} onChange={(v) => handleChange('stock_actual', parseInt(v) || 0)} error={errors.stock_actual} type="number" />
            <FormField label="Ubicación" value={form.ubicacion} onChange={(v) => handleChange('ubicacion', v)} placeholder="Estante A-01" />
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className="w-full h-20 px-3 py-2 rounded-lg bg-secondary ring-1 ring-border focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
              placeholder="Breve descripción del libro..."
            />
          </div>

          {/* Actions */}
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
              className="h-10 px-6 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {isEditing ? 'Guardar Cambios' : 'Registrar Libro'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FormField = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-2">
    <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-10 px-3 rounded-lg bg-secondary ring-1 ${error ? 'ring-destructive' : 'ring-border'} focus:ring-2 focus:ring-primary outline-none text-sm transition-all`}
      placeholder={placeholder}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default BookFormDialog;
