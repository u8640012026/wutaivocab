import React from 'react';
import {
  Puzzle,
  Users,
  Apple,
  Activity,
  Shield,
  Zap,
  HelpCircle,
  Compass,
  Clock,
  ScrollText,
} from 'lucide-react';

const GRAMMAR_ICON_MAP = {
  puzzle: Puzzle,
  users: Users,
  apple: Apple,
  activity: Activity,
  shield: Shield,
  zap: Zap,
  help: HelpCircle,
  compass: Compass,
  clock: Clock,
  scroll: ScrollText,
};

export function GrammarIcon({ name = 'puzzle', className = 'w-5 h-5' }) {
  const Icon = GRAMMAR_ICON_MAP[name] || Puzzle;
  return <Icon className={className} />;
}
