import { useState, useRef, useEffect } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { answerService } from '../services/answerService';

import { Answer } from '../services/answerService';

interface AnswerActionsProps {
  answerId: string;
  content: string | Answer; // Accept either string or full Answer object
  onUpdate: (answerId: string, updatedAnswer: Answer) => void;
  onDelete: (answerId: string) => void;
}

const AnswerActions = ({ answerId, content, onUpdate, onDelete }: AnswerActionsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Initialize editedContent with content, handling both string and Answer types
  const [editedContent, setEditedContent] = useState(
    typeof content === 'string' ? content : content.content || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = editedContent.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing, editedContent?.length]);

  const handleUpdate = async () => {
    if (!editedContent || !editedContent.trim()) return;
    
    setIsLoading(true);
    try {
      // Create a temporary updated answer object with the new content
      const tempUpdatedAnswer = {
        ...(typeof content === 'string' ? {} : content),
        _id: answerId,
        content: editedContent,
        updatedAt: new Date().toISOString()
      } as Answer;
      
      // Call onUpdate with the temporary answer for optimistic update
      onUpdate(answerId, tempUpdatedAnswer);
      
      // Make the API call to update the answer
      const updatedAnswer = await answerService.update(answerId, editedContent);
      
      // Create the complete updated answer with server response
      const completeUpdatedAnswer: Answer = {
        ...tempUpdatedAnswer,
        ...updatedAnswer,
        // Ensure we don't lose the user reference
        user: (typeof content !== 'string' ? content.user : '') as any,
        // Ensure we have all required fields
        content: updatedAnswer.content || editedContent,
        updatedAt: updatedAnswer.updatedAt || new Date().toISOString(),
        _id: updatedAnswer._id || answerId,
        question: (typeof content !== 'string' ? content.question : '') as any,
        isAccepted: updatedAnswer.isAccepted || false,
        votes: updatedAnswer.votes || 0,
        createdAt: (typeof content !== 'string' ? content.createdAt : new Date().toISOString()) as any
      };
      
      // Update with the complete answer from server
      onUpdate(answerId, completeUpdatedAnswer);
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating answer:', error);
      // Revert to original content on error
      const originalContent = typeof content === 'string' ? content : content.content;
      setEditedContent(originalContent);
      // Let the parent component know about the error
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      setIsLoading(true);
      try {
        await answerService.delete(answerId);
        onDelete(answerId);
      } catch (error) {
        console.error('Failed to delete answer:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="mt-2">
        <textarea
          ref={textareaRef}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleUpdate();
            }
          }}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleUpdate}
            disabled={isLoading || !editedContent.trim()}
            className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              const originalContent = typeof content === 'string' ? content : content.content;
              setEditedContent(originalContent);
            }}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            <XMarkIcon className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => setIsEditing(true)}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
      >
        <PencilIcon className="w-4 h-4" /> Edit
      </button>
      <button
        onClick={handleDelete}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        <TrashIcon className="w-4 h-4" /> Delete
      </button>
    </div>
  );
};

export default AnswerActions;