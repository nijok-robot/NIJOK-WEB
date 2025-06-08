from flask import Flask, make_response, request, send_file, render_template, redirect, url_for, session, flash, jsonify
import os
import time
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'cable_robot_secret_key'

UPLOAD_FOLDER = '/home/nijokrobot/ESP32_CAM/static/images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

robot_data = {
    'velocidad_actual': 0.0,
    'velocidad_referencia': 0.0,
    'tem_motor1': 0.0,
    'tem_motor2': 0.0,
    'corr_motor1': 0.0,
    'corr_motor2': 0.0,
    'distancia_total': 0,
    'voltaje_24v': 0.0,
    'last_update': time.time()
}


ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'password'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        session['logged_in'] = True
        return redirect(url_for('dashboard'))
    else:
        flash('Invalid credentials')
        return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if not session.get('logged_in'):
        flash('Please log in to access the dashboard')
        return redirect(url_for('index'))

    current_time = time.time()
    time_diff = current_time - robot_data['last_update']

    robot_data['distance'] += robot_data['speed'] * time_diff * 0.1
    robot_data['battery'] = max(0, min(100, robot_data['battery'] - time_diff * 0.001))
    robot_data['temperature'] = max(20, min(50, robot_data['temperature'] + (time.time() % 2 - 1) * 0.1))
    robot_data['last_update'] = current_time

    formatted_data = {
        'speed': f"{robot_data['speed']:.1f}",
        'distance': f"{robot_data['distance']:.1f}",
        'battery': f"{robot_data['battery']:.0f}",
        'temperature': f"{robot_data['temperature']:.1f}",
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

    return render_template('dashboard.html', robot_data=formatted_data)

@app.route('/api/update_robot_data', methods=['POST'])
def update_robot_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data received'}), 400

        robot_data['velocidad_actual'] = float(data.get('velocidad_actual', 0))
        robot_data['velocidad_referencia'] = float(data.get('velocidad_referencia', 0))
        robot_data['tem_motor1'] = float(data.get('tem_motor1', 0))
        robot_data['tem_motor2'] = float(data.get('tem_motor2', 0))
        robot_data['corr_motor1'] = float(data.get('corr_motor1', 0))
        robot_data['corr_motor2'] = float(data.get('corr_motor2', 0))
        robot_data['distancia_total'] = int(data.get('distancia_total', 0))
        robot_data['voltaje_24v'] = float(data.get('voltaje_24v', 0))
        robot_data['last_update'] = time.time()

        return jsonify({'status': 'success'}), 200
    except Exception as e:
        app.logger.error(f"Error updating robot data: {e}")
        return jsonify({'error': 'Failed to update data'}), 500



@app.route('/upload', methods=['POST'])
def upload_image():
    camera_id = request.args.get('camera', '1')

    if not camera_id.isdigit():
        return 'Invalid camera ID', 400

    if 'file' in request.files:
        image_file = request.files['file']
        if image_file.filename == '':
            return 'No selected file', 400

        file_path = os.path.join(UPLOAD_FOLDER, f'cam{camera_id}.jpg')
        try:
            image_file.save(file_path)
            app.logger.info(f"Saved image for camera {camera_id} at {file_path}")
            return 'Image received (multipart)', 200
        except Exception as e:
            app.logger.error(f"Error saving image for camera {camera_id}: {e}")
            return 'Failed to save image', 500

    elif request.data:
        try:
            file_path = os.path.join(UPLOAD_FOLDER, f'cam{camera_id}.jpg')
            with open(file_path, 'wb') as f:
                f.write(request.data)
            app.logger.info(f"Saved raw image for camera {camera_id} at {file_path}")
            return 'Image received (raw)', 200
        except Exception as e:
            app.logger.error(f"Error saving raw image for camera {camera_id}: {e}")
            return 'Failed to save image', 500

    return 'No image data received', 400


@app.route('/get_camera/<camera_id>')
def get_camera(camera_id):
    camera_file = f'cam{camera_id}.jpg'
    camera_path = os.path.join(UPLOAD_FOLDER, camera_file)
    placeholder_path = os.path.join(UPLOAD_FOLDER, 'placeholder.jpg')

    # Si existe la imagen pedida → usarla
    if os.path.exists(camera_path):
        selected_path = camera_path
    # Si no, usa el placeholder
    elif os.path.exists(placeholder_path):
        selected_path = placeholder_path
    else:
        return "Image not found", 404

    try:
        response = make_response(send_file(selected_path, mimetype='image/jpeg'))
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        return response
    except Exception as e:
        app.logger.error(f"Error sending file {selected_path}: {e}")
        return "Error serving image", 500

@app.route('/api/robot_data')
def get_robot_data():
    return jsonify({
        'speed': robot_data['speed'],
        'distance': robot_data['distance'],
        'battery': robot_data['battery'],
        'temperature': robot_data['temperature'],
        'last_update': robot_data['last_update']
    })


@app.route('/emergency_stop', methods=['POST'])
def emergency_stop():
    robot_data['speed'] = 0
    return jsonify({'status': 'success', 'message': 'Emergency stop activated'})

@app.route('/restart_system', methods=['POST'])
def restart_system():
    robot_data['speed'] = 0
    robot_data['temperature'] = 28.5
    return jsonify({'status': 'success', 'message': 'System restarted'})

@app.route('/save_images', methods=['POST'])
def save_images():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    position = robot_data['distance']
    return jsonify({
        'status': 'success',
        'message': f'Images saved at position {position:.1f}m',
        'timestamp': timestamp
    })

@app.route('/history')
def history():
    if not session.get('logged_in'):
        flash('Please log in to access the history')
        return redirect(url_for('index'))

    history_data = []
    current_distance = float(robot_data['distance'])
    for i in range(10):
        point_distance = max(0, current_distance - (i * 5))
        history_data.append({
            'distance': point_distance,
            'timestamp': (datetime.now().timestamp() - (i * 600)),
            'cameras': [1, 2, 3]
        })

    history_data.sort(key=lambda x: x['distance'])

    return render_template('history.html', history_data=history_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
