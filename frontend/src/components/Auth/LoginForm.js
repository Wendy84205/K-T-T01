import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [mfaToken, setMfaToken] = useState('');
    const [mfaMethods, setMfaMethods] = useState([]);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(identifier, password);
            
            if (response.requiresMfa) {
                setMfaRequired(true);
                setTempToken(response.tempToken);
                setMfaMethods(response.mfaMethods);
            } else {
                login(response);
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.verifyMfa(mfaToken, tempToken);
            login(response);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid MFA token. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (mfaRequired) {
        return (
            <div className="form-box login">
                <form onSubmit={handleMfaVerify}>
                    <h1>Multi-Factor Authentication</h1>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                        Please enter your {mfaMethods.includes('totp') ? 'TOTP' : 'MFA'} code
                    </p>

                    {error && (
                        <div style={{ 
                            color: '#ff4444', 
                            fontSize: '14px', 
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '5px'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Enter MFA code"
                            value={mfaToken}
                            onChange={(e) => setMfaToken(e.target.value)}
                            required
                            maxLength="6"
                        />
                        <i className="bx bxs-lock-alt"></i>
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMfaRequired(false);
                            setMfaToken('');
                            setTempToken('');
                        }}
                        style={{
                            marginTop: '10px',
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Back to login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="form-box login">
            <form onSubmit={handleLogin}>
                <h1>Login</h1>

                {error && (
                    <div style={{ 
                        color: '#ff4444', 
                        fontSize: '14px', 
                        marginBottom: '15px',
                        padding: '10px',
                        backgroundColor: '#ffe6e6',
                        borderRadius: '5px'
                    }}>
                        {error}
                    </div>
                )}

                <div className="input-box">
                    <input
                        type="text"
                        placeholder="Email or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <i className="bx bxs-user"></i>
                </div>

                <div className="input-box">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <i className="bx bxs-lock-alt"></i>
                </div>

                <div className="forgot-link">
                    <a href="#">Forgot Password?</a>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <p>or login with social platforms</p>

                <div className="social-icons">
                    <a href="#"><i className="bx bxl-google"></i></a>
                    <a href="#"><i className="bx bxl-facebook"></i></a>
                    <a href="#"><i className="bx bxl-github"></i></a>
                    <a href="#"><i className="bx bxl-linkedin"></i></a>
                </div>
            </form>
        </div>
    );
}

export default LoginForm;
