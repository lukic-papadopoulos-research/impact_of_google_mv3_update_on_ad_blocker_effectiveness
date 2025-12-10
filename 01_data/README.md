# Data Directory

This directory contains the processed datasets and browser extensions used in the study.

## Datasets (RDS Files)

| File | Description | Rows | Used In |
|------|-------------|------|---------|
| `blocker_effectiveness_df.rds` | **Main dataset** - Ad/tracker blocking metrics per website and browser instance | 9,000 | All main analyses |
| `blocker_effectiveness_unavg_df.rds` | Unaggregated version (individual run data) | ~45,000 | Robustness checks |
| `blocker_effectiveness_firefox_df.rds` | Firefox browser comparison data | - | Firefox comparison |
| `blocker_effectiveness_firefox_html_trackers_unavg_df.rds` | Firefox HTML tracker data (unaggregated) | - | Firefox analysis |
| `blocker_effectiveness_early_mv3_unavg_df.rds` | Early MV3 transition data | - | Temporal analysis |
| `blocker_effectiveness_strat_tranco_rank_df.rds` | Stratified by Tranco website rank | - | Robustness checks |
| `blocker_effectiveness_strat_employee_df.rds` | Stratified by company employee count | - | Robustness checks |
| `ads_trackers_dt.rds` | Raw ads and trackers data table | - | Data processing |
| `ads_validation_df.rds` | Validation dataset for ad detection | - | Validation |
| `runs_stats_df.rds` | Crawling run statistics (timing, etc.) | 50 | Section 3 (Methods) |
| `top_1000_websites_tranco.rds` | Tranco Top 1000 website list | 1,000 | Sample description |

## Main Dataset Schema (`blocker_effectiveness_df.rds`)

| Variable | Type | Description |
|----------|------|-------------|
| `cleaned_domain` | character | Website domain (e.g., "google.com") |
| `instance_blocker` | factor | Ad blocker name with version (e.g., "Adblock Plus MV2") |
| `instance_group_blocker` | factor | Manifest version group: "MV2", "MV3", or "MV3+" |
| `avg_blocked_ads` | numeric | Average number of blocked ads (across 5 runs) |
| `avg_blocked_trackers` | numeric | Average number of blocked trackers (across 5 runs) |
| `ad_blocker_name` | character | Ad blocker name without version |

## Other Input Files

| File | Description |
|------|-------------|
| `01_table.xlsx` | Ad blocker overview (Table 1 in paper) |
| `02_table.xlsx` | Additional table data |
| `03_table.xlsx` | Validation data |
| `top_1000_websites_tranco.csv` | Original CSV from Tranco list |

## Browser Extensions

The `extensions/` directory contains the exact versions of ad blockers used in the experiment:

### Ad Blockers (MV2 vs MV3 pairs)

| Ad Blocker | MV2 Version | MV3 Version |
|------------|-------------|-------------|
| Adblock Plus | `adblock_plus_free_ad_blocker_3.25.1_MV2` | `adblock_plus_free_ad_blocker_4.5.1_MV3` |
| AdGuard | `adguard_adblocker_MV2` | `adguard_adblocker_mv3_beta_MV3` |
| Stands | `stands_adblocker_MV2` | `fair_adblocker_mv3_beta_MV3` |
| uBlock Origin | `ublock_origin_MV2` | `ublock_origin_lite_MV3` |

### Helper Extensions

| Extension | Purpose |
|-----------|---------|
| `http-recorder` | Records HTTP requests for analysis |
| `super_agent` / `super_agent_mv3` | Cookie consent automation |
| `azerion` | Additional helper functionality |

## Loading Data in R

```r
# Load main dataset
library(readr)
blocker_effectiveness_df <- read_rds("01_data/blocker_effectiveness_df.rds")

# View structure
str(blocker_effectiveness_df)
head(blocker_effectiveness_df)

# Basic stats
nrow(blocker_effectiveness_df)  # 9,000 rows
length(unique(blocker_effectiveness_df$cleaned_domain))  # 1,000 websites
length(unique(blocker_effectiveness_df$instance_blocker))  # 9 browser configs
```
