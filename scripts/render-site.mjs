import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";

const inputPath = process.argv[2] ?? "content/home.md";
const outputPath = process.argv[3] ?? "index.html";

const source = await readFile(inputPath, "utf8");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inlineMarkdown(value) {
  const pieces = [];
  let cursor = 0;
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(value)) !== null) {
    pieces.push(formatText(value.slice(cursor, match.index)));
    const href = match[2];
    pieces.push(
      `<a href="${escapeHtml(href)}"${href.startsWith("http") ? ' target="_blank" rel="noreferrer"' : ""}>${formatText(match[1])}</a>`,
    );
    cursor = match.index + match[0].length;
  }

  pieces.push(formatText(value.slice(cursor)));
  return pieces.join("");
}

function formatText(value) {
  let html = escapeHtml(value);
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  return html;
}

function parseBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      blocks.push(`<h${level} id="${id}">${inlineMarkdown(text)}</h${level}>`);
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim());
    if (image) {
      flushParagraph();
      flushList();
      blocks.push(
        `<figure><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" loading="eager"></figure>`,
      );
      continue;
    }

    const bullet = /^\s*-\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  return blocks.join("\n");
}

const title = /^#\s+(.+)$/m.exec(source)?.[1] ?? "Robby Cochran";
const body = parseBlocks(source);
const updated = /_Last updated:\s*([^_]+)_/i.exec(source)?.[1]?.trim().replace(/\.$/, "") ?? "";

const document = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Robby Cochran: technical engineering leader working across security systems, Kubernetes, software verification, and AI-agent infrastructure.">
  <title>${escapeHtml(title)}</title>
  <link rel="icon" href="data:,">
  <link rel="stylesheet" href="styles/site.css">
</head>
<body>
  <header class="site-header" aria-label="Site">
    <a class="signal" href="pdf/robby_cochran_resume_latex.pdf">~ SYSTEMS / SECURITY / AGENTS &gt;&gt;</a>
    <div class="masthead">
      <a class="wordmark" href="#top">ROBERT A. COCHRAN III <span aria-hidden="true">█</span></a>
      <div>ROBBYCOCHRAN.COM</div>
      <div>2026</div>
    </div>
    <nav>
      <a href="content/resume.md">resume md</a>
      <a href="pdf/robby_cochran_resume_latex.pdf">resume pdf</a>
      <a href="content/cv.md">cv md</a>
      <a href="pdf/robby_cochran_cv_latex.pdf">cv pdf</a>
      <a href="https://github.com/robbycochran">github</a>
      <a href="https://www.linkedin.com/in/robertacochran">linkedin</a>
    </nav>
  </header>
  <main id="top" class="document">
${body}
  </main>
  <footer>
    <span>Rendered from ${escapeHtml(basename(inputPath))}${updated ? `, updated ${escapeHtml(updated)}` : ""}.</span>
  </footer>
</body>
</html>
`;

await writeFile(outputPath, document);
