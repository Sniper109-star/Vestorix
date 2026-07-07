import type { DataProvider } from "react-admin";

async function collect(resource: string): Promise<any[]> {
  const res = await fetch(`/api/admin/${resource}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${resource}`);
  const json = await res.json();
  return json[resource] ?? [];
}

export const adminDataProvider: DataProvider = {
  getList: async (resource) => {
    const data = await collect(resource);
    return { data, total: data.length };
  },
  getOne: async (resource, params) => {
    const data = await collect(resource);
    const found = data.find((r: any) => String(r.id) === String(params.id));
    if (!found) throw new Error("Not found");
    return { data: found };
  },
  getMany: async (resource, params) => {
    const data = await collect(resource);
    const ids = params.ids.map(String);
    return { data: data.filter((r: any) => ids.includes(String(r.id))) };
  },
  getManyReference: async (resource) => {
    const data = await collect(resource);
    return { data, total: data.length };
  },
  create: async () => {
    throw new Error("Create not supported");
  },
  update: async () => {
    throw new Error("Update not supported");
  },
  updateMany: async () => {
    throw new Error("Update not supported");
  },
  delete: async () => {
    throw new Error("Delete not supported");
  },
  deleteMany: async () => {
    throw new Error("Delete not supported");
  },
};
