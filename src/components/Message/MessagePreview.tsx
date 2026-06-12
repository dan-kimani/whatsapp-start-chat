import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useIsDark } from "../../hooks/useIsDark";

interface Props {
  text: string;
}

interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  mono?: boolean;
}

// Parse a single line into segments with inline formatting
function parseLine(line: string): Segment[] {
  const segments: Segment[] = [];
  const patterns = [
    { regex: /\*(.+?)\*/g, prop: "bold" as const },
    { regex: /_(.+?)_/g, prop: "italic" as const },
    { regex: /~(.+?)~/g, prop: "strike" as const },
    { regex: /`(.+?)`/g, prop: "mono" as const },
  ];

  // Collect all matches with positions
  interface Match {
    start: number;
    end: number;
    text: string;
    prop: "bold" | "italic" | "strike" | "mono";
  }
  const matches: Match[] = [];

  for (const p of patterns) {
    let m;
    while ((m = p.regex.exec(line)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        text: m[1],
        prop: p.prop,
      });
    }
  }

  // Sort by start position
  matches.sort((a, b) => a.start - b.start);

  // Build segments from non-overlapping matches
  let pos = 0;
  for (const m of matches) {
    if (m.start < pos) continue; // skip overlapping
    if (m.start > pos) {
      segments.push({ text: line.slice(pos, m.start) });
    }
    segments.push({ text: m.text, [m.prop]: true });
    pos = m.end;
  }
  if (pos < line.length) {
    segments.push({ text: line.slice(pos) });
  }

  return segments.length > 0 ? segments : [{ text: line }];
}

export default function MessagePreview({ text }: Props) {
  const [expanded, setExpanded] = useState(true);
  const isDark = useIsDark();
  const baseColor = isDark ? "#e2e8f0" : "#334155";
  const dimColor = isDark ? "#64748b" : "#94a3b8";

  if (!text.trim()) return null;

  const lines = text.split("\n");

  return (
    <View className="mb-3 rounded-xl bg-emerald-50 px-4 py-2 dark:bg-emerald-900/20">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between py-3 active:opacity-60"
        hitSlop={8}
      >
        <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          Preview
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-emerald-600 dark:text-emerald-500">
            {expanded ? "Hide" : "Show"}
          </Text>
          {expanded ? (
            <ChevronUp size={14} color="#059669" />
          ) : (
            <ChevronDown size={14} color="#059669" />
          )}
        </View>
      </Pressable>
      {expanded && (
        <View className="pb-2">
          {lines.map((rawLine, _i) => {
            // Detect line-level formatting
            let prefix: string | null = null;
            let line = rawLine;
            let prefixStyle: object = {};

            if (rawLine.startsWith("* ")) {
              prefix = "  •  ";
              line = rawLine.slice(2);
            } else if (/^\d+\.\s/.test(rawLine)) {
              const num = rawLine.match(/^(\d+)\.\s/)![1];
              prefix = `  ${num}.  `;
              line = rawLine.slice(num.length + 2);
            } else if (rawLine.startsWith("> ")) {
              prefix = "│ ";
              line = rawLine.slice(2);
              prefixStyle = { color: dimColor };
            }

            const segments = parseLine(line);

            return (
              <Text key={`line-${rawLine}`} className="mb-0.5 text-sm leading-6">
                {prefix && <Text style={[{ color: dimColor }, prefixStyle]}>{prefix}</Text>}
                {segments.map((seg, _j) => {
                  const style: any = { color: baseColor };
                  if (seg.bold) style.fontWeight = "700";
                  if (seg.italic) style.fontStyle = "italic";
                  if (seg.strike) style.textDecorationLine = "line-through";
                  if (seg.mono) {
                    style.fontFamily = "monospace";
                    style.fontSize = 12;
                    style.backgroundColor = isDark ? "#334155" : "#e2e8f0";
                  }
                  return (
                    <Text
                      key={`seg-${seg.text}-${seg.bold}-${seg.italic}-${seg.strike}-${seg.mono}`}
                      style={style}
                    >
                      {seg.text}
                    </Text>
                  );
                })}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}
