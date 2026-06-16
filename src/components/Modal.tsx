import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidthClass
}) => {
  // Lock body scroll when modal open and scroll modal body to top
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      
      // Case A: After modal renders scroll its body to top
      setTimeout(() => {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) modalBody.scrollTop = 0;
      }, 50);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handle);
    return () =>
      document.removeEventListener('keydown', handle);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal-box ${maxWidthClass || ''}`}>
        {/* Drag handle (mobile only) */}
        <div className="modal-drag-handle" />

        {/* Header — always visible */}
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="modal-body">
          {children}
        </div>

        {/* Footer — always visible */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
