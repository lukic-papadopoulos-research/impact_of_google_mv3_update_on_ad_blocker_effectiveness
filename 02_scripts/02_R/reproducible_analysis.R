library(data.table)
library(tidyverse)
library(cowplot)
library(extrafont)
library(flextable)
library(ggpubr)
library(officer)
library(readxl)
library(emmeans)
library(grid)
library(gridExtra)
library(knitr)
library(irr)
library(kableExtra)
library(rstatix)

source("./02_scripts/02_R/helper_functions.R")


# Default settings ----

# ggplot settings
theme_set(theme_classic(base_family = "Times", base_size = 30))
theme_custom <- function() {
  theme_classic(base_family = "Times", base_size = 30)
}

figure_annotation_size_latex <- 9
figure_label_a_b_size_latex <- 30
figure_caption_size_latex <- 28

# ggplot settings for individual ad blocker figures
theme_for_individual_ad_blockers <- theme(
  axis.text.x = element_text(size = 9),
  axis.text.y = element_text(size = 8),
  axis.title.y = element_text(size = 10),
  axis.title.x = element_text(size = 10),
  legend.title = element_text(size = 9),
  legend.text = element_text(size = 8)
)
annotation_size_for_individual_ad_blockers <- 2.5
bolded_label_sizes <- 10

# flextable settings
set_flextable_defaults(font.family = "Times", font.size = 12)
thick_border <- fp_border(color = "black", width = 2, style = "solid")
std_border <- fp_border(color = "black", width = 1, style = "solid")
gray_border <- fp_border(color = "gray", width = 1, style = "solid")


# Load data ------

blocker_effectiveness_df <- read_rds("./01_data/blocker_effectiveness_df.rds")
blocker_effectiveness_df

# Define desired order
custom_blocker_order <- c(
  "Adblock Plus MV2",
  "Adblock Plus MV3",
  "AdGuard MV2",
  "AdGuard MV3",
  "Stands MV2",
  "Stands MV3",
  "uBlock MV2",
  "uBlock MV3",
  "MV3+"
)

# Apply the order
blocker_effectiveness_df <- blocker_effectiveness_df |>
  mutate(
    instance_blocker = factor(instance_blocker, levels = custom_blocker_order)
  )

# Clean raw data: create clear ad blocker names and manifest version labels.
blocker_effectiveness_df <- blocker_effectiveness_df |>
  mutate(
    ad_blocker_name = sub(" MV[23]\\+?$", "", instance_blocker)
  )
blocker_effectiveness_df

# Print basic stats of sample
n_sites <- uniqueN(blocker_effectiveness_df$cleaned_domain)
print(n_sites)
n_instances <- uniqueN(blocker_effectiveness_df$instance_blocker)
print(n_instances)
n_sites * n_instances
nrow(blocker_effectiveness_df) == n_sites * n_instances


# Figure 1:  Illustration of The Manifest (manifest.json) File for an Extension ------

if (file.exists("./03_results/01_figure.pdf")) {
  pdftools::pdf_render_page("./03_results/01_figure.pdf", dpi = 300) |>
    magick::image_read() |>
    plot()
}

# Table 1:  Overview of MV3 and MV2 Ad Blockers Used in the Browser-Based Experiment ------

# render table
read_excel("./01_data/01_table.xlsx") |>
  slice(1:6) |>
  kable("simple", booktabs = T) |>
  collapse_rows(columns = 1, latex_hline = "major") |>
  row_spec(2, hline_after = T) |>
  row_spec(4, hline_after = T) |>
  row_spec(6, hline_after = T) |>
  kable_styling(latex_options = c("hold_position", "scale_down"))

# export table for LaTeX
read_excel("./01_data/01_table.xlsx") |>
  slice(1:6) |>
  kable("latex", booktabs = T) |>
  collapse_rows(columns = 1, latex_hline = "major") |>
  row_spec(2, hline_after = T) |>
  row_spec(4, hline_after = T) |>
  row_spec(6, hline_after = T) |>
  kable_styling(latex_options = c("hold_position", "scale_down")) |>
  save_kable("./03_results/01_table.tex")

# Descriptives on Crawling Process -----

results <- read_rds("./01_data/runs_stats_df.rds")

# Overall averages
avg_visit_sec <- mean(results$avg_visit_secs)
avg_visit_min <- avg_visit_sec / 60

avg_run_sec <- mean(results$total_run_secs)
avg_run_hours <- avg_run_sec / 3600

total_experiment_sec <- sum(results$total_run_secs)
total_experiment_h <- floor(total_experiment_sec / 3600) / 2
total_experiment_m <- round((total_experiment_sec / 60) %% 60) / 2

# Print a summary
cat(glue::glue(
  "
→ Average time per website crawl: {round(avg_visit_min, 2)} minutes
→ Average time per run (5 runs): {round(avg_run_hours, 2)} hours
→ Total experiment duration (5 runs): {total_experiment_h} hours {total_experiment_m} minutes
"
))

# Figure 2: Illustration of the Browser Experiment and Data Collection Process ------

if (file.exists("./03_results/02_figure.pdf")) {
  pdftools::pdf_render_page("./03_results/02_figure.pdf", dpi = 300) |>
    magick::image_read() |>
    plot()
}

# Figure 3: Distribution of the Number of Blocked Ads (Panel A) and Trackers (Panel B) per Website and Browser Instance ------

# Box plot for avg_blocked_ads per instance_blocker with fill by manifest version.
box_plot_ads <- ggplot(
  blocker_effectiveness_df,
  aes(x = instance_blocker, y = avg_blocked_ads, fill = instance_group_blocker)
) +
  geom_boxplot(color = 'black', outlier.shape = 16) +
  xlab('Ad Blocker') +
  ylab('Number of Blocked Ads') +
  coord_cartesian(ylim = c(NA, 15)) +
  geom_hline(yintercept = 0, linetype = 2, linewidth = 1.5, colour = "red") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1, size = 20),
    axis.title.y = element_text(size = 30)
  )

# Box plot for avg_blocked_trackers per instance_blocker with fill by manifest version.
box_plot_trackers <- ggplot(
  blocker_effectiveness_df,
  aes(
    x = instance_blocker,
    y = avg_blocked_trackers,
    fill = instance_group_blocker
  )
) +
  geom_boxplot(color = 'black', outlier.shape = 16) +
  xlab('Ad Blocker') +
  ylab('Number of Blocked Trackers') +
  coord_cartesian(ylim = c(NA, 80)) +
  geom_hline(yintercept = 0, linetype = 2, linewidth = 1.5, colour = "red") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme(
    axis.text.x = element_text(angle = 45, hjust = 1, size = 20),
    axis.title.y = element_text(size = 30)
  )

# Combine the two box plots into one figure.
plot_grid(
  box_plot_ads + theme(plot.margin = margin(1, 1, 1, 1.5, "cm")),
  box_plot_trackers + theme(plot.margin = margin(1, 1, 1, 1.5, "cm")),
  ncol = 1,
  labels = c("A", "B"),
  label_size = figure_label_a_b_size_latex,
  hjust = -0.5
)

# Export the combined box plots as a PDF.
ggsave("./03_results/03_figure.pdf", width = 13, height = 17, dpi = 300)

# Summary statistics and outliers for avg_blocked_ads
summary_ads_detailed <- blocker_effectiveness_df |>
  group_by(instance_blocker) |>
  summarise(
    mean = mean(avg_blocked_ads, na.rm = TRUE),
    median = median(avg_blocked_ads, na.rm = TRUE),
    sd = sd(avg_blocked_ads, na.rm = TRUE),
    var = var(avg_blocked_ads, na.rm = TRUE),
    min = min(avg_blocked_ads, na.rm = TRUE),
    max = max(avg_blocked_ads, na.rm = TRUE),
    Q1 = quantile(avg_blocked_ads, 0.25, na.rm = TRUE),
    Q3 = quantile(avg_blocked_ads, 0.75, na.rm = TRUE),
    outliers = list(identify_outliers(avg_blocked_ads))
  )

print(summary_ads_detailed)
print(summary_ads_detailed$outliers)

# Summary statistics for avg_blocked_trackers
summary_trackers_detailed <- blocker_effectiveness_df |>
  group_by(instance_blocker) |>
  summarise(
    mean = mean(avg_blocked_trackers, na.rm = TRUE),
    median = median(avg_blocked_trackers, na.rm = TRUE),
    sd = sd(avg_blocked_trackers, na.rm = TRUE),
    var = var(avg_blocked_trackers, na.rm = TRUE),
    min = min(avg_blocked_trackers, na.rm = TRUE),
    max = max(avg_blocked_trackers, na.rm = TRUE),
    Q1 = quantile(avg_blocked_trackers, 0.25, na.rm = TRUE),
    Q3 = quantile(avg_blocked_trackers, 0.75, na.rm = TRUE),
    outliers = list(identify_outliers(avg_blocked_trackers))
  )
print(summary_trackers_detailed)
print(summary_trackers_detailed$outliers)

# Figure 4: Comparing Ad Blocker Groups: MV3 vs. MV2 ------

# Obtain Mean Score for blocked_ads and blocked_trackers.
df <- blocker_effectiveness_df |>
  filter(instance_group_blocker != "MV3+") |>
  group_by(cleaned_domain, instance_group_blocker) |>
  summarise(across(
    c(avg_blocked_ads, avg_blocked_trackers),
    mean,
    .names = "{.col}_avg"
  ))

# Get data in long format for creating bar plots
df_long <- df |>
  pivot_longer(
    cols = starts_with("avg_blocked"),
    names_to = "metric",
    values_to = "value"
  )

# Split metric into type and version
df_long <- df_long |>
  separate(metric, into = c("type", "version"), sep = "_avg")

# Calculate delta for blocked_ads and blocked_trackers
delta_df <- df |>
  pivot_wider(
    names_from = "instance_group_blocker",
    values_from = c("avg_blocked_ads_avg", "avg_blocked_trackers_avg")
  ) |>
  summarise(
    delta_ads = mean(
      `avg_blocked_ads_avg_MV3` - `avg_blocked_ads_avg_MV2`,
      na.rm = T
    ),
    delta_trackers = mean(
      `avg_blocked_trackers_avg_MV3` - `avg_blocked_trackers_avg_MV2`,
      na.rm = T
    )
  ) |>
  summarise(
    delta_ads = mean(delta_ads, na.rm = TRUE),
    delta_trackers = mean(delta_trackers, na.rm = TRUE)
  ) |>
  # force R to display 2 digits
  mutate(across(everything(), ~ sprintf("%.2f", .)))
delta_df

# Create barplot for `blocked_ads`
p_value <- t.test(
  avg_blocked_ads ~ instance_group_blocker,
  data = blocker_effectiveness_df |> filter(instance_group_blocker != "MV3+")
)$p.value

p_value_data <- tibble(
  group1 = "MV2",
  group2 = "MV3",
  y.position = 8.3, # position of the p-value on the figure
  label = paste0("p = ", sprintf("%.2f", p_value))
)
p_value_data

df_avg <- df_long[df_long$type == "avg_blocked_ads", ] |>
  group_by(instance_group_blocker) |>
  summarise(value = mean(value))

barplot_blocked_ads <- ggbarplot(
  df_long[df_long$type == "avg_blocked_ads", ],
  x = "instance_group_blocker",
  y = "value",
  fill = "instance_group_blocker",
  palette = c("#DAE8FC", "#D5E8D4"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  geom_text(
    data = df_avg,
    aes(
      x = instance_group_blocker,
      y = value,
      label = paste0("mu == ", round(value, 2))
    ),
    vjust = -0.9, # placement of mu for each group
    size = figure_annotation_size_latex,
    color = "black",
    family = "Times",
    parse = TRUE
  ) +
  labs(
    y = "Average Number of Blocked Ads",
    x = "Ad Blocker Group"
  ) +
  theme_custom() +
  theme(legend.position = "none") +
  coord_cartesian(ylim = c(0, 10)) +
  scale_y_continuous(breaks = seq(0, 10, 1)) +
  annotate(
    "text",
    label = paste0(
      "Delta == '",
      sprintf("%.2f", as.numeric(delta_df$delta_ads)),
      "'"
    ),
    x = 1.5,
    y = 9.4,
    size = figure_annotation_size_latex,
    color = "black",
    family = "Times",
    parse = TRUE
  ) +
  stat_pvalue_manual(
    data = p_value_data,
    family = "Times",
    size = figure_annotation_size_latex
  )

# Create barplot for `blocked_trackers`
p_value <- t.test(
  avg_blocked_trackers ~ instance_group_blocker,
  data = blocker_effectiveness_df |> filter(instance_group_blocker != "MV3+")
)$p.value
p_value

p_value_data <- tibble(
  group1 = "MV2",
  group2 = "MV3",
  y.position = 49, # position of the label on the figure
  label = paste0("p = ", sprintf("%.2f", p_value))
)
p_value_data

df_avg <- df_long[df_long$type == "avg_blocked_trackers", ] |>
  group_by(instance_group_blocker) |>
  summarise(value = mean(value))

barplot_blocked_trackers <- ggbarplot(
  df_long[df_long$type == "avg_blocked_trackers", ],
  x = "instance_group_blocker",
  y = "value",
  fill = "instance_group_blocker",
  palette = c("#DAE8FC", "#D5E8D4"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  geom_text(
    data = df_avg,
    aes(
      x = instance_group_blocker,
      y = value,
      label = paste0("mu == ", sprintf("%.2f", value))
    ),
    vjust = -0.7, # placement of mu for each group
    size = figure_annotation_size_latex,
    color = "black",
    family = "Times",
    parse = TRUE
  ) +
  labs(
    y = "Average Number of Blocked Trackers",
    x = "Ad Blocker Group"
  ) +
  theme_custom() +
  theme(legend.position = "none") +
  coord_cartesian(ylim = c(0, 60)) +
  scale_y_continuous(breaks = seq(0, 60, 10)) +
  annotate(
    "text",
    # label = paste0("Δ = ", delta_df$delta_trackers),
    label = paste0("Delta == ", delta_df$delta_trackers),
    parse = T,
    x = 1.47,
    y = 56, # position of delta on the figure
    size = figure_annotation_size_latex,
    color = "black",
    family = "Times"
  ) +
  stat_pvalue_manual(
    data = p_value_data,
    family = "Times",
    size = figure_annotation_size_latex
  )

# Combine plots
plot_grid(
  barplot_blocked_ads + theme(plot.margin = margin(1, 1, 1, 1.5, "cm")),
  barplot_blocked_trackers + theme(plot.margin = margin(1, 1, 1, 1.5, "cm")),
  ncol = 1,
  labels = c("A", "B"),
  label_size = figure_label_a_b_size_latex,
  hjust = -0.5
) +
  theme(
    plot.caption = element_text(
      hjust = 0.1,
      vjust = 1.5,
      size = figure_caption_size_latex,
      family = "Times"
    )
  )

# Export Figure 4
ggsave(
  "./03_results/04_figure.pdf",
  width = 13,
  height = 17,
  font = "Times",
  dpi = 300
)

# Figure 5: Comparing Individual Ad Blockers MV3 vs. MV2  and MV3+ ------

# Set custom order
ad_blocker_order <- c("Adblock Plus", "AdGuard", "Stands", "uBlock")

# Clean raw data: Create clear ad blocker names and manifest version labels.
blocker_effectiveness_df <- blocker_effectiveness_df |>
  mutate(
    ad_blocker_name = sub(" MV[23]\\+?$", "", instance_blocker),
    instance_group_blocker = sub(".*(MV[23]\\+?)$", "\\1", instance_blocker),
    ad_blocker_name = factor(ad_blocker_name, levels = ad_blocker_order)
  )

### FIGURE 1: MV3 vs. MV2 Comparisons

# Set fixed annotation positions for Figure 1
y_diff_ads_fixed <- 4 # Δ for Blocked Ads
y_p_ads_fixed <- y_diff_ads_fixed - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed <- 45 # Δ for Blocked Trackers
y_p_trackers_fixed <- y_diff_trackers_fixed - 5 # p-value for Blocked Trackers

# Restrict data to MV2 and MV3 for Blocked Ads.
data_comp1_ads <- blocker_effectiveness_df |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Restrict data to MV2 and MV3 for Blocked Trackers.
data_comp1_trackers <- blocker_effectiveness_df |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Compute annotation data for Blocked Ads.
ann_data_ads_fig1 <- data_comp1_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      avg_blocked_ads[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      avg_blocked_ads[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig1

# Create bar plot for Blocked Ads (Figure 1).
barplot_ads_fig1 <- ggbarplot(
  data_comp1_ads,
  x = "ad_blocker_name",
  y = "avg_blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_p_ads_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Compute annotation data for Blocked Trackers.
ann_data_trackers_fig1 <- data_comp1_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      avg_blocked_trackers[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      avg_blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig1

# Create bar plot for Blocked Trackers (Figure 1).
barplot_trackers_fig1 <- ggbarplot(
  data_comp1_trackers,
  x = "ad_blocker_name",
  y = "avg_blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Combine Figure 1 panels.
final_fig1 <- ggarrange(
  barplot_ads_fig1,
  barplot_trackers_fig1,
  ncol = 1,
  nrow = 2,
  labels = c("A", "B")
)
final_fig1

### FIGURE 2: MV3 vs MV3+ Comparisons

# Set fixed annotation positions for Figure 2.
y_diff_ads_fixed2 <- 4 # Δ for Blocked Ads
y_p_ads_fixed2 <- y_diff_ads_fixed2 - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed2 <- 45 # Δ for Blocked Trackers
y_p_trackers_fixed2 <- y_diff_trackers_fixed2 - 5 # p-value for Blocked Trackers

# Filter data for MV3 and MV3+.
data_fig2 <- blocker_effectiveness_df |>
  filter(instance_group_blocker %in% c("MV3", "MV3+"))

# For Blocked Ads:
data_MV3_ads <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_ads <- data_fig2 |> filter(instance_group_blocker == "MV3+")

# Get list of ad blocker names from MV3.
ad_blockers <- unique(data_MV3_ads$ad_blocker_name)

# Replicate the MV3+ rows so each ad blocker appears.
data_MV3plus_ads_rep <- data_MV3plus_ads |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_ads)))

# Combine MV3 and replicated MV3+.
data_comp2_ads <- bind_rows(data_MV3_ads, data_MV3plus_ads_rep)

# Compute annotation data for Blocked Ads.
ann_data_ads_fig2 <- data_comp2_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(
      avg_blocked_ads[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    MV3plus_mean = mean(
      avg_blocked_ads[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig2

# Create bar plot for Blocked Ads (Figure 2).
barplot_ads_fig2 <- ggbarplot(
  data_comp2_ads,
  x = "ad_blocker_name",
  y = "avg_blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_p_ads_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# For Blocked Trackers:
data_MV3_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3+")

ad_blockers <- unique(data_MV3_trackers$ad_blocker_name)

data_MV3plus_trackers_rep <- data_MV3plus_trackers |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(
    ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_trackers))
  )

data_comp2_trackers <- bind_rows(data_MV3_trackers, data_MV3plus_trackers_rep)

ann_data_trackers_fig2 <- data_comp2_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(
      avg_blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    MV3plus_mean = mean(
      avg_blocked_trackers[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig2

# Create bar plot for Blocked Trackers (Figure 2).
barplot_trackers_fig2 <- ggbarplot(
  data_comp2_trackers,
  x = "ad_blocker_name",
  y = "avg_blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Combine Figure 2 panels.
final_fig2 <- ggarrange(
  barplot_ads_fig2,
  barplot_trackers_fig2,
  ncol = 1,
  nrow = 2,
  labels = c("A", "B")
)
final_fig2

# Combine 4 plots into a 2×2 grid.
final_fig <- ggarrange(
  barplot_ads_fig1,
  barplot_ads_fig2,
  barplot_trackers_fig1,
  barplot_trackers_fig2,
  ncol = 2,
  nrow = 2,
  labels = c("A", "B", "C", "D"),
  font.label = list(size = bolded_label_sizes, face = "bold", family = "Times")
)

# Create a spacer grob (an empty rectangle) for extra padding.
spacer <- rectGrob(gp = gpar(col = NA))

# Create column headers with a larger font and adjusted vertical justification.
col_header <- arrangeGrob(
  textGrob(
    "MV3 vs. MV2",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  textGrob(
    "MV3+ vs. MV3",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  ncol = 2
)
# Increase the spacer row height to push the headers further from the plots.
col_header_with_spacer <- arrangeGrob(
  spacer,
  col_header,
  ncol = 1,
  heights = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Create row headers with a larger font and adjusted vertical justification.
row_header <- arrangeGrob(
  textGrob(
    "Blocked Ads",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.6
  ),
  textGrob(
    "Blocked Trackers",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.4
  ),
  ncol = 1
)

# Increase the spacer column width to separate the row headers from the plots.
row_header_with_spacer <- arrangeGrob(
  spacer,
  row_header,
  ncol = 2,
  widths = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Annotate the grid with the custom headers.
final_fig_annot <- annotate_figure(
  final_fig,
  top = col_header_with_spacer,
  left = row_header_with_spacer
)
final_fig_annot

ggsave(
  "./03_results/05_figure.pdf",
  final_fig_annot,
  width = 8.5,
  height = 6.2,
  dpi = 300
)

# Table 2: Summary of Robustness Tests ------

# report summary of robustness tests
read_excel("./01_data/02_table.xlsx", sheet = "table", range = "A1:D6") |>
  knitr::kable(
    format = "simple",
    booktabs = TRUE,
    escape = FALSE
  )

# save table to file
read_excel("./01_data/02_table.xlsx", sheet = "table", range = "A1:D6") |>
  knitr::kable(
    format = "latex",
    booktabs = TRUE,
    escape = FALSE
  ) |>
  save_kable("./03_results/02_table.tex")


# Table 3: Literature Review ------

# report literature review
read_excel("./01_data/03_table.xlsx", sheet = "table", range = "A1:F7") |>
  knitr::kable(
    format = "simple",
    booktabs = TRUE,
    escape = FALSE
  )

# save table to file
read_excel("./01_data/03_table.xlsx", sheet = "table", range = "A1:F7") |>
  knitr::kable(
    format = "latex",
    booktabs = TRUE,
    escape = FALSE
  ) |>
  save_kable("./03_results/03_table.tex")

# Table 4: Variance Analysis -----

variance_df <- read_rds("./01_data/blocker_effectiveness_unavg_df.rds")
variance_df

variance_df |>
  distinct(cleaned_domain)

variance_df |>
  distinct(cleaned_domain, run_id, instance_blocker) |>
  count(cleaned_domain, name = "n_obs_per_domain")

variance_df |>
  distinct(cleaned_domain, run_id) |>
  count(cleaned_domain, name = "n_runs_per_domain")

variance_df |>
  group_by(run_id) |>
  summarise(
    mean_blocked_ads = mean(blocked_ads),
    sd_blocked_ads = sd(blocked_ads),
    mean_blocked_trackers = mean(blocked_trackers),
    sd_blocked_trackers = sd(blocked_trackers)
  )

# Compute per-group (website, browser instance) variability for blocked ads
ads_stats <- variance_df |>
  group_by(cleaned_domain, instance_blocker) |>
  summarise(
    mean_ads = mean(blocked_ads),
    sd_ads = sd(blocked_ads),
    cv_ads = ifelse(mean_ads != 0, sd_ads / mean_ads, NA), # coefficient of variation
    range_ads = max(blocked_ads) - min(blocked_ads)
  ) |>
  ungroup()

# Compute per-group variability for blocked trackers
trackers_stats <- variance_df |>
  group_by(cleaned_domain, instance_blocker) |>
  summarise(
    mean_trackers = mean(blocked_trackers),
    sd_trackers = sd(blocked_trackers),
    cv_trackers = ifelse(mean_trackers != 0, sd_trackers / mean_trackers, NA),
    range_trackers = max(blocked_trackers) - min(blocked_trackers)
  ) |>
  ungroup()

# Total number of groups (should be 924 websites * 9 instances = 8,316)
n_groups <- nrow(ads_stats) # or nrow(trackers_stats)

# Summary statistics for Blocked Ads
avg_sd_ads <- mean(ads_stats$sd_ads, na.rm = TRUE)
avg_cv_ads <- mean(ads_stats$cv_ads, na.rm = TRUE)

# Count groups with no deviation (i.e. SD = 0)
no_deviation_ads <- sum(ads_stats$sd_ads == 0)
perc_no_deviation_ads <- no_deviation_ads / n_groups * 100

# Count groups with max-min difference ≤ 1
maxmin_ads <- sum(ads_stats$range_ads <= 1)
perc_maxmin_ads <- maxmin_ads / n_groups * 100

# Summary statistics for Blocked Trackers
avg_sd_trackers <- mean(trackers_stats$sd_trackers, na.rm = TRUE)
avg_cv_trackers <- mean(trackers_stats$cv_trackers, na.rm = TRUE)

# Count groups with no deviation for trackers
no_deviation_trackers <- sum(trackers_stats$sd_trackers == 0)
perc_no_deviation_trackers <- no_deviation_trackers / n_groups * 100

# Count groups with max-min difference ≤ 1 for trackers
maxmin_trackers <- sum(trackers_stats$range_trackers <= 1)
perc_maxmin_trackers <- maxmin_trackers / n_groups * 100

# Helpers for formatting
fmt2 <- function(x) sprintf("%.2f", x) # force two decimals
fmt_pct <- function(count, pct) {
  sprintf("%s (%.2f\\%%)", format(count, big.mark = ","), pct)
}

# Build summary table with two-decimal formatting
summary_table <- data.frame(
  Metric = c(
    "Average SD",
    "Average CV",
    "No deviation",
    "Max-min difference \\(\\leq\\) 1",
    "N"
  ),
  `Blocked Ads` = c(
    fmt2(avg_sd_ads),
    fmt2(avg_cv_ads),
    fmt_pct(no_deviation_ads, perc_no_deviation_ads),
    fmt_pct(maxmin_ads, perc_maxmin_ads),
    format(n_groups, big.mark = ",")
  ),
  `Blocked Trackers` = c(
    fmt2(avg_sd_trackers),
    fmt2(avg_cv_trackers),
    fmt_pct(no_deviation_trackers, perc_no_deviation_trackers),
    fmt_pct(maxmin_trackers, perc_maxmin_trackers),
    format(n_groups, big.mark = ",")
  ),
  check.names = FALSE
)

# Print table to console
kable(
  summary_table,
  format = "simple",
  booktabs = TRUE,
  caption = "Variance analysis for the number of blocked ads and trackers across five runs of browser-based experiment.",
  escape = FALSE
)

# Save table to file
kable(
  summary_table,
  format = "latex",
  booktabs = TRUE,
  caption = "Variance analysis for the number of blocked ads and trackers across five runs of browser-based experiment.",
  escape = FALSE
) |>
  save_kable("./03_results/04_table.tex")


# Calculate IRR and add to LaTeX table manually afterwards

# Pivot wider so each run becomes a column
icc_df_ads <- variance_df |>
  select(cleaned_domain, instance_blocker, run_id, blocked_ads) |>
  pivot_wider(names_from = run_id, values_from = blocked_ads) |>
  select(-cleaned_domain, -instance_blocker) # only numeric columns for ICC

icc_ads <- icc(
  icc_df_ads,
  model = "twoway",
  type = "consistency",
  unit = "single"
)
print(icc_ads)

# Do the same for blocked_trackers
icc_df_trackers <- variance_df |>
  select(cleaned_domain, instance_blocker, run_id, blocked_trackers) |>
  pivot_wider(names_from = run_id, values_from = blocked_trackers) |>
  select(-cleaned_domain, -instance_blocker)

icc_trackers <- icc(
  icc_df_trackers,
  model = "twoway",
  type = "consistency",
  unit = "single"
)
print(icc_trackers)


# RT 1: Effectiveness of MV3 Ad Blockers Across Different Samples -------

## Figure 6: Comparing Individual Ad Blockers MV3 vs. MV2 and MV3+ (Stratified Employee Count) ---------

# Load stratified Tranco data
blocker_effectiveness_strat_emp_dt <- read_rds(
  "./01_data/blocker_effectiveness_strat_employee_df.rds"
)
blocker_effectiveness_strat_emp_dt

# Create clear ad blocker names and manifest version labels
blocker_effectiveness_strat_emp_dt <- blocker_effectiveness_strat_emp_dt |>
  mutate(
    ad_blocker_name = sub(" MV[23]\\+?$", "", instance_blocker)
  )

# Print basic stats of sample
n_sites <- uniqueN(blocker_effectiveness_strat_emp_dt$website)
print(n_sites)
n_instances <- uniqueN(blocker_effectiveness_strat_emp_dt$instance_blocker)
print(n_instances)
n_sites * n_instances
nrow(blocker_effectiveness_strat_emp_dt) == n_sites * n_instances

### FIGURE 1: MV3 vs. MV2 Comparisons

# Set fixed annotation positions for Figure 1
y_diff_ads_fixed <- 4 # Δ for Blocked Ads
y_p_ads_fixed <- y_diff_ads_fixed - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed <- 45 # Δ for Blocked Trackers
y_p_trackers_fixed <- y_diff_trackers_fixed - 5 # p-value for Blocked Trackers

# Restrict data to MV2 and MV3 for Blocked Ads.
data_comp1_ads <- blocker_effectiveness_strat_emp_dt |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Restrict data to MV2 and MV3 for Blocked Trackers.
data_comp1_trackers <- blocker_effectiveness_strat_emp_dt |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Ensure consistent x-axis order
instance_order <- c("Adblock Plus", "AdGuard", "Stands", "uBlock")

data_comp1_ads$ad_blocker_name <- factor(
  data_comp1_ads$ad_blocker_name,
  levels = instance_order
)

data_comp1_trackers$ad_blocker_name <- factor(
  data_comp1_trackers$ad_blocker_name,
  levels = instance_order
)

# Compute annotation data for Blocked Ads.
ann_data_ads_fig1 <- data_comp1_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(blocked_ads[instance_group_blocker == "MV2"], na.rm = TRUE),
    MV3_mean = mean(blocked_ads[instance_group_blocker == "MV3"], na.rm = TRUE),
    p.value = t.test(blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig1

# Create bar plot for Blocked Ads (Figure 1).
barplot_ads_fig1 <- ggbarplot(
  data_comp1_ads,
  x = "ad_blocker_name",
  y = "blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_p_ads_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Compute annotation data for Blocked Trackers.
ann_data_trackers_fig1 <- data_comp1_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      blocked_trackers[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig1

# Create bar plot for Blocked Trackers (Figure 1).
barplot_trackers_fig1 <- ggbarplot(
  data_comp1_trackers,
  x = "ad_blocker_name",
  y = "blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

### FIGURE 2: MV3 vs MV3+ Comparisons

# Set fixed annotation positions for Figure 2.
y_diff_ads_fixed2 <- 4 # Δ for Blocked Ads
y_p_ads_fixed2 <- y_diff_ads_fixed2 - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed2 <- 45 # Δ for Blocked Trackers
y_p_trackers_fixed2 <- y_diff_trackers_fixed2 - 5 # p-value for Blocked Trackers

# Filter data for MV3 and MV3+.
data_fig2 <- blocker_effectiveness_strat_emp_dt |>
  filter(instance_group_blocker %in% c("MV3", "MV3+"))

# For Blocked Ads:
data_MV3_ads <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_ads <- data_fig2 |> filter(instance_group_blocker == "MV3+")

# Get list of ad blocker names from MV3.
ad_blockers <- unique(data_MV3_ads$ad_blocker_name)

# Replicate the MV3+ rows so each ad blocker appears.
data_MV3plus_ads_rep <- data_MV3plus_ads |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_ads)))

# Combine MV3 and replicated MV3+.
data_comp2_ads <- bind_rows(data_MV3_ads, data_MV3plus_ads_rep)

# Compute annotation data for Blocked Ads.
ann_data_ads_fig2 <- data_comp2_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(blocked_ads[instance_group_blocker == "MV3"], na.rm = TRUE),
    MV3plus_mean = mean(
      blocked_ads[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig2

# Ensure consistent x-axis order for Figure 2 (MV3+ vs. MV3)
data_comp2_ads$ad_blocker_name <- factor(
  data_comp2_ads$ad_blocker_name,
  levels = instance_order
)

# Create bar plot for Blocked Ads (Figure 2).
barplot_ads_fig2 <- ggbarplot(
  data_comp2_ads,
  x = "ad_blocker_name",
  y = "blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_p_ads_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# For Blocked Trackers:
data_MV3_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3+")

ad_blockers <- unique(data_MV3_trackers$ad_blocker_name)

data_MV3plus_trackers_rep <- data_MV3plus_trackers |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(
    ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_trackers))
  )

data_comp2_trackers <- bind_rows(data_MV3_trackers, data_MV3plus_trackers_rep)

# Ensure consistent x-axis order for Figure 2 (MV3+ vs. MV3)
data_comp2_trackers$ad_blocker_name <- factor(
  data_comp2_trackers$ad_blocker_name,
  levels = instance_order
)

ann_data_trackers_fig2 <- data_comp2_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    MV3plus_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig2

# Create bar plot for Blocked Trackers (Figure 2).
barplot_trackers_fig2 <- ggbarplot(
  data_comp2_trackers,
  x = "ad_blocker_name",
  y = "blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Combine 4 plots into a 2×2 grid.
final_fig <- ggarrange(
  barplot_ads_fig1,
  barplot_ads_fig2,
  barplot_trackers_fig1,
  barplot_trackers_fig2,
  ncol = 2,
  nrow = 2,
  labels = c("A", "B", "C", "D"),
  font.label = list(size = bolded_label_sizes, face = "bold", family = "Times")
)

# Create a spacer grob (an empty rectangle) for extra padding.
spacer <- rectGrob(gp = gpar(col = NA))

# Create column headers with a larger font and adjusted vertical justification.
col_header <- arrangeGrob(
  textGrob(
    "MV3 vs. MV2",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  textGrob(
    "MV3+ vs. MV3",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  ncol = 2
)
# Increase the spacer row height to push the headers further from the plots.
col_header_with_spacer <- arrangeGrob(
  spacer,
  col_header,
  ncol = 1,
  heights = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Create row headers with a larger font and adjusted vertical justification.
row_header <- arrangeGrob(
  textGrob(
    "Blocked Ads",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.6
  ),
  textGrob(
    "Blocked Trackers",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.4
  ),
  ncol = 1
)
# Increase the spacer column width to separate the row headers from the plots.
row_header_with_spacer <- arrangeGrob(
  spacer,
  row_header,
  ncol = 2,
  widths = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Annotate the grid with the custom headers.
final_fig_annot <- annotate_figure(
  final_fig,
  top = col_header_with_spacer,
  left = row_header_with_spacer
)
final_fig_annot

ggsave(
  "./03_results/06_figure.pdf",
  final_fig_annot,
  width = 8.5,
  height = 6.2,
  dpi = 300
)


## Figure 7: Comparing Individual Ad Blockers MV3 vs. MV2 and MV3+ (Stratified Tranco Popularity Rank) --------

# Load stratified Tranco data
blocker_effectiveness_strat_pop_rank_dt <- read_rds(
  "./01_data/blocker_effectiveness_strat_tranco_rank_df.rds"
)
blocker_effectiveness_strat_pop_rank_dt

# Clean raw data: Create clear ad blocker names and manifest version labels.
blocker_effectiveness_strat_pop_rank_dt <- blocker_effectiveness_strat_pop_rank_dt |>
  mutate(
    ad_blocker_name = sub(" MV[23]\\+?$", "", instance_blocker)
  )

# Stats of sample
n_sites <- uniqueN(blocker_effectiveness_strat_pop_rank_dt$website)
print(n_sites)
n_instances <- uniqueN(blocker_effectiveness_strat_pop_rank_dt$instance_blocker)
print(n_instances)
n_sites * n_instances
nrow(blocker_effectiveness_strat_pop_rank_dt) == n_sites * n_instances


### FIGURE 1: MV3 vs. MV2 Comparisons

# Set fixed annotation positions for Figure 1
y_diff_ads_fixed <- 4 # Δ for Blocked Ads
y_p_ads_fixed <- y_diff_ads_fixed - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed <- 45 # Δ for Blocked Trackers
y_p_trackers_fixed <- y_diff_trackers_fixed - 5 # p-value for Blocked Trackers

# Restrict data to MV2 and MV3 for Blocked Ads.
data_comp1_ads <- blocker_effectiveness_strat_pop_rank_dt |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Restrict data to MV2 and MV3 for Blocked Trackers.
data_comp1_trackers <- blocker_effectiveness_strat_pop_rank_dt |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Ensure consistent x-axis order
instance_order <- c("Adblock Plus", "AdGuard", "Stands", "uBlock")

data_comp1_ads$ad_blocker_name <- factor(
  data_comp1_ads$ad_blocker_name,
  levels = instance_order
)

data_comp1_trackers$ad_blocker_name <- factor(
  data_comp1_trackers$ad_blocker_name,
  levels = instance_order
)

# Compute annotation data for Blocked Ads.
ann_data_ads_fig1 <- data_comp1_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(blocked_ads[instance_group_blocker == "MV2"], na.rm = TRUE),
    MV3_mean = mean(blocked_ads[instance_group_blocker == "MV3"], na.rm = TRUE),
    p.value = t.test(blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig1

# Create bar plot for Blocked Ads (Figure 1).
barplot_ads_fig1 <- ggbarplot(
  data_comp1_ads,
  x = "ad_blocker_name",
  y = "blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_p_ads_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Compute annotation data for Blocked Trackers.
ann_data_trackers_fig1 <- data_comp1_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      blocked_trackers[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig1

# Create bar plot for Blocked Trackers (Figure 1).
barplot_trackers_fig1 <- ggbarplot(
  data_comp1_trackers,
  x = "ad_blocker_name",
  y = "blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers


### FIGURE 2: MV3 vs MV3+ Comparisons

# Set fixed annotation positions for Figure 2.
y_diff_ads_fixed2 <- 4 # Δ for Blocked Ads
y_p_ads_fixed2 <- y_diff_ads_fixed2 - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed2 <- 45 # Δ for Blocked Trackers
y_p_trackers_fixed2 <- y_diff_trackers_fixed2 - 5 # p-value for Blocked Trackers

# Filter data for MV3 and MV3+.
data_fig2 <- blocker_effectiveness_strat_pop_rank_dt |>
  filter(instance_group_blocker %in% c("MV3", "MV3+"))

# For Blocked Ads:
data_MV3_ads <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_ads <- data_fig2 |> filter(instance_group_blocker == "MV3+")

# Get list of ad blocker names from MV3.
ad_blockers <- unique(data_MV3_ads$ad_blocker_name)

# Replicate the MV3+ rows so each ad blocker appears.
data_MV3plus_ads_rep <- data_MV3plus_ads |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_ads)))

# Combine MV3 and replicated MV3+.
data_comp2_ads <- bind_rows(data_MV3_ads, data_MV3plus_ads_rep)

# Ensure consistent x-axis order for Figure 2 (MV3+ vs. MV3)
data_comp2_ads$ad_blocker_name <- factor(
  data_comp2_ads$ad_blocker_name,
  levels = instance_order
)

# Compute annotation data for Blocked Ads.
ann_data_ads_fig2 <- data_comp2_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(blocked_ads[instance_group_blocker == "MV3"], na.rm = TRUE),
    MV3plus_mean = mean(
      blocked_ads[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig2

# Create bar plot for Blocked Ads (Figure 2).
barplot_ads_fig2 <- ggbarplot(
  data_comp2_ads,
  x = "ad_blocker_name",
  y = "blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_p_ads_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# For Blocked Trackers:
data_MV3_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3+")

ad_blockers <- unique(data_MV3_trackers$ad_blocker_name)

data_MV3plus_trackers_rep <- data_MV3plus_trackers |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(
    ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_trackers))
  )

data_comp2_trackers <- bind_rows(data_MV3_trackers, data_MV3plus_trackers_rep)

# Ensure consistent x-axis order for Figure 2 (MV3+ vs. MV3)
data_comp2_trackers$ad_blocker_name <- factor(
  data_comp2_trackers$ad_blocker_name,
  levels = instance_order
)

ann_data_trackers_fig2 <- data_comp2_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    MV3plus_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig2

# Create bar plot for Blocked Trackers (Figure 2).
barplot_trackers_fig2 <- ggbarplot(
  data_comp2_trackers,
  x = "ad_blocker_name",
  y = "blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Combine 4 plots into a 2×2 grid.
final_fig <- ggarrange(
  barplot_ads_fig1,
  barplot_ads_fig2,
  barplot_trackers_fig1,
  barplot_trackers_fig2,
  ncol = 2,
  nrow = 2,
  labels = c("A", "B", "C", "D"),
  font.label = list(size = bolded_label_sizes, face = "bold", family = "Times")
)

# Create a spacer grob (an empty rectangle) for extra padding.
spacer <- rectGrob(gp = gpar(col = NA))

# Create column headers with a larger font and adjusted vertical justification.
col_header <- arrangeGrob(
  textGrob(
    "MV3 vs. MV2",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  textGrob(
    "MV3+ vs. MV3",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  ncol = 2
)
# Increase the spacer row height to push the headers further from the plots.
col_header_with_spacer <- arrangeGrob(
  spacer,
  col_header,
  ncol = 1,
  heights = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Create row headers with a larger font and adjusted vertical justification.
row_header <- arrangeGrob(
  textGrob(
    "Blocked Ads",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.6
  ),
  textGrob(
    "Blocked Trackers",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.4
  ),
  ncol = 1
)

# Increase the spacer column width to separate the row headers from the plots.
row_header_with_spacer <- arrangeGrob(
  spacer,
  row_header,
  ncol = 2,
  widths = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Annotate the grid with the custom headers.
final_fig_annot <- annotate_figure(
  final_fig,
  top = col_header_with_spacer,
  left = row_header_with_spacer
)
final_fig_annot

ggsave(
  "03_results/07_figure.pdf",
  final_fig_annot,
  width = 8.5,
  height = 6.2,
  dpi = 300
)

# RT 2: Alternative Measures for MV3 Ad Blockers Effectiveness -----

## Size of HTML Files (kb) ----

# Read averaged dataset
# One row per website × instance with run-averaged outcomes
df <- read_rds("./01_data/ads_trackers_dt.rds")

# Tidy: keep MV2/MV3 and derive labels
df_tidy <- df |>
  filter(instance_group %in% c("MV2", "MV3")) |>
  mutate(
    version_simple = instance_group, # "MV2" / "MV3"
    ad_blocker = case_when(
      str_detect(instance, "MV[23]") ~ str_remove(instance, "\\s+MV[23].*"),
      TRUE ~ NA_character_
    ) |>
      recode(Fair = "Stands", Stands = "Stands")
  ) |>
  select(
    domain_id,
    cleaned_domain,
    ad_blocker,
    version_simple,
    html_kb = avg_html_file_size_kb
  )
df_tidy |> count(ad_blocker, version_simple)

# Wide per-blocker per-website table
df_wide <- df_tidy |>
  select(ad_blocker, domain_id, cleaned_domain, version_simple, html_kb) |>
  distinct() |> # safety, in case of duplicates
  pivot_wider(
    names_from = version_simple,
    values_from = html_kb
  ) |>
  filter(!is.na(MV2), !is.na(MV3)) |>
  mutate(diff_kb = MV3 - MV2)

# Descriptives per blocker (on run-averaged values)
stats_tbl <- df_wide |>
  summarise(
    n_each = n(),
    mean_MV2 = mean(MV2, na.rm = TRUE),
    sd_MV2 = sd(MV2, na.rm = TRUE),
    mean_MV3 = mean(MV3, na.rm = TRUE),
    sd_MV3 = sd(MV3, na.rm = TRUE),
    mean_diff = mean(diff_kb, na.rm = TRUE),
    sd_diff = sd(diff_kb, na.rm = TRUE),
    .by = ad_blocker
  )

# Un-Paired t-tests (MV2 vs MV3) within each blocker
# Using base t.test on wide data to keep the sign of the difference explicit (MV2 - MV3)
ttests <- df_wide |>
  group_by(ad_blocker) |>
  group_modify(
    ~ {
      tt <- t.test(.x$MV3, .x$MV2, paired = FALSE)
      tibble(
        t_stat = unname(tt$statistic),
        df = unname(tt$parameter),
        p_val = tt$p.value,
        ci_low = tt$conf.int[1],
        ci_high = tt$conf.int[2]
      )
    }
  ) |>
  ungroup()

# Effect size
# Cohen's dz = mean(diff) / sd(diff)
effects <- df_wide |>
  summarise(
    cohend_z = mean(diff_kb, na.rm = TRUE) / sd(diff_kb, na.rm = TRUE),
    .by = ad_blocker
  )

# Combine results
results <- stats_tbl |>
  left_join(ttests, by = "ad_blocker") |>
  left_join(effects, by = "ad_blocker") |>
  rename(
    Condition = ad_blocker,
    `N (websites)` = n_each,
    `mean MV2` = mean_MV2,
    `SD MV2` = sd_MV2,
    `mean MV3` = mean_MV3,
    `SD MV3` = sd_MV3,
    `Δ (MV2−MV3)` = mean_diff,
    `SD Δ` = sd_diff,
    `t-stat` = t_stat,
    `df` = df,
    `p-val` = p_val,
    `95% CI low` = ci_low,
    `95% CI high` = ci_high,
    `Cohen's dz` = cohend_z
  ) |>
  select(
    Condition,
    `N (websites)`,
    `mean MV2`,
    `SD MV2`,
    `mean MV3`,
    `SD MV3`,
    `Δ (MV2−MV3)`,
    `95% CI low`,
    `95% CI high`,
    `t-stat`,
    df,
    `p-val`,
    `Cohen's dz`
  )
setDT(results)

# Formatting + LaTeX table
fmt_p <- function(p) {
  ifelse(is.na(p), NA_character_, ifelse(p < .001, "<.001", sprintf("%.3f", p)))
}

results_print <- results |>
  mutate(
    across(
      c(
        `mean MV2`,
        `SD MV2`,
        `mean MV3`,
        `SD MV3`,
        `Δ (MV2−MV3)`,
        `95% CI low`,
        `95% CI high`,
        `t-stat`,
        `Cohen's dz`
      ),
      ~ sprintf("%.2f", .)
    ),
    `p-val` = fmt_p(`p-val`),
    df = sprintf("%.0f", df)
  )
results_print

# Display in console
kable(
  results_print,
  format = "simple",
  booktabs = TRUE,
  col.names = c(
    "Condition",
    "N (websites)",
    "mean MV2",
    "SD MV2",
    "mean MV3",
    "SD MV3",
    "$\\Delta$ (MV2−MV3)",
    "95\\% CI low",
    "95\\% CI high",
    "t-stat",
    "df",
    "$p$-val",
    "Cohen's $d_z$"
  ),
  escape = FALSE
)

# export to LaTeX file
kable(
  results_print,
  format = "latex",
  booktabs = TRUE,
  col.names = c(
    "Condition",
    "N (websites)",
    "mean MV2",
    "SD MV2",
    "mean MV3",
    "SD MV3",
    "$\\Delta$ (MV2−MV3)",
    "95\\% CI low",
    "95\\% CI high",
    "t-stat",
    "df",
    "$p$-val",
    "Cohen's $d_z$"
  ),
  escape = FALSE,
) |>
  save_kable(file = "./03_results/05_table.tex")


## Change of DV for Anti-Tracking Effectiveness -----

### FIGURE 1: MV3 vs. MV2 Comparisons

y_diff_domains_fixed <- 65 # Δ for Blocked Trackers
y_p_domains_fixed <- y_diff_domains_fixed - 5 # p-value for Blocked Trackers

# Restrict data to MV2 and MV3 for Blocked Trackers.
data_comp1_domains <- blocker_effectiveness_df |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Compute annotation data for Blocked Domains
ann_data_domains_fig1 <- data_comp1_domains |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      avg_blocked_domains[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      avg_blocked_domains[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_domains ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_domains_fig1

# Create bar plot for Blocked Domains (Figure 1).
barplot_domains_fig1 <- ggbarplot(
  data_comp1_domains,
  x = "ad_blocker_name",
  y = "avg_blocked_domains",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Domains", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_domains_fig1,
    aes(x = ad_blocker_name, y = y_p_domains_fixed, label = p_label),
    size = 4,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_domains_fig1,
    aes(x = ad_blocker_name, y = y_diff_domains_fixed, label = label_expr),
    size = 4,
    family = "Times",
    parse = TRUE
  ) +
  theme(axis.text.x = element_text(size = 11))

### FIGURE 2: MV3 vs MV3+ Comparisons

y_diff_domains_fixed2 <- 65 # Δ for Blocked Domains
y_p_domains_fixed2 <- y_diff_domains_fixed2 - 5 # p-value for Blocked Domains

# Filter data for MV3 and MV3+.
data_fig2 <- blocker_effectiveness_df |>
  filter(instance_group_blocker %in% c("MV3", "MV3+"))

# Get list of ad blocker names from MV3.
ad_blockers <- unique(data_fig2$ad_blocker_name)

# For Blocked Domains:
data_MV3_domains <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_domains <- data_fig2 |> filter(instance_group_blocker == "MV3+")

ad_blockers <- unique(data_MV3_domains$ad_blocker_name)

data_MV3plus_domains_rep <- data_MV3plus_domains |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_domains)))

data_comp2_domains <- bind_rows(data_MV3_domains, data_MV3plus_domains_rep)

ann_data_domains_fig2 <- data_comp2_domains |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(
      avg_blocked_domains[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    MV3plus_mean = mean(
      avg_blocked_domains[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_domains ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_domains_fig2

# Create bar plot for Blocked Domains (Figure 2).
barplot_domains_fig2 <- ggbarplot(
  data_comp2_domains,
  x = "ad_blocker_name",
  y = "avg_blocked_domains",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Domains", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_domains_fig2,
    aes(x = ad_blocker_name, y = y_p_domains_fixed2, label = p_label),
    size = 4,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_domains_fig2,
    aes(x = ad_blocker_name, y = y_diff_domains_fixed2, label = label_expr),
    size = 4,
    family = "Times",
    parse = TRUE
  ) +
  theme(axis.text.x = element_text(size = 11))

# Combine 2 plots into a 2×2 grid.
final_fig <- ggarrange(
  barplot_domains_fig1,
  barplot_domains_fig2,
  ncol = 2,
  labels = c("A", "B"),
  hjust = -0.5
)

# Create a spacer grob (an empty rectangle) for extra padding.
spacer <- rectGrob(gp = gpar(col = NA))

# Create column headers with a larger font and adjusted vertical justification.
col_header <- arrangeGrob(
  textGrob(
    "MV3 vs. MV2",
    gp = gpar(fontface = "bold", fontsize = 13, fontfamily = "Times"),
    vjust = 0.6,
    hjust = 0.9
  ),
  textGrob(
    "MV3+ vs. MV3",
    gp = gpar(fontface = "bold", fontsize = 13, fontfamily = "Times"),
    vjust = 0.6,
    hjust = 0.9
  ),
  ncol = 2
)

# Increase the spacer row height to push the headers further from the plots.
col_header_with_spacer <- arrangeGrob(
  spacer,
  col_header,
  ncol = 1,
  heights = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Create row headers with a larger font and adjusted vertical justification.
row_header <- arrangeGrob(
  textGrob(
    "Blocked Domains",
    gp = gpar(fontface = "bold", fontsize = 13, fontfamily = "Times"),
    rot = 90,
    vjust = 0.6,
    hjust = 0.55
  ),
  ncol = 1
)
# Increase the spacer column width to separate the row headers from the plots.
row_header_with_spacer <- arrangeGrob(
  spacer,
  row_header,
  ncol = 2,
  widths = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Annotate the grid with the custom headers.
final_fig_annot <- annotate_figure(
  final_fig,
  top = col_header_with_spacer,
  left = row_header_with_spacer
)
final_fig_annot

ggsave("./03_results/08_figure.pdf", width = 12, height = 5, dpi = 300)

# In-Text: Ground-Truth Validation of Ads -------

ads_validation_dt <- read_rds("./01_data/ads_validation_df.rds")
ads_validation_dt

## In-Text: Report Correlation Coefficient --------------
cor_test <- cor.test(
  ads_validation_dt$n_ads_azerion,
  ads_validation_dt$n_ads_hand_count,
  method = "pearson"
)
print(cor_test)

## In-Text: Report N Website Countries --------------

websites_in_sample <- blocker_effectiveness_df |>
  select(cleaned_domain) |>
  distinct()
websites_in_sample

website_info <- read_rds("./01_data/top_1000_websites_tranco.rds")
website_info

# remove common endings (.com, .net, etc.)
tld_patterns <- c(
  "com",
  "org",
  "net",
  "gov",
  "edu",
  "fr",
  "co\\.uk",
  "be",
  "de",
  "es",
  "it",
  "nl",
  "ca",
  "uk",
  "info",
  "biz",
  "tv",
  "ch",
  "mc",
  "fi",
  "eu",
  "us",
  "co",
  "pl",
  "io"
)

# Create the cleaned_domain column by removing an initial "www" and a trailing TLD.
website_info <- website_info |>
  mutate(cleaned_domain = root_domain) |>
  mutate(cleaned_domain = str_remove(cleaned_domain, "^www")) |>
  mutate(
    cleaned_domain = str_remove(
      cleaned_domain,
      paste0("(", paste(tld_patterns, collapse = "|"), ")$")
    )
  ) |>
  mutate(cleaned_domain = str_remove(cleaned_domain, "\\.$"))

websites_in_sample <- websites_in_sample |>
  left_join(website_info, by = "cleaned_domain")

# report info on website countries
# NOTE: 23 countries in total (+ missing ones)
websites_in_sample |>
  group_by(country) |>
  summarise(n_websites = n(), .groups = "drop") |>
  arrange(desc(n_websites)) |>
  mutate(percentage = n_websites / sum(n_websites) * 100) |>
  select(country, n_websites, percentage) |>
  print(n = Inf)

# group into EU vs. Non-EU
# ISO‑2 EU members (27). Include both GR and EL to be safe for Greece labels.
eu_iso2 <- c(
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "EL"
)

country_lookup <- tibble(
  country = eu_iso2,
  region = "EU"
)

# 3‑category summary (EU / Non‑EU / Unknown)
# NOTE: 24 EU and 631 Non-EU (269 Unknown)
websites_by_region <- websites_in_sample |>
  mutate(country = na_if(country, "")) |> # treat "" as NA
  left_join(country_lookup, by = "country") |>
  mutate(
    region = case_when(
      is.na(country) ~ "Unknown",
      is.na(region) ~ "Non-EU",
      TRUE ~ region
    )
  ) |>
  group_by(region) |>
  summarise(n_websites = n(), .groups = "drop") |>
  mutate(percentage = round(n_websites / sum(n_websites) * 100, 1)) |>
  arrange(desc(n_websites))
websites_by_region |> print(n = Inf)


# In-Text: Tranco Score Range of BuiltWith Websites -------

range(website_info$tranco) # 17 - 17,590


# RT 3: First Version of Each MV3 Ad Blocker ------

# Load robustness test sample
blocker_effectiveness_robustness_df <- read_rds(
  "./01_data/blocker_effectiveness_early_mv3_unavg_df.rds"
)
dim(blocker_effectiveness_robustness_df)
names(blocker_effectiveness_robustness_df)
blocker_effectiveness_robustness_df

# Recode values nicely
blocker_effectiveness_robustness_df <- blocker_effectiveness_robustness_df |>
  mutate(
    instance_blocker = recode(
      instance_blocker,
      "uBlock Origin MV3 Early" = "uBlock MV3",
      "AdGuard MV3 Early" = "AdGuard MV3"
    )
  )

# Standardize order of ad blockers
instance_order <- c(
  'AdGuard MV2',
  'uBlock MV2',
  'AdGuard MV3',
  'uBlock MV3',
  'MV3+'
)

blocker_effectiveness_robustness_df$instance_blocker <- factor(
  blocker_effectiveness_robustness_df$instance_blocker,
  levels = instance_order
)

# Create instance_group_blocker column
blocker_effectiveness_robustness_df <- blocker_effectiveness_robustness_df |>
  mutate(
    ad_blocker_name = sub(" MV[23]\\+?$", "", instance_blocker)
  )

# Stats of sample
n_sites_robustness_df <- uniqueN(
  blocker_effectiveness_robustness_df$cleaned_domain
)
print(n_sites_robustness_df)
n_instances_robustness_df <- uniqueN(
  blocker_effectiveness_robustness_df$instance_blocker
)
print(n_instances_robustness_df)
n_sites_robustness_df * n_instances_robustness_df
nrow(blocker_effectiveness_robustness_df) ==
  n_sites_robustness_df * n_instances_robustness_df


### FIGURE 1: MV3 vs. MV2 Comparisons

# Set fixed annotation positions for Figure 1
y_diff_ads_fixed <- 8 # Δ for Blocked Ads
y_p_ads_fixed <- y_diff_ads_fixed - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed <- 60 # Δ for Blocked Trackers
y_p_trackers_fixed <- y_diff_trackers_fixed - 5 # p-value for Blocked Trackers

# Restrict data to MV2 and MV3 for Blocked Ads.
data_comp1_ads <- blocker_effectiveness_robustness_df |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Define the order
ad_blocker_name_order <- c("AdGuard", "uBlock")

# Reorder the levels
data_comp1_ads$ad_blocker_name <- factor(
  data_comp1_ads$ad_blocker_name,
  levels = ad_blocker_name_order
)

# Restrict data to MV2 and MV3 for Blocked Trackers.
data_comp1_trackers <- blocker_effectiveness_robustness_df |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Compute annotation data for Blocked Ads.
ann_data_ads_fig1 <- data_comp1_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(blocked_ads[instance_group_blocker == "MV2"], na.rm = TRUE),
    MV3_mean = mean(blocked_ads[instance_group_blocker == "MV3"], na.rm = TRUE),
    p.value = t.test(blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig1

# Create bar plot for Blocked Ads (Figure 1).
barplot_ads_fig1 <- ggbarplot(
  data_comp1_ads,
  x = "ad_blocker_name",
  y = "blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_p_ads_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig1,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Compute annotation data for Blocked Trackers.
ann_data_trackers_fig1 <- data_comp1_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      blocked_trackers[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig1

# Define the order
ad_blocker_name_order <- c("AdGuard", "uBlock")

# Reorder the levels
data_comp1_trackers$ad_blocker_name <- factor(
  data_comp1_trackers$ad_blocker_name,
  levels = ad_blocker_name_order
)

# Create bar plot for Blocked Trackers (Figure 1).
barplot_trackers_fig1 <- ggbarplot(
  data_comp1_trackers,
  x = "ad_blocker_name",
  y = "blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

### FIGURE 2: MV3 vs MV3+ Comparisons

# Set fixed annotation positions for Figure 2.
y_diff_ads_fixed2 <- 8 # Δ for Blocked Ads
y_p_ads_fixed2 <- y_diff_ads_fixed2 - 0.5 # p-value for Blocked Ads

y_diff_trackers_fixed2 <- 60 # Δ for Blocked Trackers
y_p_trackers_fixed2 <- y_diff_trackers_fixed2 - 5 # p-value for Blocked Trackers

# Filter data for MV3 and MV3+.
data_fig2 <- blocker_effectiveness_robustness_df |>
  filter(instance_group_blocker %in% c("MV3", "MV3+"))

# For Blocked Ads:
data_MV3_ads <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_ads <- data_fig2 |> filter(instance_group_blocker == "MV3+")

# Get list of ad blocker names from MV3.
ad_blockers <- unique(data_MV3_ads$ad_blocker_name)

# Replicate the MV3+ rows so each ad blocker appears.
data_MV3plus_ads_rep <- data_MV3plus_ads |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_ads)))

# Combine MV3 and replicated MV3+.
data_comp2_ads <- bind_rows(data_MV3_ads, data_MV3plus_ads_rep)

# Define the order
ad_blocker_name_order <- c("AdGuard", "uBlock")

# Reorder the levels in data_comp2_ads
data_comp2_ads$ad_blocker_name <- factor(
  data_comp2_ads$ad_blocker_name,
  levels = ad_blocker_name_order
)

# Compute annotation data for Blocked Ads.
ann_data_ads_fig2 <- data_comp2_ads |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(blocked_ads[instance_group_blocker == "MV3"], na.rm = TRUE),
    MV3plus_mean = mean(
      blocked_ads[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_ads ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_ads_fig2

# Create bar plot for Blocked Ads (Figure 2).
barplot_ads_fig2 <- ggbarplot(
  data_comp2_ads,
  x = "ad_blocker_name",
  y = "blocked_ads",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Ads", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_p_ads_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_ads_fig2,
    aes(x = ad_blocker_name, y = y_diff_ads_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# For Blocked Trackers:
data_MV3_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3")
data_MV3plus_trackers <- data_fig2 |> filter(instance_group_blocker == "MV3+")

ad_blockers <- unique(data_MV3_trackers$ad_blocker_name)

data_MV3plus_trackers_rep <- data_MV3plus_trackers |>
  slice(rep(1:n(), each = length(ad_blockers))) |>
  mutate(
    ad_blocker_name = rep(ad_blockers, times = nrow(data_MV3plus_trackers))
  )

data_comp2_trackers <- bind_rows(data_MV3_trackers, data_MV3plus_trackers_rep)

# Define the order
ad_blocker_name_order <- c("AdGuard", "uBlock")

# Reorder the levels in data_comp2_trackers
data_comp2_trackers$ad_blocker_name <- factor(
  data_comp2_trackers$ad_blocker_name,
  levels = ad_blocker_name_order
)

ann_data_trackers_fig2 <- data_comp2_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV3_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    MV3plus_mean = mean(
      blocked_trackers[instance_group_blocker == "MV3+"],
      na.rm = TRUE
    ),
    p.value = t.test(blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3plus_mean - MV3_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig2

# Create bar plot for Blocked Trackers (Figure 2).
barplot_trackers_fig2 <- ggbarplot(
  data_comp2_trackers,
  x = "ad_blocker_name",
  y = "blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV3" = "#DAE8FC", "MV3+" = "#FFDAB9")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed2, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig2,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed2, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers

# Combine 4 plots into a 2×2 grid.
final_fig <- ggarrange(
  barplot_ads_fig1,
  barplot_ads_fig2,
  barplot_trackers_fig1,
  barplot_trackers_fig2,
  ncol = 2,
  nrow = 2,
  labels = c("A", "B", "C", "D"),
  font.label = list(size = bolded_label_sizes, face = "bold", family = "Times")
)

# Create a spacer grob (an empty rectangle) for extra padding.
spacer <- rectGrob(gp = gpar(col = NA))

# Create column headers with a larger font and adjusted vertical justification.
col_header <- arrangeGrob(
  textGrob(
    "MV3 vs. MV2",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  textGrob(
    "MV3+ vs. MV3",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  ncol = 2
)
# Increase the spacer row height to push the headers further from the plots.
col_header_with_spacer <- arrangeGrob(
  spacer,
  col_header,
  ncol = 1,
  heights = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Create row headers with a larger font and adjusted vertical justification.
row_header <- arrangeGrob(
  textGrob(
    "Blocked Ads",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.6
  ),
  textGrob(
    "Blocked Trackers",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = 0.4
  ),
  ncol = 1
)
# Increase the spacer column width to separate the row headers from the plots.
row_header_with_spacer <- arrangeGrob(
  spacer,
  row_header,
  ncol = 2,
  widths = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Annotate the grid with the custom headers.
final_fig_annot <- annotate_figure(
  final_fig,
  top = col_header_with_spacer,
  left = row_header_with_spacer
)
final_fig_annot

ggsave(
  "./03_results/09_figure.pdf",
  final_fig_annot,
  width = 8.5,
  height = 6.2,
  dpi = 300
)


# RT 4: Firefox MV3 vs. MV2 ------

## Size of HTML Files (kb) -----

## Read per‑run dataset
df_final <- read_rds(
  "./01_data/blocker_effectiveness_firefox_html_trackers_unavg_df.rds"
)

## Tidy + keep only MV2/MV3 uBlock observations
df_tidy <- df_final |>
  mutate(
    version_simple = case_when(
      str_detect(instance, "MV3\\+") ~ "MV3+",
      str_detect(instance, "MV3") ~ "MV3",
      str_detect(instance, "MV2") ~ "MV2",
      str_detect(instance, "Baseline") ~ "Baseline",
      TRUE ~ NA_character_
    ),
    ad_blocker = case_when(
      str_detect(instance, "MV[23]") ~ str_remove(instance, "\\s+MV[23].*"),
      TRUE ~ NA_character_
    )
  ) |>
  # standardize the label if needed; keep as "uBlock" everywhere in this section
  mutate(ad_blocker = recode(ad_blocker, "uBlock Origin" = "uBlock")) |>
  filter(version_simple %in% c("MV2", "MV3"), ad_blocker == "uBlock")

## Average HTML file size across runs per site and per version
## (One averaged observation per website per instance)
df_avg_html <- df_tidy |>
  transmute(
    domain = cleaned_domain, # site ID
    version_simple,
    html_kb = html_file_size_kb
  ) |>
  group_by(domain, version_simple) |>
  summarise(html_mean = mean(html_kb, na.rm = TRUE), .groups = "drop")

## Sanity check Ns (should be 824 per instance if complete)
table_counts <- table(df_avg_html$version_simple)
print(table_counts)

## Compute summary stats on the averaged values
stats <- df_avg_html |>
  group_by(version_simple) |>
  summarise(
    N = n(),
    mean = mean(html_mean, na.rm = TRUE),
    sd = sd(html_mean, na.rm = TRUE),
    .groups = "drop"
  ) |>
  mutate(version_simple = factor(version_simple, levels = c("MV2", "MV3")))

## Welch t-test on the averaged per‑site values
t_res <- t.test(html_mean ~ version_simple, data = df_avg_html)

## Build a one‑row table in your layout
table <- data.frame(
  Condition = "uBlock",
  `N (each)` = stats$N[stats$version_simple == "MV2"], # should be 824
  `mean MV2` = stats$mean[stats$version_simple == "MV2"],
  `SD MV2` = stats$sd[stats$version_simple == "MV2"],
  `mean MV3` = stats$mean[stats$version_simple == "MV3"],
  `SD MV3` = stats$sd[stats$version_simple == "MV3"],
  `t-stat` = as.numeric(t_res$statistic),
  `p-val` = as.numeric(t_res$p.value),
  check.names = FALSE
)

## Render table to console
table |>
  mutate(
    across(
      c(`mean MV2`, `SD MV2`, `mean MV3`, `SD MV3`, `t-stat`),
      ~ sprintf("%.2f", .x)
    ),
    `p-val` = ifelse(`p-val` < 0.001, "< 0.001", sprintf("%.2f", `p-val`))
  ) |>
  knitr::kable(
    format = "simple",
    booktabs = TRUE,
    caption = paste0(
      "HTML file size (kb) comparison for ad‑blocking and anti‑tracking effectiveness ",
      "between uBlock MV3 and MV2 on Firefox. Each instance has N = ",
      format(stats$N[1], big.mark = ","),
      " (",
      format(stats$N[1], big.mark = ","),
      " websites × 1 averaged observation); ",
      format(sum(stats$N), big.mark = ","),
      " total across both instances."
    ),
    col.names = c(
      "Condition",
      "N (each)",
      "mean MV2",
      "SD MV2",
      "mean MV3",
      "SD MV3",
      "t-stat",
      "$p$-val"
    ),
    escape = FALSE
  )

# export LateX table to file
table |>
  mutate(
    across(
      c(`mean MV2`, `SD MV2`, `mean MV3`, `SD MV3`, `t-stat`),
      ~ sprintf("%.2f", .x)
    ),
    `p-val` = ifelse(`p-val` < 0.001, "< 0.001", sprintf("%.2f", `p-val`))
  ) |>
  knitr::kable(
    format = "latex",
    booktabs = TRUE,
    caption = paste0(
      "HTML file size (kb) comparison for ad‑blocking and anti‑tracking effectiveness ",
      "between uBlock MV3 and MV2 on Firefox. Each instance has N = ",
      format(stats$N[1], big.mark = ","),
      " (",
      format(stats$N[1], big.mark = ","),
      " websites × 1 averaged observation); ",
      format(sum(stats$N), big.mark = ","),
      " total across both instances."
    ),
    col.names = c(
      "Condition",
      "N (each)",
      "mean MV2",
      "SD MV2",
      "mean MV3",
      "SD MV3",
      "t-stat",
      "$p$-val"
    ),
    escape = FALSE
  ) |>
  save_kable("./03_results/06_table.tex")


## Trackers on Firefox -----

blocker_effectiveness_robustness_df <- read_rds(
  "./01_data/blocker_effectiveness_firefox_df.rds"
)
blocker_effectiveness_robustness_df

# Clean raw data: Create clear ad blocker names and manifest version labels.
blocker_effectiveness_robustness_df <- blocker_effectiveness_robustness_df |>
  mutate(
    ad_blocker_name = sub(" MV[23]\\+?$", "", instance_blocker)
  )
blocker_effectiveness_robustness_df

# Stats of sample
n_sites_robustness_df <- uniqueN(
  blocker_effectiveness_robustness_df$cleaned_domain
)
print(n_sites_robustness_df)
n_instances_robustness_df <- uniqueN(
  blocker_effectiveness_robustness_df$instance_blocker
)
print(n_instances_robustness_df)
n_sites_robustness_df * n_instances_robustness_df
nrow(blocker_effectiveness_robustness_df) ==
  n_sites_robustness_df * n_instances_robustness_df

# ### FIGURE 1: MV3 vs. MV2 Comparisons

y_diff_trackers_fixed <- 60 # Δ for Blocked Trackers
y_p_trackers_fixed <- y_diff_trackers_fixed - 5 # p-value for Blocked Trackers

# Restrict data to MV2 and MV3 for Blocked Trackers.
data_comp1_trackers <- blocker_effectiveness_robustness_df |>
  filter(instance_group_blocker %in% c("MV2", "MV3"))

# Compute annotation data for Blocked Trackers.
ann_data_trackers_fig1 <- data_comp1_trackers |>
  group_by(ad_blocker_name) |>
  summarise(
    MV2_mean = mean(
      avg_blocked_trackers[instance_group_blocker == "MV2"],
      na.rm = TRUE
    ),
    MV3_mean = mean(
      avg_blocked_trackers[instance_group_blocker == "MV3"],
      na.rm = TRUE
    ),
    p.value = t.test(avg_blocked_trackers ~ instance_group_blocker)$p.value,
    .groups = "drop"
  ) |>
  mutate(
    diff = MV3_mean - MV2_mean,
    p_label = paste0("p = ", sprintf("%.2f", p.value)),
    diff_label = sprintf("%.2f", diff),
    label_expr = paste0("Delta == \"", diff_label, "\"")
  )
ann_data_trackers_fig1

# Create bar plot for Blocked Trackers (Figure 1).
barplot_trackers_fig1 <- ggbarplot(
  data_comp1_trackers,
  x = "ad_blocker_name",
  y = "avg_blocked_trackers",
  fill = "instance_group_blocker",
  palette = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC"),
  add = "mean_se",
  position = position_dodge(0.8)
) +
  labs(y = "Average Number of Blocked Trackers", x = "Ad Blocker") +
  scale_fill_manual(
    name = " Ad \n Blocker \n Group:",
    values = c("MV2" = "#D5E8D4", "MV3" = "#DAE8FC")
  ) +
  theme_pubr(base_family = "Times") +
  theme(legend.position = "right") +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_p_trackers_fixed, label = p_label),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times"
  ) +
  geom_text(
    data = ann_data_trackers_fig1,
    aes(x = ad_blocker_name, y = y_diff_trackers_fixed, label = label_expr),
    size = annotation_size_for_individual_ad_blockers,
    family = "Times",
    parse = TRUE
  ) +
  theme_for_individual_ad_blockers


# Combine 4 plots into a 2×2 grid.
final_fig <- ggarrange(
  # barplot_ads_fig1,
  barplot_trackers_fig1,
  ncol = 1,
  nrow = 2,
  labels = c("", ""),
  font.label = list(size = bolded_label_sizes, face = "bold", family = "Times")
)

# Create a spacer grob (an empty rectangle) for extra padding.
spacer <- rectGrob(gp = gpar(col = NA))

# Create column headers with a larger font and adjusted vertical justification.
col_header <- arrangeGrob(
  textGrob(
    "MV3 vs. MV2",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    vjust = 0.6,
    hjust = 0.9
  ),
  ncol = 1
)

# Increase the spacer row height to push the headers further from the plots.
col_header_with_spacer <- arrangeGrob(
  spacer,
  col_header,
  ncol = 1,
  heights = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Create row headers with a larger font and adjusted vertical justification.
row_header <- arrangeGrob(
  textGrob(
    "Blocked Trackers",
    gp = gpar(
      fontface = "bold",
      fontsize = bolded_label_sizes,
      fontfamily = "Times"
    ),
    rot = 90,
    vjust = 0.6,
    hjust = -0.8
  ),
  ncol = 1
)

# Increase the spacer column width to separate the row headers from the plots.
row_header_with_spacer <- arrangeGrob(
  spacer,
  row_header,
  ncol = 2,
  widths = unit.c(unit(1, "cm"), unit(1, "null"))
)

# Annotate the grid with the custom headers.
final_fig_annot <- annotate_figure(
  final_fig,
  top = col_header_with_spacer,
  left = row_header_with_spacer
)
final_fig_annot

ggsave(
  "./03_results/10_figure.pdf",
  final_fig_annot,
  width = 5,
  height = 6.2,
  dpi = 300
)
