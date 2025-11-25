export interface ParentNotification {
  type: 'content_blocked' | 'response_sanitized' | 'inappropriate_attempt';
  severity: 'low' | 'medium' | 'high';
  flags: string[];
  childId: string;
  timestamp?: Date;
  details?: string;
}

export interface ConversationSummary {
  childId: string;
  date: Date;
  totalMessages: number;
  topicsDiscussed: string[];
  safetyFlags: number;
  learningTime: number; // minutes
  xpEarned: number;
}

export interface SafetyIncident {
  type: string;
  content: string;
  flags: string[];
  timestamp: Date;
  userId: string;
  lessonId?: string;
}

class ParentMonitoringService {
  private getNotificationsKey(childId: string): string {
    return `parent_notifications_${childId}`;
  }

  private getUrgentAlertsKey(childId: string): string {
    return `urgent_alerts_${childId}`;
  }

  private getChatHistoryKey(childId: string): string {
    return `chat_history_${childId}`;
  }

  async notifyParent(notification: ParentNotification): Promise<void> {
    const timestampedNotification = {
      ...notification,
      timestamp: notification.timestamp || new Date(),
    };

    // Store notification for parent dashboard
    try {
      const key = this.getNotificationsKey(notification.childId);
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');
      notifications.push(timestampedNotification);

      // Keep last 100 notifications
      const trimmed = notifications.slice(-100);
      localStorage.setItem(key, JSON.stringify(trimmed));

      // Send urgent alert for high severity
      if (notification.severity === 'high') {
        await this.sendUrgentAlert(timestampedNotification);
      }
    } catch (error) {
      console.error('Error storing parent notification:', error);
    }
  }

  async getNotifications(childId: string, limit: number = 20): Promise<ParentNotification[]> {
    try {
      const key = this.getNotificationsKey(childId);
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');
      return notifications
        .slice(-limit)
        .reverse()
        .map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      return [];
    }
  }

  async getUrgentAlerts(childId: string): Promise<ParentNotification[]> {
    try {
      const key = this.getUrgentAlertsKey(childId);
      const alerts = JSON.parse(localStorage.getItem(key) || '[]');
      return alerts.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
    } catch (error) {
      console.error('Error retrieving urgent alerts:', error);
      return [];
    }
  }

  async clearUrgentAlerts(childId: string): Promise<void> {
    try {
      const key = this.getUrgentAlertsKey(childId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing urgent alerts:', error);
    }
  }

  async generateConversationSummary(childId: string, date: Date): Promise<ConversationSummary> {
    try {
      // Get conversation history for the date
      const key = this.getChatHistoryKey(childId);
      const history = JSON.parse(localStorage.getItem(key) || '[]');

      const dayMessages = history.filter((msg: any) => {
        const msgDate = new Date(msg.timestamp);
        return msgDate.toDateString() === date.toDateString();
      });

      // Extract topics
      const topics = this.extractTopics(dayMessages);

      // Count safety flags
      const safetyFlags = dayMessages.filter(
        (msg: any) => msg.metadata?.safetyFlags && msg.metadata.safetyFlags.length > 0
      ).length;

      // Calculate learning time (rough estimate)
      let learningTime = 0;
      if (dayMessages.length >= 2) {
        const firstMessage = dayMessages[0];
        const lastMessage = dayMessages[dayMessages.length - 1];
        learningTime = Math.round(
          (new Date(lastMessage.timestamp).getTime() -
            new Date(firstMessage.timestamp).getTime()) /
            (1000 * 60)
        );
      }

      return {
        childId,
        date,
        totalMessages: dayMessages.length,
        topicsDiscussed: topics,
        safetyFlags,
        learningTime,
        xpEarned: 0, // Will be integrated with gamification system
      };
    } catch (error) {
      console.error('Error generating conversation summary:', error);
      return {
        childId,
        date,
        totalMessages: 0,
        topicsDiscussed: [],
        safetyFlags: 0,
        learningTime: 0,
        xpEarned: 0,
      };
    }
  }

  async getWeeklySummary(childId: string): Promise<ConversationSummary[]> {
    const summaries: ConversationSummary[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const summary = await this.generateConversationSummary(childId, date);
      summaries.push(summary);
    }

    return summaries;
  }

  private extractTopics(messages: any[]): string[] {
    // Simple keyword extraction
    const keywords = new Map<string, number>();

    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'was', 'are', 'were', 'what', 'when', 'where', 'how', 'why',
      'can', 'could', 'would', 'should', 'help', 'please', 'thanks', 'okay',
      'yes', 'no', 'me', 'you', 'i', 'we', 'they', 'it', 'this', 'that',
      'my', 'your', 'about', 'with', 'from', 'have', 'has', 'do', 'does',
      'did', 'will', 'be', 'been', 'being', 'just', 'more', 'some', 'any',
    ]);

    messages.forEach((msg) => {
      if (msg.role === 'user') {
        const words = msg.content.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach((word: string) => {
          if (word.length > 3 && !commonWords.has(word)) {
            keywords.set(word, (keywords.get(word) || 0) + 1);
          }
        });
      }
    });

    // Return top 5 keywords
    return Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  private async sendUrgentAlert(notification: ParentNotification): Promise<void> {
    console.warn('URGENT: Parent notification required', notification);

    // Store in urgent alerts
    try {
      const key = this.getUrgentAlertsKey(notification.childId);
      const urgentAlerts = JSON.parse(localStorage.getItem(key) || '[]');
      urgentAlerts.push({ ...notification, urgent: true });
      localStorage.setItem(key, JSON.stringify(urgentAlerts));
    } catch (error) {
      console.error('Error storing urgent alert:', error);
    }

    // In production, this would send email/SMS/push notification
    // Integration points:
    // - SendGrid for email
    // - Twilio for SMS
    // - Firebase Cloud Messaging for push notifications
  }

  async clearNotifications(childId: string): Promise<void> {
    try {
      const key = this.getNotificationsKey(childId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  async getSafetyIncidents(childId: string): Promise<SafetyIncident[]> {
    try {
      const key = `safety_incidents_${childId}`;
      const incidents = JSON.parse(localStorage.getItem(key) || '[]');
      return incidents.map((i: any) => ({
        ...i,
        timestamp: new Date(i.timestamp),
      }));
    } catch (error) {
      console.error('Error retrieving safety incidents:', error);
      return [];
    }
  }

  // Helper to check if there are any urgent unread alerts
  async hasUnreadUrgentAlerts(childId: string): Promise<boolean> {
    const alerts = await this.getUrgentAlerts(childId);
    return alerts.length > 0;
  }

  // Get statistics for parent dashboard
  async getParentDashboardStats(childId: string): Promise<{
    totalConversations: number;
    totalSafetyFlags: number;
    averageLearningTime: number;
    topicsThisWeek: string[];
  }> {
    const weeklySummary = await this.getWeeklySummary(childId);

    const totalConversations = weeklySummary.reduce((sum, s) => sum + (s.totalMessages > 0 ? 1 : 0), 0);
    const totalSafetyFlags = weeklySummary.reduce((sum, s) => sum + s.safetyFlags, 0);
    const totalLearningTime = weeklySummary.reduce((sum, s) => sum + s.learningTime, 0);
    const averageLearningTime = totalConversations > 0 ? totalLearningTime / totalConversations : 0;

    const allTopics: string[] = [];
    weeklySummary.forEach(s => {
      allTopics.push(...s.topicsDiscussed);
    });

    // Deduplicate topics
    const topicsThisWeek = [...new Set(allTopics)].slice(0, 10);

    return {
      totalConversations,
      totalSafetyFlags,
      averageLearningTime: Math.round(averageLearningTime),
      topicsThisWeek,
    };
  }
}

export { ParentMonitoringService };
export default ParentMonitoringService;
