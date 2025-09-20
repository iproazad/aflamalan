
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  isLoading?: boolean;
}

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right flex-grow">
            <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:justify-start">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 sm:w-auto sm:text-sm disabled:bg-red-800 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <SpinnerIcon />}
            {isLoading ? 'جاري الحذف...' : 'حذف'}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            onClick={onClose}
            disabled={isLoading}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
