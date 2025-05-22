document.addEventListener('DOMContentLoaded', async () => {
  const fileList = document.getElementById('fileList');
  const res = await fetch('/files');
  const files = await res.json();

  files.forEach(file => {
    const li = document.createElement('li');

    // Link do pobrania
    const link = document.createElement('a');
    link.href = `/uploads/${file}`;
    link.textContent = file;
    link.target = '_blank';
    li.appendChild(link);

    // Przycisk usuń
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.style.marginLeft = '10px';
    delBtn.addEventListener('click', async () => {
      if (confirm(`Na pewno chcesz usunąć "${file}"?`)) {
        const res = await fetch(`/delete/${file}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          li.remove(); // usuwa z DOM
        } else {
          alert('Błąd podczas usuwania pliku');
        }
      }
    });

    li.appendChild(delBtn);
    fileList.appendChild(li);
  });
});
