import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ImagePlus, X } from 'lucide-react';
import { LibroResumen } from '@/types/book';

interface BookFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (book: Partial<LibroResumen> & { imagen?: string }) => void;
  book?: LibroResumen | null;
}

const CATEGORIAS = [
  'Novela', 'Cuento', 'Poesía', 'Ensayo',
  'Clásico', 'Infantil', 'Educativo', 'Otro',
];

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'bajo_stock', label: 'Stock Bajo' },
  { value: 'inactivo', label: 'Inactivo' },
] as const;

const getInitialForm = (book?: LibroResumen | null) => ({
  codigo: book?.codigo || '',
  titulo: book?.titulo || '',
  autor: book?.autor || '',
  editorial: book?.editorial || '',
  isbn: book?.isbn || '',
  categoria: book?.categoria || 'Novela',
  descripcion: book?.descripcion || '',
  stock_actual: book?.stock_actual ?? 0,
  ubicacion: book?.ubicacion || '',
  estado: book?.estado || ('activo' as LibroResumen['estado']),
});

const BookFormDialog = ({ open, onClose, onSave, book }: BookFormDialogProps) => {
  const isEditing = !!book;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(getInitialForm(book));
  const [imagen, setImagen] = useState<string | undefined>(book?.imagen);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(getInitialForm(book));
    setImagen(book?.imagen);
    setErrors({});
  }, [book, open]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
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
      setErrors((prev) => { const next = { ...prev }; delete next.imagen; return next; });
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
    if (!form.ubicacion.trim()) errs.ubicacion = 'La ubicación es obligatoria.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ ...form, imagen });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        /* ── Dialog shell ── */
        .bfd-wrap [role="dialog"] {
          font-family: 'DM Sans', sans-serif !important;
          border-radius: 22px !important;
          border: 1px solid #e4dbd6 !important;
          box-shadow: 0 24px 64px rgba(0,0,0,0.13) !important;
          padding: 0 !important;
          overflow: hidden !important;
          max-width: 640px !important;
        }

        /* ── Header ── */
        .bfd-header {
          background: #6b1228;
          padding: 26px 32px 22px;
          position: relative;
          overflow: hidden;
        }

        .bfd-header::before {
          content: '';
          position: absolute;
          top: -50px; right: -50px;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }

        .bfd-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }

        .bfd-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-bottom: 5px;
        }

        .bfd-header h2 {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 21px !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          color: #fff !important;
          margin: 0 0 4px !important;
          line-height: 1.2 !important;
        }

        .bfd-header p {
          font-size: 13px !important;
          font-weight: 400 !important;
          color: rgba(255,255,255,0.55) !important;
          margin: 0 !important;
          line-height: 1.4 !important;
        }

        /* ── Body ── */
        .bfd-body {
          padding: 26px 32px 30px;
          background: #f5f1ee;
        }

        /* ── Cover row ── */
        .bfd-cover-row {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 24px;
          padding: 18px 20px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e4dbd6;
        }

        .bfd-cover-upload {
          flex-shrink: 0;
          width: 76px; height: 108px;
          border-radius: 10px;
          background: #f0ebe6;
          border: 1.5px dashed #c9b8b0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          position: relative;
          transition: border-color 0.18s, background 0.18s;
        }

        .bfd-cover-upload:hover {
          border-color: #6b1228;
          background: #f5eeeb;
        }

        .bfd-cover-upload img { width: 100%; height: 100%; object-fit: cover; }

        .bfd-cover-remove {
          position: absolute;
          top: 4px; right: 4px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(107,18,40,0.88);
          color: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .bfd-cover-upload:hover .bfd-cover-remove { opacity: 1; }

        .bfd-cover-placeholder {
          display: flex; flex-direction: column;
          align-items: center; gap: 6px;
          color: #a89890;
        }

        .bfd-cover-placeholder span {
          font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
        }

        .bfd-cover-info { flex: 1; padding-top: 2px; }

        .bfd-cover-info strong {
          display: block;
          font-size: 13px; font-weight: 600;
          color: #2a2a2a; margin-bottom: 4px;
        }

        .bfd-cover-info p {
          font-size: 12px; font-weight: 400;
          color: #9a8a84; margin: 0; line-height: 1.55;
        }

        .bfd-cover-error {
          font-size: 12px; color: #6b1228;
          margin-top: 6px; display: block;
        }

        /* ── Section divider ── */
        .bfd-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .bfd-section-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b1228;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }

        .bfd-section-line {
          flex: 1;
          height: 1px;
          background: #e4dbd6;
        }

        /* ── Grid ── */
        .bfd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        @media (max-width: 560px) { .bfd-grid { grid-template-columns: 1fr; } }

        /* ── Field ── */
        .bfd-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bfd-field label {
          font-size: 13px;
          font-weight: 600;
          color: #3a3030;
          letter-spacing: 0;
        }

        .bfd-field input,
        .bfd-field select,
        .bfd-field textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          color: #1a1a1a;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          width: 100%;
          box-sizing: border-box;
        }

        .bfd-field input,
        .bfd-field select { height: 42px; padding: 0 12px; }

        .bfd-field textarea {
          height: 84px;
          padding: 10px 12px;
          resize: none;
          line-height: 1.55;
        }

        .bfd-field input::placeholder,
        .bfd-field textarea::placeholder { color: #c5b5ae; }

        .bfd-field input:focus,
        .bfd-field select:focus,
        .bfd-field textarea:focus {
          border-color: #6b1228;
          box-shadow: 0 0 0 3px rgba(107,18,40,0.08);
        }

        .bfd-field input.err,
        .bfd-field select.err {
          border-color: #c0392b;
          background: #fff8f7;
        }

        .bfd-field-error {
          font-size: 12px;
          color: #6b1228;
          font-weight: 400;
        }

        /* Custom select arrow */
        .bfd-field select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b1228' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          cursor: pointer;
        }

        /* ── Footer ── */
        .bfd-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          padding-top: 6px;
        }

        .bfd-btn-cancel {
          height: 42px; padding: 0 20px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #7a6a64;
          background: #fff;
          border: 1.5px solid #e4dbd6;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }

        .bfd-btn-cancel:hover {
          background: #f0ebe6;
          color: #3a3a3a;
          border-color: #c9b8b0;
        }

        .bfd-btn-submit {
          height: 42px; padding: 0 24px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          color: #fff;
          background: #6b1228;
          border: none; cursor: pointer;
          box-shadow: 0 4px 14px rgba(107,18,40,0.28);
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
          position: relative; overflow: hidden;
        }

        .bfd-btn-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%);
          pointer-events: none;
        }

        .bfd-btn-submit:hover {
          background: #7c1530;
          box-shadow: 0 6px 18px rgba(107,18,40,0.36);
        }

        .bfd-btn-submit:active { transform: scale(0.987); }
      `}</style>

      <div className="bfd-wrap">
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">

            {/* Header */}
            <div className="bfd-header">
              <span className="bfd-eyebrow">
                {isEditing ? 'Modificar registro' : 'Nuevo registro'}
              </span>
              <DialogTitle asChild>
                <h2>{isEditing ? 'Editar libro' : 'Registrar nuevo libro'}</h2>
              </DialogTitle>
              <DialogDescription asChild>
                <p>
                  {isEditing
                    ? 'Modificá los datos del libro y guardá los cambios.'
                    : 'Completá los campos para incorporar el libro al sistema.'}
                </p>
              </DialogDescription>
            </div>

            {/* Body */}
            <div className="bfd-body">
              <form onSubmit={handleSubmit}>

                {/* Cover upload */}
                <div className="bfd-cover-row">
                  <div className="bfd-cover-upload" onClick={() => fileInputRef.current?.click()}>
                    {imagen ? (
                      <>
                        <img src={imagen} alt="Portada" />
                        <button
                          type="button"
                          className="bfd-cover-remove"
                          onClick={(e) => { e.stopPropagation(); setImagen(undefined); }}
                          aria-label="Eliminar portada"
                        >
                          <X size={11} />
                        </button>
                      </>
                    ) : (
                      <div className="bfd-cover-placeholder">
                        <ImagePlus size={18} />
                        <span>Portada</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="bfd-cover-info">
                    <strong>Imagen de portada</strong>
                    <p>Hacé clic en el recuadro para subir una imagen. Formato JPG, PNG o WEBP. Tamaño máximo 5 MB.</p>
                    {errors.imagen && <span className="bfd-cover-error">{errors.imagen}</span>}
                  </div>
                </div>

                {/* Identification */}
                <div className="bfd-section">
                  <span className="bfd-section-title">Identificación</span>
                  <div className="bfd-section-line" />
                </div>
                <div className="bfd-grid">
                  <FormField label="Código" value={form.codigo} onChange={(v) => handleChange('codigo', v)} error={errors.codigo} placeholder="LIB-009" />
                  <FormField label="ISBN" value={form.isbn} onChange={(v) => handleChange('isbn', v)} error={errors.isbn} placeholder="978-X-XXX-XXXXX-X" />
                  <FormField label="Título" value={form.titulo} onChange={(v) => handleChange('titulo', v)} error={errors.titulo} placeholder="Nombre del libro" />
                  <FormField label="Autor" value={form.autor} onChange={(v) => handleChange('autor', v)} error={errors.autor} placeholder="Nombre del autor" />
                  <FormField label="Editorial" value={form.editorial} onChange={(v) => handleChange('editorial', v)} error={errors.editorial} placeholder="Editorial" />
                  <div className="bfd-field">
                    <label>Categoría</label>
                    <select value={form.categoria} onChange={(e) => handleChange('categoria', e.target.value)}>
                      {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Inventory */}
                <div className="bfd-section" style={{ marginTop: 4 }}>
                  <span className="bfd-section-title">Inventario</span>
                  <div className="bfd-section-line" />
                </div>
                <div className="bfd-grid">
                  <FormField label="Stock actual" value={String(form.stock_actual)} onChange={(v) => handleChange('stock_actual', parseInt(v) || 0)} error={errors.stock_actual} type="number" />
                  <FormField label="Ubicación" value={form.ubicacion} onChange={(v) => handleChange('ubicacion', v)} error={errors.ubicacion} placeholder="Estante A-01" />
                  <div className="bfd-field">
                    <label>Estado</label>
                    <select value={form.estado} onChange={(e) => handleChange('estado', e.target.value as LibroResumen['estado'])}>
                      {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="bfd-section" style={{ marginTop: 4 }}>
                  <span className="bfd-section-title">Descripción</span>
                  <div className="bfd-section-line" />
                </div>
                <div className="bfd-field" style={{ marginBottom: 22 }}>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Breve descripción del libro..."
                  />
                </div>

                {/* Footer */}
                <div className="bfd-footer">
                  <button type="button" className="bfd-btn-cancel" onClick={onClose}>
                    Cancelar
                  </button>
                  <button type="submit" className="bfd-btn-submit">
                    {isEditing ? 'Guardar cambios' : 'Registrar libro'}
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

const FormField = ({
  label, value, onChange, error, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) => (
  <div className="bfd-field">
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={error ? 'err' : ''}
      placeholder={placeholder}
    />
    {error && <span className="bfd-field-error">{error}</span>}
  </div>
);

export default BookFormDialog;