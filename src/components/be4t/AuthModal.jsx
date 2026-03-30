import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Music, Mail, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../core/xplit/supabaseClient';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, songName, onLogin }) => {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sentStatus, setSentStatus] = useState(null);

    // Escape key listener for closing modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleMagicLink = async (e) => {
        e.preventDefault();
        if (!email) return;
        
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ 
            email,
            options: { emailRedirectTo: window.location.origin }
        });
        setIsLoading(false);

        if (error) {
            console.error('Supabase Error:', error);
            setSentStatus('error');
        } else {
            setSentStatus('success');
        }
    };

    const handleGoogleAuth = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    if (!isOpen) return null;

    // Close when clicking outside the modal content
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('auth-modal-overlay')) {
            onClose();
        }
    };

    return createPortal(
        <div className="auth-modal-overlay animate-fade-in" onClick={handleBackdropClick}>
            <div className="auth-modal-content glass-panel" role="dialog" aria-modal="true">
                <button className="auth-modal-close" onClick={onClose} aria-label="Close">×</button>

                <div className="auth-modal-header">
                    <div className="auth-icon-wrapper">
                        <Music size={24} className="text-gradient" />
                    </div>
                    <h2>{t('auth_title')}</h2>
                </div>

                <div className="auth-modal-body">
                    <p className="primary-msg">
                        {t('auth_desc1')} <strong>{songName}</strong> {t('auth_desc1_p2')}
                    </p>
                    <p className="secondary-msg text-secondary mt-3">
                        {t('auth_desc2')}
                    </p>
                </div>

                <div className="auth-modal-actions">
                    {sentStatus === 'success' ? (
                        <div className="auth-success-msg animate-fade-in">
                            <Mail size={32} style={{ margin: '0 auto 1rem', display: 'block' }} />
                            <p>¡Hemos enviado un Enlace Mágico seguro a tu correo!</p>
                            <p className="text-sm mt-3" style={{ opacity: 0.8 }}>Si no lo ves, revisa tu bandeja de SPAM.</p>
                            <button className="btn-secondary full-width mt-4" onClick={() => setSentStatus(null)}>Volver</button>
                        </div>
                    ) : (
                        <form className="auth-form" onSubmit={handleMagicLink}>
                            {sentStatus === 'error' && <p style={{color: '#ff4444', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center'}}>Hubo un error al enviar el enlace. Revisa la consola o intenta con Google.</p>}
                            
                            <input 
                                type="email" 
                                placeholder="tu@correo.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input full-width mb-3"
                                required
                                disabled={isLoading}
                            />
                            
                            <button type="submit" className="btn-primary full-width mb-3" disabled={isLoading}>
                                {isLoading ? 'Conectando...' : t('auth_btn_create')}
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', margin: '0.5rem 0 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
                                <hr style={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: '10px' }}/>
                                O
                                <hr style={{ flexGrow: 1, borderColor: 'rgba(255,255,255,0.1)', marginLeft: '10px' }}/>
                            </div>
                            
                            <button type="button" className="btn-secondary full-width" onClick={handleGoogleAuth} disabled={isLoading}>
                                Entrar con Google
                            </button>
                            
                            <button type="button" className="btn-tertiary mt-3" onClick={onClose} disabled={isLoading}>
                                {t('auth_btn_guest')}
                            </button>
                        </form>
                    )}
                </div>

                <div className="auth-modal-footer">
                    <p className="text-muted text-sm text-center">
                        {t('auth_footer')}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AuthModal;
