// Packages loader — service_packages + package_features.
import { resolveClient, safeQuery, type KnowledgeClient } from "./client";
import { getServiceBySlug } from "./services";
import {
  PRICE_UNAVAILABLE,
  type PackageFeature,
  type PackageWithFeatures,
  type ServicePackage,
} from "./types";

export async function listPackagesForService(
  serviceSlug: string,
  client?: KnowledgeClient,
): Promise<ServicePackage[]> {
  const c = resolveClient(client);
  const service = await getServiceBySlug(serviceSlug, c);
  if (!service) return [];
  return safeQuery<ServicePackage[]>(
    "packages.byService",
    () =>
      c
        .from("service_packages")
        .select("*")
        .eq("service_id", service.id)
        .order("sort_order", { ascending: true }),
    [],
  );
}

export async function listPackagesWithFeatures(
  serviceId: string,
  client?: KnowledgeClient,
): Promise<PackageWithFeatures[]> {
  const c = resolveClient(client);
  const packages = await safeQuery<ServicePackage[]>(
    "packages.list",
    () =>
      c
        .from("service_packages")
        .select("*")
        .eq("service_id", serviceId)
        .order("sort_order", { ascending: true }),
    [],
  );
  if (!packages.length) return [];
  const ids = packages.map((p) => p.id);
  const features = await safeQuery<PackageFeature[]>(
    "packages.features",
    () =>
      c
        .from("package_features")
        .select("*")
        .in("package_id", ids)
        .order("sort_order", { ascending: true }),
    [],
  );
  return packages.map((p) => ({
    ...p,
    features: features.filter((f) => f.package_id === p.id),
  }));
}

export async function getPackageWithFeatures(
  packageId: string,
  client?: KnowledgeClient,
): Promise<PackageWithFeatures | null> {
  const c = resolveClient(client);
  const pkg = await safeQuery<ServicePackage | null>(
    "package.get",
    () => c.from("service_packages").select("*").eq("id", packageId).maybeSingle(),
    null,
  );
  if (!pkg) return null;
  const features = await safeQuery<PackageFeature[]>(
    "package.features",
    () =>
      c
        .from("package_features")
        .select("*")
        .eq("package_id", packageId)
        .order("sort_order", { ascending: true }),
    [],
  );
  return { ...pkg, features };
}

export interface PackageComparisonRow {
  tier: string;
  display_price: string;
  currency: string;
  is_popular: boolean;
  processing_days: string | null;
  features: string[];
}

/** Side-by-side comparable summary for a service's packages. */
export async function buildPackageComparison(
  serviceSlug: string,
  client?: KnowledgeClient,
): Promise<PackageComparisonRow[]> {
  const c = resolveClient(client);
  const service = await getServiceBySlug(serviceSlug, c);
  if (!service) return [];
  const packages = await listPackagesWithFeatures(service.id, c);
  return packages.map((p) => {
    const sym = p.currency === "USD" ? "$" : p.currency === "GBP" ? "£" : "";
    const display_price = p.price == null ? PRICE_UNAVAILABLE : `${sym}${p.price}`;
    return {
      tier: p.tier,
      display_price,
      currency: p.currency,
      is_popular: p.is_popular,
      processing_days: p.processing_days,
      features: p.features.filter((f) => f.included).map((f) => f.label),
    };
  });
}
