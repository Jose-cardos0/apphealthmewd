"use client";

import { HeartIcon, TrashIcon } from "@/components/Icons";
import { foodImages } from "@/lib/foodImages";
import type { Recipe, SavedItem } from "@/lib/types";

type Props = {
  recipes: SavedItem<Recipe>[];
  onView: (item: SavedItem<Recipe>) => void;
  onDelete: (id: string) => Promise<void>;
};

export default function LibraryTab({ recipes, onView, onDelete }: Props) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">Meine Rezepte 📖</h1>
        <p className="text-gray-600">Deine gespeicherten Lieblingsrezepte – jederzeit griffbereit.</p>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
          <div className="w-16 h-16 mx-auto bg-gold-100 text-gold-500 rounded-2xl flex items-center justify-center mb-4">
            <HeartIcon className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-gray-800 mb-1">Noch keine Rezepte gespeichert</h3>
          <p className="text-sm text-gray-500">
            Tippe bei einem Rezept auf{" "}
            <span className="font-semibold text-gold-500">„Speichern“</span>, um es hier in deiner
            Bibliothek zu sammeln.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {recipes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.data.bild || foodImages[0]}
                alt={item.data.titel}
                className="w-full h-36 object-cover"
              />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 mb-1">{item.data.titel}</h3>
                <p className="text-xs text-gray-500 mb-4">{item.data.meta}</p>
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => onView(item)}
                    className="flex-1 bg-gold-400 hover:bg-gold-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                  >
                    Ansehen
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Aus Bibliothek entfernen"
                    className="w-11 border border-gold-200 text-gold-500 hover:bg-gold-50 rounded-xl flex items-center justify-center transition"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
