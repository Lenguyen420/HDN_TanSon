export function introductionParagraphs(text: string): string[] {
  return text.split(/\r?\n+/).reduce<string[]>((paragraphs, block) => {
    const trimmed = block.trim();
    if (!trimmed) return paragraphs;
    // Nội dung dài chưa có xuống dòng được ngắt tại cuối câu, giữ nguyên lời văn.
    const readable = trimmed.length > 350
      ? trimmed.replace(/([.!?])\s+(?=[A-ZÀ-Ỹ“"])/g, "$1\n").split("\n")
      : [trimmed];
    return paragraphs.concat(readable);
  }, []);
}
