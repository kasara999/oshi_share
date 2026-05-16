import React from "react";
import type { Card } from "@/types";

type Props = {
  card: Card;
};

export default function CardDisplay({ card }: Props) {
  const publicUrl = card.image_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/card-images/${card.image_path}`
    : null;

  return (
    <div className="rounded-lg border p-4 shadow-sm bg-white">
      {publicUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={publicUrl} alt={card.oshi_name} className="w-full h-48 object-cover rounded-md mb-3" />
      )}
      <h2 className="text-xl font-semibold">{card.oshi_name}</h2>
      {card.description && <p className="text-sm text-muted-foreground mt-2">{card.description}</p>}
      {card.tags && card.tags.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {card.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-1 bg-muted rounded-full">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
