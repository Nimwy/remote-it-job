/**
 * Render văn bản nhiều dòng: các dòng liên tiếp bắt đầu bằng "-", "•", "*"
 * gộp thành một <ul>, các dòng còn lại thành <p>.
 */
export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: Array<{ type: "ul" | "p"; items: string[] }> = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length) {
      blocks.push({ type: "ul", items: currentList });
      currentList = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (/^[-•*]\s*/.test(line)) {
      currentList.push(line.replace(/^[-•*]\s*/, ""));
    } else {
      flushList();
      blocks.push({ type: "p", items: [line] });
    }
  }
  flushList();

  return (
    <div className="text-body-md text-on-surface-variant">
      {blocks.map((block, bi) =>
        block.type === "ul" ? (
          <ul key={bi} className="mt-2 list-disc space-y-1.5 pl-5">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={bi} className={bi > 0 ? "mt-2" : ""}>
            {block.items[0]}
          </p>
        ),
      )}
    </div>
  );
}
