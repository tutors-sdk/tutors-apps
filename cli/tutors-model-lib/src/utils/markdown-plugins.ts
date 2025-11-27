import MarkdownIt from "markdown-it";


// Custom video player plugin
export function videoPlayer (md: MarkdownIt) {
    // Add a rule to parse custom video tags like ::video[src="url" poster="poster.jpg"]::
    md.inline.ruler.before("text", "custom_video", function (state: any, _silent: boolean) {
      const pos = state.pos;
      const max = state.posMax;
      
      // Check for ::video[ pattern
      if (state.src.charCodeAt(pos) !== 0x3A || state.src.charCodeAt(pos + 1) !== 0x3A) {
        return false;
      }
      
      const start = pos + 2;
      if (start + 5 > max || state.src.slice(start, start + 5) !== "video") {
        return false;
      }
      
      const afterVideo = start + 5;
      if (afterVideo >= max || state.src.charCodeAt(afterVideo) !== 0x5B) {
        return false;
      }
      
      // Find the closing ]::
      const endMatch = state.src.indexOf("]::", afterVideo);
      if (endMatch === -1) {
        return false;
      }
      
      const attrsStr = state.src.slice(afterVideo + 1, endMatch);
      const token = state.push("custom_video", "", 0);
      token.content = attrsStr;
      token.markup = "::video";
      
      state.pos = endMatch + 3;
      return true;
    });
    
    // Render the custom video tag
    md.renderer.rules.custom_video = function (tokens: any, idx: number) {
      const attrsStr = tokens[idx].content;
      // Parse attributes like src="url" type="video/mp4"
      const attrs: Record<string, string> = {};
      const attrRegex = /(\w+)="([^"]+)"/g;
      let match;
      while ((match = attrRegex.exec(attrsStr)) !== null) {
        attrs[match[1]] = match[2];
      }
      
      const src = attrs.src || "";
      // Determine video type from extension if not specified
      let videoType = attrs.type || "";
      if (!videoType && src) {
        const ext = src.split('.').pop()?.toLowerCase();
        if (ext === 'mp4') videoType = 'video/mp4';
        else if (ext === 'webm') videoType = 'video/webm';
        else if (ext === 'ogg') videoType = 'video/ogg';
        else videoType = 'video/mp4'; // default
      }
      
      return `<div class="relative mx-auto w-full mb-4 border rounded-lg overflow-hidden" style="aspect-ratio: 16/9; ">
    <video controls class="absolute inset-0 h-full w-full">
      <source src="${src}" type="${videoType}">
      Your browser does not support the video tag.
    </video>
  </div>`;
    };
  }


export function quote_open() : string {
  return '<div class="custom-blockquote" style="border-left: 3px solid #ccc; padding-left: 10px; font-style: italic;">';
};

export function quote_close() : string {
  return "</div>";
};

export function link_open (tokens: any, idx: any, options: any, env: any, self: any) {
  // If you are sure other plugins can't add `target` - drop check below
  const aIndex = tokens[idx].attrIndex("target");
  if (aIndex < 0) {
    if (tokens[idx]?.attrs.length > 0 && tokens[idx].attrs[0][1] === "header-anchor") {
      // do not set target in anchor tags
    } else {
      if (!tokens[idx].attrs[0][1].startsWith("/lab")) {
        // as long as link it external to this lab, open in a new page
        tokens[idx].attrPush(["target", "_blank"]); // add new attribute
      }
    }
  } else {
    tokens[idx].attrs[aIndex][1] = "_blank"; // replace value of existing attr
  }
  // pass token to default renderer.
  return self.renderToken(tokens, idx, options);
};
