import type { NodeData } from '@/types';
import { NodeWindow } from './NodeWindow';
import { NodeSocket } from './NodeSocket';
import { EXPERIENCE } from '@/data/profile';

interface ExperienceNodeProps {
    node: NodeData;
}

export function ExperienceNode({ node }: ExperienceNodeProps) {
    if (node.state === 'idle') return <NodeSocket node={node} />;

    return (
        <NodeWindow node={node} width={380}>
            <div
                className='space-y-4 text-[11px]'
                style={{ fontFamily: '"Fira Code", Consolas, monospace' }}
            >
                {EXPERIENCE.map((e, i) => (
                    <div
                        key={i}
                        className='relative pl-4'
                        style={{
                            borderLeft: '2px solid var(--accent)',
                        }}
                    >
                        <p
                            style={{
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                            }}
                        >
                            {e.role}
                        </p>
                        <p style={{ color: 'var(--accent)' }}>{e.company}</p>
                        <p
                            className='text-[10px]'
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {e.period}
                        </p>
                        <ul className='mt-1 space-y-0.5'>
                            {e.notes.map((n) => (
                                <li
                                    key={n}
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {'– '}
                                    {n}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </NodeWindow>
    );
}
