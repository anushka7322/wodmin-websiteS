"""WODMIN PDF generators — catalogue & spec sheets using ReportLab."""
from __future__ import annotations

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


TERRACOTTA = colors.HexColor("#C25934")
WALNUT = colors.HexColor("#2C2621")
MOCHA = colors.HexColor("#756F68")
SAND = colors.HexColor("#F4F0EA")


def _styles() -> dict:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("title", parent=base["Title"], fontName="Helvetica-Bold", textColor=WALNUT, fontSize=28, leading=32, spaceAfter=8),
        "tagline": ParagraphStyle("tagline", parent=base["Normal"], textColor=TERRACOTTA, fontSize=11, leading=14, spaceAfter=16),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="Helvetica-Bold", textColor=WALNUT, fontSize=16, leading=20, spaceAfter=6),
        "h3": ParagraphStyle("h3", parent=base["Heading3"], fontName="Helvetica-Bold", textColor=WALNUT, fontSize=12, leading=15, spaceAfter=4),
        "body": ParagraphStyle("body", parent=base["Normal"], fontName="Helvetica", textColor=WALNUT, fontSize=10, leading=14),
        "muted": ParagraphStyle("muted", parent=base["Normal"], fontName="Helvetica", textColor=MOCHA, fontSize=9, leading=12),
        "price": ParagraphStyle("price", parent=base["Normal"], fontName="Helvetica-Bold", textColor=TERRACOTTA, fontSize=14, leading=18),
    }


def _safe_image(url: str, max_w_cm: float, max_h_cm: float) -> Image | None:
    try:
        import requests
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        img = Image(BytesIO(r.content))
        # scale to fit
        iw, ih = img.imageWidth, img.imageHeight
        ratio = min((max_w_cm * cm) / iw, (max_h_cm * cm) / ih)
        img.drawWidth = iw * ratio
        img.drawHeight = ih * ratio
        return img
    except Exception:
        return None


def _header(story: list, styles: dict, title: str) -> None:
    story.append(Paragraph("WODMIN", styles["title"]))
    story.append(Paragraph("Modern Furniture for Every Home", styles["tagline"]))
    story.append(Paragraph(title, styles["h2"]))
    story.append(Spacer(1, 0.2 * cm))


def _footer_table() -> Table:
    data = [["WODMIN", "hello@wodmin.in", "+91 98765 43210", "wodmin.in"]]
    t = Table(data, colWidths=[3 * cm, 5 * cm, 4 * cm, 4 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (-1, -1), MOCHA),
        ("LINEABOVE", (0, 0), (-1, 0), 0.5, MOCHA),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, 0), (0, 0), TERRACOTTA),
    ]))
    return t


def build_product_pdf(product: dict) -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _styles()
    story: list = []
    _header(story, styles, f"Specification Sheet — {product.get('name', '')}")

    img = _safe_image(product.get("main_image") or "", max_w_cm=16, max_h_cm=9)
    if img is not None:
        story.append(img)
        story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph(product.get("name", ""), styles["h2"]))
    story.append(Paragraph(f"SKU: {product.get('sku','')} · Category: {product.get('category_name','')}", styles["muted"]))
    story.append(Spacer(1, 0.2 * cm))

    price = f"₹{product.get('price', 0):,} (indicative, GST extra)"
    story.append(Paragraph(price, styles["price"]))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph(product.get("short_description", ""), styles["body"]))
    story.append(Spacer(1, 0.4 * cm))

    spec_rows = [
        ["Dimensions", product.get("dimensions", "—")],
        ["Weight", f"{product.get('weight_kg', '—')} kg"],
        ["Materials", ", ".join(product.get("materials", [])) or "—"],
        ["Colours", ", ".join(product.get("colours", [])) or "—"],
        ["Sizes", ", ".join(product.get("sizes", [])) or "—"],
        ["Warranty", product.get("warranty", "—")],
        ["Stock", product.get("stock_status", "—")],
    ]
    t = Table(spec_rows, colWidths=[4.5 * cm, 12 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), MOCHA),
        ("TEXTCOLOR", (1, 0), (1, -1), WALNUT),
        ("BACKGROUND", (0, 0), (0, -1), SAND),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.white, colors.HexColor("#FDFBF7")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5 * cm))

    story.append(Paragraph("Care Instructions", styles["h3"]))
    for c in product.get("care_instructions") or []:
        story.append(Paragraph(f"• {c}", styles["body"]))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Delivery", styles["h3"]))
    story.append(Paragraph(product.get("delivery_info", ""), styles["body"]))
    story.append(Spacer(1, 0.6 * cm))

    story.append(_footer_table())
    doc.build(story)
    return buf.getvalue()


def build_catalogue_pdf(products: list[dict], title: str = "WODMIN Catalogue 2026") -> bytes:
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = _styles()
    story: list = []
    _header(story, styles, title)
    story.append(Paragraph(
        "Affordable, reliable and modern furniture for every Indian home. "
        "Browse our handpicked selection and reach out via WhatsApp, phone or email for a personalised quote.",
        styles["body"],
    ))
    story.append(Spacer(1, 0.5 * cm))

    # Group by category
    by_cat: dict[str, list[dict]] = {}
    for p in products:
        by_cat.setdefault(p.get("category_name", "Other"), []).append(p)

    first = True
    for cat_name, items in by_cat.items():
        if not first:
            story.append(PageBreak())
        first = False
        story.append(Paragraph(cat_name, styles["h2"]))
        story.append(Spacer(1, 0.2 * cm))
        for p in items[:6]:
            row = []
            img = _safe_image(p.get("main_image") or "", max_w_cm=4, max_h_cm=3)
            row.append(img if img else Paragraph("(image)", styles["muted"]))
            info = [
                Paragraph(f"<b>{p.get('name','')}</b>", styles["body"]),
                Paragraph(p.get("short_description", ""), styles["muted"]),
                Paragraph(
                    f"<b>₹{p.get('price', 0):,}</b> &nbsp; SKU: {p.get('sku','')} &nbsp; {p.get('warranty','')}",
                    styles["body"],
                ),
            ]
            row.append(info)
            t = Table([row], colWidths=[5 * cm, 11 * cm])
            t.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LINEBELOW", (0, 0), (-1, -1), 0.4, SAND),
            ]))
            story.append(t)
        story.append(Spacer(1, 0.4 * cm))

    story.append(_footer_table())
    doc.build(story)
    return buf.getvalue()
