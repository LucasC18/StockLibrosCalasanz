import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView = ({ onLogin }: LoginViewProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }

    setLoading(true);
    // Simulate auth
    setTimeout(() => {
      if (email === 'admin@editorial.com' && password === 'admin123') {
        onLogin();
      } else {
        setError('Credenciales inválidas. Intentá con admin@editorial.com / admin123');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[400px] space-y-8"
      >
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-elevated mb-4">
            <BookMarked className="text-primary-foreground" size={24} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Sistema de Trazabilidad Editorial
          </h1>
          <p className="text-sm text-muted-foreground">
            Control, auditoría y seguimiento histórico de libros en depósito central.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card p-8 rounded-[20px] shadow-elevated space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Usuario
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-secondary border-none ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                placeholder="admin@editorial.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-11 rounded-lg bg-secondary border-none ring-1 ring-border focus:ring-2 focus:ring-primary transition-all outline-none text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-foreground text-background font-medium rounded-lg hover:opacity-90 active:scale-[0.98] transition-all will-change-transform disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Acceder al Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Versión 2.4.0 • Depósito Norte
        </p>
      </motion.div>
    </div>
  );
};

export default LoginView;
