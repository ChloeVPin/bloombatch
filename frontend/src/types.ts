import { main } from '../wailsjs/go/models';

export type RuleType = 'prefix' | 'suffix' | 'replace' | 'autonumber' | 'case';

export type Page = 'drop' | 'rules' | 'preview' | 'done';

export interface RuleConfig {
  id: string;
  type: RuleType;
  prefix: string;
  suffix: string;
  searchText: string;
  replaceText: string;
  startNum: number;
  padding: number;
  caseMode: string;
}

export function newRule(type: RuleType): RuleConfig {
  return {
    id: crypto.randomUUID(),
    type,
    prefix: '',
    suffix: '',
    searchText: '',
    replaceText: '',
    startNum: 1,
    padding: 3,
    caseMode: 'lower',
  };
}

export function toBackendRules(rules: RuleConfig[]): main.RenameRule[] {
  return rules.map((r) => ({
    type: r.type,
    prefix: r.prefix,
    suffix: r.suffix,
    searchText: r.searchText,
    replaceText: r.replaceText,
    startNum: r.startNum,
    padding: r.padding,
    caseMode: r.caseMode,
  }));
}
