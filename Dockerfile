FROM rocker/r-ver:4.4.2

# Install system dependencies for R packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libfontconfig1-dev \
    libfreetype6-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libgit2-dev \
    libcairo2-dev \
    libmagick++-dev \
    libpoppler-cpp-dev \
    pandoc \
    cmake \
    libnlopt-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /artifact

# Copy renv files first (for Docker layer caching)
COPY renv.lock renv.lock
COPY .Rprofile .Rprofile
COPY renv/activate.R renv/activate.R

# Install renv and restore packages
RUN R -e "install.packages('renv', repos='https://cran.rstudio.com')" && \
    R -e "renv::restore()"

# Copy remaining project files
COPY . .

# Default command: run the reproducible analysis
CMD ["Rscript", "02_scripts/02_R/reproducible_analysis.R"]
