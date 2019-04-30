export async function concurrentMap<A, B>(
  xs: A[],
  fn: (v: A) => Promise<B>,
  options: { workers: number }
) {
  let results: B[] = [];

  const rounds = Math.ceil(xs.length / options.workers);
  for (let r = 0; r < rounds; r++) {
    const promises: Promise<B>[] = [];
    const baseIdx = r * options.workers;
    for (let j = 0; j < options.workers && baseIdx + j < xs.length; j++) {
      promises.push(fn(xs[baseIdx + j]));
    }
    results = results.concat(await Promise.all(promises));
  }
  return results;
}
