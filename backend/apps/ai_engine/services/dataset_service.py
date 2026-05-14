"""
Scan local datasets, infer columns, write DATASETS_REPORT.md and dataset_summary.json.
"""
from __future__ import annotations

import json
import os
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

from django.conf import settings

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


@dataclass
class TabularInfo:
    path: str
    rows_sample: int
    columns: list[str]


@dataclass
class DatasetScanResult:
    name: str
    root: str
    total_bytes: int
    file_count: int
    image_count: int
    tabular_files: list[TabularInfo] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)
    useful_hints: dict[str, Any] = field(default_factory=dict)


def _dir_size_and_files(root: Path) -> tuple[int, int, int]:
    total = 0
    files = 0
    images = 0
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            files += 1
            fp = Path(dirpath) / fn
            try:
                total += fp.stat().st_size
            except OSError:
                pass
            if Path(fn).suffix.lower() in IMAGE_EXTENSIONS:
                images += 1
    return total, files, images


def _peek_columns(path: Path, max_rows: int = 3) -> tuple[list[str], int]:
    import pandas as pd

    ext = path.suffix.lower()
    try:
        if ext in (".tsv",):
            df = pd.read_csv(path, sep="\t", nrows=max_rows, on_bad_lines="skip", engine="python")
        elif ext in (".csv",):
            df = pd.read_csv(path, nrows=max_rows, on_bad_lines="skip", engine="python")
        else:
            return [], 0
        return [str(c) for c in df.columns], int(len(df.columns))
    except Exception as exc:  # noqa: BLE001
        return [], 0


def scan_datasets_root(datasets_dir: Path | None = None) -> list[DatasetScanResult]:
    datasets_root = Path(datasets_dir or settings.DATASETS_DIR)
    results: list[DatasetScanResult] = []
    if not datasets_root.exists():
        return [
            DatasetScanResult(
                name="datasets",
                root=str(datasets_root),
                total_bytes=0,
                file_count=0,
                image_count=0,
                notes=["Datasets directory not found."],
            )
        ]

    for child in sorted(datasets_root.iterdir()):
        if not child.is_dir():
            continue
        total, fcount, img_count = _dir_size_and_files(child)
        tabulars: list[TabularInfo] = []
        notes: list[str] = []
        for dirpath, _, filenames in os.walk(child):
            for fn in filenames:
                fp = Path(dirpath) / fn
                if fp.suffix.lower() not in (".csv", ".tsv"):
                    continue
                cols, _ = _peek_columns(fp)
                if cols:
                    tabulars.append(
                        TabularInfo(
                            path=str(fp.relative_to(datasets_root)),
                            rows_sample=3,
                            columns=cols,
                        )
                    )
        hints: dict[str, Any] = {
            "image_classification": "images" in str(child).lower() or img_count > 50,
            "resale_price": any("price" in " ".join(t.columns).lower() for t in tabulars),
            "electronics": "electronic" in child.name.lower() or "tech" in child.name.lower(),
            "fashion": "fashion" in child.name.lower() or "bottom" in child.name.lower(),
            "demo_listings": fcount > 0 and len(tabulars) > 0,
        }
        results.append(
            DatasetScanResult(
                name=child.name,
                root=str(child),
                total_bytes=total,
                file_count=fcount,
                image_count=img_count,
                tabular_files=tabulars[:20],
                notes=notes,
                useful_hints=hints,
            )
        )
    return results


def write_report_markdown(results: list[DatasetScanResult], docs_path: Path) -> None:
    docs_path.parent.mkdir(parents=True, exist_ok=True)
    lines = ["# Dataset scan report", "", f"_Generated from `{settings.DATASETS_DIR}`._", ""]
    for r in results:
        lines.append(f"## {r.name}")
        lines.append(f"- Root: `{r.root}`")
        lines.append(f"- Total size (bytes): {r.total_bytes}")
        lines.append(f"- File count: {r.file_count}")
        lines.append(f"- Image-like files: {r.image_count}")
        lines.append(f"- Usability hints: {json.dumps(r.useful_hints)}")
        if r.notes:
            lines.append("- Notes:")
            for n in r.notes:
                lines.append(f"  - {n}")
        if r.tabular_files:
            lines.append("- Tabular files (sample):")
            for t in r.tabular_files[:10]:
                lines.append(f"  - `{t.path}` columns: {', '.join(t.columns[:25])}")
        lines.append("")
    docs_path.write_text("\n".join(lines), encoding="utf-8")


def write_summary_json(results: list[DatasetScanResult], out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "datasets_dir": str(settings.DATASETS_DIR),
        "datasets": [
            {
                **{k: v for k, v in asdict(r).items() if k != "tabular_files"},
                "tabular_files": [asdict(t) for t in r.tabular_files],
            }
            for r in results
        ],
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def run_full_scan() -> list[DatasetScanResult]:
    results = scan_datasets_root()
    backend_dir = Path(settings.BASE_DIR)
    write_report_markdown(results, backend_dir.parent / "docs" / "DATASETS_REPORT.md")
    write_report_markdown(results, backend_dir / "docs" / "DATASETS_REPORT.md")
    write_summary_json(results, backend_dir / "data" / "dataset_summary.json")
    return results
