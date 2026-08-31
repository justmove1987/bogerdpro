from __future__ import annotations

import csv
import html
import json
import re
import sys
import unicodedata
from collections import OrderedDict
from pathlib import Path

import pandas as pd


EPI_CLASSES = {
    "Protección de los pies",
    "Protección de las manos",
    "Protección de la cabeza",
    "Protección anticaídas",
}

CATALOG_CATEGORY_BY_CLASS = {
    "Protección de los pies": "Calzado de trabajo",
    "Protección de las manos": "Equipos de protección",
    "Protección de la cabeza": "Equipos de protección",
    "Protección anticaídas": "Equipos de protección",
}

TRAILING_COLOR_WORDS = {
    "AHUMADO",
    "AMARELO",
    "AMARILLO",
    "AZUL",
    "BC",
    "BEIGE",
    "BL",
    "BLANC",
    "BLANCO",
    "BLANCA",
    "BLEU",
    "CLEAR",
    "FU",
    "GRIS",
    "IN",
    "JA",
    "JAUNE",
    "KAKI",
    "MARRON",
    "MARRÓN",
    "NARANJA",
    "NATURAL",
    "NEGRO",
    "NEGRA",
    "NOIR",
    "OR",
    "ORANGE",
    "RO",
    "ROJO",
    "ROJA",
    "ROUGE",
    "SMOKE",
    "TRANSPARENTE",
    "VE",
    "VERDE",
    "VERT",
}


def text(value):
    if value is None or pd.isna(value):
        return None
    value = html.unescape(str(value)).replace("\u00a0", " ")
    value = re.sub(r"<br\s*/?>", "\n", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value or None


def slugify(value):
    value = unicodedata.normalize("NFD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.lower()).strip("-")
    return value or "producte"


def base_product_number(value):
    parts = (text(value) or "").split()
    while len(parts) > 1 and parts[-1].upper() in TRAILING_COLOR_WORDS:
        parts.pop()
    return " ".join(parts) or (text(value) or "")


def cents(value):
    value = text(value)
    if not value:
        return None
    return int(round(float(value.replace(".", "").replace(",", ".")) * 100))


def spec(label, value):
    value = text(value)
    if not value:
        return None
    return {"label": label, "value": value}


def unique(values, limit=None):
    result = []
    for value in values:
        value = text(value)
        if value and value not in result:
            result.append(value)
            if limit and len(result) >= limit:
                break
    return result


def column_name(frame, *candidates):
    normalized = {unicodedata.normalize("NFD", str(column)).encode("ascii", "ignore").decode("ascii").lower(): column for column in frame.columns}
    for candidate in candidates:
        key = unicodedata.normalize("NFD", candidate).encode("ascii", "ignore").decode("ascii").lower()
        if key in normalized:
            return normalized[key]
    for column in frame.columns:
        column_text = str(column).lower()
        if all(part.lower() in column_text for part in candidates):
            return column
    return None


def col_values(frame, *candidates):
    name = column_name(frame, *candidates)
    return frame[name] if name else []


def clean_size(value):
    value = text(value)
    if not value:
        return None
    replacements = {
        "�nica": "Única",
        "Unica": "Única",
        "UNICA": "Única",
    }
    return replacements.get(value, value)


def title_from_group(group, fallback_code):
    descriptions = unique(group.get("Short description", []), limit=3)
    if descriptions:
        best = descriptions[0].rstrip(".")
        if len(best) >= 6 and not re.fullmatch(r"[\d\s./+-]+", best):
            return best

    labels = unique(group.get("Product Label", []), limit=3)
    if labels:
        label = labels[0]
        label = re.sub(r"\s+\d{1,2}(?:/\d{1,2})?$", "", label).strip()
        return label[:1].upper() + label[1:].lower()

    return fallback_code


def load_ready_prices(audit_csv_path: Path):
    ready = {}
    with audit_csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if row.get("status") != "ready":
                continue
            product_name = text(row.get("product_name_excel"))
            price = cents(row.get("price_eur"))
            if product_name and price and price > 0:
                ready[product_name] = {
                    "priceCents": price,
                    "priceEur": row.get("price_eur"),
                    "confidence": row.get("confidence"),
                    "matchType": row.get("match_type"),
                    "matchedTariffKey": row.get("matched_tariff_key"),
                    "pdfPages": row.get("pdf_pages"),
                    "samplePdfLine": row.get("sample_pdf_line"),
                }
    return ready


def normalize(xlsx_path: Path, audit_csv_path: Path, output_path: Path):
    ready_prices = load_ready_prices(audit_csv_path)
    df = pd.read_excel(xlsx_path, sheet_name="exported_items")

    for column in df.columns:
        df[column] = df[column].map(text)

    df = df[df["Classe 1"].isin(EPI_CLASSES)].copy()
    df = df[df["Nom commercial"].isin(ready_prices)].copy()

    products = OrderedDict()
    skipped = []

    df["_base_product_number"] = df["Nom commercial"].map(base_product_number)
    product_names_by_original = {
        product_number: title_from_group(group, product_number)
        for product_number, group in df.groupby("Nom commercial", sort=True)
    }
    df["_normalized_product_name"] = df["Nom commercial"].map(product_names_by_original)
    df["_price_cents"] = df["Nom commercial"].map(lambda value: ready_prices[value]["priceCents"])
    df["_catalog_category"] = df["Classe 1"].map(lambda value: CATALOG_CATEGORY_BY_CLASS.get(value, "Equipos de protección"))
    df["_group_key"] = df.apply(
        lambda row: "||".join(
            [
                row["_base_product_number"] or "",
                row["_normalized_product_name"] or "",
                row["_catalog_category"] or "",
                str(row["_price_cents"] or ""),
            ]
        ),
        axis=1,
    )
    group_keys_by_base = df.groupby("_base_product_number")["_group_key"].nunique().to_dict()

    for group_key, group in df.groupby("_group_key", sort=True):
        base_number = text(group["_base_product_number"].iloc[0])
        original_numbers = unique(group["Nom commercial"])
        product_number = base_number if group_keys_by_base.get(base_number, 0) == 1 else original_numbers[0]
        prices = [ready_prices[name]["priceCents"] for name in unique(group["Nom commercial"]) if name in ready_prices]
        classe1_values = unique(group["Classe 1"], limit=3)
        classe2_values = unique(group["Classe 2"], limit=8)
        classe3_values = unique(group["Classe 3"], limit=8)
        classe1 = classe1_values[0] if classe1_values else None
        category = CATALOG_CATEGORY_BY_CLASS.get(classe1, "Equipos de protección")
        subcategory = classe2_values[0] if classe2_values else classe1
        name = title_from_group(group, product_number)
        description = text(group["Long description"].dropna().iloc[0]) if group["Long description"].dropna().size else None
        short_description = text(group["Short description"].dropna().iloc[0]) if group["Short description"].dropna().size else None
        material = text(group["Description"].dropna().iloc[0]) if group["Description"].dropna().size else None

        images = unique(
            list(group.get("Picture 1 HD URL", [])) + list(group.get("Picture 1 URL", [])),
            limit=12,
        )
        images = [url for url in images if url.startswith("http")]

        documents = []
        ft_url = text(group["FT URL"].dropna().iloc[0]) if group["FT URL"].dropna().size else None
        ce_url = text(group["DCEU-EPI URL"].dropna().iloc[0]) if group["DCEU-EPI URL"].dropna().size else None
        if ft_url and ft_url.startswith("http"):
            documents.append({"type": "TECHNICAL_SHEET", "title": "Ficha técnica", "url": ft_url})
        if ce_url and ce_url.startswith("http"):
            documents.append({"type": "CE_DECLARATION", "title": "Declaración CE", "url": ce_url})

        specifications = [
            item
            for item in [
                spec("Gama", ", ".join(unique(group["Gamme"], limit=5))),
                spec("Riesgos", ", ".join(unique(group["Riesgos"], limit=8))),
                spec("Normas", ", ".join(unique(col_values(group, "Normes", "Deck"), limit=8))),
                spec("Categorías CE", ", ".join(unique(col_values(group, "Categor"), limit=8))),
                spec("Familia EPI", classe1),
                spec("Subfamilia", ", ".join(classe2_values)),
                spec("Tipo", ", ".join(classe3_values)),
                spec("Composición", material),
                spec("Destacados", ", ".join(unique(group["Highlights"], limit=5))),
                spec("Instrucciones de uso", ", ".join(unique(group["Instructions for use"], limit=3))),
                spec("País de origen", ", ".join(unique(group["Country of origin"], limit=5))),
                spec("Código arancelario", ", ".join(unique(group["Customs code"], limit=5))),
                spec("Unidades por caja", ", ".join(unique(group["PCB"], limit=5))),
                spec("Unidades mínimas", ", ".join(unique(group["SPCB"], limit=5))),
                spec("Precio tarifa Delta Plus 08/2025", f"{min(prices) / 100:.2f} - {max(prices) / 100:.2f} EUR" if min(prices) != max(prices) else f"{min(prices) / 100:.2f} EUR"),
            ]
            if item
        ]

        product = {
            "productNumber": f"DELTA-{product_number}",
            "name": name,
            "slug": f"{slugify(name)}-delta-{slugify(product_number)}",
            "description": description or short_description,
            "gender": "Unisex",
            "material": material,
            "category": category,
            "subcategory": subcategory,
            "brand": "Delta Plus",
            "images": images,
            "documents": documents,
            "specifications": specifications,
            "attributes": {
                key: value
                for key, value in {
                    "supplier": "Delta Plus",
                    "supplierProduct": product_number,
                    "epiFamily": classe1,
                    "epiSubfamily": ", ".join(classe2_values),
                    "epiType": ", ".join(classe3_values),
                    "tariff": "PVP 08/2025",
                }.items()
                if value
            },
            "variants": [],
        }

        seen_skus = set()
        for _, row in group.iterrows():
            sku = text(row.get("SKU code"))
            if not sku or sku in seen_skus:
                continue
            seen_skus.add(sku)
            row_product_number = text(row.get("Nom commercial"))
            row_price = ready_prices[row_product_number]["priceCents"]
            color = text(row.get("Color"))
            size = clean_size(row.get("Size"))
            product["variants"].append(
                {
                    "sku": sku,
                    "name": " / ".join(part for part in [color, size] if part) or sku,
                    "color": color,
                    "size": size,
                    "priceCents": row_price,
                    "stock": 999,
                }
            )

        if product["variants"]:
            products[product_number] = product
        else:
            skipped.append({"productNumber": product_number, "reason": "no variants"})

    normalized = list(products.values())
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Normalized {len(normalized)} Delta Plus EPI products with {sum(len(item['variants']) for item in normalized)} variants.")
    if skipped:
        print(f"Skipped {len(skipped)} products.")
        print(json.dumps(skipped[:20], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: python scripts/normalize-deltaplus-epi.py <delta.xlsx> <audit.csv> <output.json>")
    normalize(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
