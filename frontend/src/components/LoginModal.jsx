import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';

export default function LoginModal({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      onClose();
      navigate('/admin');
    } catch (err) {
      setError(err.message || '韵律不通，墨城不现');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">粉墨登场</h3>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">账号</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="墨城"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="墨韵"
              required
            />
          </div>
          
          <div className="form-error">{error}</div>
          
          <button 
            type="submit" 
            className="form-submit"
            disabled={loading}
          >
            {loading ? '登场中...' : '登场'}
          </button>
        </form>
      </div>
    </div>
  );
}
