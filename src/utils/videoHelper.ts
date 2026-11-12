/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface YouTubeInfo {
  videoId: string;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string;
}

/**
 * Extracts YouTube Video ID from various link formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. youtu.be/xxx
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // 2. youtube.com/embed/xxx
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // 3. youtube.com/shorts/xxx
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // 4. youtube.com/live/xxx
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch && liveMatch[1]) return liveMatch[1];

  // 5. youtube.com/watch?v=xxx (with or without extra params)
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // 6. Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Validates if the given string is a recognizable YouTube link
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Returns complete YouTube details if valid, null otherwise
 */
export function getYouTubeInfo(url: string): YouTubeInfo | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Standardize any YouTube URL to an embed URL
 */
export function toYouTubeEmbedUrl(url: string): string {
  const info = getYouTubeInfo(url);
  if (info) return info.embedUrl;
  return url;
}

/**
 * Sample Pesantren YouTube kajian links for ustadz to quickly test & use
 */
export const SAMPLE_PESANTREN_YOUTUBE_VIDEOS = [
  {
    title: 'Kajian Jurumiyah: Bab Kalam & Pembagian Isim Fiil Huruf',
    kitab: 'Jurumiyah',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    displayId: 'dQw4w9WgXcQ',
    ustadz: 'Ust. Ilham Matuf Muzaki',
  },
  {
    title: 'Kajian Fiqih Safinatunnajah: Syarat Wudhu & Rukun Shalat',
    kitab: 'Safinatunnajah',
    url: 'https://www.youtube.com/watch?v=1La4QzGeaaQ',
    displayId: '1La4QzGeaaQ',
    ustadz: 'Ust. Kuswantoro',
  },
  {
    title: 'Syarah Arbain Nawawi: Hadits 1 Innamal A\'malu Bin Niyyat',
    kitab: 'Arbain Nawawi',
    url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    displayId: 'L_LUpnjgPso',
    ustadz: 'Ust. Anas Abdul Aziz',
  },
  {
    title: 'Adab Penuntut Ilmu: Ta\'lim Muta\'allim Bab Memilih Guru & Teman',
    kitab: 'Ta\'lim Muta\'alim',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    displayId: 'kJQP7kiw5Fk',
    ustadz: 'Ust. Anas Abdul Aziz',
  },
];

/**
 * Format bytes to readable size (e.g. 15.4 MB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
