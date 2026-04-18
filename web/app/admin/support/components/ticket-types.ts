export type TicketStatus = "Open" | "Pending" | "Closed" | "Resolved";
export type TicketPriority = "High" | "Medium" | "Low";
export type TicketCategory = "Refund" | "Booking" | "Account" | "Vendor" | "Technical" | "General";

export type Ticket = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  lastUpdated: string;
  messages: TicketMessage[];
};

export type TicketMessage = {
  id: string;
  sender: "user" | "admin";
  senderName: string;
  body: string;
  timestamp: string;
};

export const MOCK_TICKETS: Ticket[] = Array.from({ length: 18 }, (_, i) => ({
  id: `#TKT-${String(i + 1).padStart(4, "0")}`,
  userId: `USR-${1000 + i}`,
  userName: ["Chris Jones", "Amara Osei", "Lena Mueller", "David Park", "Sofia Rossi"][i % 5],
  userEmail: `user${i + 1}@example.com`,
  subject: ["Payment not received", "Refund request", "Account suspended", "Vendor issue", "Booking cancelled"][i % 5],
  category: (["Refund", "Booking", "Account", "Vendor", "Technical", "General"] as TicketCategory[])[i % 6],
  priority: (["High", "Medium", "Low"] as TicketPriority[])[i % 3],
  status: (["Open", "Open", "Pending", "Closed", "Open", "Resolved"] as TicketStatus[])[i % 6],
  createdAt: `Apr ${10 + (i % 8)}, 2026`,
  lastUpdated: `Apr ${15 + (i % 3)}, 2026`,
  messages: [
    {
      id: "m1",
      sender: "user",
      senderName: ["Chris Jones", "Amara Osei", "Lena Mueller", "David Park", "Sofia Rossi"][i % 5],
      body: "Hello, I have an issue with my booking. The payment was deducted but I did not receive any confirmation. Could you please look into this?",
      timestamp: `Apr ${10 + (i % 8)}, 2026 · 10:32 AM`,
    },
    {
      id: "m2",
      sender: "admin",
      senderName: "Support Team",
      body: "Hi! Thanks for reaching out. We've received your request and are currently looking into it. We'll get back to you within 24 hours.",
      timestamp: `Apr ${11 + (i % 8)}, 2026 · 09:15 AM`,
    },
  ],
}));
