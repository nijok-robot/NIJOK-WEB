from flask import Flask, request, send_file, render_template
import os

app = Flask(__name__)

UPLOAD_FOLDER = 'static'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    image_data = request.data
    with open(os.path.join(UPLOAD_FOLDER, 'cam1.jpg'), 'wb') as f:
        f.write(image_data)
    return 'Image received', 200

@app.route('/cam')
def get_image():
    return send_file(os.path.join(UPLOAD_FOLDER, 'cam1.jpg'), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)