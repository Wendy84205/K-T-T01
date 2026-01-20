import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import TogglePanel from "./TogglePanel";
import "../../styles/auth.css";

function AuthContainer() {
    const [isRegister, setIsRegister] = useState(false);

    return (
        <div className={`container ${isRegister ? "active" : ""}`}>
            <LoginForm />
            <RegisterForm />
            <TogglePanel setIsRegister={setIsRegister} />
        </div>
    );
}

export default AuthContainer;
