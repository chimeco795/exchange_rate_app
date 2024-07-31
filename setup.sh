#!/bin/bash

echo "Creando entorno virtual..."
python3 -m venv venv

echo "Activando entorno virtual..."
source venv/bin/activate

echo "Instalando dependencias..."
pip install -r requirements.txt

echo "Instalación completa. Para activar el entorno virtual, usa 'source venv/bin/activate'."
