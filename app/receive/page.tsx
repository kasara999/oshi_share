'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSenderStore } from '@/store/senderStore';
import CardDisplay from '@/components/CardDisplay';
import { Button } from '@/components/ui/button';

export default function ReceivePage() {
  const router = useRouter();
  const token = useSenderStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function claim() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'X-Recipient-Token': token },
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || 'マッチングに失敗しました');
        return;
      }
      if (!data || !data.match_id) {
        setMessage(
          '現在プールにカードがありません。時間をおいて試してください。',
        );
        return;
      }
      setCard(data.card || null);
      setMatchId(data.match_id);
      // カードページへ遷移して詳細といいね操作を行えるようにする
      router.push(`/card/${data.match_id}`);
    } catch (e) {
      console.error(e);
      setMessage('サーバーエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 自動で一回マッチングを試す
    claim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">受け取る</h1>
      {loading && <p>マッチング中…</p>}
      {message && <p className="mb-4">{message}</p>}
      {card && <CardDisplay card={card} />}
      <div className="mt-4">
        <Button onClick={claim} disabled={loading}>
          {loading ? '待機中…' : 'もう一度受け取る'}
        </Button>
      </div>
    </div>
  );
}
