import { useEffect, useRef, useState } from "react";
import {
  getLocalGoCategories,
  listLocalGoPlaces,
  getLocalGoPlace,
  requireLocalGoMember,
  saveLocalGoPlace,
  setLocalGoVisibility,
  deleteLocalGoPlace,
  type LocalGoCategory,
  type LocalGoPlace,
  type LocalGoDraft,
} from "@/services/localgo";
type View =
  | { kind: "browse" | "mine" }
  | { kind: "detail"; place: LocalGoPlace; managed: boolean }
  | { kind: "editor"; place?: LocalGoPlace };
export default function useLocalGo(enabled: boolean) {
  const [view, setView] = useState<View>({ kind: "browse" });
  const [categories, setCategories] = useState<LocalGoCategory[]>([]),
    [places, setPlaces] = useState<LocalGoPlace[]>([]);
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0),
    lock = useRef(false),
    generation = useRef(0);
  const refresh = () => setRevision((value) => value + 1);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (!enabled) {
      generation.current++;
      setView({ kind: "browse" });
      setSearch("");
      setCategory("");
      setError("");
      setNotice("");
      return;
    }
    const current = ++generation.current;
    return () => {
      if (generation.current === current) generation.current++;
    };
  }, [enabled]);
  useEffect(() => {
    if (!enabled || !["browse", "mine"].includes(view.kind)) return;
    let active = true;
    setLoading(true);
    setError("");
    setPlaces([]);
    void Promise.all([
      getLocalGoCategories(),
      listLocalGoPlaces(query, category, view.kind === "mine"),
    ])
      .then(([cats, result]) => {
        if (active) {
          setCategories(cats);
          setPlaces(result.data);
        }
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Không tải được địa điểm.");
      })
      .then(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled, view.kind, query, category, revision]);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa thể thực hiện thao tác.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const back = () => {
    setError("");
    setView({
      kind:
        view.kind === "editor" || (view.kind === "detail" && view.managed)
          ? "mine"
          : "browse",
    });
  };
  return {
    view,
    categories,
    places,
    search,
    setSearch,
    category,
    setCategory,
    loading,
    busy,
    error,
    notice,
    refresh,
    back,
    mine: () =>
      run(async () => {
        await requireLocalGoMember();
        setSearch("");
        setCategory("");
        setView({ kind: "mine" });
      }),
    create: () =>
      run(async () => {
        await requireLocalGoMember();
        setCategories(await getLocalGoCategories());
        setView({ kind: "editor" });
      }),
    open: (place: LocalGoPlace, managed = false) =>
      run(async () => {
        const current = generation.current;
        const result = await getLocalGoPlace(place.id, managed);
        if (current === generation.current)
          setView({ kind: "detail", place: result, managed });
      }),
    edit: (place: LocalGoPlace) =>
      run(async () => {
        const result = await getLocalGoPlace(place.id, true);
        setView({ kind: "editor", place: result });
      }),
    save: (draft: LocalGoDraft) =>
      run(async () => {
        await saveLocalGoPlace(
          draft,
          view.kind === "editor" ? view.place?.id : undefined,
        );
        setSearch("");
        setCategory("");
        setView({ kind: "mine" });
        refresh();
        setNotice(
          "Đã lưu địa điểm. Địa điểm đang hiển thị được công bố ngay, không cần duyệt.",
        );
      }),
    visibility: (place: LocalGoPlace) =>
      run(async () => {
        await setLocalGoVisibility(place.id, !place.isVisible);
        setView({ kind: "mine" });
        refresh();
        setNotice(
          place.isVisible ? "Đã ẩn địa điểm." : "Đã hiển thị địa điểm.",
        );
      }),
    remove: (place: LocalGoPlace) =>
      run(async () => {
        await deleteLocalGoPlace(place.id);
        setView({ kind: "mine" });
        refresh();
        setNotice("Đã xóa địa điểm khỏi danh sách.");
      }),
  };
}
export type LocalGoController = ReturnType<typeof useLocalGo>;
