import type { NodeData } from '@/types';
import { NodeWindow } from './NodeWindow';
import { useUiStore } from '@/stores/uiStore';

const FUN_FACTS = [
    'Fenerbahçe basketball, from youth teams to pro',
    'One year on the Turkish national team',
];

interface AboutNodeProps {
    node: NodeData;
}

export function AboutNode({ node }: AboutNodeProps) {
    const toggleContact = useUiStore((s) => s.toggleContact);

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
                    <strong>Batuhan Belbüken</strong>
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    I'm a{' '}
                    <span
                        style={{
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                        }}
                    >
                        software developer
                    </span>{' '}
                    and former sound engineer based in Istanbul. I build
                    multi-tenant SaaS, real-time IoT systems, serverless data
                    pipelines on AWS and Azure, and agentic AI workflows with
                    Claude Code and MCP.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Before code, I spent 8 years designing sound for brands like
                    GAP, Vogue, and Turkcell. Next stop: AI.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
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
                <div
                    className='pt-2 text-[10px] space-y-1'
                    style={{
                        borderTop: '1px solid var(--window-border)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    {FUN_FACTS.map((fact) => (
                        <p key={fact}>
                            <span style={{ color: 'var(--accent)' }}>{'→'}</span>{' '}
                            {fact}
                        </p>
                    ))}
                </div>
            </div>
        </NodeWindow>
    );
}
