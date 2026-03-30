import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, UserPlus, Music, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LeadCapture.css';

const LeadCapture = ({ type = 'investor', onComplete }) => {
    const { t } = useTranslation('common');
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Define questions based on type
    const questions = type === 'artist' ? [
        { id: 'name', text: t('lead_artist_q1'), type: 'text', placeholder: "e.g., The Midnight Echo" },
        { id: 'email', text: "What's the best email to reach you?", type: 'email', placeholder: "artist@example.com" },
        { id: 'spotifyUrl', text: t('lead_artist_q2'), type: 'url', placeholder: "https://open.spotify.com/artist/..." },
        { id: 'listeners', text: t('lead_artist_q3'), type: 'number', placeholder: "e.g., 250000" }
    ] : [
        { id: 'name', text: t('lead_inv_q1'), type: 'text', placeholder: "John Doe" },
        { id: 'email', text: t('lead_inv_q2'), type: 'email', placeholder: "john@example.com" },
        { id: 'budget', text: t('lead_inv_q3'), type: 'number', placeholder: "e.g., 5000" }
    ];

    const handleNext = async (e) => {
        e?.preventDefault();
        if (currentStep < questions.length) {
            setCurrentStep(curr => curr + 1);
        } else {
            // Form complete
            setIsSubmitting(true);
            setError(null);

            try {
                // Point to our new local serverless endpoint
                const endpoint = "http://localhost:3000/api/send_email";

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        role: type,
                        name: answers.name || 'Anonymous',
                        email: answers.email,
                        formAnswers: answers
                    })
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                setCurrentStep(questions.length + 1); // Go to success screen
                setTimeout(() => {
                    onComplete(answers);
                }, 3000); // Redirect after 3 seconds

            } catch (err) {
                console.error("Submission failed:", err);
                setError("Algo salió mal al enviar. Por favor intenta de nuevo.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleInputChange = (val) => {
        if (currentStep > 0 && currentStep <= questions.length) {
            setAnswers({ ...answers, [questions[currentStep - 1].id]: val });
        }
    };

    const renderIntro = () => (
        <div className="lead-step animate-fade-in content-center">
            <h1 className="lead-title text-gradient">
                {type === 'artist' ? t('lead_artist_title') : t('lead_inv_title')}
            </h1>
            <p className="lead-desc text-secondary">
                {type === 'artist' ? t('lead_artist_desc') : t('lead_inv_desc')}
            </p>
            <button className="btn-primary lead-btn mt-8" onClick={handleNext}>
                {t('lead_start')} <ArrowRight size={20} className="ml-2" />
            </button>
        </div>
    );

    const renderQuestion = () => {
        const q = questions[currentStep - 1];
        const currentAnswer = answers[q.id] || '';

        return (
            <div className="lead-step animate-fade-in">
                <div className="step-counter text-gradient">
                    {currentStep} / {questions.length}
                </div>
                <h2 className="lead-question">{q.text}</h2>

                <form onSubmit={handleNext} className="lead-form mt-8">
                    <input
                        autoFocus
                        type={q.type}
                        className="lead-input"
                        placeholder={q.placeholder}
                        value={currentAnswer}
                        onChange={(e) => handleInputChange(e.target.value)}
                        required
                    />
                    <div className="form-actions mt-8">
                        <button type="submit" className="btn-primary lead-btn" disabled={!currentAnswer || isSubmitting}>
                            {isSubmitting ? (
                                <><Loader2 size={20} className="mr-2 animate-spin" /> Enviando...</>
                            ) : currentStep === questions.length ? (
                                <>{t('lead_submit')} <ArrowRight size={20} className="ml-2" /></>
                            ) : (
                                <>{t('lead_next')} <ArrowRight size={20} className="ml-2" /></>
                            )}
                        </button>
                        <span className="text-muted text-sm ml-4 hidden-mobile">Press Enter ↵</span>
                    </div>
                    {error && <p className="error-text mt-4">{error}</p>}
                </form>
            </div>
        );
    };

    const renderSuccess = () => (
        <div className="lead-step animate-fade-in content-center">
            <div className="success-icon mb-6">
                <CheckCircle size={64} className="success-text" />
            </div>
            <h2 className="lead-title">
                {type === 'artist' ? t('lead_artist_thanks') : t('lead_inv_thanks')}
            </h2>
        </div>
    );

    return (
        <div className="lead-capture-container">
            <div className="lead-progress-bar" style={{ width: `${(currentStep / (questions.length + 1)) * 100}%` }}></div>
            <div className="lead-content-area">
                {currentStep === 0 && renderIntro()}
                {(currentStep > 0 && currentStep <= questions.length) && renderQuestion()}
                {currentStep > questions.length && renderSuccess()}
            </div>
        </div>
    );
};

export default LeadCapture;
