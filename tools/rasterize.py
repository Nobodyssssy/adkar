"""
Rasterize broken PDFs into per-page JPGs for the reader's image mode.

Usage:
  python tools/rasterize.py "assets/books/<cat>/<file>.pdf"
  python tools/rasterize.py --all     # run on BROKEN_BOOKS list below

Produces:
  assets/books/<cat>/<file>-pages/page-001.jpg, page-002.jpg, ...
"""
import sys, pathlib

try:
    import fitz  # pymupdf
except ImportError:
    print("pymupdf not installed. Run: pip install pymupdf")
    sys.exit(1)

# Books known to render incorrectly in-browser. Add as you find more.
BROKEN_BOOKS = [
    "assets/books/1. القرآن وعلومه - Quran & Its Sciences/31-faedah-fi-tdabbor-alquran-ara.pdf",
    "assets/books/3. السيرة النبوية والتاريخ - Prophet's Biography & History/متن الأرجوزة الميئية في ذكر حال أشرف البرية الشيخ علي بن أبي العز الحنفي.pdf",
    "assets/books/4. العقيدة والتوحيد - Islamic Creed & Theology/ashareeah-fi-alislam_arb.pdf",
    "assets/books/4. العقيدة والتوحيد - Islamic Creed & Theology/شرح أسماء الله الحسنى (لـ سعيد بن علي بن وهف القحطاني أو عبد الرزاق البدر).pdf",
    "assets/books/6. الرقائق، الأذكار والتزكية - Purification of the Soul & Adhkar/10 وصايا للوقاية من الوباء.pdf",
    "assets/books/7. دراسات وقضايا معاصرة - Modern Studies & Issues/الدين الصحيح يحل جميع المشاكل.pdf",
    "assets/books/8. كتب عامة وأدب - General Books & Literature/The Art of War (Sun Tzu ).pdf",
]

DPI = 150          # 150 dpi is a good balance; bump to 200 for sharper
JPEG_QUALITY = 85  # 85 keeps files small with little visible loss


def rasterize(pdf_path):
    pdf_path = pathlib.Path(pdf_path)
    if not pdf_path.exists():
        print(f"[skip] not found: {pdf_path}")
        return

    out_dir = pdf_path.with_name(pdf_path.stem + "-pages")

    # Skip if already rasterized
    if out_dir.exists():
        existing = list(out_dir.glob("page-*.jpg"))
        if existing:
            print(f"[skip] already rasterized: {len(existing)} pages in {out_dir}")
            return

    out_dir.mkdir(exist_ok=True)

    doc = fitz.open(pdf_path)
    zoom = DPI / 72.0
    mat = fitz.Matrix(zoom, zoom)

    for i, page in enumerate(doc, start=1):
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out = out_dir / f"page-{i:03d}.jpg"
        pix.save(out, jpg_quality=JPEG_QUALITY)
        print(f"  page {i}/{len(doc)} -> {out.name} ({out.stat().st_size // 1024} KB)")

    doc.close()
    print(f"[done] {len(list(out_dir.glob('page-*.jpg')))} pages in {out_dir}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    if sys.argv[1] == "--all":
        for p in BROKEN_BOOKS:
            print(f"\n=== {p} ===")
            rasterize(p)
    else:
        rasterize(sys.argv[1])