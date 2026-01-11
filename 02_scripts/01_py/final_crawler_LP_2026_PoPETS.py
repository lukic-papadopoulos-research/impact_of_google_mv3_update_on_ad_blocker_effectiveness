"""
Authors: Karlo Lukic, Lazaros Papadopoulos
Last modified: 09.12.2025
Description:
    This code performs the crawl for the paper:
    Privacy vs. Profit: The Impact of Google's Manifest Version 3 (MV3) Update on Ad Blocker Effectiveness

    The code is structured into the following sections:
        1. Package Imports
            Loading all relevant packages for running the crawler.

        2. Input Paths
            Please input paths to Chrome driver, Chrome binary, download directory and extensions.

        3. Define Function
            Define the functions necessary to run the experiment.

        4. Execution Block
            Running the experiment in 10 parallel instances (10 per website).
    Comment:
        We have updated the code, compared to the code that was run for the paper. 
        It runs with a newer version of SuperAgent for continued functionality after recent updates.
        The interaction with the newer SuperAgent version is less stable than before.
        If the code is run for a large experiment, we recommend considering replacing SuperAgent.
        A comment in the run_experiment function points out changes.     

    Tips for running the code:
        1. Please make sure to allow for long file names on Windows.
           Otherwise consider changing the file naming convention.
        2. The crawler can be very resource-straining due to concurrency.
           Please make sure to run it on at least a 13th gen i7 processor or equivalent.
        3. It is important to match the browser and package versions as closely as possible.
           The MV3 update caused movement in several browser-focused packages, extensions etc.
        4. Security measures can interfere with the download of relevant data.
           Make sure to disable security measures that could cause interference.
        5. The waiting times should be adjusted based on system performance if no files/too few files are created.
        6. For the code to be able to call extension sites, the extensions need to contain valid key.
           Please run key_injection.py beforehand.
"""

################################################################################
############################### Import Packages ################################
################################################################################

import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import numpy as np
from datetime import datetime
import os
from urllib.parse import urlparse
from PIL import Image
import io
from io import BytesIO
from bs4 import BeautifulSoup
import logging
import concurrent.futures
import random
import psutil
import shutil
import tempfile
import regex as re
import json
import base64
import hashlib

################################################################################
############################### Input Paths ####################################
################################################################################

############################### INPUT START:
# Paths to Chome version 
# Replace 'XXX' with your local paths. Example structure:
#
# C:/Users/YourName/Research/
# ├── chromedriver-win64/
# │   └── chromedriver.exe
# ├── chrome-win64/
# │   └── chrome.exe
# ├── downloads/                    # Where crawled data will be saved
# └── extensions/
#     ├── 01_super-agent/neooppigbkahgfdhbpbhcccgpimeaafi/
#     ├── 02_azerion/nndadbimjipilgfojofhpjjkhgflkih/
#     └── ...

driver_path = r'XXX/chromedriver-win64/chromedriver.exe'
binary_path = r'XXX/chrome-win64/chrome.exe'

# Path to folder with 
downloads_path = r'XXX/downloads'

# Specify the paths to your Chrome extensions
# Default extensions:
extension_path1 = r'XXX/extensions/01_super-agent/neooppigbkahgfdhbpbhcccgpimeaafi' # Input the path to Super-Agent
extension_path2 = r'XXX/extensions/02_azerion/nndadbimjipilgfojofhpjjkhgflkih' # Input the path to Azerion
extension_path3 = r'XXX/extensions/03_http-recorder/ckjelkgpooomhchnnmbofckmnncifinb' # Input the path to http-recorder

# Ad Blockers:
extension_path4 = r'XXX/extensions/adblock_plus_free_ad_blocker_3.25.1_MV2/cfhdojbkjhnklbpkdaibdccddilifddb' # Input the path to Adblock_ Plus 3.25.1_MV2
extension_path5 = r'XXX/extensions/adblock_plus_free_ad_blocker_4.5.1_MV3/cfhdojbkjhnklbpkdaibdccddilifddb' # Input the path to Adblock Plus 4.5.1_MV3
extension_path6 = r'XXX/extensions/adguard_adblocker_MV2/bgnkhhnnamicmpeenaelnjfhikgbkllg' # Input the path to Adguard MV2
extension_path7 = r'XXX/extensions/adguard_adblocker_mv3_beta_MV3/apjcbfpjihpedihablmalmbbhjpklbdf' # Input the path to Adguard MV3
extension_path8 = r'XXX/extensions/stands_adblocker_MV2/lgblnfidahcdcjddiepkckcfdhpknnjh' # Input the path to Stands MV2
extension_path9 = r'XXX/extensions/fair_adblocker_mv3_beta_MV3/dpbilcifapcagighfgooemclcalgdhbh' # Input the path to Fair MV3
extension_path10 = r'XXX/extensions/ublock_origin_MV2/cjpalhdlnbpafiamejdnhcphjbkeiagm' # Input the path to Ublock Origin MV2
extension_path11 = r'XXX/extensions/ublock_origin_lite_MV3/ddkjiahejlhfcafbddmgiahcphecmpfh' # Input the path to Ublock Origin Lite MV3

# Website List
# website_path= r"D:\Lazaros\Privacy\99_Websites/my_list.csv" - for demo purposes, a list of one single website is used below ("nba.com")

# Super Agent Login Data
username= 'your_superagent_email'
password= 'your_superagent_password'

############################ INPUT END

# Define path sets to extensions - no need for input here
extensions = [
    # Instance 1 (baseline): extensions 1, 2 and 3
    [extension_path1, extension_path2, extension_path3],
    # Instance 2 (AdGuard MV2): extensions 1, 2, 3 and 4
    [extension_path1, extension_path2, extension_path3, extension_path4],
    # Instance 3 (AdGuard MV3): extensions 1, 2, 3 and 5
    [extension_path1, extension_path2, extension_path3, extension_path5],
    # Instance 4 (Stands MV2): extensions 1, 2, 3 and 6
    [extension_path1, extension_path2, extension_path3, extension_path6],
    # Instance 5 (Stands MV3): extensions 1, 2, 3 and 7
    [extension_path1, extension_path2, extension_path3, extension_path7],
    # Instance 6 (uBlock MV2): extensions 1, 2, 3 and 8
    [extension_path1, extension_path2, extension_path3, extension_path8],
    # Instance 7 (uBlock MV3): extensions 1, 2, 3 and 9
    [extension_path1, extension_path2, extension_path3, extension_path9],
    # Instance 8 (ABP MV2): extensions 1, 2, 3 + 5, 7, 9, and 11
    [extension_path1, extension_path2, extension_path3, extension_path10],
    # Instance 9 (ABP MV3): extensions 1, 2, 3 + 5, 7, 9, and 11
    [extension_path1, extension_path2, extension_path3, extension_path11],
    # Instance 10 (MV3+): extensions 1, 2, 3 + 5, 7, 9, and 11
    [
        extension_path1,
        extension_path2,
        extension_path3,
        extension_path5,
        extension_path7,
        extension_path9,
        extension_path11
    ]
]

################################################################################
############################### Define functions  ##############################
################################################################################

def prepare_extensions(extension_paths):
    """
    Prepares a mapping of extensions to id to call extension sites.

    Args:
        extension_paths (list): List of paths to extensions.

    Returns:
        dict: Mapping of extension names to their computed IDs.
    """

    extension_name_to_id = {}

    for path in extension_paths:
        # Get extension key

        # Optionally, retrieve the extension's name from manifest.json
        manifest_path = os.path.join(path, "manifest.json")
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
            ext_name = manifest.get("name", "Unknown Extension")
            key = manifest.get("key")
            # Compute extension ID
            ext_id = compute_extension_id(key)
            # print(f"Computed Extension ID: {ext_id}")

        extension_name_to_id[ext_name] = ext_id
        # print(f"Mapped Extension '{ext_name}' to ID '{ext_id}'\n")

    return extension_name_to_id


def compute_extension_id(public_key_b64):
    """
    Computes the Chrome extension ID from the base64-encoded public key.

    Args:
        public_key_b64 (str): Base64-encoded public key without headers or line breaks.

    Returns:
        str: The computed extension ID.
    """
    if public_key_b64 is None:
        raise ValueError(
            "No 'key' field found in manifest.json; cannot compute extension ID"
        )

    # Decode the base64 public key
    public_key_bytes = base64.b64decode(public_key_b64)

    # Compute SHA256 hash
    sha256_hash = hashlib.sha256(public_key_bytes).digest()

    # Take the first 16 bytes
    first_16_bytes = sha256_hash[:16]

    # Map each 4-bit nibble to 'a' to 'p'
    extension_id = ""
    for byte in first_16_bytes:
        high_nibble = (byte >> 4) & 0x0F
        low_nibble = byte & 0x0F
        extension_id += chr(ord("a") + high_nibble)
        extension_id += chr(ord("a") + low_nibble)

    return extension_id


def process_data(raw_df, table_title):
    """
    Clean the Azerion auction table and return a tidy DataFrame.

    Args:
        raw_df (pandas.DataFrame): Input with at least
            ['Bidder','Unnamed: 6','Size','Format','CPM','Response (ms)','Winner'].
        table_title (str): Title of the table

    Returns:
        Processed table of ads on website
    """
    # Fill NaN
    raw_df = raw_df.fillna("")

    # If the row is a valid ad (all columns have same value), assign it to 'Ad', else assign NaN
    raw_df["Ad"] = np.where(
        (raw_df["Bidder"] == raw_df["Unnamed: 6"]), raw_df["Bidder"], np.nan
    )

    # Forward fill 'Ad' column
    raw_df["Ad"] = raw_df["Ad"].replace("", np.nan).ffill()

    # Calculate ID based on 'Ad' change
    raw_df["ID"] = (raw_df["Ad"] != raw_df["Ad"].shift(1)).cumsum()

    # Exclude rows where 'Bidder' column is in 'Ad' format
    raw_df = raw_df[~(raw_df["Bidder"] == raw_df["Ad"])]

    # Any row with equal values across all columns is treated as 'no bids in the last auction'
    raw_df.loc[raw_df.apply(lambda x: x.nunique() == 1, axis=1), "Bidder"] = (
        "no bids in the last auction"
    )

    # Drop 'Unnamed: 6' column
    raw_df = raw_df.drop("Unnamed: 6", axis=1)

    # Add 'Table Title' as a new column
    raw_df["Table Title"] = table_title

    # Set exact column order
    cols_order = [
        "ID",
        "Table Title",
        "Ad",
        "Bidder",
        "Size",
        "Format",
        "CPM",
        "Response (ms)",
        "Winner",
    ]
    raw_df = raw_df[cols_order]

    return raw_df


def generate_filename(url, extension_paths):
    """
    Generate a sanitized filename from URL and extension paths.

    Args: url (str); extension_paths (extension paths describing the instance).
    Returns: str safe filename.
    """
    # Parsing URL for domain
    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    # Remove the TLD part
    domain = "".join(domain.split("."))

    # Current time for timestamp
    current_time = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    # Parsing extension path to get the name of the extension
    extension_names = [
        os.path.split(os.path.dirname(path))[-1] for path in extension_paths
    ]
    joined_extension_names = "-".join(extension_names)

    filename = f"{domain}-{current_time}-{joined_extension_names}-ads.png"
    clean_filename = re.sub(r"[^\w\\.]", "", filename)

    return clean_filename


def save_page_as_html(driver, filename):
    """
    Save the current page's HTML to filename in output directory.

    Args:
        driver: Selenium WebDriver on the page to capture.
        filename: Output file name

    Returns:
        None
    """
    html = driver.page_source
    with open(os.path.join(downloads_path, filename), "w", encoding="utf-8") as f:
        f.write(html)


def take_full_page_screenshot(driver, screenshot_filename):
    """
    Stitch a full-page screenshot by scrolling, capturing frames, and saving the combined image.
    Temporarily sets fixed elements to absolute; scrolls up to 15 steps with short waits.
    Saves to given filename.

    Args: driver with open website and extensions; screenshot_filename 
    Returns: True on success.
    """
    # Hide fixed elements
    driver.execute_script("""
        var elements = document.querySelectorAll('*');
        for (var i = 0; i < elements.length; i++) {
            if (window.getComputedStyle(elements[i]).position === 'fixed') {
                elements[i].setAttribute('data-original-style', elements[i].getAttribute('style') || '');
                elements[i].style.position = 'absolute';
            }
        }
    """)

    # Get the initial viewport height
    viewport_height = driver.execute_script("return window.innerHeight")
    total_height = driver.execute_script("return document.body.scrollHeight")

    # Initialize the stitched image and the current scroll position
    stitched_image = None
    current_scroll_position = 0
    scrolls = 0

    while current_scroll_position < total_height and scrolls < 15: # Scroll through the website up to 15 times
        # Scroll to the current position
        driver.execute_script(f"window.scrollTo(0, {current_scroll_position});")

        # Allow time for content to load
        time.sleep(random.uniform(2, 4))

        # Capture the screenshot
        screenshot = driver.get_screenshot_as_png()
        screenshot_image = Image.open(BytesIO(screenshot))

        if stitched_image is None:
            # Initialize the stitched image with the first screenshot
            stitched_image = screenshot_image
        else:
            # Create a new image with combined height
            new_image_height = stitched_image.height + screenshot_image.height
            new_image = Image.new("RGB", (stitched_image.width, new_image_height))

            # Paste the current stitched image and the new screenshot
            new_image.paste(stitched_image, (0, 0))
            new_image.paste(screenshot_image, (0, stitched_image.height))

            # Update the stitched image
            stitched_image = new_image

        # Update the scroll position
        current_scroll_position += viewport_height

        # Check if we have reached the bottom of the page
        if current_scroll_position >= total_height:
            break

        # Update the total height in case more content is loaded
        total_height = driver.execute_script("return document.body.scrollHeight")

        # Keep count of scrolls
        scrolls += 1

    # Save the final stitched image
    stitched_image.save(os.path.join(downloads_path, screenshot_filename))

    # Restore fixed elements
    driver.execute_script("""
        var elements = document.querySelectorAll('*');
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].hasAttribute('data-original-style')) {
                elements[i].setAttribute('style', elements[i].getAttribute('data-original-style'));
                elements[i].removeAttribute('data-original-style');
            }
        }
    """)

    return True


def run_experiment(extension_paths, url):
    """
    Run the main crawl for a browser instance: 
    launch Chrome with given extensions, open `url`, scroll,
    capture screenshot + HTML, export trackers, parse ad tables to CSV,
    clean up; retries up to 5 times.

    Args: extension_paths (list[str]); url (str).
    Returns: None (writes outputs under `downloads_path`).
    """
    i = 0
    # Attempt to crawl website up to 5 times until success
    while i < 5:
        try:
            extensions_combined = ",".join(extension_paths) # Combine extensions paths for loading

            # Prepare extensions: generate keys, insert into manifest, compute IDs
            extension_name_to_id = prepare_extensions(extension_paths)

            # Prepare Chrome for experiment with temporary profile
            chrome_options = Options()
            chrome_options.binary_location = binary_path
            profile_dir = tempfile.mkdtemp()
            chrome_options.add_argument(f"--user-data-dir={profile_dir}")  # Set fresh temporary profile
            chrome_options.add_argument(
                "--search-engine-choice-country"
            )
            chrome_options.add_argument("--disable-extensions-http-throttling")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.page_load_strategy = "none" # Above options have shown to result in the most consistent crawls
            prefs = {
                "download.default_directory": downloads_path,
                "download.prompt_for_download": False,
            } # preferences for automated data downloads
            chrome_options.add_experimental_option("prefs", prefs)

            # Add extensions
            chrome_options.add_argument(f"--load-extension={extensions_combined}")

            # Prepare Chrome Service
            service = Service(driver_path)
            service.startup_timeout = 60
            
            # Initiate Chrome
            driver = webdriver.Chrome(service=service, options=chrome_options)
            time.sleep(8)

            # List of base extension names for mapping
            known_extension_names = [
                "Super Agent - Automatic cookie consent",
                "Azerion Ad Expert",
                "HTTP Traffic and Cookie Recorder",
            ]

            # Open extension site
            driver.get("chrome://extensions/")
            time.sleep(random.randint(10, 15))

            # Additional download preferences after initiation for increased robustness
            driver.execute_cdp_cmd(
                "Page.setDownloadBehavior",
                {
                    "behavior": "allow",
                    "downloadPath": downloads_path,
                    # optional, but can help track events
                    "eventsEnabled": True,
                },
            ) 

            # Open the Superagent URL - more stable to actively open it  
            driver.get(
                f"chrome-extension://{extension_name_to_id.get(known_extension_names[0])}/onboard.html"
            )

            # Close any window/extension pop-up that is not Super Agent
            for handle in driver.window_handles:
                driver.switch_to.window(handle)
                current_url = driver.current_url
                if (
                    current_url
                    != f"chrome-extension://{extension_name_to_id.get(known_extension_names[0])}/onboard.html#/how-to"
                ):
                    driver.close()
                    time.sleep(random.randint(1, 2))

            # Close duplicate Super Agent sites
            num_handles = len(driver.window_handles)
            if num_handles > 1:
                while num_handles > 1:
                    driver.switch_to.window(driver.window_handles[0])
                    driver.close()
                    num_handles = len(driver.window_handles)

            # Log into Superagent and set it up - preferences should be set prior
            driver.switch_to.window(driver.window_handles[0])
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="#/account"],button[href="#/account"]'))).click()
            WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.ID, "username"))).send_keys(username)
            WebDriverWait(driver, 20).until(EC.visibility_of_element_located((By.ID, "password"))).send_keys(password)
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.XPATH, '//button[@type="submit" and contains(normalize-space(.), "Einloggen")]'))).click()
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="#/preferences"],button[href="#/preferences"]'))).click()
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="#/data-collection"],button[href="#/data-collection"]'))).click()
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="#/manage-subscriptions"],button[href="#/manage-subscriptions"]'))).click()
            WebDriverWait(driver, 20).until(EC.element_to_be_clickable((By.CSS_SELECTOR, 'a[href="#/done"],button[href="#/done"]'))).click()
            
            # Open the new URL for Azerion Ad Expert extension to capture ad data
            driver.get(
                f"chrome-extension://{extension_name_to_id.get(known_extension_names[1])}/popup.html"
            )
            time.sleep(random.randint(1, 2))

            # Navigate to website in a new tab after setting up the extension
            driver.execute_script("window.open('');")

            # Switch to the new tab
            driver.switch_to.window(driver.window_handles[-1])

            # Load a website in the new tab
            driver.get(url)

            # Fetch the updated URL after redirection
            new_url = driver.current_url

            # Wait n seconds for page to fully load
            time.sleep(random.randint(15, 20))

            # Refresh page
            driver.refresh()
            time.sleep(random.randint(5,10))

            # File name for CSV file
            filename = generate_filename(new_url, extension_paths)

            # Take screenshot of the page while scrolling down
            take_full_page_screenshot(driver, filename)

            # Save HTML page source
            html_filename = filename.replace(".png", ".html")
            save_page_as_html(driver, html_filename)

            # Save HTTP traffic (trackers) and cookies
            driver.get(
                f"chrome-extension://{extension_name_to_id.get(known_extension_names[2])}/popup.html"
            )
            time.sleep(1)

            # Export via secure Chrome action
            export_btn = WebDriverWait(driver, 20).until(
                EC.element_to_be_clickable((By.ID, "exportButton"))
            )
            ActionChains(driver).move_to_element(export_btn).pause(0.05).click().perform()
            time.sleep(random.randint(1, 2))

            # Switch back to the original tab that captured ad data
            driver.switch_to.window(driver.window_handles[0])
            time.sleep(random.randint(1, 2))

            # Save raw ad data as HTML
            popup_html_filename = filename.replace(".png", "-popup.html")
            save_page_as_html(driver, popup_html_filename)

            # Once on a page with the table, grab the table with pandas
            try:
                # load the html content
                html_io = io.StringIO(driver.page_source)
                soup = BeautifulSoup(html_io.getvalue(), "html.parser")

                # get the titles and tables
                content = soup.select("div.v-card__title.text-subtitle-1.pb-0, table")

                all_dfs = []
                current_title = None
                for item in content:
                    if item.name == "div":
                        current_title = item.text
                    elif item.name == "table":
                        df = pd.read_html(io.StringIO(str(item)), header=0)[
                            0
                        ]  # convert html to dataframe
                        tidy_df = process_data(df, current_title)
                        all_dfs.append(tidy_df)

                # concatenate all the dataframes
                final_df = pd.concat(all_dfs)

                # Write final dataframe to CSV
                csv_filename = filename.replace(".png", ".csv")
                final_df.to_csv(os.path.join(downloads_path, csv_filename), index=False)
            except ValueError:
                # Create an empty DataFrame with columns if there were no tables found on the page
                column_names = [
                    "ID",
                    "Table Title",
                    "Ad",
                    "Bidder",
                    "Size",
                    "Format",
                    "CPM",
                    "Response (ms)",
                    "Winner",
                ]
                final_df = pd.DataFrame(columns=column_names)

                # Append an empty row to final_df
                final_df.loc[0] = [np.nan] * len(column_names)

                # Write final DataFrame to CSV
                csv_filename = filename.replace(".png", ".csv")
                final_df.to_csv(os.path.join(downloads_path, csv_filename), index=False)

            # Finish process
            driver.quit()
            break

        except Exception as e:
            print(e)
            i += 1

        finally:
            # Finally block for stable process termination of runaway Chrome processes
            # 1) Close the browser
            if driver is not None:
                try: driver.quit()
                except: pass
        
            # 2) Stop the driver service
            if service is not None:
                try:
                    service.stop()
                except: pass
        
            # 3) Kill *any* Chrome or ChromeDriver processes launched under this profile
            for proc in psutil.process_iter(attrs=['pid','cmdline']):
                cmd = ' '.join(proc.info['cmdline'] or [])
                if profile_dir and profile_dir in cmd:
                    try: psutil.Process(proc.info['pid']).kill()
                    except: pass
        
            # 4) Clean up the temp profile
            if profile_dir:
                shutil.rmtree(profile_dir, ignore_errors=True)
                
            profile_dir=None
        
    if i==5:
        # In case the crawler failed five times, terminate the process, print messages
        print("This did not work.")
        print(extension_paths)
        try:
            driver.quit()
            i += 1
            print(f"Attempt {i} done. Not working")
            
        except:
            print("Driver was not closed.")  # message in case the driver was not close successfully
            

# Logger configuration function
def setup_logger(downloads_path):
    """
    Configure a logger that writes INFO logs to '00_crawler_log.log' in downloads_path.

    Args:
        downloads_path (str | Path): Directory where the log file is saved.

    Returns:
        logging.Logger: Configured logger instance.

    """
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)
    handler = logging.FileHandler(os.path.join(downloads_path, "00_crawler_log.log"))
    handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s : %(levelname)s : %(name)s : %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

# Call logger setup function
logger = setup_logger(downloads_path)

def read_websites(filename):
    """
    Read first-column domains from a CSV and return URL-normalized strings.
    Adds 'https://' when no scheme is present.

    Args: filename (str | Path): Path to the CSV file.
    Returns: list[str]: List of normalized website URLs.
    """
    df = pd.read_csv(filename)
    websites = df.iloc[:, 0].tolist()  # Read the first column

    # Add 'https://' prefix if not present
    websites = [
        "https://" + website
        if not website.startswith("http://") and not website.startswith("https://")
        else website
        for website in websites
    ]

    return websites


################################################################################
############################### Execution Block ################################
################################################################################

if __name__ == "__main__":
    print(time.strftime("%H:%M:%S", time.localtime())) # print strting time
    websites = ["https:\\nba.com"] # read file with websites
    successful = [] # initiate list of successfully visited websites
    failed = [] # initiate list of failed websites visits

    # Parallelized execution block
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_website = {
            executor.submit(run_experiment, extension_set, website): (
                website,
                extension_set,
            )
            for website in websites
            for extension_set in extensions
        }

        for future in concurrent.futures.as_completed(future_to_website):
            website, extension_now = future_to_website[future]
            extension_now = " ".join(extension_now)
            try:
                # Log successful website visits
                future.result(timeout=900)
                successful.append(website)
                logger.info(f"Successfully visited {website}{extension_now}")
                print(f"Successfully visited {website}")
            except Exception as e:
                # Log errors and failed website visits
                logger.error(
                    f"Failed to visit {website} {extension_now} due to {str(e)}",
                    exc_info=True,
                )
                print(f"Failed to visit {website} {extension_now} due to {str(e)}")
                failed.append(website)

    executor.shutdown(wait=True)

    # Create dataframe for successful and failed website visits
    pd.DataFrame(successful, columns=["website"]).to_csv(
        os.path.join(downloads_path, "00_successful.csv"), index=False
    )
    pd.DataFrame(failed, columns=["website"]).to_csv(
        os.path.join(downloads_path, "00_failed.csv"), index=False
    )

    # Document End time
    print(time.strftime("%H:%M:%S", time.localtime()))


