import type { NodeData } from '@/types';
import { NodeWindow } from './NodeWindow';
import { useUiStore } from '@/stores/uiStore';
import { ABOUT, ABOUT_HIGHLIGHT, NAME } from '@/data/profile';

/** Bolds the first occurrence of `word` inside a paragraph */
function withHighlight(text: string, word: string) {
    const at = text.indexOf(word);
    if (at < 0) return text;
    return (
        <>
            {text.slice(0, at)}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {word}
            </span>
            {text.slice(at + word.length)}
        </>
    );
}

interface AboutNodeProps {
    node: NodeData;
}

export function AboutNode({ node }: AboutNodeProps) {
    const toggleContact = useUiStore((s) => s.toggleContact);
    const toggleAgent = useUiStore((s) => s.toggleAgent);

    return (
        <NodeWindow node={node} width={340}>
            <div
                className='space-y-3 text-[12px] leading-relaxed'
                style={{
                    color: 'var(--text-primary)',
                    fontFamily: '"Fira Code", Consolas, monospace',
                }}
            >
                <h1>
                    <span style={{ color: 'var(--accent)' }}>{'> '}</span>
                    <strong>{NAME}</strong>
                </h1>
                {ABOUT.map((text) => (
                    <p key={text} style={{ color: 'var(--text-secondary)' }}>
                        {withHighlight(text, ABOUT_HIGHLIGHT)}
                    </p>
                ))}
                {/* The fun facts live in agent.sh's knowledge, not here */}
                <div
                    className='pt-2 space-y-1'
                    style={{
                        borderTop: '1px solid var(--window-border)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <p>
                        Want to talk?{' '}
                        <button
                            onClick={toggleContact}
                            onPointerDown={(e) => e.stopPropagation()}
                            className='hover:underline'
                            style={{
                                color: 'var(--accent)',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            $ ./contact.sh
                        </button>
                    </p>
                    <p>
                        Or ask my AI agent:{' '}
                        <button
                            onClick={toggleAgent}
                            onPointerDown={(e) => e.stopPropagation()}
                            className='hover:underline'
                            style={{
                                color: 'var(--accent)',
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}
                        >
                            $ ./agent.sh
                        </button>
                    </p>
                </div>
            </div>
        </NodeWindow>
    );
}
