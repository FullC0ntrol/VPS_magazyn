document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const fileList = document.getElementById('fileList');
    const refreshBtn = document.getElementById('refreshBtn');

    // Pobierz listę plików przy załadowaniu strony
    fetchFiles();

    // Obsługa formularza
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showNotification('Proszę wybrać plik', 'error');
            return;
        }

        uploadFile(fileInput.files[0]);
    });

    // Obsługa przeciągania i upuszczania plików
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            uploadFile(e.dataTransfer.files[0]);
        }
    });

    // Przycisk odświeżania
    refreshBtn.addEventListener('click', fetchFiles);

    // Funkcja do wysyłania pliku
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('myFile', file);

        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);

        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressText.textContent = percentComplete + '%';
            }
        };

        xhr.onload = function() {
            if (xhr.status === 200) {
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    showNotification('Plik został pomyślnie przesłany');
                    fetchFiles();
                    uploadForm.reset();
                }, 500);
            } else {
                showNotification('Wystąpił błąd podczas przesyłania pliku', 'error');
                progressContainer.style.display = 'none';
            }
        };

        xhr.onerror = function() {
            showNotification('Wystąpił błąd podczas przesyłania pliku', 'error');
            progressContainer.style.display = 'none';
        };

        xhr.send(formData);
    }

    // Funkcja do pobierania listy plików
    function fetchFiles() {
        fetch('/files')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(files => {
                renderFileList(files);
            })
            .catch(error => {
                console.error('Error fetching files:', error);
                showNotification('Wystąpił błąd podczas ładowania plików', 'error');
            });
    }

    // Funkcja do renderowania listy plików
    function renderFileList(files) {
        if (files.length === 0) {
            fileList.innerHTML = `
                <li class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>Brak plików. Dodaj swój pierwszy plik!</p>
                </li>
            `;
            return;
        }

        fileList.innerHTML = '';
        
        files.forEach(file => {
            const fileExt = file.split('.').pop().toLowerCase();
            const listItem = createFileListItem(file, fileExt);
            fileList.appendChild(listItem);
        });

        // Dodaj obsługę przycisków usuwania
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const filename = this.getAttribute('data-filename');
                deleteFile(filename);
            });
        });
    }

    // Funkcja tworząca element listy plików
    function createFileListItem(file, fileExt) {
        const iconClass = getFileIconClass(fileExt);
        const listItem = document.createElement('li');
        listItem.className = 'file-item';
        
        listItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div>
                    <div class="file-name" title="${file}">${file}</div>
                    <div class="file-size">${getFileSizeDisplay(file)}</div>
                </div>
            </div>
            <div class="file-actions">
                <a href="/uploads/${encodeURIComponent(file)}" class="btn-action btn-download" title="Pobierz" download>
                    <i class="fas fa-download"></i>
                </a>
                <button class="btn-action btn-delete" title="Usuń" data-filename="${file}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return listItem;
    }

    // Funkcja do usuwania plików
    function deleteFile(filename) {
        if (confirm(`Czy na pewno chcesz usunąć plik "${filename}"?`)) {
            fetch(`/delete/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    showNotification('Plik został usunięty');
                    fetchFiles();
                } else {
                    throw new Error('File deletion failed');
                }
            })
            .catch(error => {
                console.error('Error deleting file:', error);
                showNotification('Wystąpił błąd podczas usuwania pliku', 'error');
            });
        }
    }

    // Funkcja pokazująca powiadomienie
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Pomocnicza funkcja do ikon plików
    function getFileIconClass(ext) {
        const fileIcons = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'xls': 'fa-file-excel',
            'xlsx': 'fa-file-excel',
            'ppt': 'fa-file-powerpoint',
            'pptx': 'fa-file-powerpoint',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'gif': 'fa-file-image',
            'mp3': 'fa-file-audio',
            'wav': 'fa-file-audio',
            'mp4': 'fa-file-video',
            'avi': 'fa-file-video',
            'zip': 'fa-file-archive',
            'rar': 'fa-file-archive',
            'txt': 'fa-file-alt',
            'html': 'fa-file-code',
            'css': 'fa-file-code',
            'js': 'fa-file-code'
        };
        
        return fileIcons[ext] || 'fa-file';
    }


});