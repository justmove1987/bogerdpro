from __future__ import annotations

import csv
import json
import re
import sys
import unicodedata
from collections import OrderedDict
from pathlib import Path


def text(value):
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def cents(value):
    value = text(value)
    if not value:
        return None
    try:
        return int(round(float(value.replace(",", ".")) * 100))
    except ValueError:
        return None


def slugify(value):
    value = unicodedata.normalize("NFD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "producte"


def clean_title(value):
    value = text(value)
    if not value:
        return None
    return " ".join(value.split())


def clean_color(value):
    value = clean_title(value)
    return value.title() if value else None


def size_label(size_from, size_to):
    start = text(size_from)
    end = text(size_to)
    if start and end and start != end:
        return f"{start}-{end}"
    return start or end or "Talla única"


def spec(label, value):
    value = text(value)
    if not value:
        return None
    return {"label": label, "value": value}


def product_colors(row):
    colors = []
    for index in range(1, 33):
        color = clean_color(row.get(f"Colors_{index}"))
        if color and color not in colors:
            colors.append(color)
    return colors


def normalize(info_path: Path, prices_path: Path, output_path: Path):
    with prices_path.open(encoding="utf-8-sig", newline="") as file:
        price_rows = list(csv.DictReader(file, delimiter=";"))
    price_map = {row["SKU"].strip(): row for row in price_rows if text(row.get("SKU"))}

    with info_path.open(encoding="utf-8-sig", newline="") as file:
        info_rows = list(csv.DictReader(file, delimiter=";"))

    products = OrderedDict()
    skipped = []

    for row_number, row in enumerate(info_rows, start=2):
        product_number = text(row.get("SerieCode"))
        price_row = price_map.get(product_number or "")
        price = cents(price_row.get("PROMOPRICE") if price_row else None) or cents(price_row.get("PRICE") if price_row else None)
        name = clean_title(row.get("Name"))

        if not product_number or not price_row or not price or price <= 0 or not name:
            skipped.append({"row": row_number, "sku": product_number, "name": name, "price": price})
            continue

        brand = clean_title(price_row.get("BRAND")) or clean_title(row.get("Brand")) or "Velilla"
        category = clean_title(price_row.get("FAMILY")) or clean_title(row.get("Families_1"))
        subcategory = clean_title(row.get("SubFamilies_1")) or clean_title(row.get("SubFamilies_2"))
        colors = product_colors(row)
        variant_colors = colors or [None]
        size = size_label(row.get("Size_From"), row.get("Size_To"))
        material = clean_title(row.get("Gammas_1")) or clean_title(row.get("Families_1"))
        description = text(row.get("Description"))
        gammas = [clean_title(row.get(f"Gammas_{index}")) for index in range(1, 5)]
        families = [clean_title(row.get(f"Families_{index}")) for index in range(1, 4)]
        subfamilies = [clean_title(row.get(f"SubFamilies_{index}")) for index in range(1, 3)]
        gamma_text = " ".join(item for item in gammas if item).lower()

        specifications = [
            item
            for item in [
                spec("Familia", ", ".join(item for item in families if item)),
                spec("Subfamilia", ", ".join(item for item in subfamilies if item)),
                spec("Gama", ", ".join(item for item in gammas if item)),
                spec("Certificaciones", row.get("Certifications")),
                spec("Tallas disponibles", size),
                spec("Colores disponibles", ", ".join(colors)),
            ]
            if item
        ]

        products[product_number] = {
            "productNumber": product_number,
            "name": name,
            "slug": f"{slugify(name)}-{slugify(product_number)}",
            "description": description,
            "gender": "Mujer" if "mujer" in name.lower() or "woman" in gamma_text else None,
            "material": material,
            "category": category,
            "subcategory": subcategory,
            "brand": brand,
            "images": [],
            "documents": [],
            "specifications": specifications,
            "attributes": {
                key: value
                for key, value in {
                    "family": category,
                    "subfamily": subcategory,
                    "gamma": ", ".join(item for item in gammas if item),
                    "certifications": row.get("Certifications"),
                }.items()
                if text(value)
            },
            "variants": [
                {
                    "sku": product_number if color is None else f"{product_number}-{slugify(color)}",
                    "name": " / ".join(part for part in [color, size] if part) or product_number,
                    "color": color,
                    "size": size,
                    "priceCents": price,
                    "stock": 999,
                }
                for color in variant_colors
            ],
        }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    normalized = list(products.values())
    output_path.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Normalized {len(normalized)} products with {sum(len(item['variants']) for item in normalized)} variants.")
    if skipped:
        print(f"Skipped {len(skipped)} rows without product info or matching price.")
        print(json.dumps(skipped[:20], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: python scripts/normalize-velilla-csv.py <product_info.csv> <prices.csv> <output.json>")
    normalize(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
