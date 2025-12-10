#!/usr/bin/env Rscript
# Generate reference checksums for .tex files only
# (PDFs may vary across systems due to fonts/timestamps)

library(tools)

tex_files <- list.files("03_results", pattern = "\\.tex$", full.names = TRUE)
checksums <- sapply(tex_files, md5sum, USE.NAMES = FALSE)

output <- data.frame(checksum = checksums, file = tex_files)
write.table(output, "03_results/checksums.md5",
            row.names = FALSE, col.names = FALSE, quote = FALSE)

cat("Generated checksums for", length(tex_files), ".tex files\n")
cat("Saved to: 03_results/checksums.md5\n")
