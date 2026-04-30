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

export const MOCK_TICKETS: Ticket[] = [];
