import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RetroWindow } from '@/components/ui/RetroWindow';
import { POP_IN } from '@/lib/motion';
import { RetroButton } from '@/components/ui/RetroButton';
import { useGraphStore } from '@/stores/graphStore';
import { childrenOf } from '@/lib/graph';
import { useTickReveal } from '@/hooks/useTickReveal';
import { useUiStore } from '@/stores/uiStore';
import { useThemeStore } from '@/stores/themeStore';
import { HEADER_H, NAV_LINK_CLASS } from './headerStyles';

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
    const open = useUiStore((s) => s.openMenu === label);
    const setOpenMenu = useUiStore((s) => s.setOpenMenu);
    const setControlOpen = useThemeStore((s) => s.setControlOpen);
    const [left, setLeft] = useState(0);
    const triggerRef = useRef<HTMLAnchorElement>(null);

    const branch = useGraphStore((s) =>
        s.nodes.find((n) => n.id === branchId),
    );

    function toggle() {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) setLeft(rect.left);
        // Opening one header window closes the others
        setControlOpen(false);
        setOpenMenu(open ? null : label);
    }

    function close() {
        setOpenMenu(null);
    }

    return (
        <>
            <a
                ref={triggerRef}
                href={`#${label}`}
                className={`${NAV_LINK_CLASS} ${open ? 'underline' : ''}`}
                style={{ color: 'var(--text-header)' }}
                onClick={(e) => {
                    e.preventDefault();
                    toggle();
                }}
            >
                {label}
            </a>

            {/* Click-outside backdrop — stops at the header so the other
                header items stay hoverable and clickable */}
            {open && (
                <div
                    className='fixed inset-x-0 bottom-0 z-40'
                    style={{ top: HEADER_H }}
                    onPointerDown={close}
                />
            )}

            <AnimatePresence>
                {open && (
                    <motion.div
                        key='menu'
                        {...POP_IN}
                        className='fixed z-50'
                        style={{ top: 34, left, transformOrigin: 'top left' }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <RetroWindow
                            title={branch?.label ?? label}
                            onClose={close}
                            style={{ width: 200 }}
                        >
                            <MenuBody
                                branchId={branchId}
                                onDone={close}
                            />
                        </RetroWindow>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

interface MenuBodyProps {
    branchId: string;
    /** Close the menu after "open all" */
    onDone: () => void;
}

/**
 * The menu's rows. Mounted fresh on every open, so the rows print top to
 * bottom one tick at a time, the same way contact.sh does.
 */
function MenuBody({ branchId, onDone }: MenuBodyProps) {
    const nodes = useGraphStore((s) => s.nodes);
    const openNode = useGraphStore((s) => s.openNode);
    const openNodeTree = useGraphStore((s) => s.openNodeTree);
    const closeNode = useGraphStore((s) => s.closeNode);

    const items = childrenOf(nodes, branchId);
    // One tick per item, plus "open all"
    const shown = useTickReveal(items.length + 1);

    return (
        <div
            className='p-3 space-y-2 text-[11px]'
            style={{
                fontFamily:
                    '"Fira Code", Consolas, monospace',
            }}
        >
            <div className='flex flex-col gap-1'>
                {items.slice(0, shown).map((item) => (
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

            {shown > items.length && (
                <button
                    onClick={() => {
                        openNodeTree(branchId);
                        onDone();
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
            )}
        </div>
    );
}
