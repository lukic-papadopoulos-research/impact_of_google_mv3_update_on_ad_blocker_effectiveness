# Privacy vs. Profit: The Impact of Google's Manifest Version 3 (MV3) Update on Ad Blocker Effectiveness -- Crawler

**Authors:** Karlo Lukic, Lazaros Papadopoulos  
**Last Modified:** December 9, 2025

## Overview

This repository contains the code for crawling ad and tracker data to analyze ad blocker effectiveness across different Chrome extensions under Google's Manifest V2 and V3 specifications.

## System Requirements

### Operating System
- **Last tested on:** Windows 10 Pro (Version 22H2, Build 19045.6456)
- **Hardware:** Intel Core i7-13700K (13th Gen), 128GB RAM

### Software Versions
- **Python Version:** 3.11.4
- **Chrome Browser:** 124.0.6367.60
- **ChromeDriver:** 124.0.6367.60

### Hardware Requirements
- **Minimum:** Intel i7 (10th gen+) or AMD equivalent
- **Recommended:** 13th gen Intel i7 or better
- **RAM:** 32GB minimum, 64GB+ recommended (tested with 128GB)
- **Reason:** The crawler runs 10 parallel Chrome instances, which is resource-intensive

## Installation

### 1. Install Python Dependencies

See requirements.txt

This installs the package versions:
- selenium==4.24.0
- pandas==1.5.3
- numpy==1.24.3
- Pillow==11.1.0
- beautifulsoup4==4.8.2
- regex==2022.7.9
- psutil==5.9.0
- cryptography==41.0.2

### 2. Download Chrome and ChromeDriver

**Important:** Use standalone/portable Chrome (not your regular installed Chrome) for consistent testing.

1. Download Chrome 124.x for Windows
2. Download matching ChromeDriver 124.0.6367.60
3. Extract both to a dedicated testing directory

### 3. Prepare Chrome Extensions

This crawler requires several Chrome extensions to be unpacked and available locally:

**Default Extensions (Required):**
- Super Agent - Automatic cookie consent
- Azerion Ad Expert
- HTTP Traffic and Cookie Recorder

**Ad Blocker Extensions (for testing):**
- Adblock Plus (MV2 and MV3 versions)
- AdGuard (MV2 and MV3 versions)
- Stands Adblocker (MV2 and MV3 versions)
- uBlock Origin (MV2)
- uBlock Origin Lite (MV3)
- Fair Adblocker (MV3)

**important:** Exact extension versions are described in the paper.

### 4. Configure Extension Manifests

Before running the crawler, you must inject public keys into the extension manifests using key_injection.py.
This is done to be able to consistently call extension sites.

### 5. Configure the Main Crawler

Make sure to update any paths in the scripts.
Paths are listed at the top of the crawler script.

**Also update Super Agent credentials**:
```python
username = "your_superagent_email"
password = "your_superagent_password"
```

### 6. Prepare Website List

The script includes a demo example.
For full experiments, use the `read_websites()` function with a CSV file:
```python
websites = read_websites("path/to/your/website_list.csv")
```
Your CSV should have website URLs in the first column.

### Known Issues

**SuperAgent Stability:**
The newer SuperAgent version (used in this updated code) is less stable than the MV2 version used in the original paper experiments.
The MV2 SuperAgent version is not functional anymore. Thus, for large-scale experiments, consider:
- Monitoring SuperAgent success rates
- Implementing additional error handling
- Replacing SuperAgent with an alternative if stability issues persist (SuperAgent interactions are indicated in the script)

### Security Considerations

- **Antivirus/Security Software:** May interfere with automated downloads. Consider temporarily disabling or adding exceptions.
- **Malicious Ads:** The crawler downloads external content. Run in an isolated environment if concerned.

**Disclaimer:** This code is provided "as-is" for research reproducibility. The authors are not responsible for any misuse or issues arising from running this code. Ensure you have appropriate permissions before crawling any websites.
