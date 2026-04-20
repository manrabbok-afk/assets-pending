import { useEffect, useCallback } from 'react';
import { useAppStore, type WalletBalance } from '@/stores/app-store';
import { supabase } from '@/integrations/supabase/client';

export function useWallet() {
  const { user, balances, totalUsd, setBalances, selectedCurrency, setSelectedCurrency, balancesLoading } = useAppStore();

  const fetchBalances = useCallback(async () => {
    if (!user) return;
    const { data: wallets } = await supabase
      .from('wallets')
      .select('id, currency, balance')
      .eq('user_id', user.id);

    if (wallets) {
      const mapped: WalletBalance[] = wallets.map((w) => ({
        id: w.id,
        currency: w.currency ?? '',
        balance: Number(w.balance),
        usd: Number(w.balance),
        icon: '$',
        color: '#22c55e',
      }));
      setBalances(mapped);
    }
  }, [user, setBalances]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  useEffect(() => {
    if (!user) return;
    // Create a unique channel name per user to avoid re-subscribe-after-subscribe errors
    // (Supabase realtime forbids adding `.on()` handlers to an already-subscribed channel.)
    const channel = supabase.channel(`wallet-changes-${user.id}`);
    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBalances();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBalances]);

  return { balances, totalUsd, selectedCurrency, setSelectedCurrency, loading: balancesLoading, refetch: fetchBalances };
}
