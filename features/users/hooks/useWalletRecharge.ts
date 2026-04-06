import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletAPI } from '@/lib/api';

export function useWalletRecharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => walletAPI.recharge(amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['profiles', 'me']);
      queryClient.invalidateQueries(['auth', 'me']);
      queryClient.setQueryData(['profile'], data);
    },
  });
}
