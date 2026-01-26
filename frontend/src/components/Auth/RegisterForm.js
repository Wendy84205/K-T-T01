import { useState } from 'react';
import api from '../../utils/api';

function RegisterForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        mfaRequired: true,
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [usernameAvailable, setUsernameAvailable] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear availability checks when user types
        if (name === 'email') setEmailAvailable(null);
        if (name === 'username') setUsernameAvailable(null);
    };

    const checkAvailability = async (field, value) => {
        if (!value) return;
        
        try {
            const response = await api.checkAvailability(field, value);
            if (field === 'email') {
                setEmailAvailable(response.available);
            } else {
                setUsernameAvailable(response.available);
            }
        } catch (err) {
            console.error('Availability check failed:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Validate password strength (min 8 chars, uppercase, lowercase, number, special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
            setLoading(false);
            return;
        }

        const departmentMap = {
            IT: 'IT',
            HR: 'HR',
            Finance: 'FINANCE',
            Marketing: 'MARKETING',
            Security: 'SECURITY',
            Operations: 'OPERATIONS',
            Sales: 'SALES',
            Development: 'DEVELOPMENT',
        };

        const registerData = {
            email: formData.email.trim().toLowerCase(),
            username: formData.username.trim(),
            password: formData.password,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            phone: formData.phone?.trim() || undefined,
            employeeId: formData.employeeId?.trim() || undefined,
            department: formData.department ? (departmentMap[formData.department] || formData.department) : 'IT',
            jobTitle: formData.jobTitle?.trim() || undefined,
            mfaRequired: formData.mfaRequired,
        };

        try {
            const response = await api.register(registerData);
            setSuccess('Registration successful! You can log in now.');
            
            // Clear form
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                username: '',
                password: '',
                confirmPassword: '',
                employeeId: '',
                department: '',
                jobTitle: '',
                mfaRequired: true,
            });

            // Show next steps if provided
            if (response.nextSteps && response.nextSteps.length > 0) {
                setTimeout(() => {
                    alert('Next steps:\n' + response.nextSteps.join('\n'));
                }, 1000);
            }
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-box register">
            <form onSubmit={handleSubmit}>
                <h1>Registration</h1>

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

                {success && (
                    <div style={{ 
                        color: '#00aa00', 
                        fontSize: '14px', 
                        marginBottom: '15px',
                        padding: '10px',
                        backgroundColor: '#e6ffe6',
                        borderRadius: '5px'
                    }}>
                        {success}
                    </div>
                )}

                {/* SCROLL AREA */}
                <div className="form-scroll">
                    {/* PERSONAL INFO */}
                    <div className="input-box">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name *"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <i className="bx bxs-user"></i>
                    </div>

                    <div className="input-box">
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name *"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                        <i className="bx bxs-user"></i>
                    </div>

                    <div className="input-box">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={() => checkAvailability('email', formData.email)}
                            required
                        />
                        <i className="bx bxs-envelope"></i>
                        {emailAvailable === false && (
                            <span style={{ color: '#ff4444', fontSize: '12px' }}>Email already taken</span>
                        )}
                        {emailAvailable === true && (
                            <span style={{ color: '#00aa00', fontSize: '12px' }}>Email available</span>
                        )}
                    </div>

                    <div className="input-box">
                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <i className="bx bxs-phone"></i>
                    </div>

                    {/* LOGIN INFO */}
                    <div className="input-box">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username *"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={() => checkAvailability('username', formData.username)}
                            required
                        />
                        <i className="bx bxs-user"></i>
                        {usernameAvailable === false && (
                            <span style={{ color: '#ff4444', fontSize: '12px' }}>Username already taken</span>
                        )}
                        {usernameAvailable === true && (
                            <span style={{ color: '#00aa00', fontSize: '12px' }}>Username available</span>
                        )}
                    </div>

                    <div className="input-box">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password *"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <i className="bx bxs-lock-alt"></i>
                    </div>

                    <div className="input-box">
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password *"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <i className="bx bxs-lock-alt"></i>
                    </div>

                    {/* COMPANY INFO */}
                    <div className="input-box">
                        <input
                            type="text"
                            name="employeeId"
                            placeholder="Employee ID (optional)"
                            value={formData.employeeId}
                            onChange={handleChange}
                        />
                        <i className="bx bxs-id-card"></i>
                    </div>

                    <div className="input-box">
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Department *</option>
                            <option value="IT">IT</option>
                            <option value="SECURITY">Security</option>
                            <option value="HR">HR</option>
                            <option value="FINANCE">Finance</option>
                            <option value="OPERATIONS">Operations</option>
                            <option value="SALES">Sales</option>
                            <option value="MARKETING">Marketing</option>
                            <option value="DEVELOPMENT">Development</option>
                        </select>
                    </div>

                    <div className="input-box">
                        <input
                            type="text"
                            name="jobTitle"
                            placeholder="Job Title"
                            value={formData.jobTitle}
                            onChange={handleChange}
                        />
                        <i className="bx bxs-briefcase"></i>
                    </div>
                </div>

                {/* MFA */}
                <div className="mfa-box">
                    <label>
                        <input
                            type="checkbox"
                            name="mfaRequired"
                            checked={formData.mfaRequired}
                            onChange={handleChange}
                        />
                        Require Multi-Factor Authentication (MFA)
                    </label>
                </div>

                <button type="submit" className="btn" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>

                <p>or register with social platforms</p>

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

export default RegisterForm;
