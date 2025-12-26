import type { JokeModel } from '@/models/joke.model';

export interface Props {
  formattedData: JokeModel | null;
  loading: boolean;
  error: string | null;
}
