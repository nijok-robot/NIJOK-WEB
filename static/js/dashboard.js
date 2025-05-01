document.addEventListener('DOMContentLoaded', function() {
    // Theme switching
    const themeBtn = document.getElementById('theme-btn');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    const app = document.getElementById('app');
    
    // Default theme
    let currentTheme = localStorage.getItem('robot-dashboard-theme') || 'dark';
    applyTheme(currentTheme);
    
    // Toggle theme dropdown
    themeBtn.addEventListener('click', () => {
        themeDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!themeBtn.contains(e.target) && !themeDropdown.contains(e.target)) {
            themeDropdown.classList.remove('active');
        }
    });
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            currentTheme = theme;
            localStorage.setItem('robot-dashboard-theme', theme);
            applyTheme(theme);
            themeDropdown.classList.remove('active');
            
            // Update active theme in dropdown
            themeOptions.forEach(opt => {
                if (opt.getAttribute('data-theme') === theme) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        });
    });
    
    function applyTheme(theme) {
        // Remove all theme classes from body
        document.body.className = '';
        
        // Add the selected theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Update theme icon
        updateThemeIcon(theme);
    }
    
    function updateThemeIcon(theme) {
        const iconElement = themeBtn.querySelector('svg');
        
        // Update icon path based on theme
        switch(theme) {
            case 'light':
                updateSVGPath(iconElement, 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
                break;
            case 'dark':
                updateSVGPath(iconElement, 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
                break;
            case 'cyberpunk':
                updateSVGPath(iconElement, 'M4 6h16M4 12h16M4 18h16');
                break;
            case 'nature':
                updateSVGPath(iconElement, 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z');
                break;
            case 'terminal':
                updateSVGPath(iconElement, 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z');
                break;
            default:
                updateSVGPath(iconElement, 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
        }
    }
    
    function updateSVGPath(iconElement, pathData) {
        // Clear existing paths
        while (iconElement.firstChild) {
            iconElement.removeChild(iconElement.firstChild);
        }
        
        // Create new path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        
        iconElement.appendChild(path);
    }
    
    // Camera modal
    const cameraFeeds = document.querySelectorAll('.camera-feed');
    const cameraModal = document.getElementById('camera-modal');
    const modalCameraImg = document.getElementById('modal-camera-img');
    const modalCameraLabel = document.getElementById('modal-camera-label');
    const modalCameraTitle = document.getElementById('modal-camera-title');
    const closeModalBtn = document.getElementById('close-camera-modal');
    
    cameraFeeds.forEach(feed => {
        feed.addEventListener('click', () => {
            const cameraId = feed.getAttribute('data-camera');
            const cameraImg = feed.querySelector('img').src;
            
            modalCameraImg.src = cameraImg;
            modalCameraLabel.textContent = `Camera ${cameraId} - Live Feed`;
            modalCameraTitle.textContent = `Camera ${cameraId} Details`;
            
            // Update position and timestamp in modal
            document.getElementById('modal-position').textContent = document.getElementById('current-position').textContent;
            document.getElementById('modal-timestamp').textContent = new Date().toLocaleTimeString();
            
            cameraModal.classList.add('active');
        });
    });
    
    closeModalBtn.addEventListener('click', () => {
        cameraModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    cameraModal.addEventListener('click', function(e) {
        if (e.target === cameraModal) {
            cameraModal.classList.remove('active');
        }
    });
    
    // Cable length input
    const cableLengthInput = document.getElementById('cable-length');
    const totalLengthSpan = document.getElementById('total-length');
    const progressBar = document.getElementById('progress-bar');
    const progressPercentage = document.getElementById('progress-percentage');
    
    cableLengthInput.addEventListener('change', updateProgress);
    
    function updateProgress() {
        const totalLength = parseFloat(cableLengthInput.value);
        const currentDistance = parseFloat(document.getElementById('distance-traveled').textContent);
        
        if (isNaN(totalLength) || totalLength <= 0) {
            cableLengthInput.value = 100;
            return;
        }
        
        totalLengthSpan.textContent = `${totalLength}m`;
        
        const progress = (currentDistance / totalLength) * 100;
        progressBar.style.width = `${Math.min(100, progress)}%`;
        progressPercentage.textContent = `${progress.toFixed(1)}%`;
    }
    
    // Control buttons
    const emergencyStopBtn = document.getElementById('emergency-stop-btn');
    const restartSystemBtn = document.getElementById('restart-system-btn');
    const saveImagesBtn = document.getElementById('save-images-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    
    emergencyStopBtn.addEventListener('click', () => {
        fetch('/emergency_stop', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            showToast('Emergency Stop', data.message, 'alert-triangle', 'danger');
            document.getElementById('current-speed').textContent = '0.0 m/s';
            document.getElementById('speed-bar').style.width = '0%';
        });
    });
    
    restartSystemBtn.addEventListener('click', () => {
        fetch('/restart_system', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            showToast('System Restart', data.message, 'refresh-cw', 'primary');
            document.getElementById('current-speed').textContent = '0.0 m/s';
            document.getElementById('speed-bar').style.width = '0%';
        });
    });
    
    function saveImages() {
        fetch('/save_images', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            showToast('Images Saved', data.message, 'download', 'success');
        });
    }
    
    saveImagesBtn.addEventListener('click', saveImages);
    modalSaveBtn.addEventListener('click', saveImages);
    
    // Toast notification
    function showToast(title, message, iconType, type) {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        // Update icon based on type
        const iconSVG = toastIcon.querySelector('svg');
        
        switch(iconType) {
            case 'alert-triangle':
                updateSVGPath(iconSVG, 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v2 M12 17h.01');
                break;
            case 'refresh-cw':
                updateSVGPath(iconSVG, 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15');
                break;
            case 'download':
                updateSVGPath(iconSVG, 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3');
                break;
            default:
                updateSVGPath(iconSVG, 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3');
        }
        
        // Update color based on type
        switch(type) {
            case 'danger':
                toastIcon.style.color = 'var(--danger)';
                break;
            case 'success':
                toastIcon.style.color = 'var(--success)';
                break;
            case 'warning':
                toastIcon.style.color = 'var(--warning)';
                break;
            default:
                toastIcon.style.color = 'var(--primary)';
        }
        
        // Show toast
        toast.classList.add('active');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }
    
    // Fetch robot data periodically
    function updateRobotData() {
        fetch('/api/robot_data')
            .then(response => response.json())
            .then(data => {
                document.getElementById('current-speed').textContent = `${parseFloat(data.speed).toFixed(1)} m/s`;
                document.getElementById('speed-bar').style.width = `${Math.min(100, data.speed * 50)}%`;
                
                document.getElementById('distance-traveled').textContent = `${parseFloat(data.distance).toFixed(1)} m`;
                document.getElementById('current-position').textContent = `${parseFloat(data.distance).toFixed(1)}m`;
                
                document.getElementById('battery-level').textContent = `${parseInt(data.battery)}%`;
                document.getElementById('battery-bar').style.width = `${data.battery}%`;
                
                // Update battery bar color based on level
                const batteryBar = document.getElementById('battery-bar');
                if (data.battery > 60) {
                    batteryBar.className = 'progress-fill';
                } else if (data.battery > 30) {
                    batteryBar.className = 'progress-fill warning';
                } else {
                    batteryBar.className = 'progress-fill danger';
                }
                
                document.getElementById('temperature').textContent = `${parseFloat(data.temperature).toFixed(1)}°C`;
                document.getElementById('temp-bar').style.width = `${Math.min(100, (data.temperature - 20) * (100 / 30))}%`;
                
                // Update temperature bar color based on level
                const tempBar = document.getElementById('temp-bar');
                if (data.temperature > 40) {
                    tempBar.className = 'progress-fill danger';
                } else if (data.temperature > 35) {
                    tempBar.className = 'progress-fill warning';
                } else {
                    tempBar.className = 'progress-fill';
                }
                
                const distance = parseFloat(data.distance).toFixed(1);
                document.querySelectorAll('[id^="camera-distance-"]').forEach(el => {
                    el.textContent = `${distance}m`;
                });

                // Update progress
                updateProgress();
            });
    }
    
    // Update data initially and then every 5 seconds
    updateRobotData();
    setInterval(updateRobotData, 5000);
    
    // Refresh camera images every 5 seconds
    function refreshCameraImages() {
        const cameraImages = document.querySelectorAll('.camera-img');
        cameraImages.forEach(img => {
            const cameraId = img.getAttribute('data-camera');
            const timestamp = new Date().getTime(); // Add timestamp to prevent caching
            img.src = `/get_camera/${cameraId}?t=${timestamp}`;
        });
    }
    
    setInterval(refreshCameraImages, 5000);
    
    // Initialize progress bar
    updateProgress();
});