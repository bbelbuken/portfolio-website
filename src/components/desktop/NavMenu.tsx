import { useRef, useState } from 'react';
import { RetroWindow } from '@/components/ui/RetroWindow';
import { RetroButton } from '@/components/ui/RetroButton';
import { useGraphStore } from '@/stores/graphStore';
import { childrenOf } from '@/lib/graph';

interface NavMenuProps {
    /** Header label, e.g. "code" */
    label: string;
    /** Branch node this menu belongs to, e.g. "code-branch" */
    branchId: string;
}

/**
 * Header nav item that drops a small retro window below itself — same
 * treatment as control.md — listing the nodes related to that branch.
 * Each entry opens its node on the canvas.
 */
export function NavMenu({ label, branchId }: NavMenuProps) {
    const [open, setOpen] = useState(false);
    const [left, setLeft] = useState(0);
    const triggerRef = useRef<HTMLAnchorElement>(null);

    const nodes = useGraphStore((s) => s.nodes);
    const openNode = useGraphStore((s) => s.openNode);
    const openNodeTree = useGraphStore((s) => s.openNodeTree);
    const closeNode = useGraphStore((s) => s.closeNode);

    const branch = nodes.find((n) => n.id === branchId);
    const items = childrenOf(nodes, branchId);

    function toggle() {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) setLeft(rect.left);
        setOpen((v) => !v);
    }

    return (
        <>
            <a
                ref={triggerRef}
                href={`#${label}`}
                className='text-[11px] hover:underline'
                style={{
                    color: 'var(--text-header)',
                    textDecoration: open ? 'underline' : 'none',
                    cursor: 'pointer',
                }}
                onClick={(e) => {
                    e.preventDefault();
                    toggle();
                }}
            >
                {label}
            </a>

            {open && (
                <>
                    {/* Click-outside backdrop */}
                    <div
                        className='fixed inset-0 z-40'
                        onPointerDown={() => setOpen(false)}
                    />

                    <div
                        className='fixed z-50'
                        style={{ top: 34, left }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <RetroWindow
                            title={branch?.label ?? label}
                            onClose={() => setOpen(false)}
                            style={{ width: 200 }}
                        >
                            <div
                                className='p-3 space-y-2 text-[11px]'
                                style={{
                                    fontFamily:
                                        '"Fira Code", Consolas, monospace',
                                }}
                            >
                                <div className='flex flex-col gap-1'>
                                    {items.map((item) => (
                                        <RetroButton
                                            key={item.id}
                                            active={item.state === 'connected'}
                                            className='text-left'
                                            onClick={() =>
                                                item.state === 'connected'
                                                    ? closeNode(item.id)
                                                    : openNode(item.id)
                                            }
                                        >
                                            {item.label}
                                        </RetroButton>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        openNodeTree(branchId);
                                        setOpen(false);
                                    }}
                                    className='w-full text-[9px] uppercase tracking-widest pt-2'
                                    style={{
                                        color: 'var(--text-secondary)',
                                        borderTop:
                                            '1px solid var(--window-border)',
                                        background: 'transparent',
                                        border: 'none',
                                        borderTopWidth: 1,
                                        borderTopStyle: 'solid',
                                        cursor: 'pointer',
                                        fontFamily:
                                            '"Fira Code", Consolas, monospace',
                                    }}
                                >
                                    open all
                                </button>
                            </div>
                        </RetroWindow>
                    </div>
                </>
            )}
        </>
    );
}
