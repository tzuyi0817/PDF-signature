export async function importModule<T>(modulePath: string): Promise<T> {
  const module = await import(modulePath);

  return module.default;
}
