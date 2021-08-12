export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = (err): void => {
      reader.abort();
      reject(err);
    };
    reader.onloadend = (res): void => {
      resolve(res.target?.result as string);
    };
    reader.readAsText(file);
  });
}
