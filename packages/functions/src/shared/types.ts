/**
 * Shared TypeScript types for database entities
 */

export type ManagerRow = {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string | null;
  email: string | null;
  status: "Active" | "Terminated" | "Probation";
  market_value: number;
  as_of_date: string; // YYYY-MM-DD
};

export type ManagerCreateInput = {
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  email?: string;
  status: "Active" | "Terminated" | "Probation";
  marketValue: number;
  asOfDate: string;
};

export type ManagerUpdateInput = Partial<ManagerCreateInput>;

// ============================================
// Event Types (Reference/Lookup Table)
// ============================================

export type EventTypeRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;  // ISO timestamp
  updated_at: string;  // ISO timestamp
};

export type EventTypeCreateInput = {
  name: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export type EventTypeUpdateInput = Partial<EventTypeCreateInput>;

