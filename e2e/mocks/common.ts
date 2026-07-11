export async function importModule<T>(modulePath: string): Promise<T> {
  return await import(modulePath);
}
