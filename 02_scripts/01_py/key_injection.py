# -*- coding: utf-8 -*-
"""
Last edited: 08.12.2025
Last modifications: Formatting
Ensures each unpacked extension:
  • Has a base64‑encoded 'key' in its manifest.json
  • Gets a human‑readable 'name'—either from your overrides or derived from its folder name
The script ensures extensions have a key that allows the main crawler to call extension sites.
"""

# Import packages
import os
import json
import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# Derive extension name from path
def derive_name_from_path(ext_dir):
    # Take the parent folder name, replace underscores/hyphens, title‑case
    folder = os.path.basename(os.path.dirname(ext_dir))
    return folder.replace("_", " ").replace("-", " ").title()

# Helper function to inject key/names into extension
def ensure_extension_key_and_name(
    manifest_path, override_name=None, pem_output_path=None
):
    """
    Reads manifest.json, injects a new 'key' if missing,
    sets 'name' to override_name if given (else leaves existing or derived),
    and optionally saves the private key to a PEM file.
    """
    with open(manifest_path, "r+", encoding="utf-8") as f:
        manifest = json.load(f)

        # 1) Override or set the name
        if override_name:
            manifest["name"] = override_name

        # 2) Generate & inject a new key if missing
        if "key" not in manifest:
            private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
            public_der = private_key.public_key().public_bytes(
                serialization.Encoding.DER,
                serialization.PublicFormat.SubjectPublicKeyInfo,
            )
            manifest["key"] = base64.b64encode(public_der).decode("ascii")
            print(f"Injected new key into {manifest_path}")

            # 3) Optionally write out the private key
            if pem_output_path:
                with open(pem_output_path, "wb") as pem_file:
                    pem_file.write(
                        private_key.private_bytes(
                            encoding=serialization.Encoding.PEM,
                            format=serialization.PrivateFormat.PKCS8,
                            encryption_algorithm=serialization.NoEncryption(),
                        )
                    )
                print(f"Saved private key to {pem_output_path}")

        # 4) Write back any changes (name and/or key)
        f.seek(0)
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.truncate()

# Function to inject key/names into extension
def inject_keys_into_extensions(extension_dirs, name_overrides, save_priv_key=True):
    """
    For each unpacked extension directory:
      • Determine the override_name (from name_overrides) or derive it from the path
      • Ensure its manifest.json has both 'key' and the correct 'name'
    """
    for ext_dir in extension_dirs:
        manifest_path = os.path.join(ext_dir, "manifest.json")
        if not os.path.isfile(manifest_path):
            print(f"Skipping {ext_dir}: manifest.json not found")
            continue

        # use override if present, otherwise derive from folder name
        override_name = name_overrides.get(ext_dir) or derive_name_from_path(ext_dir)
        pem_path = os.path.join(ext_dir, "extension_key.pem") if save_priv_key else None

        ensure_extension_key_and_name(manifest_path, override_name, pem_path)

########################## Execution Block ###########################
if __name__ == "__main__":
    # Define your extension directories:
    # extension_path1  = XXX
    # extension_path2  = XXX
    # extension_path3  = XXX
    # extension_path4  = XXX
    # extension_path5  = XXX
    # extension_path6  = XXX
    # extension_path7  = XXX
    # extension_path8  = XXX
    # extension_path9  = XXX
    # extension_path10 = XXX
    # extension_path11 = XXX
  
    extensions = [
        extension_path1,
        extension_path2,
        extension_path3,
        # extension_path4,
        # extension_path5,
        # extension_path6,
        # extension_path7,
        # extension_path8,
        # extension_path9,
        # extension_path10,
        # extension_path11,
        # extension_path12,
        # extension_path13,
    ]

    # only override the first three; all others will get derived names
    name_overrides = {
        extension_path1: "Super Agent - Automatic cookie consent",
        extension_path2: "Azerion Ad Expert",
        extension_path3: "HTTP Traffic and Cookie Recorder",
    }

    inject_keys_into_extensions(extensions, name_overrides)
    print("All manifests updated.")



