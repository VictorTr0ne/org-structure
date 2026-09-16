import type { OrgNode } from "../types.js";

/** Deterministic PRNG (mulberry32) so demo data is stable across server restarts. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIVISIONS = [
  "Дивизион продаж",
  "Дивизион разработки",
  "Дивизион маркетинга",
  "Дивизион операций",
];

const DEPARTMENTS_BY_DIVISION: Record<string, string[]> = {
  "Дивизион продаж": ["Отдел B2B продаж", "Отдел B2C продаж", "Отдел партнёрств"],
  "Дивизион разработки": [
    "Отдел frontend",
    "Отдел backend",
    "Отдел платформы",
    "Отдел QA",
  ],
  "Дивизион маркетинга": ["Отдел бренда", "Отдел performance-маркетинга", "Отдел SMM"],
  "Дивизион операций": [
    "Отдел логистики",
    "Отдел поддержки",
    "Отдел закупок",
    "Отдел аналитики",
  ],
};

const TEAM_NAME_POOL = [
  "Команда роста",
  "Команда удержания",
  "Команда ключевых клиентов",
  "Команда экспансии",
  "Команда веб-приложений",
  "Команда мобильных приложений",
  "Команда инфраструктуры",
  "Команда данных",
  "Команда автотестов",
  "Команда ручного тестирования",
  "Команда контента",
  "Команда дизайна",
  "Команда трафика",
  "Команда доставки",
  "Команда склада",
  "Команда клиентского сервиса",
  "Команда снабжения",
  "Команда BI",
];

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generates a flat list of org nodes across three levels: division -> department -> team.
 * Every node (not just leaves) carries its own headcount/budget so that subtree aggregation
 * in the client has a non-trivial "own contribution" at each level to sum up.
 */
export function generateOrgTree(): OrgNode[] {
  const rng = mulberry32(42);
  const now = new Date().toISOString();
  const nodes: OrgNode[] = [];
  let teamNameCursor = 0;

  DIVISIONS.forEach((divisionName, divisionIndex) => {
    const divisionId = `div-${divisionIndex + 1}`;
    nodes.push({
      id: divisionId,
      name: divisionName,
      parentId: null,
      headcount: randomInt(rng, 4, 10),
      budget: randomInt(rng, 8_000_000, 20_000_000),
      performance: randomInt(rng, 55, 92),
      updatedAt: now,
    });

    const departments = DEPARTMENTS_BY_DIVISION[divisionName] ?? [];
    departments.forEach((departmentName, departmentIndex) => {
      const departmentId = `${divisionId}-dept-${departmentIndex + 1}`;
      nodes.push({
        id: departmentId,
        name: departmentName,
        parentId: divisionId,
        headcount: randomInt(rng, 2, 6),
        budget: randomInt(rng, 1_500_000, 4_500_000),
        performance: randomInt(rng, 45, 95),
        updatedAt: now,
      });

      const teamCount = randomInt(rng, 2, 4);
      for (let teamIndex = 0; teamIndex < teamCount; teamIndex += 1) {
        const teamId = `${departmentId}-team-${teamIndex + 1}`;
        const teamName = TEAM_NAME_POOL[teamNameCursor % TEAM_NAME_POOL.length] as string;
        teamNameCursor += 1;
        nodes.push({
          id: teamId,
          name: teamName,
          parentId: departmentId,
          headcount: randomInt(rng, 4, 18),
          budget: randomInt(rng, 400_000, 3_200_000),
          performance: randomInt(rng, 30, 99),
          updatedAt: now,
        });
      }
    });
  });

  return nodes;
}
