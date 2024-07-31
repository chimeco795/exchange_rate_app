@echo off

echo Creando entorno virtual...
python -m venv venv

echo Activando entorno virtual...
call venv\Scripts\activate

echo Instalando dependencias...
pip install -r requirements.txt

echo Instalación completa. Para activar el entorno virtual, usa 'venv\Scripts\activate'.
pause
