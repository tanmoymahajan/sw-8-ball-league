import React from "react";

export function Modal({
                          title,
                          onClose,
                          footer,
                          children,
                      }: {
    title: string;
    onClose: () => void;
    footer?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="modalOverlay" onClick={onClose} role="presentation">
            <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modalHeader">
                    <div className="modalTitle">{title}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Close" type="button">
                        ✕
                    </button>
                </div>
                <div className="modalBody">{children}</div>
                {footer ? <div className="modalFooter">{footer}</div> : null}
            </div>
        </div>
    );
}
