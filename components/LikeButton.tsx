"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

type Props = {
  matchId: string;
};

export default function LikeButton({ matchId }: Props) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (liked || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/like/${matchId}`, { method: "POST" });
      if (res.ok) {
        setLiked(true);
      } else {
        console.error("like failed", await res.text());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={liked ? "secondary" : "default"} onClick={handleLike} disabled={liked || loading}>
      <Heart className="mr-2" /> {liked ? "いいね済み" : "いいね"}
    </Button>
  );
}
