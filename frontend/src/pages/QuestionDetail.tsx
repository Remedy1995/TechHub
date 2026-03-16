import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questionService, Question } from '../services/questionService';
import { answerService, Answer } from '../services/answerService';
import { User } from '../services/authService';
import AnswerActions from '../components/AnswerActions';
import { useAuth } from '../context/AuthContext';

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Just now'
      : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  } catch (e) {
    return 'Just now';
  }
};



const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      const data = await questionService.getById(id!);
      setQuestion(data);
      setError('');
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnswer = async (answerId: string, updatedAnswer: Answer) => {
    if (!question) return;
    
    // Store the current question state for potential rollback
    const previousQuestion = { ...question };
    
    try {
      // Optimistically update the local state
      setQuestion(prevQuestion => {
        if (!prevQuestion) return prevQuestion;
        
        const updatedAnswers = prevQuestion.answers.map(answer => 
          answer._id === answerId ? { 
            ...answer, 
            ...updatedAnswer,
            // Ensure we don't lose the user reference
            user: typeof answer.user === 'object' ? answer.user : updatedAnswer.user || answer.user
          } : answer
        );
        
        return {
          ...prevQuestion,
          answers: updatedAnswers
        };
      });
      
      // Make the API call to update the answer
      const serverUpdatedAnswer = await answerService.update(answerId, updatedAnswer.content);
      
      // Update the local state with the server's response
      setQuestion(prevQuestion => {
        if (!prevQuestion) return prevQuestion;
        
        const updatedAnswers = prevQuestion.answers.map(answer => 
          answer._id === answerId ? {
            ...serverUpdatedAnswer,
            // Preserve the user object if it exists and is an object
            user: typeof answer.user === 'object' ? answer.user : serverUpdatedAnswer.user
          } : answer
        );
        
        return {
          ...prevQuestion,
          answers: updatedAnswers
        };
      });
      
    } catch (err) {
      console.error('Error updating answer:', err);
      setError('Failed to update the answer. Please try again.');
      
      // Revert to the previous state on error
      setQuestion(previousQuestion);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!question) return;

    // Store the previous state for potential rollback
    const previousAnswers = [...question.answers];
    
    try {
      // Optimistically update the UI
      const updatedAnswers = question.answers.filter(answer => answer._id !== answerId);
      setQuestion({ ...question, answers: updatedAnswers });
      
      try {
        // Make the API call to delete the answer
        await answerService.delete(answerId);
        
        // Refresh the question to ensure we have the latest data
        const freshQuestion = await questionService.getById(question._id);
        setQuestion(freshQuestion);
        
      } catch (apiError) {
        console.error('Error deleting answer:', apiError);
        // Revert to previous state on error
        setQuestion(prevQuestion => ({
          ...prevQuestion!,
          answers: previousAnswers
        }));
        setError('Failed to delete answer. Please try again.');
      }
      
    } catch (err) {
      console.error('Error in handleDeleteAnswer:', err);
      setError('An error occurred while deleting the answer');
    }
  };

// In QuestionDetail.tsx
const handleSubmitAnswer = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) {
    navigate('/login');
    return;
  }

  if (!answerContent.trim()) {
    setError('Answer cannot be empty');
    return;
  }

  setSubmitting(true);
  try {
    const newAnswer = await answerService.add(id!, answerContent);
    setAnswerContent('');
    
    if (question) {
      // Create a properly formatted answer object
      const userData = typeof user === 'string' 
        ? { _id: user, username: 'User', email: '', avatar: undefined as string | undefined }
        : user;
        
      const formattedAnswer = {
        ...newAnswer,
        content: answerContent,
        user: {
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          ...(userData.avatar && { avatar: userData.avatar })
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAccepted: false,
        votes: 0,
        _id: newAnswer._id || Math.random().toString(36).substr(2, 9)
      };

      // Update the question with the new answer
      setQuestion(prev => ({
        ...prev!,
        answers: [...(prev?.answers || []), formattedAnswer]
      }));
    }
    setError('');
  } catch (err) {
    console.error('Error submitting answer:', err);
    setError('Failed to submit answer');
  } finally {
    setSubmitting(false);
  }
};

useEffect(() => {
  const loadQuestion = async () => {
    try {
      const data = await questionService.getById(id!);
      setQuestion(data);
      setError('');
    } catch (err) {
      setError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  loadQuestion();
}, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">Question not found</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const questionUser = question.user as User;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{question.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {questionUser?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="font-medium text-slate-700">
                {questionUser?.username || 'Anonymous'}
              </span>
            </div>
            <span>•</span>
            <span>{formatDate(question.createdAt)}</span>
          </div>
          <div className="prose max-w-none">
            <p className="text-slate-700 whitespace-pre-wrap">{question.content}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {question.answers?.length || 0} Answers
          </h2>

          <div className="space-y-4">
            {question.answers?.map((answer) => (
              <div key={answer._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {typeof answer.user === 'string'
                      ? 'U'
                      : (answer.user.username?.[0]?.toUpperCase() || 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900">
                        {typeof answer.user === 'string' ? 'User' : answer.user.username}
                      </span>
                      <span className="text-sm text-slate-500">{formatDate(answer.createdAt)}</span>
                      {answer.isAccepted && (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          Accepted
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap">{answer.content}</p>

                    {user && (
                      (typeof answer.user === 'string'
                        ? user._id === answer.user
                        : user._id === answer.user._id
                      ) && (
                        <div className="mt-2">
                          <AnswerActions
                            answerId={answer._id}
                            content={answer.content}
                            onUpdate={handleUpdateAnswer}
                            onDelete={handleDeleteAnswer}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Your Answer</h3>
          {user ? (
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Write your answer here..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <p className="text-slate-600 mb-4">You need to be logged in to post an answer</p>
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;


