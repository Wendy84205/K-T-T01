function RegisterForm() {
    return (
        <div className="form-box register">
            <form>
                <h1>Registration</h1>

                {/* SCROLL AREA */}
                <div className="form-scroll">

                    {/* PERSONAL INFO */}
                    <div className="input-box">
                        <input type="text" placeholder="First Name *" required />
                        <i className="bx bxs-user"></i>
                    </div>

                    <div className="input-box">
                        <input type="text" placeholder="Last Name *" required />
                        <i className="bx bxs-user"></i>
                    </div>

                    <div className="input-box">
                        <input type="email" placeholder="Email *" required />
                        <i className="bx bxs-envelope"></i>
                    </div>

                    <div className="input-box">
                        <input type="text" placeholder="Phone Number" />
                        <i className="bx bxs-phone"></i>
                    </div>

                    {/* LOGIN INFO */}
                    <div className="input-box">
                        <input type="text" placeholder="Username *" required />
                        <i className="bx bxs-user"></i>
                    </div>

                    <div className="input-box">
                        <input type="password" placeholder="Password *" required />
                        <i className="bx bxs-lock-alt"></i>
                    </div>

                    <div className="input-box">
                        <input
                            type="password"
                            placeholder="Confirm Password *"
                            required
                        />
                        <i className="bx bxs-lock-alt"></i>
                    </div>

                    {/* COMPANY INFO */}
                    <div className="input-box">
                        <input
                            type="text"
                            placeholder="Employee ID *"
                            required
                        />
                        <i className="bx bxs-id-card"></i>
                    </div>

                    <div className="input-box">
                        <select required>
                            <option value="">Department *</option>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <div className="input-box">
                        <input type="text" placeholder="Job Title" />
                        <i className="bx bxs-briefcase"></i>
                    </div>

                    <div className="input-box">
                        <input type="date" />
                    </div>

                </div>

                {/* MFA */}
                <div className="mfa-box">
                    <label>
                        <input type="checkbox" defaultChecked />
                        Require Multi-Factor Authentication (MFA)
                    </label>
                </div>

                <button type="submit" className="btn">Register</button>

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
