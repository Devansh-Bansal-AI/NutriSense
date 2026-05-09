import { useState, useEffect, useCallback } from 'react';
import { HistoryResponse, MealLogEntry } from '@/types/api';

export function useHistory(userId?: string) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/history?userId=${userId}`);
      if (!response.ok) throw new Error(await response.text());
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const logMeal = async (entry: MealLogEntry) => {
    if (!userId) return false;
    
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, entry })
      });
      
      if (!response.ok) throw new Error(await response.text());
      
      // Optimistic update could go here, or just refetch
      await fetchHistory();
      return true;
    } catch (err) {
      console.error('Failed to log meal:', err);
      return false;
    }
  };

  return { data, loading, error, fetchHistory, logMeal };
}
