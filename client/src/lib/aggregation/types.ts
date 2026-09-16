/** Bottom-up subtree totals. Performance is stored pre-weighting so ancestors can be updated
 * incrementally by delta instead of re-walking the whole subtree on every change. */
export interface SubtreeAggregate {
  totalHeadcount: number;
  totalBudget: number;
  performanceWeightSum: number;
}

export function weightedPerformance(aggregate: SubtreeAggregate, ownPerformanceFallback: number): number {
  return aggregate.totalHeadcount > 0
    ? aggregate.performanceWeightSum / aggregate.totalHeadcount
    : ownPerformanceFallback;
}
