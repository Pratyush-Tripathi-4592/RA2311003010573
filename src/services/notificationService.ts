import { evaluationClient } from '../clients/evaluationClient';
import { Log } from '../../logging_middleware';

export class NotificationService {
  getTypeWeight(type: string): number {
    const t = (type || '').toLowerCase();
    if (t.includes('placement')) return 3;
    if (t.includes('result')) return 2;
    if (t.includes('event')) return 1;
    return 0;
  }

  async getPriorityInbox(limit: number = 10) {
    await Log('backend', 'info', 'service', 'Fetching notifications for priority inbox');

    try {
      const data = await evaluationClient.getNotifications();
      let notifications: any[] = [];
      
      if (Array.isArray(data)) {
        notifications = data;
      } else if (data && data.notifications) {
        notifications = data.notifications;
      } else if (data && data.data) {
        notifications = data.data;
      }

      await Log('backend', 'info', 'service', `Fetched ${notifications.length} notifications`);

      // Filter unread notifications
      const unread = notifications.filter(n => {
        if (n.read === true || n.isRead === true || String(n.status).toLowerCase() === 'read') {
          return false;
        }
        return true;
      });

      // Compute priority score and add timestamp if missing
      const scored = unread.map(n => {
        const type = n.type || n.category || 'General';
        const weight = this.getTypeWeight(type);
        const timestamp = n.timestamp || n.date || n.createdAt || Date.now();
        const timeVal = new Date(timestamp).getTime() || 0;

        return {
          id: n.id || n._id,
          type: type,
          message: n.message || n.text || n.content || '',
          timestamp: timestamp,
          computedPriority: weight * 1000000000000 + timeVal,
          weight,
          timeVal
        };
      });

      // Sort by priority (weight first, then recency) and get top N
      scored.sort((a, b) => b.computedPriority - a.computedPriority);
      const topN = scored.slice(0, limit);

      await Log('backend', 'success', 'service', `Calculated top ${topN.length} priority notifications`);

      // Clean output
      return topN.map(n => ({
        ID: n.id,
        Type: n.type,
        Message: n.message,
        Timestamp: n.timestamp,
        computedPriority: n.computedPriority
      }));

    } catch (error: any) {
      await Log('backend', 'error', 'service', `Notification service failed: ${error.message}`);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
