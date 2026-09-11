import { notFound } from 'next/navigation';
import { StyleguideContent } from './StyleguideContent';

/**
 * Every atom in every state, in both themes. This is how Phase 1 is verified
 * rather than asserted: screenshot light and dark, run the greyscale check from
 * docs/design/09-light-dark-mode.md §9.10.
 *
 * Development only — it 404s in production builds.
 */
export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <StyleguideContent />;
}
