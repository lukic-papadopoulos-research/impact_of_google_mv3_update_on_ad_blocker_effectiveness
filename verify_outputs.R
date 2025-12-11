#!/usr/bin/env Rscript
# Verification script for PoPETs artifact
# - Checksums .tex files (text, deterministic)
# - Checks .pdf files exist (binary may differ across systems)

library(tools)

cat("=== PoPETs Artifact Verification ===\n\n")

# Expected output files (skip 03_table.tex - platform-specific Excel merged cell handling)
tex_files <- paste0("03_results/0", setdiff(1:6, 3), "_table.tex")
pdf_files <- c(
  paste0("03_results/0", 1:9, "_figure.pdf"),
  "03_results/10_figure.pdf"
)

results <- list()

# 1. Verify LaTeX files with checksums
cat("Checking LaTeX tables (MD5 checksums):\n")

checksums_file <- "03_results/checksums.md5"
if (!file.exists(checksums_file)) {
  stop("Reference checksums not found: ", checksums_file,
       "\nRun: Rscript generate_checksums.R")
}

ref_checksums <- read.table(checksums_file,
  col.names = c("checksum", "file"), stringsAsFactors = FALSE)

for (f in tex_files) {
  if (!file.exists(f)) {
    cat(sprintf("  [MISSING] %s\n", f))
    results[[f]] <- "MISSING"
  } else {
    expected <- ref_checksums$checksum[ref_checksums$file == f]
    actual <- unname(md5sum(f))
    if (length(expected) == 0 || actual != expected) {
      cat(sprintf("  [DIFFERS] %s\n", f))
      results[[f]] <- "DIFFERS"
    } else {
      cat(sprintf("  [OK] %s\n", f))
      results[[f]] <- "PASS"
    }
  }
}

# 2. Check PDF files exist (don't checksum - binary varies)
cat("\nChecking PDF figures (existence only):\n")
for (f in pdf_files) {
  if (!file.exists(f)) {
    cat(sprintf("  [MISSING] %s\n", f))
    results[[f]] <- "MISSING"
  } else {
    cat(sprintf("  [OK] %s\n", f))
    results[[f]] <- "PASS"
  }
}

# Summary
n_pass <- sum(unlist(results) == "PASS")
n_total <- length(results)
cat(sprintf("\nSummary: %d/%d files verified\n", n_pass, n_total))

if (all(unlist(results) == "PASS")) {
  cat("\n[SUCCESS] All outputs verified successfully!\n")
  quit(status = 0)
} else {
  cat("\n[FAILED] Some outputs missing or differ from reference\n")
  quit(status = 1)
}
