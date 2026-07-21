/* ==========================================================================
   PERSONALITY LENTES - DEMONSTRADOR DIGITAL DE LENTES (SIMULATOR.JS)
   Engine Gráfica 60 FPS, Gestos Touch, Trilha de Escolhas & Calculadoras
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. ESTADO GLOBAL DA APLICAÇÃO E TRILHA DE ESCOLHAS
    // -------------------------------------------------------------
    const state = {
        authenticated: false,
        storeName: 'Modo Demonstração',
        trail: [],
        activeTab: 'tab-progressivos',
        
        // Parâmetros dos Módulos
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
    // 2. ELEMENTOS DO DOM
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
    // 3. AUTENTICAÇÃO E NÍVEIS DE ACESSO
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

        // Inicializa a renderização de todas as engines nos canvas
        initAllCanvasEngines();
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
    // 4. NAVEGAÇÃO ENTRE ABAS
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

            // Redesenha os canvas do módulo ativo
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
    // 5. GERENCIADOR DA TRILHA DE ESCOLHAS DO CLIENTE
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
        // Evita duplicatas da mesma categoria
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
            // Chip na barra superior
            const chip = document.createElement('div');
            chip.className = 'sim-chip';
            chip.innerHTML = `
                <span><strong>${t.category}:</strong> ${t.item}</span>
                <span class="sim-chip-remove" data-idx="${idx}">✕</span>
            `;
            simTrailChipsContainer.appendChild(chip);

            // Item na Ficha de Recomendação
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

        // Eventos para remover chips
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
    // 6. ENGINES GRÁFICAS DOS CANVAS DOS 10 MÓDULOS
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

    // --- MÓDULO 1: PROGRESSIVOS & MARCAS ---
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

        // Fundo simulado (Painel do Carro + Estrada)
        ctx.fillStyle = '#121218';
        ctx.fillRect(0, 0, w, h);

        // Desenha a paisagem
        ctx.fillStyle = '#1b2234';
        ctx.fillRect(0, 0, w, h * 0.5); // Céu noturno

        ctx.fillStyle = '#0f141f';
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.5);
        ctx.lineTo(w * 0.7, h * 0.5);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill(); // Estrada

        // Painel/Celular de Perto
        ctx.fillStyle = '#1c1c24';
        ctx.fillRect(w * 0.35, h * 0.6, w * 0.3, h * 0.4);
        ctx.fillStyle = 'var(--gold-light)';
        ctx.font = '13px Inter, sans-serif';
        ctx.fillText('📱 GPS & Celular (Perto)', w * 0.37, h * 0.75);

        // Aplica o Efeito de Campo Visual (Split Screen)
        const splitX = w * state.progressive.sliderPos;

        // Lado Esquerdo: Personality Digital HD (Limpo)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();
        
        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.strokeStyle = 'var(--gold-primary)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(w * 0.25, h * 0.5, w * 0.22, h * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText('✨ Personality Digital HD', 20, 30);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Corredor ultralargo sem distorção lateral', 20, 50);
        ctx.restore();

        // Lado Direito: Multifocal Convencional Padrão (Desfocado nas pontas)
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, w - splitX, h);
        ctx.clip();

        // Camada de desfoque lateral (Aberrações)
        ctx.fillStyle = 'rgba(255, 85, 85, 0.25)';
        ctx.fillRect(splitX, 0, w - splitX, h);

        ctx.fillStyle = '#ff8888';
        ctx.font = '700 14px Inter, sans-serif';
        ctx.fillText('❌ Convencional Padrão', splitX + 20, 30);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Aberrações laterais e efeito túnel', splitX + 20, 50);

        ctx.restore();
    }

    // --- MÓDULO 2: OFFICE VS PERTO ---
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

        // Fundo Escritório (Computador a 1m + Colega a 3m)
        ctx.fillStyle = '#14141c';
        ctx.fillRect(0, 0, w, h);

        // Tela de Computador (Intermediário - 1 metro)
        ctx.fillStyle = '#222533';
        ctx.fillRect(w * 0.1, h * 0.2, w * 0.35, h * 0.5);
        ctx.fillStyle = '#fff';
        ctx.font = '13px Inter, sans-serif';
        ctx.fillText('💻 Monitor (1 metro)', w * 0.12, h * 0.45);

        // Pessoas/Escritório (Longe - 3 metros)
        ctx.fillStyle = '#2a2d3e';
        ctx.fillRect(w * 0.55, h * 0.2, w * 0.35, h * 0.5);
        ctx.fillStyle = '#fff';
        ctx.fillText('👥 Sala de Reunião (3 metros)', w * 0.57, h * 0.45);

        if (state.office.mode === 'perto-simples') {
            // Desfoca a tela do computador e o ambiente distante
            ctx.fillStyle = 'rgba(8, 8, 10, 0.75)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#ff5555';
            ctx.font = '700 16px Inter, sans-serif';
            ctx.fillText('❌ Lente de Perto Simples: Desfoca tudo além de 40cm!', w * 0.2, h * 0.9);
        } else {
            ctx.fillStyle = 'rgba(197, 168, 92, 0.15)';
            ctx.strokeStyle = 'var(--gold-primary)';
            ctx.lineWidth = 2;
            ctx.strokeRect(w * 0.05, h * 0.1, w * 0.9, h * 0.75);
            ctx.fillStyle = 'var(--gold-light)';
            ctx.font = '700 16px Inter, sans-serif';
            ctx.fillText('✨ Personality Office: Visão cristalina contínua de 40cm a 4 metros!', w * 0.18, h * 0.9);
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

        // Grade de Teste de Visão (Grid)
        ctx.fillStyle = '#0b0c10';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y < h; y += 30) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        if (state.freeform.mode === 'pronta-esferica') {
            ctx.fillStyle = 'rgba(255, 85, 85, 0.2)';
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, h * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ff8888';
            ctx.font = '700 15px Inter, sans-serif';
            ctx.fillText('❌ Lente Pronta Esférica: Distorção periférica nas bordas da armação', w * 0.15, h * 0.9);
        } else {
            ctx.strokeStyle = 'var(--gold-primary)';
            ctx.lineWidth = 3;
            ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

            ctx.fillStyle = 'var(--gold-light)';
            ctx.font = '700 15px Inter, sans-serif';
            ctx.fillText('✨ Personality VS Freeform Asférica: Geometria limpa e nítida até a borda', w * 0.12, h * 0.9);
        }
    }

    // --- MÓDULO 4: COM VS SEM ANTIRREFLEXO ---
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

        drawArDemo();
    }

    function drawArDemo() {
        const canvas = document.getElementById('canvasArDemo');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#08080c';
        ctx.fillRect(0, 0, w, h);

        const splitX = w * state.arDemo.sliderPos;

        // Lado Com Antirreflexo Gold
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();

        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(w * 0.25, h * 0.4, 25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'var(--gold-light)';
        ctx.font = '700 15px Inter, sans-serif';
        ctx.fillText('✨ Com Antirreflexo Personality: Visão 100% Cristalina', 20, 30);
        ctx.restore();

        // Lado Sem Antirreflexo
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, w - splitX, h);
        ctx.clip();

        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath(); ctx.arc(w * 0.75, h * 0.4, 60, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff8888';
        ctx.font = '700 15px Inter, sans-serif';
        ctx.fillText('❌ Sem Antirreflexo: Ofuscamento e reflexos incômodos', splitX + 20, 30);
        ctx.restore();
    }

    // --- MÓDULO 6: FOTOSSENSÍVEIS (TRANSITIONS) ---
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
        ctx.fillStyle = '#1a1d24';
        ctx.fillRect(0, 0, w, h);

        // Lente no Centro
        const opacity = (state.photo.uvLevel / 100) * 0.85;
        ctx.fillStyle = `rgba(20, 20, 25, ${opacity})`;
        ctx.strokeStyle = 'var(--gold-primary)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(w / 2, h / 2, w * 0.25, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '700 15px Inter, sans-serif';
        ctx.fillText(`Tecnologia: ${state.photo.mode === 'gen-s' ? 'Transitions GEN S' : 'Transitions Xtractive'} (UV: ${state.photo.uvLevel}%)`, w * 0.25, 40);
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

            // Desenha perfil da borda cortada
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.strokeStyle = idxObj.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x - 35, y - edgeThick / 2);
            ctx.lineTo(x + 35, y - edgeThick / 2);
            ctx.lineTo(x + 35, y + edgeThick / 2);
            ctx.lineTo(x - 35, y + edgeThick / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = '700 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(idxObj.name, x, h - 30);
            ctx.fillStyle = idxObj.color;
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(`${(edgeThick / 5).toFixed(1)} mm`, x, h - 12);
        });
    }

    // --- MÓDULOS 8 & 9: POLARIZADO & CORES ---
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
        ctx.fillStyle = state.polarized.mode === 'com-polarizado' ? '#003366' : '#6699cc';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#fff';
        ctx.font = '700 16px Inter, sans-serif';
        ctx.fillText(state.polarized.mode === 'com-polarizado' ? '🌊 Filtro Polarizado Personality: Água cristalina sem reflexos' : '❌ Sem Polarizado: Reflexo cegante sobre a água', 30, 40);
    }

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
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        let colorStyle = 'rgba(80,80,80,0.6)';
        if (state.colors.color === 'marrom') colorStyle = 'rgba(120,70,30,0.65)';
        if (state.colors.color === 'g15') colorStyle = 'rgba(30,90,50,0.65)';
        if (state.colors.color === 'gold-mirror') colorStyle = 'rgba(212,175,55,0.75)';
        if (state.colors.color === 'blue-mirror') colorStyle = 'rgba(0,150,255,0.75)';

        ctx.fillStyle = colorStyle;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, h * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '700 15px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Tonalidade / Acabamento: ${state.colors.color.toUpperCase()}`, w / 2, 40);
    }

});
