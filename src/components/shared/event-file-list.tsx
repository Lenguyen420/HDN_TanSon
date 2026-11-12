import { useState } from "react";
import type { EventFile } from "@/datas/types";
import AppIcon from "@/components/icons";
export default function EventFileList({ files, onOpen, emptyText }: { files: EventFile[]; onOpen: (url: string) => Promise<void>; emptyText: string }) {
  const [error, setError] = useState("");
  const [opening, setOpening] = useState("");
  return <>{error && <p className="form-status" role="alert">{error}</p>}{files.length ? <div className="event-file-list">{files.map((file) => <button className="event-file-card" key={file.id} type="button" disabled={!!opening} onClick={async () => { setError(""); setOpening(file.id); try { await onOpen(file.url); } catch (error) { setError(error instanceof Error ? error.message : "Không mở được file. Vui lòng thử lại."); } finally { setOpening(""); } }}><span className="event-file-icon"><AppIcon name="document" /></span><span><strong>{file.title}</strong><small>{opening === file.id ? "Đang mở…" : "Mở tài liệu"}</small></span><AppIcon name="arrow" /></button>)}</div> : <div className="event-workspace-empty"><AppIcon name="document" /><p>{emptyText}</p></div>}</>;
}
