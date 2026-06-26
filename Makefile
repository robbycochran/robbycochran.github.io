SITE_MD=content/home.md
CV_MD=content/cv.md
SITE_HTML=index.html
CV_TEX=cv/robby_cochran_cv.tex
CV_PDF=pdf/robby_cochran_cv_latex.pdf
RESUME_TEX=cv/robby_cochran_resume.tex
RESUME_PDF=pdf/robby_cochran_resume_latex.pdf
DOCKER_IMAGE=robbycochran-site
DOCKER_RUN=docker run --rm -v $(CURDIR):/work -w /work -u $(shell id -u):$(shell id -g) $(DOCKER_IMAGE)

.PHONY: all site cv-tex cv resume docker-image docker-site docker-cv docker-resume docker-all docker-shell clean distclean serve

all: site

site: $(SITE_HTML)

$(SITE_HTML): $(SITE_MD) content/cv.md content/resume.md scripts/render-site.mjs styles/site.css images/robby-film.jpg
	node scripts/render-site.mjs $(SITE_MD) $(SITE_HTML)

cv-tex: $(CV_TEX)

$(CV_TEX): $(CV_MD) scripts/render-cv-tex.mjs
	node scripts/render-cv-tex.mjs $(CV_MD) $(CV_TEX)

cv: $(CV_PDF)

$(CV_PDF): $(CV_TEX)
	xelatex -interaction=nonstopmode -halt-on-error -output-directory=pdf -jobname=robby_cochran_cv_latex $(CV_TEX)

resume: $(RESUME_PDF)

$(RESUME_PDF): $(RESUME_TEX)
	xelatex -interaction=nonstopmode -halt-on-error -output-directory=pdf -jobname=robby_cochran_resume_latex $(RESUME_TEX)

docker-image:
	docker build -t $(DOCKER_IMAGE) .

docker-site: docker-image
	$(DOCKER_RUN) make site

docker-cv: docker-image
	$(DOCKER_RUN) make cv

docker-resume: docker-image
	$(DOCKER_RUN) make resume

docker-all: docker-image
	$(DOCKER_RUN) make site cv resume

docker-shell: docker-image
	docker run --rm -it -v $(CURDIR):/work -w /work -u $(shell id -u):$(shell id -g) $(DOCKER_IMAGE) bash

serve: site
	python3 -m http.server 8080

clean:
	rm -f pdf/*.aux pdf/*.log pdf/*.out pdf/*.fls pdf/*.fdb_latexmk pdf/*.synctex.gz

distclean: clean
	rm -f index.html
