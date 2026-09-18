import React, { useState } from 'react';
import type { Hospital, Review } from '../../types';
import { translateTextToEnglish } from '../../lib/translation';
import { getActivePatientSession } from '../../lib/userAuth';
import { 
  X, 
  Star, 
  Mic, 
  MicOff, 
  Languages, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Building2,
  Lock
} from 'lucide-react';

interface LeaveReviewModalProps {
  hospital: Hospital;
  onClose: () => void;
  onSuccess: (newReview: Review) => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  hospital,
  onClose,
  onSuccess
}) => {
  // Retrieve current patient name from session or localStorage
  const getInitialPatientName = (): string => {
    return getActivePatientSession().name;
  };

  const [patientName, setPatientName] = useState<string>(getInitialPatientName());
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  
  // Voice & Speech Recognition State
  const [speechLang, setSpeechLang] = useState<'ta-IN' | 'en-IN'>('ta-IN');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [wasVoiceUsed, setWasVoiceUsed] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Loading & Translation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Speech Recognition toggle
  const toggleSpeechRecording = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech API is not supported on this browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsRecording(true);
        setWasVoiceUsed(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setComment((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError('Microphone access denied. Please enable mic permissions in browser.');
        } else {
          setSpeechError(`Voice input error (${event.error}). Please click mic to try again.`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setSpeechError('Failed to initialize microphone.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setErrorMessage('Please type or record your review comment before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-translate to English if recorded/written in Tamil or non-English
      const transResult = await translateTextToEnglish(trimmedComment);

      const newReview: Review = {
        id: `rev-${Date.now()}`,
        hospitalId: hospital.id,
        patientName: patientName.trim() || 'Anonymous Patient',
        rating,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        comment: transResult.translatedText,
        originalComment: transResult.isTranslated ? trimmedComment : undefined,
        originalLanguage: transResult.originalLang,
        isVoice: wasVoiceUsed
      };

      onSuccess(newReview);
      onClose();
    } catch (err: any) {
      setErrorMessage('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: '1.0 - Poor Experience',
    2: '2.0 - Fair / Average',
    3: '3.0 - Good Care',
    4: '4.0 - Very Good Service',
    5: '5.0 - Excellent & Highly Recommended'
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div 
        className="modal" 
        style={{ 
          maxWidth: '520px', 
          width: '100%', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(15, 39, 68, 0.2)' 
        }}
      >
        {/* Modal Header */}
        <div style={{ background: 'linear-gradient(140deg, #16a3ae, #0d6e7d)', padding: '20px 24px', color: '#fff', position: 'relative' }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ position: 'absolute', right: 16, top: 16, background: 'rgba(255,255,255,0.2)', border: 0, color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Building2 size={20} color="#fff" />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
              Leave a Patient Review
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: '#fff' }}>
            {hospital.name}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.95 }}>
            Share your feedback via text or voice in Tamil or English
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div style={{ background: '#fdf1f1', border: '1px solid #f7d4d4', color: '#d94a4a', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Patient Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
              Your Name (Patient) *
            </label>
            <input 
              type="text" 
              className="form-control"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Praveen Kumar"
              style={{ width: '100%', height: '42px', borderRadius: '9px', fontSize: '13.5px', fontWeight: 600 }}
              required
            />
          </div>

          {/* Star Rating Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Overall Rating *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s ease' }}
                >
                  <Star 
                    size={28} 
                    fill={(hoverRating || rating) >= star ? '#f5a623' : 'none'} 
                    color={(hoverRating || rating) >= star ? '#f5a623' : '#cbd5e1'} 
                  />
                </button>
              ))}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>
              {ratingLabels[hoverRating || rating]}
            </div>
          </div>

          {/* Voice Input Controls & Language Switcher */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>
                <Languages size={15} color="var(--teal)" />
                <span>Voice Speech-to-Text Language:</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  onClick={() => setSpeechLang('ta-IN')}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: speechLang === 'ta-IN' ? '#0e7c86' : '#fff',
                    color: speechLang === 'ta-IN' ? '#fff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  🇮🇳 Tamil (தமிழ்)
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechLang('en-IN')}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: speechLang === 'en-IN' ? '#0e7c86' : '#fff',
                    color: speechLang === 'en-IN' ? '#fff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Voice Mic Record Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={toggleSpeechRecording}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 0,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: isRecording ? '#e11d48' : '#16a3ae',
                  color: '#ffffff',
                  boxShadow: isRecording ? '0 0 0 4px rgba(225, 29, 72, 0.25)' : '0 2px 6px rgba(22, 163, 174, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isRecording ? 'Listening... Click to Stop' : 'Record Voice Review'}</span>
              </button>

              <div style={{ fontSize: '11.5px', color: '#64748b', flex: 1 }}>
                {isRecording ? (
                  <span style={{ color: '#e11d48', fontWeight: 700 }}>🎙️ Recording active... Speak now ({speechLang === 'ta-IN' ? 'Tamil' : 'English'})</span>
                ) : (
                  <span>Click mic to speak in Tamil or English. Your voice is transcribed automatically!</span>
                )}
              </div>
            </div>

            {speechError && (
              <div style={{ color: '#e11d48', fontSize: '11.5px', fontWeight: 600, marginTop: '8px' }}>
                ⚠️ {speechError}
              </div>
            )}
          </div>

          {/* Comment Text Area */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
              Your Feedback Comment (Tamil or English) *
            </label>
            <textarea
              className="form-control"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. மருத்துவர் நன்றாக கவனித்து கொண்டார் (Doctor treated very well) or type your review here..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px', lineHeight: 1.5, resize: 'vertical' }}
              required
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} color="var(--teal)" />
                Auto-translates Tamil reviews to English on submission
              </span>
              <span>{comment.length} chars</span>
            </div>
          </div>

          {/* Immutability Assurance Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '11.5px', color: '#166534', fontWeight: 600 }}>
            <Lock size={14} color="#166534" />
            <span>Authenticated Patient Review: Hospital admins cannot alter or delete your review.</span>
          </div>

          {/* Submit Action Buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting || !comment.trim()}
              style={{ background: 'var(--teal)', minWidth: '150px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" style={{ marginRight: 6 }} />
                  Translating...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} style={{ marginRight: 6 }} />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
