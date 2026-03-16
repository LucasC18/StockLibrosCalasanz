import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { Usuario } from '@/types/book';

interface LoginViewProps {
  onLogin: (token: string, user: Usuario) => void;
}

const LoginView = ({ onLogin }: LoginViewProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }

    try {
      setLoading(true);
      const result = await api.login(email, password);
      localStorage.setItem('token', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      onLogin(result.accessToken, result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');

        .login-root {
          min-height: 100svh;
          display: flex;
          background: #f7f4f0;
          font-family: 'Lato', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* ── Left decorative panel ── */
        .login-panel {
          display: none;
          width: 42%;
          background: #6b1228;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          justify-content: flex-end;
          padding: 52px 48px;
        }

        @media (min-width: 900px) {
          .login-panel { display: flex; }
        }

        /* Geometric top-left corner accent */
        .panel-corner {
          position: absolute;
          top: 0; left: 0;
          width: 200px; height: 200px;
          background: rgba(255,255,255,0.05);
          border-radius: 0 0 200px 0;
        }

        /* Subtle diagonal stripe texture */
        .panel-texture {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 28px,
            rgba(255,255,255,0.025) 28px,
            rgba(255,255,255,0.025) 29px
          );
        }

        .panel-bottom-arc {
          position: absolute;
          bottom: -80px; right: -80px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }

        .panel-crest {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 40px;
        }

        .panel-crest-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .panel-crest-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          line-height: 1.3;
        }

        .panel-heading {
          position: relative;
          z-index: 2;
        }

        .panel-heading h2 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          margin: 0 0 16px;
        }

        .panel-heading p {
          font-size: 13px;
          font-weight: 300;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          margin: 0;
          max-width: 280px;
        }

        .panel-divider {
          width: 48px;
          height: 2px;
          background: rgba(255,255,255,0.3);
          margin: 20px 0;
          position: relative;
          z-index: 2;
        }

        /* ── Right form side ── */
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
        }

        /* Soft background blob */
        .form-bg-blob {
          position: absolute;
          top: -120px; right: -120px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(107,18,40,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          position: relative;
          z-index: 1;
        }

        /* Mobile-only header */
        .mobile-header {
          text-align: center;
          margin-bottom: 36px;
        }

        @media (min-width: 900px) {
          .mobile-header { display: none; }
        }

        .mobile-header-icon {
          display: inline-flex;
          width: 52px; height: 52px;
          border-radius: 14px;
          background: #6b1228;
          align-items: center; justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(107,18,40,0.25);
        }

        .mobile-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px;
          line-height: 1.3;
        }

        .mobile-header p {
          font-size: 12px;
          color: #8a8a8a;
          margin: 0;
          line-height: 1.6;
        }

        /* Form card */
        .form-card {
          background: #fff;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow:
            0 1px 3px rgba(0,0,0,0.04),
            0 8px 32px rgba(0,0,0,0.08),
            0 0 0 1px rgba(0,0,0,0.04);
        }

        .form-card-header {
          margin-bottom: 32px;
        }

        .form-card-header .eyebrow {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #6b1228;
          margin-bottom: 8px;
        }

        .form-card-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px;
          line-height: 1.3;
        }

        .form-card-header p {
          font-size: 13px;
          color: #8a8a8a;
          margin: 0;
          font-weight: 300;
        }

        /* Separator */
        .form-card-sep {
          height: 1px;
          background: linear-gradient(90deg, #e8e0dc, transparent);
          margin-bottom: 28px;
        }

        /* Field */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #5a5a5a;
        }

        .field-input-wrap {
          position: relative;
        }

        .field input {
          width: 100%;
          height: 44px;
          padding: 0 16px;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          background: #f9f6f3;
          border: 1.5px solid #e6ddd8;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }

        .field input::placeholder {
          color: #bbb;
        }

        .field input:focus {
          border-color: #6b1228;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(107,18,40,0.1);
        }

        .field input.has-toggle {
          padding-right: 44px;
        }

        .toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s;
        }

        .toggle-btn:hover {
          color: #6b1228;
        }

        /* Error */
        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fdf2f4;
          border: 1px solid #f0c8d0;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
        }

        .error-dot {
          flex-shrink: 0;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6b1228;
          margin-top: 5px;
        }

        .error-box p {
          font-size: 13px;
          color: #6b1228;
          margin: 0;
          line-height: 1.5;
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          height: 46px;
          background: #6b1228;
          color: #fff;
          font-family: 'Lato', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.06em;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(107,18,40,0.3);
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
          pointer-events: none;
        }

        .submit-btn:hover:not(:disabled) {
          background: #7d1630;
          box-shadow: 0 6px 20px rgba(107,18,40,0.38);
        }

        .submit-btn:active:not(:disabled) {
          transform: scale(0.985);
          box-shadow: 0 2px 8px rgba(107,18,40,0.2);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .form-footer {
          text-align: center;
          margin-top: 24px;
        }

        .form-footer p {
          font-size: 11px;
          color: #bbb;
          margin: 0;
          letter-spacing: 0.04em;
        }

        .beta-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b1228;
          background: rgba(107,18,40,0.08);
          border: 1px solid rgba(107,18,40,0.15);
          border-radius: 99px;
          padding: 3px 9px;
          margin-bottom: 6px;
        }
      `}</style>

      <div className="login-root">
        {/* Left decorative panel */}
        <div className="login-panel">
          <div className="panel-corner" />
          <div className="panel-texture" />
          <div className="panel-bottom-arc" />

          <div className="panel-crest">
            <div className="panel-crest-icon">
              <BookMarked color="#fff" size={22} />
            </div>
            <div className="panel-crest-name">
              Escuelas Pías<br />Colegio Calasanz
            </div>
          </div>

          <div className="panel-heading">
            <h2>Sistema de Gestión<br />de Biblioteca</h2>
            <div className="panel-divider" />
            <p>
              Control, auditoría y seguimiento histórico de libros
              en depósito central. Acceso exclusivo para personal autorizado.
            </p>
          </div>
        </div>

        {/* Right form side */}
        <div className="login-form-side">
          <div className="form-bg-blob" />

          <motion.div
            className="form-container"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Mobile-only header */}
            <div className="mobile-header">
              <div className="mobile-header-icon">
                <BookMarked color="#fff" size={24} />
              </div>
              <h1>Escuelas Pías<br />Colegio Calasanz</h1>
              <p>Sistema de Gestión de Biblioteca</p>
            </div>

            {/* Card */}
            <div className="form-card">
              <div className="form-card-header">
                <span className="eyebrow">Acceso al sistema</span>
                <h2>Iniciar sesión</h2>
                <p>Ingresá tus credenciales para continuar</p>
              </div>

              <div className="form-card-sep" />

              <form onSubmit={handleSubmit}>
                <div className="field-group">
                  <div className="field">
                    <label htmlFor="email">Usuario</label>
                    <div className="field-input-wrap">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tuemail@editorial.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="password">Contraseña</label>
                    <div className="field-input-wrap">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="has-toggle"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    className="error-box"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="error-dot" />
                    <p>{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading && <span className="spinner" />}
                  {loading ? 'Verificando...' : 'Acceder al Panel'}
                </button>
              </form>
            </div>

            <div className="form-footer">
              <span className="beta-badge">Beta</span>
              <p>Sistema interno — acceso restringido</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginView;