import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  [key: string]: string;
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app_settings'],
    queryFn: async (): Promise<AppSettings> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');
      if (error) throw new Error(error.message);
      const settings: AppSettings = {};
      (data || []).forEach(row => {
        settings[row.key] = row.value || '';
      });
      return settings;
    },
  });
};

export const useSaveAppSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      for (const [key, value] of Object.entries(settings)) {
        // Upsert: try update first, then insert
        const { data: existing } = await supabase
          .from('app_settings')
          .select('id')
          .eq('key', key)
          .single();

        if (existing) {
          await supabase
            .from('app_settings')
            .update({ value, updated_at: new Date().toISOString() } as any)
            .eq('key', key);
        } else {
          await supabase
            .from('app_settings')
            .insert({ key, value } as any);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app_settings'] });
    },
  });
};