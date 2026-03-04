import { RuleConfig, RuleType, newRule } from '../types';
import RuleCard from '../components/RuleCard';
import { ChevronLeft } from 'lucide-react';

interface RulesPageProps {
  rules: RuleConfig[];
  onRulesChange: (rules: RuleConfig[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const ruleTypes: { type: RuleType; label: string }[] = [
  { type: 'prefix', label: 'Prefix' },
  { type: 'suffix', label: 'Suffix' },
  { type: 'replace', label: 'Replace' },
  { type: 'autonumber', label: 'Number' },
  { type: 'case', label: 'Case' },
];

export default function RulesPage({ rules, onRulesChange, onBack, onNext }: RulesPageProps) {
  const activeTypes = new Set(rules.map((r) => r.type));

  const toggleRule = (type: RuleType) => {
    if (activeTypes.has(type)) {
      onRulesChange(rules.filter((r) => r.type !== type));
    } else {
      onRulesChange([...rules, newRule(type)]);
    }
  };

  const updateRule = (id: string, updates: Partial<RuleConfig>) => {
    onRulesChange(rules.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Rule type toggles */}
      <div className="flex flex-wrap gap-1.5 px-6 pb-4">
        {ruleTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => toggleRule(type)}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
              activeTypes.has(type)
                ? 'border-accent bg-accent-subtle text-text-accent'
                : 'border-border bg-surface-raised text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {activeTypes.has(type) ? '✓ ' : '+ '}{label}
          </button>
        ))}
      </div>

      {/* Active rule cards */}
      <div className="flex-1 overflow-y-auto px-6 space-y-2.5">
        {rules.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-text-tertiary">Pick a rule above to configure</p>
          </div>
        )}
        {rules.map((rule) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            onUpdate={(u) => updateRule(rule.id, u)}
            onRemove={() => removeRule(rule.id)}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={rules.length === 0}
          className="px-5 py-2 text-xs font-semibold rounded-lg text-white bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Preview
        </button>
      </div>
    </div>
  );
}
