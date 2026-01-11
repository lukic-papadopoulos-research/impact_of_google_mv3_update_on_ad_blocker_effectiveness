# Artifact Appendix

**Paper:** Privacy vs. Profit: The Impact of Google's Manifest Version 3 (MV3) Update on Ad Blocker Effectiveness

**Authors:** Karlo Lukic, Lazaros Papadopoulos

**Badges Applied For:** Available, Functional, Reproduced

## Abstract

This artifact contains the datasets, analysis scripts, and browser extensions used in our study comparing MV2 and MV3 ad blocker effectiveness. The R analysis scripts reproduce all figures and tables presented in the paper from the provided processed datasets.

### Security, Privacy, and Ethical Concerns

This artifact contains browser extensions (ad blockers) that were used for research purposes. The extensions are publicly available versions from official sources. No personal data or credentials are included.

---

## Artifact Available

### Permanent Public Access

The artifact is publicly available at:

| Resource | URL |
|----------|-----|
| **GitHub Repository** | [lukic-papadopoulos-research/impact_of_google_mv3_update_on_ad_blocker_effectiveness](https://github.com/lukic-papadopoulos-research/impact_of_google_mv3_update_on_ad_blocker_effectiveness) |

### License

This artifact is released under the **MIT License** (see [LICENSE](LICENSE)).

### Relevance to Paper

The artifact contains all materials needed to reproduce the analysis presented in the paper:
- Processed datasets from our browser-based experiment
- R scripts that generate all figures and tables
- Browser extensions used in the study
- Data collection scripts (for methodology transparency)

---

## Artifact Functional

### Hardware Dependencies

- Any modern computer capable of running Docker or R 4.4+
- Minimum 8 GB RAM recommended
- ~500 MB disk space for the repository

### Software Dependencies

**Option A: Docker (Recommended)**
- Docker Engine 20.10+ ([install guide](https://docs.docker.com/engine/install/))

**Option B: Native R**
- R 4.4+ ([download](https://cran.r-project.org/))
- renv (R package manager, included in repository)
- gfortran (required for compiling some R packages)

All R package dependencies are pinned in `renv.lock` with exact versions.

### Build and Run Instructions

#### Option A: Docker (Recommended for Reproducibility)

```bash
# Clone the repository
git clone https://github.com/karlolukic/impact-of-google-mv3-on-ad-blocker-effectivenesss.git
cd impact-of-google-mv3-on-ad-blocker-effectivenesss

# Build the Docker image (~20 minutes)
docker build -t mv3-artifact .

# Run the analysis and generate outputs (~5 minutes)
docker run --rm -v $(pwd)/03_results:/artifact/03_results mv3-artifact

# Verify outputs match reference checksums
docker run --rm mv3-artifact Rscript verify_outputs.R
```

#### Option B: Native R

```bash
# Clone the repository
git clone https://github.com/karlolukic/impact-of-google-mv3-on-ad-blocker-effectivenesss.git
cd impact-of-google-mv3-on-ad-blocker-effectivenesss
```

```r
# In R console:
renv::restore()  # Install exact package versions (~10 minutes)
source("02_scripts/02_R/reproducible_analysis.R")  # Run analysis (~5 minutes)
```

### Expected Outputs

After running the analysis:
- `03_results/01_figure.pdf` through `03_results/10_figure.pdf` (10 figures)
- `03_results/01_table.tex` through `03_results/06_table.tex` (6 LaTeX tables)

### Verification

The artifact includes automated verification:

```bash
docker run --rm mv3-artifact Rscript verify_outputs.R
```

This verifies:
- MD5 checksums for all `.tex` files (deterministic text output)
- Existence of all `.pdf` files (binary output may vary slightly across systems)

---

## Artifact Reproduced

### Core Claims and Experiments

The paper's main claims can be reproduced by running a single script. All quantitative results should match **exactly** (within floating-point precision) because the same datasets, code, and package versions are used.

| Paper Element | Claim | Command | Output File | Verification |
|---------------|-------|---------|-------------|--------------|
| Section 4.1 | Sample: 1,000 websites × 9 browser instances = 9,000 observations | `nrow(blocker_effectiveness_df)` | Console | Equals 9,000 |
| Figure 3 | Distribution of blocked ads/trackers by ad blocker | `source("02_scripts/02_R/reproducible_analysis.R")` | `03_results/03_figure.pdf` | Visual comparison with paper |
| Figure 4 | MV2 vs MV3 effectiveness comparison | `source("02_scripts/02_R/reproducible_analysis.R")` | `03_results/04_figure.pdf` | Visual comparison with paper |
| Table 2 | Summary statistics (mean, SD, median) | `source("02_scripts/02_R/reproducible_analysis.R")` | `03_results/02_table.tex` | Values match paper Table 2 |
| Section 4.3 | No statistically significant difference (t-tests, p > 0.05) | `source("02_scripts/02_R/reproducible_analysis.R")` | Console output | p-values and effect sizes match paper |

### Reproducibility Tolerance

- **Quantitative results:** Expected to match exactly (same data + same code + same package versions)
- **Statistical values:** All p-values, effect sizes, means, and standard deviations should be identical to paper values
- **Figures:** Generated PDFs should be visually identical to paper figures
- **Tables:** LaTeX output verified via MD5 checksums against reference values

Results that differ by more than **5%** from paper values indicate a problem with the execution environment.

### Step-by-Step Reproduction

1. **Build environment** (Docker recommended):
   ```bash
   docker build -t mv3-artifact .
   ```

2. **Run complete analysis**:
   ```bash
   docker run --rm -v $(pwd)/03_results:/artifact/03_results mv3-artifact
   ```

3. **Verify outputs**:
   ```bash
   docker run --rm mv3-artifact Rscript verify_outputs.R
   ```
   Expected output: `[SUCCESS] All outputs verified successfully!`

4. **Compare results**:
   - Open generated PDFs in `03_results/` and compare to paper figures
   - Open generated `.tex` files and compare values to paper tables
   - Check console output for statistical test results

### Alternative Formats

The analysis is available in three equivalent formats for flexibility:

| Format | File | Use Case |
|--------|------|----------|
| R Script | `02_scripts/02_R/reproducible_analysis.R` | Batch execution |
| Quarto | `02_scripts/02_R/reproducible_analysis.qmd` | Literate programming |
| Jupyter | `02_scripts/02_R/reproducible_analysis.ipynb` | Interactive exploration |

---

## Artifact Structure

```
├── 01_data/
│   ├── blocker_effectiveness_df.rds    # Main dataset (9,000 observations)
│   ├── runs_stats_df.rds               # Crawling statistics
│   ├── 01_table.xlsx                   # Ad blocker overview data
│   └── extensions/                     # Browser extensions used
├── 02_scripts/
│   ├── 01_py/                          # Python crawler scripts (methodology)
│   └── 02_R/
│       ├── helper_functions.R          # Utility functions
│       ├── reproducible_analysis.R     # Main analysis script
│       ├── reproducible_analysis.qmd   # Quarto version
│       └── reproducible_analysis.ipynb # Jupyter version
├── 03_results/
│   ├── *.pdf                           # Generated figures (10 files)
│   ├── *.tex                           # Generated LaTeX tables (6 files)
│   └── checksums.md5                   # Reference checksums
├── Dockerfile                          # Reproducible build environment
├── renv.lock                           # Pinned R package versions
├── verify_outputs.R                    # Automated verification script
└── ARTIFACT-APPENDIX.md                # This file
```

---

## Limitations and Known Issues

### Data Collection Scripts (02_scripts/01_py/)

The Python crawler scripts document the methodology used for data collection. **These scripts may not reproduce the exact data collection today** because:

1. Chrome browser and extension APIs have been updated since data collection
2. Website content changes over time
3. Ad/tracker presence varies dynamically

The scripts are included for **transparency and methodology documentation**. The core reproducible artifact is the R analysis.

### Reproducible Analysis (02_scripts/02_R/)

The R analysis is **fully reproducible** and generates all paper figures and tables from the provided datasets.
Please make sure the 03_results directory contains 01-figure.pdf and 02_figure.pdf to fully render all graphs.
---

## Notes for Reviewers

- **Primary focus:** Reproducibility of analysis (datasets → figures/tables)
- **Data collection:** Methodology documented but raw data collection not reproducible due to web dynamics
- **All statistical results, figures, and tables can be exactly reproduced**
- **GitHub Actions CI:** Automatically verifies reproducibility on every commit
- **Interactive discussion:** Please open GitHub issues for any questions

---

## Version

- Artifact version: 1.0
- Paper version: PoPETs 2026, Issue 1
- Last updated: November 2025
