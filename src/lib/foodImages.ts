/** Passendes Foto je Rezept (stabil pro Titel/Zutaten). */
export const foodImages = [
  "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=900&h=500&fit=crop",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=500&fit=crop",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=900&h=500&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&h=500&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=500&fit=crop",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&h=500&fit=crop",
];

export function bildFuer(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return foodImages[h % foodImages.length];
}
