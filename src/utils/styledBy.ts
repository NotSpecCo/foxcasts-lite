export const styledBy: any = (property: string, mapping: any) => (props: any) =>
  mapping[props[property]];
