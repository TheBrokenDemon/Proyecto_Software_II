import '../estilos/Survey.css';
import { Link, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getEvaluationBySlug, submitSurvey } from "../ts/encuesta"

// --- Tipos de Datos --,
interface Question {
  id: string;
  content: string;
  required: boolean;
}

interface EvaluationDetails {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface AnswerPayload {
  question_id: string;
  answer: string;
}

// --- Componente de Barra de Progreso ---
const ProgressBar = ({ value }: { value: number }) => (
  <div className="survey-progress">
    <div className="progress-bar-container">
      <div className="progress-bar-fill" style={{ width: `${value}%` }}></div>
    </div>
    <p className="progress-text">{Math.round(value)}% completado</p>
  </div>
);

export default function Survey() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState<EvaluationDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const options = ['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'];

  useEffect(() => {
    if (!slug) return;
    getEvaluationBySlug(slug)
      .then(data => {
        // El servicio ya extrae el objeto de la evaluación, así que lo usamos directamente.
        setEvaluation(data);
      })
      .catch(() => setError('No se pudo cargar la evaluación.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!evaluation) return;

    // Verificar preguntas obligatorias
    const unanswered = evaluation.questions
      .filter((q: any) => q.required && !answers[q.id]);

    if (unanswered.length > 0) {
      setError('Por favor responde todas las preguntas obligatorias.');
      return;
    }

    const formattedAnswers: AnswerPayload[] = Object.entries(answers).map(([question_id, answer]) => ({
      question_id,
      answer,
    }));

    try {
      setSubmitting(true);
      await submitSurvey(slug!, formattedAnswers);
      navigate('/history');
    } catch (err: any) {
      setError(err.message || 'Error al enviar las respuestas.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Estados de Carga y Error ---
  if (loading) {
    return <div className="survey-loading">Cargando evaluación...</div>;
  }

  if (error && !evaluation) {
    return <div className="survey-error-fullpage">{error}</div>;
  }

  if (!evaluation) {
    return <div className="survey-error-fullpage">No se encontró la evaluación.</div>;
  }

  // --- Cálculo del Progreso ---
  const totalQuestions = evaluation.questions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="survey-page-container">
      <div className="survey-layout">
        <Link to="/encuestas" className="survey-back-btn">← Volver a Encuestas</Link>

        <header className="survey-header">
          <h2>{evaluation.title}</h2>
          <p>{evaluation.description}</p>
        </header>

        <ProgressBar value={progress} />

        <div className="questions-list">
          {evaluation.questions.map((question, index) => (
            <div key={question.id} className="question-item">
              <p className="question-text">
                {index + 1}. {question.content}
                {question.required && <span className="required-star">*</span>}
              </p>
              <div className="options-grid">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(question.id, option)}
                    className={`option-button ${answers[question.id] === option ? 'selected' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="survey-footer">
          {error && <p className="survey-error">{error}</p>}
          <button className="survey-submit-button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Finalizar Evaluación'}
          </button>
        </div>
      </div>
    </div>
  );
}