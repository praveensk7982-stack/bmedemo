import React, { useState } from 'react';
import type { Review } from '../../types';
import { translateTextToEnglish } from '../../lib/translation';
import { getActivePatientSession } from '../../lib/userAuth';
import { 
  X, 
  Star, 
  Mic, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Volume2,
  Send
} from 'lucide-react';

interface InlineReviewFormProps {
  targetId: string;
  targetName: string;
  targetType?: 'hospital' | 'doctor';
  onClose: () => void;
  onSuccess: (newReview: Review) => void;
}

export const InlineReviewForm: React.FC<InlineReviewFormProps> = ({
  targetId,
  targetName,
  targetType = 'hospital',
  onClose,
  onSuccess
}) => {
  const [patientName, setPatientName] = useState<string>(() => getActivePatientSession().name);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  // Voice & Speech Recognition State
  const [speechLang, setSpeechLang] = useState<'ta-IN' | 'en-IN' | 'hi-IN'>('ta-IN');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [wasVoiceUsed, setWasVoiceUsed] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Loading & Translation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ratingLabels: Record<number, string> = {
    1: '1.0 - Poor Experience',
    2: '2.0 - Fair / Average',
    3: '3.0 - Good Care',
    4: '4.0 - Very Good Service',
    5: '5.0 - Excellent & Highly Recommended'
  };

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
          setSpeechError('Microphone access denied. Please allow mic access in your browser.');
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
      // Auto-translate to English if written/recorded in Tamil or other language
      const transResult = await translateTextToEnglish(trimmedComment);

      const newReview: Review = {
        id: `rev-${Date.now()}`,
        hospitalId: targetId,
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

  return (
    <div 
      style={{
        background: '#f8fafc',
        border: '2px solid #16a3ae',
        borderRadius: '16px',
        padding: '20px',
        marginTop: '14px',
        marginBottom: '16px',
        boxShadow: '0 8px 24px rgba(22, 163, 174, 0.12)',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#16a3ae" />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
            Leave a {targetType === 'doctor' ? 'Doctor' : 'Hospital'} Review for {targetName}
          </h4>
        </div>
        <button 
          type="button" 
          onClick={onClose}
          style={{ background: '#e2e8f0', border: 0, width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#475569' }}
          title="Close review form"
        >
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Patient Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
            Your Name (Displayed publicly on review)
          </label>
          <input
            type="text"
            className="form-control"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Enter your name..."
            required
            style={{ width: '100%', height: '38px', borderRadius: '8px', fontSize: '13px' }}
          />
        </div>

        {/* Star Rating Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
            Select Rating *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => {
              const starVal = i + 1;
              const isFilled = (hoverRating || rating) >= starVal;
              return (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', border: 0, padding: '2px', cursor: 'pointer', transition: 'transform 0.15s ease' }}
                >
                  <Star 
                    size={24} 
                    fill={isFilled ? '#f5a623' : 'none'} 
                    color="#f5a623"
                  />
                </button>
              );
            })}
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginLeft: 8 }}>
              {ratingLabels[hoverRating || rating]}
            </span>
          </div>
        </div>

        {/* Language Selection & Voice Recording Bar */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              🎙️ Voice Record (Tamil / English / Hindi)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setSpeechLang('ta-IN')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: speechLang === 'ta-IN' ? '#16a3ae' : '#cbd5e1',
                  background: speechLang === 'ta-IN' ? '#eef7f8' : '#fff',
                  color: speechLang === 'ta-IN' ? '#16a3ae' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                தமிழ் (Tamil)
              </button>
              <button
                type="button"
                onClick={() => setSpeechLang('en-IN')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: speechLang === 'en-IN' ? '#16a3ae' : '#cbd5e1',
                  background: speechLang === 'en-IN' ? '#eef7f8' : '#fff',
                  color: speechLang === 'en-IN' ? '#16a3ae' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSpeechLang('hi-IN')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: speechLang === 'hi-IN' ? '#16a3ae' : '#cbd5e1',
                  background: speechLang === 'hi-IN' ? '#eef7f8' : '#fff',
                  color: speechLang === 'hi-IN' ? '#16a3ae' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSpeechRecording}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: 0,
              background: isRecording ? '#e11d48' : '#16a3ae',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: isRecording ? '0 0 0 3px rgba(225, 29, 72, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {isRecording ? (
              <>
                <Volume2 size={16} className="pulse" />
                <span>Recording... Speak now in {speechLang === 'ta-IN' ? 'Tamil' : 'English'}</span>
              </>
            ) : (
              <>
                <Mic size={16} />
                <span>Record Review Voice Message ({speechLang === 'ta-IN' ? 'Tamil' : 'English'})</span>
              </>
            )}
          </button>

          {speechError && (
            <div style={{ marginTop: '8px', color: '#e11d48', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={13} /> {speechError}
            </div>
          )}
        </div>

        {/* Comment Textarea */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6, color: '#334155' }}>
            Review Comment *
          </label>
          <textarea
            className="form-control"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your review comment or click mic above to speak in Tamil / English..."
            required
            style={{ width: '100%', borderRadius: '8px', padding: '10px', fontSize: '13px' }}
          />
          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            ✨ Auto-translates Tamil reviews to English on submission for universal display.
          </span>
        </div>

        {errorMessage && (
          <div style={{ background: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} /> {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            disabled={isSubmitting}
            style={{ fontSize: '12px', padding: '6px 16px', background: '#16a3ae', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Translating & Publishing...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Publish Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
