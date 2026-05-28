import { useEffect } from 'react'
import { supabase } from '../api/supabaseClient'

export function useMenuRealtime(onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel('menu-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => onUpdate()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [onUpdate])
}