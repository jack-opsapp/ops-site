export type Locale = 'en' | 'es';

export type Namespace =
  | 'common'
  | 'home'
  | 'platform'
  | 'plans'
  | 'company'
  | 'resources'
  | 'tools'
  | 'legal'
  | 'shop';

export type Dictionary = Record<string, string | string[] | Record<string, unknown>>;
