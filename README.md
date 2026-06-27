# robbycochran.com

Minimal static site and CV sources.

The website is generated from `content/home.md`:

```bash
make site
```

The one-page resume content is kept as Markdown and PDF:

```text
content/resume.md
pdf/robby_cochran_resume_latex.pdf
```

The full LaTeX CV source is generated from `content/cv.md`:

```bash
make cv-tex
```

To compile it:

```bash
make cv
```

The one-page LaTeX resume source from the starter package lives at `cv/robby_cochran_resume.tex`:

```bash
make resume
```

`make cv` and `make resume` require `xelatex`. Current PDF artifacts from the starter package are checked in under `pdf/`.

## Docker LaTeX workflow

On macOS, Docker is the easiest way to avoid installing TeX Live locally:

```bash
make docker-all
```

Start Docker Desktop, OrbStack, or another Docker daemon first. The `docker` CLI alone is not enough if the background daemon is stopped.

That builds a local image with Node, Make, and XeLaTeX, then regenerates:

- `index.html`
- `cv/robby_cochran_cv.tex`
- `pdf/robby_cochran_cv_latex.pdf`
- `pdf/robby_cochran_resume_latex.pdf`

Useful narrower targets:

```bash
make docker-site
make docker-cv
make docker-resume
make docker-shell
```

The container writes files as your macOS user, so generated artifacts should not become root-owned.

## Hosting migration

The current live site resolves to an old DigitalOcean droplet. This repo is ready to serve as a static site from GitHub Pages or another static host.

For GitHub Pages:

1. Push the static-site branch to `robbycochran/robbycochran.com`.
2. Merge it to the default branch after review.
3. Enable Pages from the repository root on the default branch.
4. Configure the custom domain as `robbycochran.com`.
5. Update DNS only after the GitHub Pages deployment is green and the domain check passes.

Keep the droplet running until both `https://robbycochran.com` and `https://www.robbycochran.com` serve the new static site with valid certificates.

For local preview:

```bash
make serve
```

Then open `http://localhost:8080`.
