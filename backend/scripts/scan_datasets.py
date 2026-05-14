"""
Scan datasets using Django settings. Run from backend/:
python scripts/scan_datasets.py
"""
import os
import sys

import django

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "recycle_backend.settings")
django.setup()

from apps.ai_engine.services.dataset_service import run_full_scan  # noqa: E402


def main() -> None:
    results = run_full_scan()
    total_files = sum(r.file_count for r in results)
    total_bytes = sum(r.total_bytes for r in results)
    print(f"Scanned {len(results)} dataset folders, {total_files} files, {total_bytes} bytes")
    for r in results:
        print(f"- {r.name}: files={r.file_count}, images~={r.image_count}, tabulars={len(r.tabular_files)}")
        for t in r.tabular_files[:3]:
            print(f"    {t.path}: {t.columns[:12]}")


if __name__ == "__main__":
    main()
