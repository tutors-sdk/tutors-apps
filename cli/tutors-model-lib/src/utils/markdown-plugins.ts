import type MarkdownIt from "markdown-it";

const VIDEO_TOKEN = "::video[";
const VIDEO_CLOSE = "]::";
const ATTR_REGEX = /(\w+)=["']([^"']+)["']/g;
const MIME_MAP: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
};

type InlineState = {
  src: string;
  pos: number;
  push: (type: string, tag: string, nesting: number) => MarkdownToken;
};

type MarkdownToken = {
  content: string;
  markup: string;
  attrIndex: (name: string) => number;
  attrs: [string, string][];
  attrPush?: (attr: [string, string]) => void;
};

type Renderer = {
  renderToken: (tokens: MarkdownToken[], idx: number, options: Record<string, unknown>) => string;
};

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(ATTR_REGEX)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function resolveMime(src: string, requested?: string): string {
  if (requested) return requested;
  const ext = src.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? MIME_MAP.mp4;
}

function renderVideo(attrs: Record<string, string>): string {
  const src = attrs.src ?? "";
  const type = resolveMime(src, attrs.type);
  const poster = attrs.poster ? ` poster="${attrs.poster}"` : "";
  return `<div class="relative mx-auto w-full mb-4 border rounded-lg overflow-hidden" style="aspect-ratio: 16/9; ">
    <video controls class="absolute inset-0 h-full w-full"${poster}>
      <source src="${src}" type="${type}">
      Your browser does not support the video tag.
    </video>
  </div>`;
}

// Custom video player plugin
export function videoPlayer(md: MarkdownIt) {
  md.inline.ruler.before("text", "custom_video", (state: InlineState, _silent: boolean) => {
    if (!state.src.startsWith(VIDEO_TOKEN, state.pos)) return false;
    const closeIdx = state.src.indexOf(VIDEO_CLOSE, state.pos + VIDEO_TOKEN.length);
    if (closeIdx === -1) return false;

    const token = state.push("custom_video", "", 0);
    token.content = state.src.slice(state.pos + VIDEO_TOKEN.length, closeIdx);
    token.markup = "::video";
    state.pos = closeIdx + VIDEO_CLOSE.length;
    return true;
  });

  md.renderer.rules.custom_video = (tokens: MarkdownToken[], idx: number) => {
    const attrs = parseAttributes(tokens[idx].content);
    return renderVideo(attrs);
  };
}


export function quote_open() : string {
  return '<div class="custom-blockquote" style="border-left: 3px solid #ccc; padding-left: 10px; font-style: italic;">';
};

export function quote_close() : string {
  return "</div>";
};

export function link_open(tokens: MarkdownToken[], idx: number, options: Record<string, unknown>, _env: unknown, self: Renderer) {
  // If you are sure other plugins can't add `target` - drop check below
  const aIndex = tokens[idx].attrIndex("target");
  if (aIndex < 0) {
    if (tokens[idx]?.attrs.length > 0 && tokens[idx].attrs[0][1] === "header-anchor") {
      // do not set target in anchor tags
    } else {
      if (!tokens[idx].attrs[0][1].startsWith("/lab")) {
        // as long as link it external to this lab, open in a new page
        tokens[idx].attrPush?.(["target", "_blank"]); // add new attribute
      }
    }
  } else {
    tokens[idx].attrs[aIndex][1] = "_blank"; // replace value of existing attr
  }
  // pass token to default renderer.
  return self.renderToken(tokens, idx, options);
};
