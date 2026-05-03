/**
 * useNotifications Hook - Fetch and manage notifications
 */
import { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../db/notifications';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getNotifications(user.uid).then(snapshot => {
        setNotifications(snapshot.docs.map(doc => doc.data()));
        setLoading(false);
      });
    }
  }, [user]);

  return { notifications, loading, markAsRead };
}
