import { readFile, writeFile } from "node:fs/promises";

const inputPath = process.argv[2] ?? "content/cv.md";
const outputPath = process.argv[3] ?? "cv/robby_cochran_cv.tex";

const source = await readFile(inputPath, "utf8");

function escapeTex(value) {
  return value
    .replaceAll("\\", "\\textbackslash{}")
    .replaceAll("&", "\\&")
    .replaceAll("%", "\\%")
    .replaceAll("$", "\\$")
    .replaceAll("#", "\\#")
    .replaceAll("_", "\\_")
    .replaceAll("{", "\\{")
    .replaceAll("}", "\\}")
    .replaceAll("~", "\\textasciitilde{}")
    .replaceAll("^", "\\textasciicircum{}");
}

function inlineTex(value) {
  const pieces = [];
  let cursor = 0;
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = linkPattern.exec(value)) !== null) {
    pieces.push(formatText(value.slice(cursor, match.index)));
    pieces.push(`\\href{${escapeTex(match[2])}}{${formatText(match[1])}}`);
    cursor = match.index + match[0].length;
  }

  pieces.push(formatText(value.slice(cursor)));
  return pieces.join("");
}

function formatText(value) {
  return escapeTex(value)
    .replace(/\*\*([^*]+)\*\*/g, "\\textbf{$1}")
    .replace(/\*([^*]+)\*/g, "\\emph{$1}")
    .replace(/\\_([^_]+)\\_/g, "\\emph{$1}");
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const out = [];
  let paragraph = [];
  let inList = false;

  function flushParagraph() {
    if (paragraph.length) {
      out.push(`${inlineTex(paragraph.join(" "))}\n`);
      paragraph = [];
    }
  }

  function closeList() {
    if (inList) {
      out.push("\\end{itemize}\n");
      inList = false;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      const text = inlineTex(heading[2].trim());
      if (level === 1) out.push(`\\cvtitle{${text}}\n`);
      if (level === 2) out.push(`\\section*{${text}}\n`);
      if (level === 3) out.push(`\\subsection*{${text}}\n`);
      continue;
    }

    const bullet = /^\s*-\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      if (!inList) {
        out.push("\\begin{itemize}\n");
        inList = true;
      }
      out.push(`  \\item ${inlineTex(bullet[1])}\n`);
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  return out.join("\n");
}

const body = parseMarkdown(source);
const tex = `% Generated from ${inputPath}. Edit the Markdown source, then run make cv-tex.
\\documentclass[10pt,letterpaper]{article}
\\usepackage[letterpaper,margin=0.72in]{geometry}
\\usepackage{fontspec}
\\setmainfont{Latin Modern Roman}
\\usepackage{microtype}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}
\\setlist[itemize]{leftmargin=1.2em,itemsep=2pt,topsep=2pt,parsep=0pt}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0pt}{}[\\titlerule]
\\titleformat{\\subsection}{\\normalsize\\bfseries}{}{0pt}{}
\\titlespacing*{\\section}{0pt}{15pt}{5pt}
\\titlespacing*{\\subsection}{0pt}{9pt}{1pt}
\\newcommand{\\cvtitle}[1]{{\\Huge\\bfseries #1}\\vspace{3pt}}

\\begin{document}
${body}
\\end{document}
`;

await writeFile(outputPath, tex);
