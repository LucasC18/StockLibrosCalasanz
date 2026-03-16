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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        * { box-sizing: border-box; }

        .lv-root {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          background: #f5f1ee;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        .lv-bg-1 {
          position: absolute;
          top: -180px; left: -180px;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(107,18,40,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .lv-bg-2 {
          position: absolute;
          bottom: -140px; right: -140px;
          width: 440px; height: 440px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(107,18,40,0.05) 0%, transparent 65%);
          pointer-events: none;
        }

        /* ── Institution header ── */
        .lv-institution {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .lv-logo {
          width: 58px; height: 58px;
          border-radius: 18px;
          background: #6b1228;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(107,18,40,0.3);
        }

        .lv-inst-name {
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.01em;
          line-height: 1.3;
        }

        .lv-inst-sub {
          font-size: 13px;
          font-weight: 400;
          color: #9e8e88;
          margin-top: 3px;
        }

        /* ── Card ── */
        .lv-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 22px;
          padding: 40px 40px 36px;
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 12px 48px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
        }

        /* Burdó top accent */
        .lv-card::before {
          content: '';
          position: absolute;
          top: 0; left: 36px; right: 36px;
          height: 3px;
          background: #6b1228;
          border-radius: 0 0 4px 4px;
        }

        .lv-card-title {
          font-size: 23px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.025em;
          margin: 0 0 5px;
          line-height: 1.2;
        }

        .lv-card-desc {
          font-size: 14px;
          font-weight: 400;
          color: #9e8e88;
          margin: 0 0 26px;
          line-height: 1.5;
        }

        .lv-divider {
          height: 1px;
          background: #ede7e2;
          margin-bottom: 26px;
        }

        /* ── Fields ── */
        .lv-fields {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 20px;
        }

        .lv-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .lv-field label {
          font-size: 13px;
          font-weight: 600;
          color: #3a3030;
          letter-spacing: 0;
        }

        .lv-input-wrap { position: relative; }

        .lv-input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #1a1a1a;
          background: #faf7f5;
          border: 1.5px solid #e4dbd6;
          border-radius: 12px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }

        .lv-input::placeholder { color: #c5b5ae; }

        .lv-input:focus {
          border-color: #6b1228;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(107,18,40,0.08);
        }

        .lv-input.pw { padding-right: 50px; }

        .lv-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #b5a09a;
          display: flex; align-items: center;
          padding: 4px;
          transition: color 0.15s;
          line-height: 0;
        }

        .lv-eye:hover { color: #6b1228; }

        /* ── Error box ── */
        .lv-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fdf2f4;
          border: 1px solid #f0c8d0;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 18px;
        }

        .lv-error-dot {
          flex-shrink: 0;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6b1228;
          margin-top: 6px;
        }

        .lv-error p {
          font-size: 13px;
          font-weight: 400;
          color: #6b1228;
          margin: 0;
          line-height: 1.55;
        }

        /* ── Submit ── */
        .lv-submit {
          width: 100%;
          height: 50px;
          background: #6b1228;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(107,18,40,0.32);
          transition: background 0.18s, box-shadow 0.18s, transform 0.1s;
        }

        .lv-submit::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%);
          pointer-events: none;
        }

        .lv-submit:hover:not(:disabled) {
          background: #7c1530;
          box-shadow: 0 6px 24px rgba(107,18,40,0.4);
        }

        .lv-submit:active:not(:disabled) {
          transform: scale(0.988);
          box-shadow: 0 2px 8px rgba(107,18,40,0.2);
        }

        .lv-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lv-spinner {
          display: inline-block;
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lv-spin 0.65s linear infinite;
          vertical-align: middle;
          margin-right: 9px;
        }

        @keyframes lv-spin { to { transform: rotate(360deg); } }

        /* ── Footer ── */
        .lv-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 22px;
          position: relative;
          z-index: 1;
        }

        .lv-beta {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #6b1228;
          background: rgba(107,18,40,0.08);
          border: 1px solid rgba(107,18,40,0.14);
          border-radius: 99px;
          padding: 3px 10px;
        }

        .lv-footer-text {
          font-size: 12px;
          color: #c0b0aa;
          font-weight: 400;
        }
      `}</style>

      <div className="lv-root">
        <div className="lv-bg-1" />
        <div className="lv-bg-2" />

        <motion.div
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Institution */}
          <div className="lv-institution">
            <div className="lv-logo">
              <BookMarked color="#fff" size={26} />
            </div>
            <div>
              <div className="lv-inst-name">Escuelas Pías · Colegio Calasanz</div>
              <div className="lv-inst-sub">Sistema de Gestión de Biblioteca</div>
            </div>
          </div>

          {/* Card */}
          <div className="lv-card">
            <div className="lv-card-title">Iniciar sesión</div>
            <div className="lv-card-desc">Ingresá tus credenciales para continuar</div>
            <div className="lv-divider" />

            <form onSubmit={handleSubmit}>
              <div className="lv-fields">
                <div className="lv-field">
                  <label htmlFor="email">Usuario</label>
                  <div className="lv-input-wrap">
                    <input
                      id="email"
                      type="email"
                      className="lv-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tuemail@editorial.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="lv-field">
                  <label htmlFor="password">Contraseña</label>
                  <div className="lv-input-wrap">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="lv-input pw"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="lv-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  className="lv-error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="lv-error-dot" />
                  <p>{error}</p>
                </motion.div>
              )}

              <button type="submit" className="lv-submit" disabled={loading}>
                {loading && <span className="lv-spinner" />}
                {loading ? 'Verificando...' : 'Acceder al Panel'}
              </button>
            </form>
          </div>

          <div className="lv-footer">
            <span className="lv-beta">Beta</span>
            <span className="lv-footer-text">Sistema interno — acceso restringido</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginView;