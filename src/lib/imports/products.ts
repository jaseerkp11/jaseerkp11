export const csvImportColumns = [
  "sku",
  "name",
  "description",
  "cost",
  "price",
  "stock",
  "category",
  "supplier",
  "imageUrl",
] as const;

export type ImportRow = Record<(typeof csvImportColumns)[number], string>;

export type ImportPreview = {
  valid: ImportRow[];
  invalid: Array<{ row: number; errors: string[]; data: Partial<ImportRow> }>;
};

export function previewProductImport(rows: Partial<ImportRow>[]): ImportPreview {
  const valid: ImportRow[] = [];
  const invalid: ImportPreview["invalid"] = [];
  rows.forEach((row, index) => {
    const errors: string[] = [];
    if (!row.sku) errors.push("sku required");
    if (!row.name) errors.push("name required");
    if (row.price && Number.isNaN(Number(row.price))) errors.push("price must be numeric");
    if (row.cost && Number.isNaN(Number(row.cost))) errors.push("cost must be numeric");
    if (errors.length) invalid.push({ row: index + 1, errors, data: row });
    else valid.push(row as ImportRow);
  });
  return { valid, invalid };
}
