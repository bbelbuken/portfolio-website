import type { NodeData } from '@/types';
import { NodeWindow } from './NodeWindow';
import { useTutorialActive } from '@/hooks/useTutorial';

interface AboutNodeProps {
    node: NodeData;
}

export function AboutNode({ node }: AboutNodeProps) {
    // The hints pulse until the first wire is connected
    const hinting = useTutorialActive();

    return (
        <NodeWindow node={node} width={340}>
            <div
                className='space-y-3 text-[12px] leading-relaxed'
                style={{
                    color: 'var(--text-primary)',
                    fontFamily: '"Fira Code", Consolas, monospace',
                }}
            >
                <p>
                    <span style={{ color: 'var(--accent)' }}>{'> '}</span>
                    <strong>Batuhan Belbüken</strong>
                </p>
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
                <div
                    className='pt-2 text-[10px] space-y-1'
                    style={{
                        borderTop: '1px solid var(--window-border)',
                        color: hinting
                            ? 'var(--accent)'
                            : 'var(--text-secondary)',
                    }}
                >
                    <p>
                        <span
                            className={hinting ? 'hint-blink' : undefined}
                            style={{ color: 'var(--accent)' }}
                        >
                            {'→'}
                        </span>{' '}
                        Connect a wire to explore
                    </p>
                    <p>
                        <span
                            className={hinting ? 'hint-blink' : undefined}
                            style={{ color: 'var(--accent)' }}
                        >
                            {'→'}
                        </span>{' '}
                        Scroll / pinch to zoom canvas
                    </p>
                    <p>
                        <span
                            className={hinting ? 'hint-blink' : undefined}
                            style={{ color: 'var(--accent)' }}
                        >
                            {'→'}
                        </span>{' '}
                        Drag nodes to rearrange
                    </p>
                </div>
            </div>
        </NodeWindow>
    );
}
