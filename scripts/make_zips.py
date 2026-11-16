import os
import zipfile

def zip_dir(src_dir, zip_path):
    count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, src_dir)
                zf.write(full_path, rel_path)
                count += 1
    size = os.path.getsize(zip_path)
    print(f"Created {zip_path}: {count} files, {size:,} bytes")

# 1. frontend-deploy.zip (Client build for public_html)
zip_dir("frontend/dist/client", "frontend-deploy.zip")

# 2. backend-deploy.zip (Node.js API build)
with zipfile.ZipFile("backend-deploy.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    count = 0
    for root, dirs, files in os.walk("backend"):
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        if ".git" in dirs:
            dirs.remove(".git")
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, "backend")
            zf.write(full_path, rel_path)
            count += 1
    size = os.path.getsize("backend-deploy.zip")
    print(f"Created backend-deploy.zip: {count} files, {size:,} bytes")

# 3. frontend-source-deploy.zip (For Hostinger Node SSR if needed)
with zipfile.ZipFile("frontend-source-deploy.zip", "w", zipfile.ZIP_DEFLATED) as zf:
    count = 0
    for root, dirs, files in os.walk("frontend"):
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        if ".git" in dirs:
            dirs.remove(".git")
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, "frontend")
            zf.write(full_path, rel_path)
            count += 1
    size = os.path.getsize("frontend-source-deploy.zip")
    print(f"Created frontend-source-deploy.zip: {count} files, {size:,} bytes")

