FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-lmodern \
    lmodern \
    make \
    nodejs \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-xetex \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /work

ENV HOME=/tmp \
    TEXMFVAR=/tmp/texmf-var \
    TEXMFCONFIG=/tmp/texmf-config \
    XDG_CACHE_HOME=/tmp/.cache

CMD ["make", "site", "cv", "resume"]
