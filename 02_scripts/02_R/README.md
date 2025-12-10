# R Analysis Scripts

This directory contains the R scripts that reproduce all figures and tables in the paper.

## Files

| File | Description |
|------|-------------|
| `helper_functions.R` | Utility functions for data processing |
| `reproducible_analysis.R` | Main analysis script (generates all outputs) |
| `reproducible_analysis.qmd` | Quarto version (narrative + code + output) |
| `reproducible_analysis.ipynb` | Jupyter notebook version (interactive) |

## Quick Start

### Option 1: R Script (Fastest)

```r
# From repository root, in R console:
renv::restore()  # First time only - install dependencies
source("02_scripts/02_R/reproducible_analysis.R")
```

### Option 2: Quarto Document

Requires [Quarto](https://quarto.org/docs/get-started/) to be installed.

```bash
# From 02_scripts/02_R/ directory:
cd 02_scripts/02_R
quarto render reproducible_analysis.qmd --to html
# Output: reproducible_analysis.html
```

### Option 3: Jupyter Notebook

Requires [IRkernel](https://irkernel.github.io/installation/) (R kernel for Jupyter).

```bash
# From 02_scripts/02_R/ directory:
cd 02_scripts/02_R
jupyter notebook reproducible_analysis.ipynb
```

**Note:** The R script runs from the repository root, while Quarto/Jupyter run from `02_scripts/02_R/`. All paths are configured accordingly.

### Verifying Installation

To verify the environment is set up correctly:

```r
# From repository root
R --vanilla -e 'source("02_scripts/02_R/reproducible_analysis.R")'
```

This should complete without errors and generate all figures/tables in `03_results/`.

## Analysis Sections

The `reproducible_analysis.R` script is organized into numbered sections corresponding to paper elements:

| Section | Paper Element | Output |
|---------|---------------|--------|
| Default settings | - | Theme configuration for ggplot2 and flextable |
| Load data | - | Loads `blocker_effectiveness_df.rds` |
| Figure 1 | Manifest.json illustration | `03_results/01_figure.pdf` |
| Table 1 | Ad blocker overview | `03_results/01_table.tex` |
| Crawling descriptives | Section 3 | Console output (timing stats) |
| Figure 2 | Browser experiment illustration | `03_results/02_figure.pdf` |
| Figure 3 | Box plots (ads/trackers distribution) | `03_results/03_figure.pdf` |
| Summary statistics | Section 4 | Console output + tables |
| Figure 4 | MV2 vs MV3 comparisons | `03_results/04_figure.pdf` |
| Figures 5-10 | Individual ad blocker analyses | `03_results/05-10_figure.pdf` |
| Statistical tests | Section 4.3 | t-tests, effect sizes (console + tables) |

## Dependencies

All dependencies are managed via `renv`. Key packages:

- **Data manipulation:** `data.table`, `tidyverse`, `dplyr`
- **Visualization:** `ggplot2`, `cowplot`, `ggpubr`
- **Statistical tests:** `rstatix`, `emmeans`, `irr`
- **Table generation:** `kableExtra`, `flextable`, `officer`
- **PDF/image:** `pdftools`, `magick`

Install all dependencies:

```r
renv::restore()
```

## Helper Functions (`helper_functions.R`)

| Function | Purpose |
|----------|---------|
| `get_domain()` | Extract domain from URL |
| `process_trackers_file()` | Process HTTP request data, identify trackers via WhoTracks.me |
| `process_trackers_file_firefox()` | Firefox-specific variant |
| `identify_outliers()` | IQR-based outlier detection |

## Expected Runtime

- Full script: 2-5 minutes (depending on hardware)
- Quarto render: 3-7 minutes (includes knitting)
- Jupyter: Interactive (runs cell by cell)

## Outputs

All outputs are written to `03_results/`:
- `01_figure.pdf` through `10_figure.pdf` - Publication figures
- `01_table.tex` through `06_table.tex` - LaTeX tables

## Troubleshooting

### "Times" font not found
The script uses Times font. If unavailable:
```r
# Install extrafont and import fonts
install.packages("extrafont")
extrafont::font_import()
extrafont::loadfonts()
```

Or modify the theme in the script to use a different font.

### Package installation fails
```r
# Try reinstalling renv first
install.packages("renv")
renv::restore()
```

### ImageMagick not found (for magick package)
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install libmagick++-dev
```
