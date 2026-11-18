import type { Member } from "./types";
import { localGoMap } from "./map";
import type { LocalGoCategory, LocalGoPlace } from "@/services/localgo";

export const localGoSampleCategory: LocalGoCategory = {
  code: "doanh-nghiep",
  name: "Doanh nghiệp",
};

export function buildLocalGoSamples(members: Pick<Member, "id" | "company">[]): LocalGoPlace[] {
  const companies = new Map<string, { id: string; name: string }>();
  for (const member of members) {
    const name = member.company.trim().replace(/\s+/g, " ").normalize("NFC");
    const key = name.toLocaleLowerCase("vi");
    if (name && !companies.has(key)) companies.set(key, { id: member.id, name });
  }

  const [lng, lat] = localGoMap.center;
  return [...companies.values()].map(({ id, name }, index) => {
    // Arrange the sample pins around the default map center.
    const angle = (2 * Math.PI * index) / companies.size;
    return {
      id: "sample-" + id,
      name,
      category: localGoSampleCategory.code,
      description: "Địa điểm mẫu dựa trên danh bạ hội viên.",
      address: "Vị trí minh họa tại Tân Sơn",
      location: {
        type: "Point",
        coordinates: [lng + 0.003 * Math.cos(angle), lat + 0.003 * Math.sin(angle)],
      },
      coverImage: "",
      memberId: null,
      createdBy: "",
      status: "published",
      isVisible: true,
      publishedAt: "",
      deletedAt: null,
      isSample: true,
    };
  });
}
