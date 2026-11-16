import { apiRequest, resolveApiImage, type ApiList } from "./api";
export interface PartnerContribution {
  id: string;
  title: string;
  type: "money" | "in_kind";
  paymentMethod: "cash" | "bank_transfer" | null;
  amount: number | null;
  itemName: string;
  quantity: number | null;
  estimatedValue: number | null;
  contributionDate: string;
  description: string;
  eventId: string | null;
  images: string[];
}
export interface Partner {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  address: string;
  website: string;
  updatedAt: string;
  totalAmount: number;
  contributionCount: number;
  selectedContribution?: PartnerContribution | null;
  contributions?: PartnerContribution[];
}
export interface PartnerSummary {
  totalPartners: number;
  totalAmount: number;
  contributionCount: number;
  inKindCount: number;
  estimatedValue: number;
}
const mapPartner = (p: Partner): Partner => ({
  ...p,
  logo: resolveApiImage(p.logo) || "",
  selectedContribution: p.selectedContribution
    ? {
        ...p.selectedContribution,
        images: p.selectedContribution.images.map(
          (i) => resolveApiImage(i) || "",
        ),
      }
    : null,
  contributions: p.contributions?.map((c) => ({
    ...c,
    images: c.images.map((i) => resolveApiImage(i) || ""),
  })),
});
export async function getPartners(search: string, sort: string, page: number) {
  const result = await apiRequest<
    ApiList<Partner> & { summary: PartnerSummary }
  >(
    `public/partners?${new URLSearchParams({ search, sort, page: String(page), limit: "20" })}`,
    { cache: "no-store" },
  );
  return { ...result, data: result.data.map(mapPartner) };
}
export async function getPartner(
  id: string,
  page: number,
  contributionId?: string,
) {
  const result = await apiRequest<{
    data: Partner;
    pagination: ApiList<Partner>["pagination"];
  }>(
    `public/partners/${encodeURIComponent(id)}?page=${page}&limit=20${contributionId ? "&contributionId=" + encodeURIComponent(contributionId) : ""}`,
    { cache: "no-store" },
  );
  return { ...result, data: mapPartner(result.data) };
}
