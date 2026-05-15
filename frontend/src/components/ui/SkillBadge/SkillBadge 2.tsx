import styles from './SkillBadge.module.css';

const skillColors: Record<string, string> = {
  react: 'cyan',
  typescript: 'blue',
  javascript: 'yellow',
  python: 'green',
  docker: 'blue',
  kubernetes: 'blue',
  aws: 'orange',
  node: 'green',
  'node.js': 'green',
  sql: 'purple',
  postgresql: 'blue',
  mongodb: 'green',
  figma: 'purple',
  kotlin: 'purple',
  swift: 'orange',
  go: 'cyan',
  java: 'orange',
  linux: 'yellow',
  git: 'orange',
  pytorch: 'orange',
  tensorflow: 'orange',
};

function getColor(skill: string): string {
  const key = skill.toLowerCase();
  for (const [k, v] of Object.entries(skillColors)) {
    if (key.includes(k)) return v;
  }
  return 'default';
}

interface SkillBadgeProps {
  skill: string;
  size?: 'sm' | 'md';
}

export function SkillBadge({ skill, size = 'sm' }: SkillBadgeProps) {
  const color = getColor(skill);
  return (
    <span className={`${styles.badge} ${styles[color]} ${styles[size]}`}>
      {skill}
    </span>
  );
}
