# Importar módulo del sistema
import sys

# Bloque try-except para manejar errores durante la lectura del PDF
try:
    # Importar la librería PyPDF2 para manipular archivos PDF
    import PyPDF2

    # Abrir el archivo PDF en modo binario de lectura
    with open(
        r"e:\Steven\EDS PROYECTO FINAL\eds-web\Presentacion EDS_2024.pdf", "rb"
    ) as f:
        # Crear un lector de PDF a partir del archivo abierto
        r = PyPDF2.PdfReader(f)

        # Inicializar variable para almacenar el texto extraído
        text = ""

        # Recorrer cada página del PDF y extraer su contenido de texto
        for page in r.pages:
            text += page.extract_text() + "\n"

        # Mostrar los primeros 3000 caracteres del texto extraído
        print(text[:3000])

# Capturar y mostrar cualquier error que ocurra durante la ejecución
except Exception as e:
    print(f"Error: {e}")
