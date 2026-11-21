import type { ComboSource } from '../../lib/combo/combo.types.ts';

/** Credit for a combo shown at `seconds` into a YouTube video, linking straight to that moment. */
export function youtube(videoId: string, seconds: number, author: string): ComboSource {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return {
    site: 'YouTube',
    label: 'Vídeo',
    url: `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`,
    reference: `${minutes}:${rest}`,
    author,
  };
}
