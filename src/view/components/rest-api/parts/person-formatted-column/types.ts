import type { PersonResponseModel } from '@/models/person-response.model';

export interface Props {
  formattedData: PersonResponseModel | null;
  loading: boolean;
  error: string | null;
}
