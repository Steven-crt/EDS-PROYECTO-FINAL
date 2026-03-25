import sys
try:
    import PyPDF2
    with open(r"e:\Steven\EDS PROYECTO FINAL\eds-web\Presentacion EDS_2024.pdf", "rb") as f:
        r = PyPDF2.PdfReader(f)
        text = ""
        for page in r.pages:
            text += page.extract_text() + "\n"
        print(text[:3000])
except Exception as e:
    print(f"Error: {e}")
