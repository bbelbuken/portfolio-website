import type { ReactNode } from 'react';

interface RetroButtonProps {
    active?: boolean;
    onClick?: () => void;
    children: ReactNode;
    className?: string;
}

export function RetroButton({
    active,
    onClick,
    children,
    className = '',
}: RetroButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-[11px] font-medium tracking-wide ${className}`}
            style={{
                fontFamily: '"Fira Code", Consolas, monospace',
                background: active
                    ? 'var(--button-active-bg)'
                    : 'var(--window-bg)',
                color: active
                    ? 'var(--button-active-text)'
                    : 'var(--text-primary)',
                border: '1.5px solid var(--window-border)',
                cursor: 'pointer',
                outline: 'none',
            }}
        >
            {children}
        </button>
    );
}
