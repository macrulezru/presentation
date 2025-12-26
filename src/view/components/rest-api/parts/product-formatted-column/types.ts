import type { ProductModel } from '@/models/product.model';

export interface Props {
  formattedData: ProductModel | null;
  loading: boolean;
  error: string | null;
}
