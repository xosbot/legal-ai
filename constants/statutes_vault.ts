
import { NDPS_ACT_1985 } from './ndps_act';
import { FAMILY_COURTS_ACT_1984 } from './family_court_act';
import { PredefinedLaw } from '../types';

export const STATUTES_VAULT: PredefinedLaw[] = [
  {
    id: 'ndps_1985',
    name: 'NDPS Act, 1985',
    category: 'Statute',
    content: NDPS_ACT_1985
  },
  {
    id: 'family_court_1984',
    name: 'Family Courts Act, 1984',
    category: 'Statute',
    content: FAMILY_COURTS_ACT_1984
  },
  {
    id: 'bnss_2023',
    name: 'BNSS, 2023 (Procedural)',
    category: 'Statute',
    content: "Bharatiya Nagarik Suraksha Sanhita, 2023. Key sections on arrest, bail, and investigation procedures."
  },
  {
    id: 'p_sc_bail_2024',
    name: 'SC Ruling on NDPS Bail (2024)',
    category: 'Precedent',
    content: "Latest Supreme Court ruling clarifying the application of Section 37 of NDPS Act regarding reasonable grounds for believing the accused is not guilty."
  },
  {
    id: 'p_hc_search_2023',
    name: 'HC Search & Seizure Protocol',
    category: 'Precedent',
    content: "High Court precedent regarding non-compliance with Section 50 of NDPS Act (Search of persons) vitiating the recovery."
  },
  {
    id: 'p_family_concil',
    name: 'Precedent: Family Conciliation',
    category: 'Precedent',
    content: "Judicial directive emphasizing mandatory mediation before litigation under Section 9 of Family Courts Act."
  }
];
