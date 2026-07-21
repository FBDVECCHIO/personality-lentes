/* ==========================================================================
   PERSONALITY LENTES - DEMONSTRADOR DIGITAL ULTRA-REALISTA (SIMULATOR.JS)
   Engine Gráfica com Fotografia HD Real, Filtros Óticos & Gestos Touch
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. CARREGAMENTO DE IMAGENS FOTORREALISTAS HD
    // -------------------------------------------------------------
    const images = {
        nightDriving: new Image(),
        officeScene: new Image(),
        waterGlare: new Image(),
        outdoorSun: new Image()
    };

    images.nightDriving.src = 'images/sim_night_driving.png';
    images.officeScene.src = 'images/sim_office_scene.png';
    images.waterGlare.src = 'images/sim_water_glare.png';
    images.outdoorSun.src = 'images/sim_outdoor_sun.png';

    // Redesenha os canvas assim que as imagens forem carregadas
    Object.values(images).forEach(img => {
        img.onload = () => {
            if (state.authenticated) renderActiveCanvas(state.activeTab);
        };
    });

    // -------------------------------------------------------------
    // 2. ESTADO GLOBAL DA APLICAÇÃO
    // -------------------------------------------------------------
    const state = {
        authenticated: false,
        storeName: 'Modo Demonstração',
        trail: [],
        activeTab: 'tab-progressivos',
        
        progressive: { mode: 'personality-hd', focus: 'far', sliderPos: 0.5 },
        office: { mode: 'office-personality' },
        freeform: { mode: 'freeform-asferica' },
        arDemo: { sliderPos: 0.5 },
        photo: { mode: 'gen-s', uvLevel: 0 },
        thickness: { diopter: -5.00 },
        polarized: { mode: 'com-polarizado' },
        colors: { color: 'cinza' }
    };

    // -------------------------------------------------------------
    // 3. ELEMENTOS DO DOM
    // -------------------------------------------------------------
    const simLoginModal = document.getElementById('simLoginModal');
    const simLoginForm = document.getElementById('simLoginForm');
    const simAppContent = document.getElementById('simAppContent');
    const simUser = document.getElementById('simUser');
    const simPass = document.getElementById('simPass');
    const simLoginError = document.getElementById('simLoginError');
    const btnSimDemoAccess = document.getElementById('btnSimDemoAccess');
    const simStoreBadge = document.getElementById('simStoreBadge');

    const simTrailChipsContainer = document.getElementById('simTrailChipsContainer');
    const btnClearTrail = document.getElementById('btnClearTrail');
    const trailCountSpan = document.getElementById('trailCount');
    const btnViewTrailSummary = document.getElementById('btnViewTrailSummary');
    const simFinalSummaryList = document.getElementById('simFinalSummaryList');

    // -------------------------------------------------------------
    // 4. AUTENTICAÇÃO E SESSÃO
    // -------------------------------------------------------------
    const checkAuthSession = () => {
        const store = sessionStorage.getItem('personality_session_store');
        if (store) {
            startApp(store);
        }
    };

    const startApp = (storeName) => {
        state.authenticated = true;
        state.storeName = storeName;
        simStoreBadge.textContent = `🏬 ${storeName}`;
        simLoginModal.style.display = 'none';
        simAppContent.style.display = 'block';

        initAllCanvasEngines();
        setTimeout(() => renderActiveCanvas(state.activeTab), 100);
    };

    if (simLoginForm) {
        simLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = simUser.value.trim().toLowerCase();
            const p = simPass.value.trim();

            if (u.length > 0 && p.length > 0) {
                sessionStorage.setItem('personality_session_store', `Ótica Licenciada: ${u.toUpperCase()}`);
                startApp(`Ótica Licenciada: ${u.toUpperCase()}`);
            } else {
                simLoginError.style.display = 'block';
                simLoginError.textContent = 'Usuário ou senha inválidos.';
            }
        });
    }

    if (btnSimDemoAccess) {
        btnSimDemoAccess.addEventListener('click', () => {
            startApp('Modo Demonstração Rápida');
        });
    }

    checkAuthSession();

    // -------------------------------------------------------------
    // 5. NAVEGAÇÃO ENTRE ABAS
    // -------------------------------------------------------------
    const tabBtns = document.querySelectorAll('.sim-tab-btn');
    const tabContents = document.querySelectorAll('.sim-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            state.activeTab = targetTab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const activeContent = document.getElementById(targetTab);
            if (activeContent) activeContent.style.display = 'block';

            renderActiveCanvas(targetTab);
        });
    });

    if (btnViewTrailSummary) {
        btnViewTrailSummary.addEventListener('click', () => {
            const summaryBtn = document.querySelector('.sim-tab-btn[data-tab="tab-summary"]');
            if (summaryBtn) summaryBtn.click();
        });
    }

    // -------------------------------------------------------------
    // 6. TRILHA DE ESCOLHAS DO CLIENTE
    // -------------------------------------------------------------
    const btnAddTrails = document.querySelectorAll('.btn-add-trail');
    btnAddTrails.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            const item = btn.getAttribute('data-item');
            addToTrail(category, item);

            btn.textContent = '✓ Adicionado!';
            btn.style.background = 'var(--gold-primary)';
            btn.style.color = '#000';
            setTimeout(() => {
                btn.textContent = '➕ Adicionar à Escolha do Cliente';
                btn.style.background = 'transparent';
                btn.style.color = 'var(--gold-light)';
            }, 1800);
        });
    });

    function addToTrail(category, item) {
        state.trail = state.trail.filter(t => t.category !== category);
        state.trail.push({ category, item });
        renderTrailChips();
    }

    function renderTrailChips() {
        if (!simTrailChipsContainer) return;
        simTrailChipsContainer.innerHTML = '';
        trailCountSpan.textContent = state.trail.length;

        if (state.trail.length === 0) {
            simTrailChipsContainer.innerHTML = `<span style="font-size: 12px; color: var(--text-muted);">Nenhuma opção marcada ainda. Selecione conforme o atendimento.</span>`;
            if (simFinalSummaryList) simFinalSummaryList.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">Nenhuma escolha registrada na trilha ainda.</p>`;
            return;
        }

        if (simFinalSummaryList) simFinalSummaryList.innerHTML = '';

        state.trail.forEach((t, idx) => {
            const chip = document.createElement('div');
            chip.className = 'sim-chip';
            chip.innerHTML = `
                <span><strong>${t.category}:</strong> ${t.item}</span>
                <span class="sim-chip-remove" data-idx="${idx}">✕</span>
            `;
            simTrailChipsContainer.appendChild(chip);

            if (simFinalSummaryList) {
                const itemBox = document.createElement('div');
                itemBox.style.cssText = `background: rgba(255,255,255,0.04); border: 1px solid var(--border-gold); padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;`;
                itemBox.innerHTML = `
                    <div>
                        <span style="font-size: 11px; color: var(--gold-light); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; display: block;">${t.category}</span>
                        <strong style="color: #fff; font-size: 14px;">${t.item}</strong>
                    </div>
                    <span style="color: var(--success); font-weight: 700; font-size: 16px;">✓</span>
                `;
                simFinalSummaryList.appendChild(itemBox);
            }
        });

        document.querySelectorAll('.sim-chip-remove').forEach(removeBtn => {
            removeBtn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                state.trail.splice(idx, 1);
                renderTrailChips();
            });
        });
    }

    if (btnClearTrail) {
        btnClearTrail.addEventListener('click', () => {
            state.trail = [];
            renderTrailChips();
        });
    }

    // -------------------------------------------------------------
    // 7. RENDERIZADORES FOTORREALISTAS (CANVAS ENGINES)
    // -------------------------------------------------------------

    function initAllCanvasEngines() {
        initProgressiveEngine();
        initOfficeEngine();
        initFreeformEngine();
        initArDemoEngine();
        initPhotoEngine();
        initThicknessEngine();
        initPolarizedEngine();
        initColorsEngine();
    }

    function renderActiveCanvas(tabId) {
        if (tabId === 'tab-progressivos') drawProgressive();
        if (tabId === 'tab-office') drawOffice();
        if (tabId === 'tab-freeform') drawFreeform();
        if (tabId === 'tab-ar-demo') drawArDemo();
        if (tabId === 'tab-photo') drawPhoto();
        if (tabId === 'tab-thickness') drawThickness();
        if (tabId === 'tab-polarized') drawPolarized();
        if (tabId === 'tab-colors') drawColors();
    }

    // --- MÓDULO 1: PROGRESSIVOS & MARCAS (FOTORREALISTA) ---
    function initProgressiveEngine() {
        const canvas = document.getElementById('canvasProgressive');
        const handle = document.getElementById('sliderHandleProgressive');
        const wrapper = document.getElementById('wrapperProgressive');
        if (!canvas) return;

        let isDragging = false;
        const updateSliderPos = (clientX) => {
            const rect = wrapper.getBoundingClientRect();
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0.05, Math.min(0.95, pos));
            state.progressive.sliderPos = pos;
            handle.style.left = `${pos * 100}%`;
            drawProgressive();
        };

        wrapper.addEventListener('mousedown', (e) => { isDragging = true; updateSliderPos(e.clientX); });
        window.addEventListener('mousemove', (e) => { if (isDragging) updateSliderPos(e.clientX); });
        window.addEventListener('mouseup', () => { isDragging = false; });

        wrapper.addEventListener('touchstart', (e) => { isDragging = true; updateSliderPos(e.touches[0].clientX); });
        window.addEventListener('touchmove', (e) => { if (isDragging) updateSliderPos(e.touches[0].clientX); });
        window.addEventListener('touchend', () => { isDragging = false; });

        document.querySelectorAll('[data-type="progressive"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-type="progressive"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.progressive.mode = btn.getAttribute('data-val');
                drawProgressive();
            });
        });

        drawProgressive();
    }

    function drawProgressive() {
        const canvas = document.getElementById('canvasProgressive');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.officeScene;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#121218';
            ctx.fillRect(0, 0, w, h);
        }

        const splitX = w * state.progressive.sliderPos;

        // Lado Esquerdo: Personality Digital HD (Visão Nítida Ampla)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();
        
        ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';
        ctx.strokeStyle = 'var(--gold-primary)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(w * 0.25, h * 0.5, w * 0.22, h * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Badge de Marca
        ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
        ctx.fillRect(15, 15, 260, 50);
        ctx.strokeStyle = 'var(--gold-primary)';
        ctx.strokeRect(15, 15, 260, 50);
        ctx.fillStyle = 'var(--gold-light)';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText('✨ Personality Digital HD', 25, 35);
        ctx.fillStyle = '#fff';
        ctx.font = '500 11px Montserrat, sans-serif';
        ctx.fillText('Corredor +80% Amplo • Visão Nítida', 25, 52);
        ctx.restore();

        // Lado Direito: Multifocal Convencional Padrão (Desfocado nas bordas)
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, w - splitX, h);
        ctx.clip();

        // Overlay de aberração periférica
        ctx.fillStyle = 'rgba(20, 20, 26, 0.45)';
        ctx.fillRect(splitX, 0, w - splitX, h);

        ctx.fillStyle = 'rgba(255, 85, 85, 0.25)';
        ctx.beginPath();
        ctx.ellipse(w * 0.75, h * 0.5, w * 0.22, h * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
        ctx.fillRect(splitX + 15, 15, 260, 50);
        ctx.strokeStyle = '#ff5555';
        ctx.strokeRect(splitX + 15, 15, 260, 50);
        ctx.fillStyle = '#ff8888';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText('❌ Convencional Padrão', splitX + 25, 35);
        ctx.fillStyle = '#fff';
        ctx.font = '500 11px Montserrat, sans-serif';
        ctx.fillText('Aberrações laterais & Efeito Túnel', splitX + 25, 52);

        ctx.restore();
    }

    // --- MÓDULO 2: OFFICE VS PERTO (FOTORREALISTA) ---
    function initOfficeEngine() {
        document.querySelectorAll('[data-type="office"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-type="office"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.office.mode = btn.getAttribute('data-val');
                drawOffice();
            });
        });
    }

    function drawOffice() {
        const canvas = document.getElementById('canvasOffice');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.officeScene;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#14141c';
            ctx.fillRect(0, 0, w, h);
        }

        if (state.office.mode === 'perto-simples') {
            ctx.fillStyle = 'rgba(8, 8, 12, 0.72)';
            ctx.fillRect(0, 0, w, h);

            // Mantém apenas área de 40cm em foco
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(w * 0.5, h * 0.7, 180, 100, 0, 0, Math.PI * 2);
            ctx.clip();
            if (img.complete && img.naturalWidth > 0) ctx.drawImage(img, 0, 0, w, h);
            ctx.strokeStyle = '#ff5555';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
            ctx.fillRect(20, 20, 380, 45);
            ctx.fillStyle = '#ff8888';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.fillText('❌ Lente de Perto Simples: Foco fixo em 40cm', 35, 47);
        } else {
            ctx.fillStyle = 'rgba(197, 168, 92, 0.08)';
            ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = 'var(--gold-primary)';
            ctx.lineWidth = 3;
            ctx.strokeRect(10, 10, w - 20, h - 20);

            ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
            ctx.fillRect(20, 20, 440, 45);
            ctx.fillStyle = 'var(--gold-light)';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.fillText('✨ Personality Office: Foco contínuo de 40cm até 4 metros!', 35, 47);
        }
    }

    // --- MÓDULO 3: VS FREEFORM VS PRONTAS ---
    function initFreeformEngine() {
        document.querySelectorAll('[data-type="freeform"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-type="freeform"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.freeform.mode = btn.getAttribute('data-val');
                drawFreeform();
            });
        });
    }

    function drawFreeform() {
        const canvas = document.getElementById('canvasFreeform');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.officeScene;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#0b0c10';
            ctx.fillRect(0, 0, w, h);
        }

        if (state.freeform.mode === 'pronta-esferica') {
            ctx.fillStyle = 'rgba(255, 85, 85, 0.35)';
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, h * 0.42, 0, Math.PI * 2);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#ff5555';
            ctx.stroke();

            ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
            ctx.fillRect(20, 20, 450, 45);
            ctx.fillStyle = '#ff8888';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.fillText('❌ Lente Pronta Esférica: Distorção "Olho de Peixe" na borda', 35, 47);
        } else {
            ctx.strokeStyle = 'var(--gold-primary)';
            ctx.lineWidth = 3;
            ctx.strokeRect(15, 15, w - 30, h - 30);

            ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
            ctx.fillRect(20, 20, 450, 45);
            ctx.fillStyle = 'var(--gold-light)';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.fillText('✨ Personality VS Freeform Asférica: Visão nítida ponta a ponta', 35, 47);
        }
    }

    // --- MÓDULO 4: COM VS SEM ANTIRREFLEXO (FOTORREALISTA) ---
    function initArDemoEngine() {
        const canvas = document.getElementById('canvasArDemo');
        const handle = document.getElementById('sliderHandleAr');
        const wrapper = document.getElementById('wrapperArDemo');
        if (!canvas) return;

        let isDragging = false;
        const updatePos = (clientX) => {
            const rect = wrapper.getBoundingClientRect();
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0.05, Math.min(0.95, pos));
            state.arDemo.sliderPos = pos;
            handle.style.left = `${pos * 100}%`;
            drawArDemo();
        };

        wrapper.addEventListener('mousedown', (e) => { isDragging = true; updatePos(e.clientX); });
        window.addEventListener('mousemove', (e) => { if (isDragging) updatePos(e.clientX); });
        window.addEventListener('mouseup', () => { isDragging = false; });

        wrapper.addEventListener('touchstart', (e) => { isDragging = true; updatePos(e.touches[0].clientX); });
        window.addEventListener('touchmove', (e) => { if (isDragging) updatePos(e.touches[0].clientX); });
        window.addEventListener('touchend', () => { isDragging = false; });

        drawArDemo();
    }

    function drawArDemo() {
        const canvas = document.getElementById('canvasArDemo');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.nightDriving;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#08080c';
            ctx.fillRect(0, 0, w, h);
        }

        const splitX = w * state.arDemo.sliderPos;

        // Lado Esquerdo: Com Antirreflexo Personality (Visão cristalina)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();

        // Brilho suave dourado AR Gold
        ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
        ctx.fillRect(0, 0, splitX, h);

        ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
        ctx.fillRect(15, 15, 340, 45);
        ctx.fillStyle = 'var(--gold-light)';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText('✨ Com Antirreflexo Gold: Sem Ofuscamento', 25, 42);
        ctx.restore();

        // Lado Direito: Sem Antirreflexo (Ofuscamento pesado de farol)
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, w - splitX, h);
        ctx.clip();

        // Camada de reflexo branco ofuscante
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(splitX, 0, w - splitX, h);

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(splitX + 150, h * 0.45, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
        ctx.fillRect(splitX + 15, 15, 340, 45);
        ctx.fillStyle = '#ff8888';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText('❌ Sem Antirreflexo: Reflexos e Faróis Incômodos', splitX + 25, 42);
        ctx.restore();
    }

    // --- MÓDULO 6: FOTOSSENSÍVEIS (TRANSITIONS FOTORREALISTA) ---
    function initPhotoEngine() {
        const rangeUv = document.getElementById('rangeUv');
        if (rangeUv) {
            rangeUv.addEventListener('input', (e) => {
                state.photo.uvLevel = parseInt(e.target.value);
                drawPhoto();
            });
        }

        document.querySelectorAll('[data-type="photo"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-type="photo"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.photo.mode = btn.getAttribute('data-val');
                drawPhoto();
            });
        });
    }

    function drawPhoto() {
        const canvas = document.getElementById('canvasPhoto');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.outdoorSun;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#1a1d24';
            ctx.fillRect(0, 0, w, h);
        }

        // Lente de Óculos em Formato Realista
        const opacity = (state.photo.uvLevel / 100) * 0.82;
        ctx.fillStyle = `rgba(18, 18, 22, ${opacity})`;
        ctx.strokeStyle = 'var(--gold-primary)';
        ctx.lineWidth = 3.5;

        ctx.beginPath();
        ctx.ellipse(w * 0.35, h * 0.5, w * 0.18, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(w * 0.65, h * 0.5, w * 0.18, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Ponte dos Óculos
        ctx.beginPath();
        ctx.moveTo(w * 0.45, h * 0.45);
        ctx.lineTo(w * 0.55, h * 0.45);
        ctx.stroke();

        ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
        ctx.fillRect(20, 20, 420, 45);
        ctx.fillStyle = 'var(--gold-light)';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText(`☀️ ${state.photo.mode === 'gen-s' ? 'Transitions GEN S (Ativação Ultrarrápida)' : 'Transitions Xtractive (Ativação no Carro)'} - UV: ${state.photo.uvLevel}%`, 35, 47);
    }

    // --- MÓDULO 7: CALCULADORA DE ESPESSURA DE BORDA ---
    function initThicknessEngine() {
        const rangeDiopter = document.getElementById('rangeDiopter');
        const valDiopter = document.getElementById('valDiopter');

        if (rangeDiopter) {
            rangeDiopter.addEventListener('input', (e) => {
                state.thickness.diopter = parseFloat(e.target.value);
                if (valDiopter) valDiopter.textContent = `${state.thickness.diopter.toFixed(2)} D`;
                drawThickness();
            });
        }
    }

    function drawThickness() {
        const canvas = document.getElementById('canvasThickness');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0a0a0e';
        ctx.fillRect(0, 0, w, h);

        const diopter = Math.abs(state.thickness.diopter);
        const indices = [
            { name: "1.50 Comum", factor: 1.0, color: "#ff5555" },
            { name: "1.61 Coringa", factor: 0.72, color: "var(--gold-light)" },
            { name: "1.67 / 1.74 Fina", factor: 0.56, color: "#a0c4ff" },
            { name: "1.76 Ultra", factor: 0.44, color: "#9bf6ff" }
        ];

        const slotW = w / indices.length;

        indices.forEach((idxObj, i) => {
            const edgeThick = 20 + (diopter * 8 * idxObj.factor);
            const x = slotW * i + slotW / 2;
            const y = h / 2;

            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.strokeStyle = idxObj.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x - 40, y - edgeThick / 2);
            ctx.lineTo(x + 40, y - edgeThick / 2);
            ctx.lineTo(x + 40, y + edgeThick / 2);
            ctx.lineTo(x - 40, y + edgeThick / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(idxObj.name, x, h - 30);
            ctx.fillStyle = idxObj.color;
            ctx.font = '12px Montserrat, sans-serif';
            ctx.fillText(`${(edgeThick / 5).toFixed(1)} mm`, x, h - 12);
        });
    }

    // --- MÓDULO 8: LENTES POLARIZADAS (FOTORREALISTA) ---
    function initPolarizedEngine() {
        document.querySelectorAll('[data-type="polar"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-type="polar"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.polarized.mode = btn.getAttribute('data-val');
                drawPolarized();
            });
        });
    }

    function drawPolarized() {
        const canvas = document.getElementById('canvasPolarized');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.waterGlare;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#003366';
            ctx.fillRect(0, 0, w, h);
        }

        if (state.polarized.mode === 'sem-polarizado') {
            // Reflexo branco ofuscante sobre a água
            ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
            ctx.fillRect(20, 20, 420, 45);
            ctx.fillStyle = '#ff8888';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.fillText('❌ Sem Polarizado: Reflexo cegante esconde o fundo da água', 35, 47);
        } else {
            // Filtro Polarizado Personality
            ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
            ctx.fillRect(20, 20, 420, 45);
            ctx.fillStyle = 'var(--gold-light)';
            ctx.font = '700 13px Montserrat, sans-serif';
            ctx.fillText('🌊 Com Polarizado Personality: Visão nítida sob a água', 35, 47);
        }
    }

    // --- MÓDULO 9: CORES & SHINE MIRROR (FOTORREALISTA) ---
    function initColorsEngine() {
        document.querySelectorAll('.sim-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sim-color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.colors.color = btn.getAttribute('data-color');
                drawColors();
            });
        });
    }

    function drawColors() {
        const canvas = document.getElementById('canvasColors');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);

        const img = images.outdoorSun;
        if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, w, h);
        }

        let colorStyle = 'rgba(80,80,80,0.6)';
        if (state.colors.color === 'marrom') colorStyle = 'rgba(120,70,30,0.65)';
        if (state.colors.color === 'g15') colorStyle = 'rgba(30,90,50,0.65)';
        if (state.colors.color === 'gold-mirror') colorStyle = 'rgba(212,175,55,0.78)';
        if (state.colors.color === 'blue-mirror') colorStyle = 'rgba(0,150,255,0.78)';

        ctx.fillStyle = colorStyle;
        ctx.beginPath();
        ctx.ellipse(w * 0.35, h * 0.5, w * 0.18, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(w * 0.65, h * 0.5, w * 0.18, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(12, 12, 16, 0.88)';
        ctx.fillRect(w * 0.25, 20, w * 0.5, 45);
        ctx.fillStyle = '#fff';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🎨 Tonalidade / Espelhado: ${state.colors.color.toUpperCase()}`, w / 2, 47);
        ctx.textAlign = 'left';
    }

});
