// Services loader — reads from public.services + related child tables.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { listPackagesWithFeatures } from "./packages";
import {
  PRICE_UNAVAILABLE,
  type Jurisdiction,
  type RequiredDocument,
  type Service,
  type ServiceKnowledgeContext,
} from "./types";

const SERVICE_COLS =
  "id,name,slug,category,category_id,short_desc,long_desc,description,hero_image_url,public_url,currency,price_from,price_unit,turnaround_days_min,turnaround_days_max,requires_jurisdiction,status,sort_order,meta,is_active";

export async function listServices(client?: KnowledgeClient): Promise<Service[]> {
  const c = resolveClient(client);
  return safeQuery<Service[]>(
    "services.list",
    () =>
      c
        .from("services")
        .select(SERVICE_COLS)
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
    [],
  );
}

export async function listServicesByCategory(
  categorySlug: string,
  client?: KnowledgeClient,
): Promise<Service[]> {
  const c = resolveClient(client);
  const cat = await safeQuery<{ id: string } | null>(
    "services.byCategory.cat",
    () => c.from("service_categories").select("id").eq("slug", categorySlug).maybeSingle(),
    null,
  );
  if (!cat?.id) return [];
  return safeQuery<Service[]>(
    "services.byCategory",
    () =>
      c
        .from("services")
        .select(SERVICE_COLS)
        .eq("status", "published")
        .eq("category_id", cat.id)
        .order("sort_order", { ascending: true }),
    [],
  );
}

export async function getServiceBySlug(
  slug: string,
  client?: KnowledgeClient,
): Promise<Service | null> {
  const c = resolveClient(client);
  return safeQuery<Service | null>(
    "services.bySlug",
    () => c.from("services").select(SERVICE_COLS).eq("slug", slug).maybeSingle(),
    null,
  );
}

export async function getServiceByName(
  name: string,
  client?: KnowledgeClient,
): Promise<Service | null> {
  const c = resolveClient(client);
  return safeQuery<Service | null>(
    "services.byName",
    () => c.from("services").select(SERVICE_COLS).eq("name", name).maybeSingle(),
    null,
  );
}

export async function listJurisdictions(
  serviceId: string,
  client?: KnowledgeClient,
): Promise<Jurisdiction[]> {
  const c = resolveClient(client);
  return safeQuery<Jurisdiction[]>(
    "services.jurisdictions",
    () =>
      c
        .from("jurisdictions")
        .select("*")
        .eq("service_id", serviceId)
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
    [],
  );
}

export async function listRequiredDocuments(
  serviceId: string,
  client?: KnowledgeClient,
): Promise<RequiredDocument[]> {
  const c = resolveClient(client);
  return safeQuery<RequiredDocument[]>(
    "services.docs",
    () =>
      c
        .from("required_documents")
        .select("*")
        .eq("service_id", serviceId)
        .eq("status", "published")
        .order("sort_order", { ascending: true }),
    [],
  );
}

export function formatServicePrice(service: Service | null): string {
  if (!service) return PRICE_UNAVAILABLE;
  if (service.price_from == null) return PRICE_UNAVAILABLE;
  const sym = service.currency === "USD" ? "$" : service.currency === "GBP" ? "£" : "";
  const unit = service.price_unit ? ` ${service.price_unit}` : "";
  return `${sym}${service.price_from}${unit}`;
}

export async function getServiceWithPackages(
  serviceSlug: string,
  client?: KnowledgeClient,
) {
  const service = await getServiceBySlug(serviceSlug, client);
  if (!service) return { service: null, packages: [] };
  const packages = await listPackagesWithFeatures(service.id, client);
  return { service, packages };
}

export async function getServiceKnowledgeContext(
  serviceSlug: string,
  client?: KnowledgeClient,
): Promise<ServiceKnowledgeContext> {
  const service = await getServiceBySlug(serviceSlug, client);
  if (!service) {
    return {
      service: null,
      packages: [],
      jurisdictions: [],
      required_documents: [],
      display_price: PRICE_UNAVAILABLE,
    };
  }
  const [packages, jurisdictions, required_documents] = await Promise.all([
    listPackagesWithFeatures(service.id, client),
    listJurisdictions(service.id, client),
    listRequiredDocuments(service.id, client),
  ]);
  return {
    service,
    packages,
    jurisdictions,
    required_documents,
    display_price: formatServicePrice(service),
  };
}
