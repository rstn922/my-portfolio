document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const modal = document.getElementById('preview-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const previewIframe = document.getElementById('preview-iframe');
    const modalTitle = document.getElementById('modal-title');

    // Fetch repositories
    async function fetchProjects() {
        projectsContainer.innerHTML = '<div class="loading glass-panel">Memuat proyek dari rstn922 & ainz04...</div>';
        
        try {
            // Fetch dari kedua akun
            const [res1, res2] = await Promise.all([
                fetch('https://api.github.com/users/rstn922/repos?per_page=20'),
                fetch('https://api.github.com/users/ainz04/repos?per_page=20')
            ]);
            
            if (!res1.ok || !res2.ok) {
                throw new Error('Gagal mengambil data dari GitHub. Batas API mungkin tercapai.');
            }
            
            const repos1 = await res1.json();
            const repos2 = await res2.json();
            
            // Gabungkan repositori
            let allRepos = [...repos1, ...repos2];
            
            // Sembunyikan repositori tertentu sesuai permintaan
            const hiddenRepos = ['osint-tool', 'bot-telegram-vercel', 'bot-pengingat', 'Wilayah-Administratif-Indonesia'];
            allRepos = allRepos.filter(repo => !hiddenRepos.includes(repo.name));
            
            // Urutkan berdasarkan waktu update terbaru
            allRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            
            renderProjects(allRepos);
        } catch (error) {
            projectsContainer.innerHTML = `<div class="loading glass-panel" style="color: #ff8a8a;">${error.message}</div>`;
        }
    }

    function renderProjects(repos) {
        if (repos.length === 0) {
            projectsContainer.innerHTML = '<div class="loading glass-panel">Tidak ada repositori publik yang ditemukan.</div>';
            return;
        }

        projectsContainer.innerHTML = '';
        
        repos.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'project-card glass-panel';
            
            // Cek apakah ada homepage khusus, jika tidak, gunakan format standar github.io
            let previewUrl = '';
            if (repo.homepage && repo.homepage.trim() !== '') {
                previewUrl = repo.homepage;
            } else {
                // Otomatis membuat link GitHub Pages berdasarkan owner dan nama repo
                previewUrl = `https://${repo.owner.login}.github.io/${repo.name}/`;
            }
            
            // Selalu aktifkan tombol Live Preview
            const previewBtnHTML = `<button class="glass-btn primary-btn preview-btn" data-url="${previewUrl}" data-title="${repo.name}">Live Preview</button>`;

            card.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'Tidak ada deskripsi yang tersedia untuk repositori ini.'}</p>
                <div class="tags">
                    <span class="tag">★ ${repo.stargazers_count}</span>
                    ${repo.language ? `<span class="tag">${repo.language}</span>` : ''}
                </div>
                <div class="card-actions">
                    <a href="${repo.html_url}" target="_blank" class="glass-btn">GitHub</a>
                    ${previewBtnHTML}
                </div>
            `;
            
            projectsContainer.appendChild(card);
        });

        // Add event listeners to new preview buttons
        document.querySelectorAll('.preview-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.getAttribute('data-url');
                const title = e.target.getAttribute('data-title');
                openModal(url, title);
            });
        });
    }

    function openModal(url, title) {
        // Ensure URL has http/https
        let finalUrl = url;
        if (!/^https?:\/\//i.test(url)) {
            finalUrl = 'https://' + url;
        }
        
        modalTitle.textContent = title;
        previewIframe.src = finalUrl;
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            previewIframe.src = ''; // Stop loading/playing content after fade out
        }, 300);
    }

    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Initial load
    fetchProjects();
});
