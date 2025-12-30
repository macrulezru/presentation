import { computed } from 'vue';

import advegoLogo from '@/view/assets/images/company-logo/advego.png';
import avmLogo from '@/view/assets/images/company-logo/avm.svg?url';
import bauserviceLogo from '@/view/assets/images/company-logo/bauservise.svg?url';
import emgLogo from '@/view/assets/images/company-logo/emg.png';
import ionLogo from '@/view/assets/images/company-logo/ion.png';
import nikitaLogo from '@/view/assets/images/company-logo/nikita.png';
import orsLogo from '@/view/assets/images/company-logo/ors.svg?url';
import publicisLogo from '@/view/assets/images/company-logo/publicis.svg?url';
import taisLogo from '@/view/assets/images/company-logo/tais.svg?url';
import tntLogo from '@/view/assets/images/company-logo/tnt.png';
import utinetLogo from '@/view/assets/images/company-logo/utinet.png';

export function useExperienceItems(t: (key: string) => string) {
  return computed(() =>
    Object.values(experienceItemsMap).map(item => ({
      id: item.id,
      company: t(item.company),
      position: t(item.position),
      description: t(item.description),
      period: item.period ? t(item.period) : undefined,
      duration: item.duration ? t(item.duration) : undefined,
      url: item.url,
      logo: item.logo,
    })),
  );
}

export interface ExperienceItemKeys {
  company: string;
  position: string;
  description: string;
  period?: string;
  duration?: string;
  url?: string;
  logo?: string;
}

export const experienceItemsMap: Record<string, ExperienceItemKeys & { id: string }> = {
  'company-online-reservation-system': {
    id: 'company-online-reservation-system',
    company: 'experience.items.company-online-reservation-system.company',
    duration: 'experience.items.company-online-reservation-system.duration',
    position: 'experience.items.company-online-reservation-system.position',
    period: 'experience.items.company-online-reservation-system.period',
    description: 'experience.items.company-online-reservation-system.description',
    url: 'https://ors-aero.ru/',
    logo: orsLogo,
  },
  'company-tais': {
    id: 'company-tais',
    company: 'experience.items.company-tais.company',
    duration: 'experience.items.company-tais.duration',
    position: 'experience.items.company-tais.position',
    period: 'experience.items.company-tais.period',
    description: 'experience.items.company-tais.description',
    logo: taisLogo,
  },
  'company-tnt-telekompaniya': {
    id: 'company-tnt-telekompaniya',
    company: 'experience.items.company-tnt-telekompaniya.company',
    position: 'experience.items.company-tnt-telekompaniya.position',
    description: 'experience.items.company-tnt-telekompaniya.description',
    url: 'https://tnt-online.ru/',
    logo: tntLogo,
  },
  'company-publicis-united': {
    id: 'company-publicis-united',
    company: 'experience.items.company-publicis-united.company',
    position: 'experience.items.company-publicis-united.position',
    description: 'experience.items.company-publicis-united.description',
    url: 'https://www.publicisgroupe.com/en/splash-en',
    logo: publicisLogo,
  },
  'company-evropeyskaya-mediagruppa-emg': {
    id: 'company-evropeyskaya-mediagruppa-emg',
    company: 'experience.items.company-evropeyskaya-mediagruppa-emg.company',
    position: 'experience.items.company-evropeyskaya-mediagruppa-emg.position',
    description: 'experience.items.company-evropeyskaya-mediagruppa-emg.description',
    url: 'https://emg.fm/',
    logo: emgLogo,
  },
  'company-bauservice-ooo': {
    id: 'company-bauservice-ooo',
    company: 'experience.items.company-bauservice-ooo.company',
    position: 'experience.items.company-bauservice-ooo.position',
    description: 'experience.items.company-bauservice-ooo.description',
    url: 'https://bauservice.ru/',
    logo: bauserviceLogo,
  },
  'company-advego': {
    id: 'company-advego',
    company: 'experience.items.company-advego.company',
    position: 'experience.items.company-advego.position',
    description: 'experience.items.company-advego.description',
    url: 'https://advego.com/',
    logo: advegoLogo,
  },
  'company-nikita-online': {
    id: 'company-nikita-online',
    company: 'experience.items.company-nikita-online.company',
    position: 'experience.items.company-nikita-online.position',
    description: 'experience.items.company-nikita-online.description',
    url: 'https://www.gamexp.com/ru/',
    logo: nikitaLogo,
  },
  'company-nettrader': {
    id: 'company-nettrader',
    company: 'experience.items.company-nettrader.company',
    position: 'experience.items.company-nettrader.position',
    description: 'experience.items.company-nettrader.description',
    logo: '',
  },
  'company-soldis': {
    id: 'company-soldis',
    company: 'experience.items.company-soldis.company',
    position: 'experience.items.company-soldis.position',
    description: 'experience.items.company-soldis.description',
    url: 'https://soldis.ru/',
    logo: '',
  },
  'company-yutinet-ru': {
    id: 'company-yutinet-ru',
    company: 'experience.items.company-yutinet-ru.company',
    position: 'experience.items.company-yutinet-ru.position',
    description: 'experience.items.company-yutinet-ru.description',
    logo: utinetLogo,
  },
  'company-cifrovoy-centr-ion': {
    id: 'company-cifrovoy-centr-ion',
    company: 'experience.items.company-cifrovoy-centr-ion.company',
    position: 'experience.items.company-cifrovoy-centr-ion.position',
    description: 'experience.items.company-cifrovoy-centr-ion.description',
    logo: ionLogo,
  },
  'company-adt-web-solutions': {
    id: 'company-adt-web-solutions',
    company: 'experience.items.company-adt-web-solutions.company',
    position: 'experience.items.company-adt-web-solutions.position',
    description: 'experience.items.company-adt-web-solutions.description',
    logo: '',
  },
  'company-freelance': {
    id: 'company-freelance',
    company: 'experience.items.company-freelance.company',
    position: 'experience.items.company-freelance.position',
    description: 'experience.items.company-freelance.description',
    logo: '',
  },
  'company-artez-prodakshen': {
    id: 'company-artez-prodakshen',
    company: 'experience.items.company-artez-prodakshen.company',
    position: 'experience.items.company-artez-prodakshen.position',
    description: 'experience.items.company-artez-prodakshen.description',
    logo: '',
  },
  'company-avm-new-wave-inc': {
    id: 'company-avm-new-wave-inc',
    company: 'experience.items.company-avm-new-wave-inc.company',
    position: 'experience.items.company-avm-new-wave-inc.position',
    description: 'experience.items.company-avm-new-wave-inc.description',
    logo: avmLogo,
  },
};
