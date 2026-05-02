# Notification System Design

## Stage 1: REST API Design

To provide a clean and robust REST API for managing notifications, we will implement the following core endpoints:

1. **`GET /api/v1/notifications`**
   - **Description**: Fetch notifications for the authenticated user.
   - **Query Parameters**:
     - `status`: Filter by status (`read`, `unread`, `all`). Default is `all`.
     - `limit`: Number of records to return.
     - `offset`: Pagination offset.
   - **Response**: Array of notification objects.

2. **`PATCH /api/v1/notifications/:id/read`**
   - **Description**: Mark a specific notification as read.
   - **Response**: Updated notification object or `204 No Content`.

3. **`PATCH /api/v1/notifications/read-all`**
   - **Description**: Mark all unread notifications for the user as read.
   - **Response**: `200 OK` with a summary of affected records.

## Stage 2: DB Choice and Schema

### Database Choice
**PostgreSQL** is the recommended database for this system. It provides strong ACID guarantees, robust indexing, and JSONB support which is useful for storing arbitrary metadata associated with various notification types (e.g., event links, placement company details).

### Schema Design

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- e.g., 'Placement', 'Result', 'Event'
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast retrieval of user's notifications, especially unread ones
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

## Stage 3: Query Optimization for Unread Notifications

When a user logs in or frequently checks their inbox, querying unread notifications can become a bottleneck.

**Optimization Strategies:**
1. **Composite Indexing**: The index `idx_notifications_user_id_is_read` ensures that queries like `SELECT * FROM notifications WHERE user_id = ? AND is_read = false` are executed efficiently using an index scan instead of a full table scan.
2. **Denormalization (Unread Count)**: Maintain an `unread_count` field in the `users` table or a separate counter table (e.g., Redis). We can increment this on a new notification and decrement it when a notification is read. This saves expensive `COUNT()` queries.

## Stage 4: Performance Improvements for Repeated Page Loads

For a high-traffic system where users repeatedly hit the notifications page:
1. **Caching with Redis**: Cache the first page of notifications and the unread count in Redis for each user. Invalidate or update the cache when a new notification arrives or status changes.
2. **Long Polling / Server-Sent Events (SSE) / WebSockets**: Instead of having the client continuously poll the REST API on every page load or interval, establish a persistent connection. Push notifications to the client in real-time. This heavily reduces HTTP request overhead and database load.

## Stage 5: Reliable Bulk Notification Delivery Design

When an admin sends a bulk notification to thousands of users:
1. **Message Queue (RabbitMQ / Kafka / AWS SQS)**: The API request simply queues an event (e.g., `BulkNotificationRequested`). The API returns a `202 Accepted` immediately.
2. **Worker Nodes**: Dedicated background workers consume this event. They chunk the users and insert records into the database in batches (e.g., 500 rows per `INSERT`).
3. **Idempotency and Retry Mechanism**: If a worker fails midway, the system must retry. Using idempotency keys ensures that duplicate notifications are not sent.

## Stage 6: Priority Inbox Implementation Idea and Code

The priority inbox ranks unread notifications based on a combination of importance (Type Weight) and recency. 

**Implementation Idea:**
- **Weights**: Placement = 3, Result = 2, Event = 1.
- **Score Calculation**: Since type weight is strictly more important than time, we can multiply the weight by a very large constant and add the timestamp, or simply use multi-criteria sorting (sort by weight descending, then by timestamp descending).

**Code Reference:**
We have implemented this inside `src/services/notificationService.ts`.

```typescript
// Excerpt from NotificationService
const scored = unread.map(n => {
  const type = n.type || 'General';
  const weight = this.getTypeWeight(type);
  const timestamp = new Date(n.timestamp).getTime();

  return {
    ...n,
    computedPriority: weight * 1000000000000 + timestamp
  };
});

// Sort by computed priority (descending)
scored.sort((a, b) => b.computedPriority - a.computedPriority);
const topN = scored.slice(0, 10);
```
This ensures Placement notifications always appear above Results, and within Placements, the newest appear first.
