import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL as string);

export default sql;

export type Coffee = {
  id: string;
  created_at?: string;
  brand: string;
  line: string;
  origin: string | null;
  process: string | null;
};

export type CoffeeReview = {
  id?: string;
  created_at?: string;
  taster_name: string;
  coffee_id: string;
  roast_level: string;
  brew_method: string;
  aroma: number;
  acidity: number;
  sweetness: number;
  body: number;
  bitterness: number;
  aftertaste: number;
  balance: number;
  overall_rating: number;
  price: number | null;
  notes: string | null;
  user_email?: string | null;
  user_name?: string | null;
  user_image?: string | null;
  // Campos que llegan cuando la consulta hace JOIN con `coffees`
  brand?: string;
  line?: string;
  origin?: string | null;
  process?: string | null;
};
