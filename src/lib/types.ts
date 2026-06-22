export type SavedKind = "recipe" | "workout" | "scan" | "plan";

export type Naehrwerte = {
  kcal?: string;
  eiweiss?: string;
  kohlenhydrate?: string;
  fett?: string;
};

export type Recipe = {
  titel: string;
  meta: string;
  zutaten: string[];
  schritte: string[];
  naehrwerte: Naehrwerte;
  bild: string;
};

export type Uebung = { name: string; saetze: string; hinweis?: string };

export type Workout = {
  titel: string;
  meta: string;
  aufwaermen: string[];
  uebungen: Uebung[];
  tipps: string[];
};

export type Scan = {
  gericht: string;
  portion: string;
  kcal: string;
  eiweiss: string;
  kohlenhydrate: string;
  fett: string;
  hinweis: string;
};

export type Mahlzeit = { name: string; gericht: string };
export type Tag = { tag: string; mahlzeiten: Mahlzeit[] };
export type Plan = { titel: string; meta: string; tage: Tag[] };

/** Eine in Supabase gespeicherte Zeile (data enthält den eigentlichen Inhalt). */
export type SavedItem<T> = { id: string; data: T };
