export interface SampleData {
  name: string;
  clientId: string;
  apiId: number;
}

export const samples: SampleData[] = [
  { name: 'Northwind Air', clientId: 'AK1', apiId: 1 },
  { name: 'Solstice Airways', clientId: 'AK2', apiId: 2 },
  { name: 'BlueOrbit', clientId: 'AK3', apiId: 3 },
];

export function getSampleByClientId(clientId: string): SampleData | undefined {
  return samples.find(s => s.clientId === clientId);
}

export function getSampleByApiId(apiId: number): SampleData | undefined {
  return samples.find(s => s.apiId === apiId);
}

/**
 * Загружает данные из API для выбранной авиакомпании
 */
export async function loadSampleData(
  clientId: string,
): Promise<{ clientId: string; data: unknown }> {
  const sample = getSampleByClientId(clientId);
  if (!sample) {
    throw new Error(`Sample not found for clientId: ${clientId}`);
  }

  const url = `https://macrulez-api.ru/api/universal-seat-map/${sample.apiId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load data from API: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();

  if (json.success && json.data) {
    const clientIdFromApi = json.data.clientId || sample.clientId;
    return {
      clientId: clientIdFromApi,
      data: json.data.data,
    };
  }

  throw new Error('Invalid API response format');
}
