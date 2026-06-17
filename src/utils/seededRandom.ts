class SeededRandom {
  private seed: number;

  constructor(seed: number = 42) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  noise(amplitude: number): number {
    return (this.next() - 0.5) * 2 * amplitude;
  }
}

export const createSeededRandom = (seed: number = 42): SeededRandom => {
  return new SeededRandom(seed);
};

export default SeededRandom;
