import LoginForm from "./LoginForm";
import "../../styles/auth.css";

function AuthContainer() {

    return (
        <div 
            className="container glass-morphism animate-fade-in" 
            style={{ 
                width: '440px', 
                height: 'auto', 
                minHeight: '520px',
                display: 'flex', 
                justifyContent: 'center', 
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                overflow: 'visible' 
            }}
        >
            <LoginForm />
        </div>
    );
}

export default AuthContainer;
