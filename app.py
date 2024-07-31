from flask import Flask, render_template, request, redirect, url_for, jsonify
import pandas as pd
from ftplib import FTP
import io
import json
import os
import time

app = Flask(__name__)

# Cargar configuración
with open('config.json') as config_file:
    config = json.load(config_file)

def fetch_excel_file():
    if config['source'] == 'ftp':
        ftp = FTP(config['ftp']['host'])
        ftp.login(config['ftp']['user'], config['ftp']['pass'])
        with io.BytesIO() as f:
            ftp.retrbinary(f"RETR {config['ftp']['file_path']}", f.write)
            f.seek(0)
            df = pd.read_excel(f)
        ftp.quit()
    elif config['source'] == 'local':
        df = pd.read_excel(config['local']['file_path'])
    return df

def get_file_info():
    file_path = config['local']['file_path']
    file_name = os.path.basename(file_path)
    modification_time = time.ctime(os.path.getmtime(file_path))
    return file_name, modification_time

def save_excel_file():
    global df
    if config['source'] == 'local':
        df.to_excel(config['local']['file_path'], index=False)

df = fetch_excel_file()

@app.route('/')
def index():
    global df
    file_name, modification_time = get_file_info()
    return render_template('index.html', data=df.to_dict(orient='records'), file_name=file_name, modification_time=modification_time)

@app.route('/update', methods=['POST'])
def update():
    global df
    data = request.json
    for item in data:
        try:
            valor = float(item['valor'])
            df.loc[df['moneda'] == item['moneda'], 'valor'] = valor
        except ValueError:
            return jsonify(success=False, message="Invalid value for 'valor'")
    save_excel_file()
    return jsonify(success=True)

@app.route('/refresh')
def refresh():
    global df
    df = fetch_excel_file()
    return redirect(url_for('index'))

@app.route('/service-worker.js')
def service_worker():
    return app.send_static_file('service-worker.js')

if __name__ == "__main__":
    app.run(debug=True)
