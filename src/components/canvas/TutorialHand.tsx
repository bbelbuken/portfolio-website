/**
 * Shared pieces for the tutorial hints: the pointing hand and the easing
 * curve its animations use.
 */

/**
 * Pointing hand. The source icon is an outline — its path holds the silhouette
 * and a second, reversed contour that punches the inside out — so filling it
 * would only paint the outline band. Keeping just the outer contour makes the
 * whole hand solid, and it picks up whatever fill the parent group sets.
 */
const HAND_PATH =
    'M 22.5 3 C 19.480226 3 17 5.4802259 17 8.5 L 17 23.412109 L 14.871094 22.697266 C 13.308963 22.172461 11.892528 22 10.703125 22 C 9.5908429 22 8.5540295 22.197475 7.640625 22.65625 C 5.2906802 23.831199 3.9427678 26.197397 4.0019531 28.90625 C 4.0019531 28.90625 4.0019531 28.908203 4.0019531 28.908203 C 4.0019531 28.908203 4.0019531 28.910156 4.0019531 28.910156 C 4.0184171 29.660452 4.4596385 30.354695 5.1328125 30.6875 A 1.50015 1.50015 0 0 0 5.1367188 30.689453 C 5.1367188 30.689453 9.4097266 32.789754 11.599609 33.949219 C 12.445613 34.397848 13.696939 34.926046 15.210938 36.09375 C 16.724935 37.261454 18.423179 39.012543 19.826172 41.792969 C 21.023611 44.165544 23.672779 45.195669 26.144531 44.955078 A 1.50015 1.50015 0 0 0 26.146484 44.955078 C 31.427085 44.439215 32.081856 44.381732 35.59375 44.023438 C 37.044229 43.875625 38.276993 43.213524 39.111328 42.289062 C 39.945663 41.364602 40.422895 40.257718 40.798828 39.125 C 41.561218 36.826116 42.933037 33.169846 43.671875 30.599609 C 45.018525 25.913269 41.884024 21.194549 37.246094 19.953125 L 37.242188 19.951172 C 36.99827 19.885452 36.756736 19.832884 36.521484 19.789062 A 1.50015 1.50015 0 0 0 36.513672 19.787109 L 28 18.248047 L 28 8.5 C 28 5.4802259 25.519774 3 22.5 3 z';

const HAND_SHAPES = (
    <svg viewBox='0 0 48 48' width='18px' height='24px'>
        <path d={HAND_PATH} />
    </svg>
);

export function easeInOut(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/** Pointing hand; the fingertip sits on the group's origin */
export function Hand({ handRef }: { handRef: React.Ref<SVGGElement> }) {
    return (
        // A thicker copy underneath keeps it readable on any bg
        <g ref={handRef}>
            <g transform='translate(-9, -5)'>
                <g
                    fill='var(--window-bg)'
                    stroke='var(--window-bg)'
                    strokeWidth={3}
                    strokeLinejoin='round'
                >
                    {HAND_SHAPES}
                </g>
                <g fill='var(--accent)'>{HAND_SHAPES}</g>
            </g>
        </g>
    );
}
