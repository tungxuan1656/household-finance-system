import type { ReferenceCategoryDTO, ReferenceSourceDTO } from '@/contracts'

const REFERENCE_CATEGORIES: readonly ReferenceCategoryDTO[] = [
  {
    key: 'food',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_antiem_rtdkab.png',
    color: '#F97316',
  },
  {
    key: 'transport',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_xeco_zlusxx.png',
    color: '#3B82F6',
  },
  {
    key: 'dating',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263089/ico_tinhyeu_n9maa9.png',
    color: '#EC4899',
  },
  {
    key: 'living-costs',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_sinhhoatphi_cdm3tg.png',
    color: '#0EA5E9',
  },
  {
    key: 'family',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_giadinh_immyso.png',
    color: '#14B8A6',
  },
  {
    key: 'children',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_concai_gkf6ox.png',
    color: '#22C55E',
  },
  {
    key: 'relatives',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_hohang_az6gl2.png',
    color: '#84CC16',
  },
  {
    key: 'shopping',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_muasam_vcfac4.png',
    color: '#A855F7',
  },
  {
    key: 'beauty',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_mypham_lbvuzk.png',
    color: '#F43F5E',
  },
  {
    key: 'health',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_suckhoe_lcqns7.png',
    color: '#EF4444',
  },
  {
    key: 'social',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_xagiao_jjlevz.png',
    color: '#EAB308',
  },
  {
    key: 'repairs',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_suachua_cjb4ml.png',
    color: '#F59E0B',
  },
  {
    key: 'work',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_congviec_zcnqxo.png',
    color: '#6366F1',
  },
  {
    key: 'education',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263089/ico_hoctap_pmeofo.png',
    color: '#8B5CF6',
  },
  {
    key: 'investment',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_dautu_wuq3xk.png',
    color: '#0891B2',
  },
  {
    key: 'self-development',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_phattrien_ezxf5t.png',
    color: '#06B6D4',
  },
  {
    key: 'sports',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_thethao_sboru6.png',
    color: '#84CC16',
  },
  {
    key: 'travel',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263088/ico_dulich_frrimr.png',
    color: '#0D9488',
  },
  {
    key: 'hobbies',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_sothich_bwstwh.png',
    color: '#A16207',
  },
  {
    key: 'pets',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_pet_ejgwee.png',
    color: '#E11D48',
  },
  {
    key: 'money-in',
    kind: 'income',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263091/ico_nhantien_bzjpqv.png',
    color: '#16A34A',
  },
  {
    key: 'lending',
    kind: 'transfer',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263087/ico_chovaytrano_voimcv.png',
    color: '#0EA5E9',
  },
  {
    key: 'charity',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263089/ico_tuthien_hnfhwl.png',
    color: '#22C55E',
  },
  {
    key: 'other',
    kind: 'expense',
    iconUrl:
      'https://res.cloudinary.com/dbh6mlyky/image/upload/v1756263090/ico_khac_jb5mal.png',
    color: '#64748B',
  },
]

const REFERENCE_SOURCES: readonly ReferenceSourceDTO[] = [
  { key: 'cash' },
  { key: 'bank-transfer' },
  { key: 'card' },
  { key: 'e-wallet' },
  { key: 'other' },
]

export const listReferenceCategories = (): ReferenceCategoryDTO[] =>
  REFERENCE_CATEGORIES.map((item) => ({ ...item }))

export const listReferenceSources = (): ReferenceSourceDTO[] =>
  REFERENCE_SOURCES.map((item) => ({ ...item }))
