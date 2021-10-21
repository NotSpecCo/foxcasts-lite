export function updateRouteWithSelectedId(id?: string | number): string {
  const urlParams: any = new URLSearchParams(location.search);
  const params = [];
  for (const pair of urlParams.entries()) {
    if (pair[0] !== 'selectedItemId') {
      params.push(`${pair[0]}=${pair[1]}`);
    }
  }

  if (id) {
    params.push(`selectedItemId=${id}`);
  }

  return `${location.pathname}?${params.join('&')}`;
}
