export type CustomerRecord = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
};

export interface CustomerRepository {
  findByPhone(phone: string): Promise<CustomerRecord | null>;
  findByEmail(email: string): Promise<CustomerRecord | null>;
  create(input: { name: string; phone: string | null; email: string | null }): Promise<CustomerRecord>;
  updateName(id: number, name: string): Promise<void>;
}

