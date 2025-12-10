require(tidyverse)
require(data.table)
require(urltools)


get_domain <- function(x) {
  url <- gsub("http://|https://|www\\.", "", x)
  url_split <- unlist(strsplit(url, "/"))[1]
  domain_split <- unlist(strsplit(url_split, "\\."))
  paste0(tail(domain_split, 2), collapse = ".")
}

process_trackers_file <- function(
  filepath,
  whotracksme_tracker_domains_filepath = "01_data/06_whotracks.me-data/tracker_domains.csv",
  whotracksme_trackers_filepath = "01_data/06_whotracks.me-data/trackers.csv"
) {
  # Read data set
  dt <- fread(filepath, na.strings = "")

  # Remove unnecessary requests initated by the browser
  dt <- dt[!initiator %like% "chrome-extension://"]

  # Filter Only HTTP Requests
  http_dt <- dt[method %like% "GET|POST"]

  # Drop Rows Where initiator Is NA
  http_dt <- http_dt[is.na(initiator) == FALSE]

  # Add 'initiator_domain' And 'request_domain' Columns
  # http_dt[, initiator_domain := sapply(initiator, get_domain)]
  http_dt[, initiator_domain := as.character(sapply(initiator, get_domain))]
  # http_dt[, request_domain := sapply(url, get_domain)]
  http_dt[, request_domain := as.character(sapply(url, get_domain))]

  # Add trackers using WhoTracks.me lookup table
  tracker_domains_dt <-
    fread(whotracksme_tracker_domains_filepath, select = c("domain", "tracker"))
  trackers_dt <-
    fread(whotracksme_trackers_filepath, select = c("id", "name"))

  # Merge tracker_domains_dt with http_dt
  http_dt <- http_dt %>%
    left_join(tracker_domains_dt, by = c("request_domain" = "domain")) %>%
    left_join(trackers_dt, by = c("tracker" = "id")) %>%
    rename(tracker_name = name)

  # Get Total Number Of Requests
  n_total_requests <- nrow(http_dt)

  # Get Number of First-Party Requests
  n_first_party_requests <- http_dt %>%
    filter(request_domain == initiator_domain) %>%
    nrow(.)

  # Get Number Of Third-Party Requests
  n_third_party_requests <- http_dt %>%
    filter(request_domain != initiator_domain) %>%
    nrow(.)

  # Get Simple Number Of Unique Third-Party Domains (i.e., Trackers)
  n_unique_third_party_domains <- http_dt %>%
    filter(request_domain != initiator_domain) %>%
    distinct(request_domain) %>%
    drop_na(request_domain) %>%
    nrow(.)

  # Get WhoTracks.me Number Of Unique Third-Party Domains (i.e., Trackers)
  n_whotracksme_trackers <- http_dt %>%
    filter(request_domain != initiator_domain) %>%
    distinct(tracker_name) %>%
    drop_na(tracker_name) %>%
    nrow(.)

  # Get visited website
  # visited_website <-
  # unlist(strsplit(basename(filepath), "-2023"))[1]

  # Create A Summary data frame
  summary_dt <- data.table(
    # visited_website,
    n_total_requests,
    n_first_party_requests,
    n_third_party_requests,
    n_unique_third_party_domains,
    n_whotracksme_trackers
  )
  return(summary_dt)
}

process_trackers_file_firefox <- function(
  filepath,
  whotracksme_tracker_domains_filepath = "01_data/06_whotracks.me-data/tracker_domains.csv",
  whotracksme_trackers_filepath = "01_data/06_whotracks.me-data/trackers.csv"
) {
  dt <- fread(filepath, na.strings = "")
  dt <- dt[Method %like% "GET|POST"]
  dt <- dt[!is.na(Initiator)]

  main_url_domain <- get_domain(dt$`Main URL`[1])
  dt[, initiator_domain := main_url_domain]
  dt[, request_domain := as.character(sapply(URL, get_domain))]

  # Load tracker reference files
  tracker_domains_dt <- fread(
    whotracksme_tracker_domains_filepath,
    select = c("domain", "tracker")
  )
  trackers_dt <- fread(whotracksme_trackers_filepath, select = c("id", "name"))

  dt <- dt %>%
    left_join(tracker_domains_dt, by = c("request_domain" = "domain")) %>%
    left_join(trackers_dt, by = c("tracker" = "id")) %>%
    rename(tracker_name = name)

  # Identify third-party via domain mismatch
  is_third_party <- dt$request_domain != dt$initiator_domain

  # Summary
  n_total_requests <- nrow(dt)
  n_first_party_requests <- sum(!is_third_party, na.rm = TRUE)
  n_third_party_requests <- sum(is_third_party, na.rm = TRUE)

  n_unique_third_party_domains <- dt[
    is_third_party & !is.na(request_domain),
    uniqueN(request_domain)
  ]

  n_whotracksme_trackers <- dt[
    is_third_party & !is.na(tracker_name),
    uniqueN(tracker_name)
  ]

  summary_dt <- data.table(
    n_total_requests,
    n_first_party_requests,
    n_third_party_requests,
    n_unique_third_party_domains,
    n_whotracksme_trackers
  )

  return(summary_dt)
}


# Function to identify outliers
identify_outliers <- function(x) {
  Q1 <- quantile(x, 0.25, na.rm = TRUE)
  Q3 <- quantile(x, 0.75, na.rm = TRUE)
  IQR <- Q3 - Q1
  lower_bound <- Q1 - 1.5 * IQR
  upper_bound <- Q3 + 1.5 * IQR
  outliers <- x[x < lower_bound | x > upper_bound]
  return(outliers)
}
