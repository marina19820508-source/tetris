import type { ReactNode } from 'react';

interface ModalAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

interface ModalProps {
  icon?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions: ModalAction[];
  dismissible?: boolean;
  onClose?: () => void;
}

export function Modal({ icon = '✦', eyebrow = 'London Yesterday Quest', title, children, actions, dismissible = true, onClose }: ModalProps) {
  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="modal-card">
        <span className="modal-icon" aria-hidden="true">{icon}</span>
        <p className="modal-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <div className="modal-content">{children}</div>
        <div className="modal-actions">
          {actions.map((action, index) => (
            <button
              className={action.primary || index === 0 ? 'button button-primary' : 'button button-soft'}
              key={action.label}
              onClick={action.onClick}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
