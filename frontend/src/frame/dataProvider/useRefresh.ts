import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useRefresh = () => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);
};
