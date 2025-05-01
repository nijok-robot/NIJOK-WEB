from flask import Flask, make_response, request, send_file, render_template, redirect, url_for, session, flash, jsonify
import os
import time
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'cable_robot_secret_key'  # Change this to a random secret key in production
UPLOAD_FOLDER = 'static/images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Simulated robot data - in a real app, this would come from a database or the robot itself
robot_data = {
    'speed': 0.5,
    'distance': 42.7,
    'battery': 78,
    'temperature': 32.4,
    'last_update': time.time()
}

# Simple authentication - in a real app, use a proper authentication system
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
    
    # Update simulated robot data
    current_time = time.time()
    time_diff = current_time - robot_data['last_update']
    
    # Simulate data changes
    robot_data['distance'] += robot_data['speed'] * time_diff * 0.1
    robot_data['battery'] = max(0, min(100, robot_data['battery'] - time_diff * 0.001))
    robot_data['temperature'] = max(20, min(50, robot_data['temperature'] + (time.time() % 2 - 1) * 0.1))
    robot_data['last_update'] = current_time
    
    # Format data for display
    formatted_data = {
        'speed': f"{robot_data['speed']:.1f}",
        'distance': f"{robot_data['distance']:.1f}",
        'battery': f"{robot_data['battery']:.0f}",
        'temperature': f"{robot_data['temperature']:.1f}",
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return render_template('dashboard.html', robot_data=formatted_data)

@app.route('/upload', methods=['POST'])
def upload_image():
    image_data = request.data
    camera_id = request.args.get('camera', '1')  # Default to camera 1 if not specified
    
    with open(os.path.join(UPLOAD_FOLDER, f'cam{camera_id}.jpg'), 'wb') as f:
        f.write(image_data)
    return 'Image received', 200

@app.route('/get_camera/<camera_id>')
def get_camera(camera_id):
    camera_file = f'cam{camera_id}.jpg'
    camera_path = os.path.join('static', 'images', camera_file)
    
    if not os.path.exists(camera_path):
        camera_path = os.path.join('static', 'images', 'placeholder.jpg')
    
    response = make_response(send_file(camera_path, mimetype='image/jpeg'))
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

@app.route('/api/robot_data')
def get_robot_data():
    # Update simulated robot data
    current_time = time.time()
    time_diff = current_time - robot_data['last_update']
    
    # Simulate data changes
    robot_data['speed'] = max(0, min(2, robot_data['speed'] + (time.time() % 2 - 1) * 0.05))
    robot_data['distance'] += robot_data['speed'] * time_diff * 0.1
    robot_data['battery'] = max(0, min(100, robot_data['battery'] - time_diff * 0.001))
    robot_data['temperature'] = max(20, min(50, robot_data['temperature'] + (time.time() % 2 - 1) * 0.1))
    robot_data['last_update'] = current_time
    
    return jsonify(robot_data)

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
    # In a real app, this would save the current camera images with metadata
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    position = robot_data['distance']
    
    # Simulate saving images
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
    
    # Simulamos datos históricos - en una app real, esto vendría de una base de datos
    history_data = []
    
    # Generamos datos de ejemplo para los últimos 10 puntos
    current_distance = float(robot_data['distance'])
    for i in range(10):
        point_distance = max(0, current_distance - (i * 5))
        history_data.append({
            'distance': point_distance,
            'timestamp': (datetime.now().timestamp() - (i * 600)),
            'cameras': [1, 2, 3]
        })
    
    # Ordenamos por distancia (de menor a mayor)
    history_data.sort(key=lambda x: x['distance'])
    
    return render_template('history.html', history_data=history_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')