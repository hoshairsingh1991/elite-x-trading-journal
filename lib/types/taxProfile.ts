export interface TaxProfile {
  id: string;
  user_id: string;

  country: string;
  country_code: string;

  province: string;

  entity_type: string;

  tax_rate: number;

  tax_year: number;

  created_at: string;
  updated_at: string;
}

export interface SaveTaxProfileInput {
  country: string;
  country_code: string;

  province: string;

  entity_type: string;

  tax_rate: number;

  tax_year: number;
}