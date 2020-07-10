class Color {
  static fromHex(str: string) {
    const match = str.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
    if (!match) throw new Error(`Invalid hex string: ${str}`);
    const [, r, g, b] = match;
    return new Color(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
  }

  constructor(private r: number, private g: number, private b: number) {}

  toString() {
    return `#${this.toNumber().toString(16).padStart(6, "0")}`;
  }

  toNumber() {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  lighten(amount: number) {
    return new Color(
      Math.min(255, Math.round(this.r * amount)),
      Math.min(255, Math.round(this.g * amount)),
      Math.min(255, Math.round(this.b * amount))
    );
  }
}

export const deep = Color.fromHex("#1d1531");
export const strong = Color.fromHex("#d80480");
export const earth = Color.fromHex("#88aaff");
