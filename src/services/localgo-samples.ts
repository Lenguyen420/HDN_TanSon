import { buildLocalGoSamples } from "@/datas/localgo-samples";
import { getAppData } from "./association";

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

export async function listLocalGoSamples(search: string) {
  const { members } = await getAppData({ resources: ["members"] });
  const query = normalize(search.trim());
  return buildLocalGoSamples(members).filter((place) =>
    normalize(place.name + " " + place.address + " " + place.description).includes(query),
  );
}
