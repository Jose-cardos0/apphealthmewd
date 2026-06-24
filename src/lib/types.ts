export type GrokPlan = {
  daily_kcal: number;
  water_liters: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  motivation: string;
  tips: string[];
};

export type Profile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  city: string | null;
  gender: string | null;
  height_cm: number | null;
  start_weight_kg: number | null;
  current_weight_kg: number | null;
  goal_weight_kg: number | null;
  activity_level: string | null;
  glp1_medication: string | null;
  glp1_dose: string | null;
  glp1_frequency: string | null;
  glp1_start_date: string | null;
  plan: GrokPlan | null;
  avatar_url: string | null;
};

/** Trainingsplan (vom Coach / Grok erzeugt). */
export type WorkoutExercise = { name: string; saetze: string; wdh: string; pause_sek?: string; hinweis?: string; en?: string; gifUrl?: string | null };
export type WorkoutCardio = { name: string; dauer: string; hinweis?: string };
export type Workout = {
  titel: string;
  fokus: string;
  dauer_min: number;
  kcal_verbrennung: number;
  uebungen: WorkoutExercise[];
  cardio: WorkoutCardio[];
  tipps: string[];
};
export type SavedWorkout = { id: string; title: string | null; data: Workout };
export type WorkoutLog = { id: string; title: string | null; burned_kcal: number; done_on: string };

/** Eingaben aus dem Onboarding-Quiz. */
export type OnboardingData = {
  first_name: string;
  last_name: string;
  age: number;
  city: string;
  gender: string;
  height_cm: number;
  start_weight_kg: number;
  goal_weight_kg: number;
  activity_level: string;
  glp1_medication: string;
  glp1_dose: string;
  glp1_frequency: string;
};
