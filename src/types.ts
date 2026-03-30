export interface Customer {
  id: string;
  user_id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export interface Journey {
  id: string;
  customer_id: string;
  user_id: string;
  date: string;
  type: string;
  notes: string;
  next_steps: string;
  created_at: string;
}
