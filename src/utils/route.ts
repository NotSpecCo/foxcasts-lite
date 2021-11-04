export function updateRouteWithSelectedId(id?: string | number): string {
  const urlParams: any = new URLSearchParams(location.search);
  const params = [];

  for (let [key, value] of urlParams.entries()) {
    if (key.startsWith('?')) {
      key = key.slice(1);
    }

    if (key !== 'selectedItemId') {
      params.push(`${key}=${value}`);
    }
  }

  if (id) {
    params.push(`selectedItemId=${id}`);
  }

  return `${location.pathname}?${params.join('&')}`;
}
