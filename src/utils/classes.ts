// Slightly easier ways to manage CSS classes

/**
 * Returns a string of valid classes
 */
export function joinClasses(...classes: (string | undefined)[]): string {
  const validClasses = classes.filter((a) => !!a);
  return validClasses.join(' ');
}

/**
 * Returns a class depending on a condition
 * @param condition
 * @param trueClass - Class to return if condition is true
 * @param falseClass - Class to return if condition is false
 */
export function ifClass(
  condition: boolean | undefined | null,
  trueClass: string,
  falseClass = ''
): string {
  return condition ? trueClass : falseClass;
}
