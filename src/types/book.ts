export type TipoEvento =
  | 'ALTA'
  | 'ENVIO'
  | 'AJUSTE_STOCK'
  | 'INGRESO'
  | 'MODIFICACION'
  | 'DEVOLUCION'
  | 'CORRECCION'
  | 'BAJA';

export interface EventoHistorial {
  id: string;
  libro_id: string;
  tipo_evento: TipoEvento;
  descripcion_evento: string;
  stock_anterior: number;
  stock_nuevo: number;
  provincia_destino?: string;
  usuario_responsable: string;
  fecha_evento: string;
  observaciones?: string;
}

export interface LibroResumen {
  id: string;
  codigo: string;
  titulo: string;
  autor: string;
  editorial: string;
  isbn: string;
  categoria: string;
  descripcion: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion: string;
  estado: 'activo' | 'inactivo' | 'bajo_stock';
  fecha_alta: string;
  fecha_ultima_modificacion: string;
  ultima_provincia: string;
  imagen?: string;
}

export interface LibroDetalle extends LibroResumen {
  historial: EventoHistorial[];
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'operador' | 'auditor';
}

export const EVENT_CONFIG: Record<
  TipoEvento,
  { label: string; colorClass: string; bgClass: string; dotClass: string }
> = {
  ALTA: { label: 'Alta', colorClass: 'text-emerald-700', bgClass: 'bg-emerald-50', dotClass: 'bg-emerald-500' },
  ENVIO: { label: 'Envío', colorClass: 'text-blue-700', bgClass: 'bg-blue-50', dotClass: 'bg-blue-500' },
  AJUSTE_STOCK: { label: 'Ajuste Stock', colorClass: 'text-amber-700', bgClass: 'bg-amber-50', dotClass: 'bg-amber-500' },
  INGRESO: { label: 'Ingreso', colorClass: 'text-green-700', bgClass: 'bg-green-50', dotClass: 'bg-green-500' },
  MODIFICACION: { label: 'Modificación', colorClass: 'text-slate-600', bgClass: 'bg-slate-100', dotClass: 'bg-slate-500' },
  DEVOLUCION: { label: 'Devolución', colorClass: 'text-violet-700', bgClass: 'bg-violet-50', dotClass: 'bg-violet-500' },
  CORRECCION: { label: 'Corrección', colorClass: 'text-orange-700', bgClass: 'bg-orange-50', dotClass: 'bg-orange-500' },
  BAJA: { label: 'Baja', colorClass: 'text-red-700', bgClass: 'bg-red-50', dotClass: 'bg-red-500' },
};