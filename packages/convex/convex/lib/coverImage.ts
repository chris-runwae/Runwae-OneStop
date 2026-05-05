const COVERS = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1600&q=80",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=1600&q=80",
  "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1600&q=80",
];

export function pickDefaultCover(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COVERS[Math.abs(h) % COVERS.length];
}
