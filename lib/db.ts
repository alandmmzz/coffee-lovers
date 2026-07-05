import { neon } from '@neondatabase/serverless';

// fetchOptions con cache: 'no-store' es necesario porque Next.js cachea
// por default cualquier fetch() que se haga durante el render — incluido
// el que usa el driver de Neon por debajo — aunque la página esté marcada
// como force-dynamic. Sin esto, las páginas muestran siempre la primera
// respuesta que se cacheó, ignorando filas nuevas.
const sql = neon(process.env.DATABASE_URL as string, {
  fetchOptions: {
    cache: 'no-store',
  },
});

export default sql;

export type BrandLogo = {
  brand: string;
  logo_url: string | null;
  updated_at?: string;
};

export type Coffee = {
  id: string;
  created_at?: string;
  brand: string;
  line: string;
  origin: string | null;
  farm: string | null;
  variety: string | null;
  process: string | null;
  tasting_notes: string | null;
  brand_logo_url?: string | null;
};

export type Group = {
  id: string;
  created_at?: string;
  name: string;
  image_url: string | null;
  invite_code: string;
  created_by: string;
};

export type CoffeeReview = {
  id?: string;
  created_at?: string;
  taster_name: string;
  coffee_id: string;
  roast_level: string | null;
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
  has_milk: boolean;
  milk_type: string | null;
  temperature_preference: string | null;
  consumption_type: string | null;
  place_name: string | null;
  user_email?: string | null;
  user_name?: string | null;
  user_image?: string | null;
  // Campos que llegan cuando la consulta hace JOIN con `coffees`
  brand?: string;
  line?: string;
  origin?: string | null;
  farm?: string | null;
  variety?: string | null;
  process?: string | null;
  tasting_notes?: string | null;
};
