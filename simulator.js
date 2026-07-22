/* ==========================================================================
   PERSONALITY LENTES - DEMONSTRADOR DIGITAL FOTORREALISTA EM 1ª PESSOA (POV)
   Motor de Efeitos Óticos Premium & Alta Robustez (Prevenção de Falhas)
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

    Object.values(images).forEach(img => {
        img.onload = () => {
            if (state.authenticated) renderActiveCanvas(state.activeTab);
        };
    });

    // Offscreen canvas auxiliar para renderizar efeitos de desfoque ótico (Blur)
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // -------------------------------------------------------------
    // 2. ESTADO GLOBAL DA APLICAÇÃO
    // -------------------------------------------------------------
    const state = {
        authenticated: false,
        storeName: 'Modo Demonstração',
        trail: [],
        activeTab: 'tab-progressivos',
        cameraActive: false,
        videoStream: null,
        
        progressive: { lensLeft: 'personality-hd', lensRight: 'convencional-padrao', sliderPos: 0.5 },
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

    const simVideoFeed = document.getElementById('simVideoFeed');
    const btnToggleCamera = document.getElementById('btnToggleCamera');
    const cameraStatus = document.getElementById('cameraStatus');

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
        if (simStoreBadge) simStoreBadge.textContent = `🏬 ${storeName}`;
        if (simLoginModal) simLoginModal.style.display = 'none';
        if (simAppContent) simAppContent.style.display = 'block';

        initAllCanvasEngines();
        startRenderLoop();
    };

    if (simLoginForm) {
        simLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = simUser ? simUser.value.trim().toLowerCase() : 'otica';
            const p = simPass ? simPass.value.trim() : '1234';

            if (u.length > 0 && p.length > 0) {
                sessionStorage.setItem('personality_session_store', `Ótica Licenciada: ${u.toUpperCase()}`);
                startApp(`Ótica Licenciada: ${u.toUpperCase()}`);
            } else {
                if (simLoginError) {
                    simLoginError.style.display = 'block';
                    simLoginError.textContent = 'Usuário ou senha inválidos.';
                }
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
    // 5. INTEGRAÇÃO DA CÂMERA (REALIDADE AUMENTADA)
    // -------------------------------------------------------------
    if (btnToggleCamera) {
        btnToggleCamera.addEventListener('click', async () => {
            if (state.cameraActive) {
                stopCamera();
            } else {
                await startCamera();
            }
        });
    }

    async function startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            state.videoStream = stream;
            if (simVideoFeed) {
                simVideoFeed.srcObject = stream;
                simVideoFeed.play();
            }

            state.cameraActive = true;
            if (cameraStatus) {
                cameraStatus.textContent = 'ON';
                cameraStatus.style.color = 'var(--success)';
            }
            if (btnToggleCamera) {
                btnToggleCamera.style.background = 'rgba(40, 199, 111, 0.15)';
                btnToggleCamera.style.borderColor = 'var(--success)';
            }
        } catch (err) {
            console.error("Erro ao acessar a câmera: ", err);
            alert("Não foi possível acessar a câmera do aparelho. Verifique as permissões de privacidade.");
            state.cameraActive = false;
        }
    }

    function stopCamera() {
        if (state.videoStream) {
            state.videoStream.getTracks().forEach(track => track.stop());
            state.videoStream = null;
        }
        if (simVideoFeed) {
            simVideoFeed.srcObject = null;
        }

        state.cameraActive = false;
        if (cameraStatus) {
            cameraStatus.textContent = 'OFF';
            cameraStatus.style.color = 'var(--gold-light)';
        }
        if (btnToggleCamera) {
            btnToggleCamera.style.background = 'rgba(212,175,55,0.05)';
            btnToggleCamera.style.borderColor = 'var(--gold-primary)';
        }
        renderActiveCanvas(state.activeTab);
    }

    function startRenderLoop() {
        const loop = () => {
            if (state.authenticated) {
                renderActiveCanvas(state.activeTab);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // -------------------------------------------------------------
    // 6. NAVEGAÇÃO ENTRE ABAS
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
    // 7. TRILHA DE ESCOLHAS DO CLIENTE
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
        if (trailCountSpan) trailCountSpan.textContent = state.trail.length;

        if (state.trail.length === 0) {
            simTrailChipsContainer.innerHTML = `<span style="font-size: 11px; color: var(--text-muted);">Nenhuma opção marcada ainda. Selecione conforme o atendimento.</span>`;
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
    // 8. MOTOR DE VISÃO EM PRIMEIRA PESSOA (POV GLASSES ENGINE)
    // -------------------------------------------------------------
    function drawGlassesPOV(ctx, w, h, bgImg, renderLeftLens, renderRightLens) {
        if (w <= 0 || h <= 0) return;

        ctx.clearRect(0, 0, w, h);

        const isCamActive = state.cameraActive && simVideoFeed && simVideoFeed.readyState >= 2;

        offscreenCanvas.width = w;
        offscreenCanvas.height = h;

        // 1. Fundo Geral da Cena (Visão Periférica Nua fora dos óculos com leve desfoque)
        ctx.save();
        if (isCamActive) {
            offscreenCtx.drawImage(simVideoFeed, 0, 0, w, h);
        } else if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            offscreenCtx.drawImage(bgImg, 0, 0, w, h);
        } else {
            offscreenCtx.fillStyle = '#111'; offscreenCtx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(offscreenCanvas, 0, 0, w, h);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        const rx = w * 0.28;
        const ry = h * 0.48;
        const rw = w * 0.21;
        const rh = h * 0.36;

        const lx = w * 0.72;
        const ly = h * 0.48;

        if (rw <= 0 || rh <= 0) return;

        // 2. VISÃO DA LENTE ESQUERDA (DENTRO DO ARO)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2);
        ctx.clip();
        renderLeftLens(ctx, rx, ry, rw, rh, isCamActive, offscreenCanvas);

        const gradL = ctx.createLinearGradient(rx - rw, ry - rh, rx + rw, ry + rh);
        gradL.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        gradL.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
        gradL.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradL;
        ctx.fillRect(rx - rw, ry - rh, rw * 2, rh * 2);
        ctx.restore();

        // 3. VISÃO DA LENTE DIREITA (DENTRO DO ARO)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(lx, ly, rw, rh, 0, 0, Math.PI * 2);
        ctx.clip();
        renderRightLens(ctx, lx, ly, rw, rh, isCamActive, offscreenCanvas);

        const gradR = ctx.createLinearGradient(lx - rw, ly - rh, lx + rw, ly + rh);
        gradR.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        gradR.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
        gradR.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradR;
        ctx.fillRect(lx - rw, ly - rh, rw * 2, rh * 2);
        ctx.restore();

        // 4. DESENHO FOTORREALISTA DA ARMAÇÃO METÁLICA (1ª PESSOA)
        ctx.save();

        // Ponte Central
        ctx.strokeStyle = 'var(--gold-primary)';
        ctx.lineWidth = 8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.75, ry - 15);
        ctx.quadraticCurveTo(w * 0.5, ry - 40, lx - rw * 0.75, ly - 15);
        ctx.stroke();

        // Aro Esquerdo em Ouro Luxo
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.ellipse(rx, ry, rw, rh, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Aro Direito em Ouro Luxo
        ctx.beginPath();
        ctx.ellipse(lx, ly, rw, rh, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Hastes estendendo para as laterais do rosto
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(rx - rw * 0.95, ry - 15);
        ctx.lineTo(0, ry - 35);
        ctx.moveTo(lx + rw * 0.95, ly - 15);
        ctx.lineTo(w, ly - 35);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // -------------------------------------------------------------
    // 9. FUNÇÃO PARA DESENHAR MAPA DE ABERRAÇÃO PEDAGÓGICA (HEATMAP)
    // -------------------------------------------------------------
    function drawAberrationHeatmap(ctx, cx, cy, rw, rh, meta) {
        if (!meta.isBad && meta.blur <= 3) return;

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        const radius = rw * (meta.blur / 16);
        const opacity = meta.isBad ? 0.45 : 0.25;

        if (radius > 0) {
            const gradL = ctx.createRadialGradient(cx - rw * 0.7, cy + rh * 0.45, 5, cx - rw * 0.7, cy + rh * 0.45, radius);
            gradL.addColorStop(0, `rgba(255, 50, 50, ${opacity})`);
            gradL.addColorStop(0.4, `rgba(255, 140, 0, ${opacity * 0.6})`);
            gradL.addColorStop(0.7, `rgba(255, 230, 0, ${opacity * 0.3})`);
            gradL.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradL;
            ctx.beginPath();
            ctx.arc(cx - rw * 0.7, cy + rh * 0.45, radius, 0, Math.PI * 2);
            ctx.fill();

            const gradR = ctx.createRadialGradient(cx + rw * 0.7, cy + rh * 0.45, 5, cx + rw * 0.7, cy + rh * 0.45, radius);
            gradR.addColorStop(0, `rgba(255, 50, 50, ${opacity})`);
            gradR.addColorStop(0.4, `rgba(255, 140, 0, ${opacity * 0.6})`);
            gradR.addColorStop(0.7, `rgba(255, 230, 0, ${opacity * 0.3})`);
            gradR.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradR;
            ctx.beginPath();
            ctx.arc(cx + rw * 0.7, cy + rh * 0.45, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // -------------------------------------------------------------
    // 10. RENDERIZADORES DOS MÓDULOS DE SIMULAÇÃO
    // -------------------------------------------------------------

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

    // --- MÓDULO 1: BATALHA DE PROGRESSIVOS (COM HEATMAP DE DISTORÇÃO) ---
    function initProgressiveEngine() {
        const canvas = document.getElementById('canvasProgressive');
        const handle = document.getElementById('sliderHandleProgressive');
        const wrapper = document.getElementById('wrapperProgressive');
        const selectLeft = document.getElementById('selectLensLeft');
        const selectRight = document.getElementById('selectLensRight');

        if (!canvas) return;

        let isDragging = false;
        const updateSliderPos = (clientX) => {
            if (!wrapper) return;
            const rect = wrapper.getBoundingClientRect();
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0.05, Math.min(0.95, pos));
            state.progressive.sliderPos = pos;
            if (handle) handle.style.left = `${pos * 100}%`;
            drawProgressive();
        };

        if (wrapper) {
            wrapper.addEventListener('mousedown', (e) => { isDragging = true; updateSliderPos(e.clientX); });
            window.addEventListener('mousemove', (e) => { if (isDragging) updateSliderPos(e.clientX); });
            window.addEventListener('mouseup', () => { isDragging = false; });

            wrapper.addEventListener('touchstart', (e) => { isDragging = true; updateSliderPos(e.touches[0].clientX); });
            window.addEventListener('touchmove', (e) => { if (isDragging) updateSliderPos(e.touches[0].clientX); });
            window.addEventListener('touchend', () => { isDragging = false; });
        }

        if (selectLeft) {
            selectLeft.addEventListener('change', (e) => {
                state.progressive.lensLeft = e.target.value;
                drawProgressive();
            });
        }

        if (selectRight) {
            selectRight.addEventListener('change', (e) => {
                state.progressive.lensRight = e.target.value;
                drawProgressive();
            });
        }
    }

    function getLensMeta(key) {
        const map = {
            'personality-hd': { title: '✨ Personality Digital HD', sub: 'Corredor Amplo +80% • Zero Distorção', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 2 },
            'personality-gold': { title: '⚡ Personality 1.61 Gold Digital', sub: 'Lente Coringa • Antirreflexo Premium', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 3 },
            'personality-ultra': { title: '👑 Personality 1.76 Ultra Digital', sub: 'Linha Ultra Tecnologia • Ultrafina', color: '#9bf6ff', border: '#9bf6ff', isBad: false, blur: 1 },
            'concorrente-basica': { title: '❌ Concorrente Básica (Campo Médio)', sub: 'Aberrações Médias nas Laterais', color: '#ffaa66', border: '#ffaa66', isBad: true, blur: 8 },
            'convencional-padrao': { title: '❌ Multifocal Convencional Padrão', sub: 'Visão Túnel Restrita & Distorções', color: '#ff8888', border: '#ff5555', isBad: true, blur: 14 }
        };
        return map[key] || map['personality-hd'];
    }

    function drawProgressive() {
        const canvas = document.getElementById('canvasProgressive');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        if (w <= 0 || h <= 0) return;

        const img = images.officeScene;
        const splitX = w * state.progressive.sliderPos;
        const metaLeft = getLensMeta(state.progressive.lensLeft);
        const metaRight = getLensMeta(state.progressive.lensRight);

        drawGlassesPOV(ctx, w, h, img, 
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                
                if (metaLeft.blur > 2) {
                    c.save();
                    c.beginPath();
                    c.ellipse(rx, ry + 20, rw * 0.45, rh * 0.9, 0, 0, Math.PI * 2);
                    c.clip();
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();

                    c.save();
                    c.globalCompositeOperation = 'destination-over';
                    c.filter = `blur(${metaLeft.blur}px)`;
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();
                }

                drawAberrationHeatmap(c, rx, ry, rw, rh, metaLeft);

                if (!metaLeft.isBad) {
                    c.fillStyle = 'rgba(212, 175, 55, 0.06)';
                    c.fillRect(0, 0, w, h);
                }
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);

                if (metaRight.blur > 2) {
                    c.save();
                    c.beginPath();
                    c.ellipse(lx, ly + 20, rw * 0.45, rh * 0.9, 0, 0, Math.PI * 2);
                    c.clip();
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();

                    c.save();
                    c.globalCompositeOperation = 'destination-over';
                    c.filter = `blur(${metaRight.blur}px)`;
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();
                }

                drawAberrationHeatmap(c, lx, ly, rw, rh, metaRight);

                if (!metaRight.isBad) {
                    c.fillStyle = 'rgba(212, 175, 55, 0.06)';
                    c.fillRect(0, 0, w, h);
                }
            }
        );

        // Badges de Identificação das Lentes
        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(15, 15, 290, 48);
        ctx.strokeStyle = metaLeft.border; ctx.lineWidth = 1.5;
        ctx.strokeRect(15, 15, 290, 48);
        ctx.fillStyle = metaLeft.color; ctx.font = '700 12.5px Montserrat, sans-serif';
        ctx.fillText(metaLeft.title, 25, 34);
        ctx.fillStyle = '#fff'; ctx.font = '500 10.5px Montserrat, sans-serif';
        ctx.fillText(metaLeft.sub, 25, 50);

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(w - 305, 15, 290, 48);
        ctx.strokeStyle = metaRight.border;
        ctx.strokeRect(w - 305, 15, 290, 48);
        ctx.fillStyle = metaRight.color; ctx.font = '700 12.5px Montserrat, sans-serif';
        ctx.fillText(metaRight.title, w - 295, 34);
        ctx.fillStyle = '#fff'; ctx.font = '500 10.5px Montserrat, sans-serif';
        ctx.fillText(metaRight.sub, w - 295, 50);
    }

    // --- MÓDULO 2: OFFICE VS PERTO ---
    function drawOffice() {
        const canvas = document.getElementById('canvasOffice');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        if (w <= 0 || h <= 0) return;

        const img = images.officeScene;

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                if (state.office.mode === 'perto-simples') {
                    c.save();
                    c.filter = 'blur(10px)';
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();

                    c.save();
                    c.beginPath();
                    c.ellipse(rx, ry + rh * 0.4, rw * 0.8, rh * 0.5, 0, 0, Math.PI * 2);
                    c.clip();
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();
                } else {
                    c.drawImage(offscreen, 0, 0, w, h);
                }
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                if (state.office.mode === 'perto-simples') {
                    c.save();
                    c.filter = 'blur(10px)';
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();

                    c.save();
                    c.beginPath();
                    c.ellipse(lx, ly + rh * 0.4, rw * 0.8, rh * 0.5, 0, 0, Math.PI * 2);
                    c.clip();
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();
                } else {
                    c.drawImage(offscreen, 0, 0, w, h);
                }
            }
        );

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(20, 20, 440, 45);
        ctx.fillStyle = state.office.mode === 'perto-simples' ? '#ff8888' : 'var(--gold-light)';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText(state.office.mode === 'perto-simples' ? '❌ Lente de Perto Simples: Desfoca tudo além de 40cm' : '✨ Personality Office: Visão nítida contínua de 40cm a 4 metros!', 35, 47);
    }

    // --- MÓDULO 3: VS FREEFORM VS PRONTAS ---
    function drawFreeform() {
        const canvas = document.getElementById('canvasFreeform');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        if (w <= 0 || h <= 0) return;

        const img = images.officeScene;

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                if (state.freeform.mode === 'pronta-esferica') {
                    c.save();
                    c.filter = 'blur(9px)';
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();

                    c.save();
                    c.beginPath();
                    c.ellipse(rx, ry, rw * 0.5, rh * 0.5, 0, 0, Math.PI * 2);
                    c.clip();
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();
                } else {
                    c.drawImage(offscreen, 0, 0, w, h);
                }
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                if (state.freeform.mode === 'pronta-esferica') {
                    c.save();
                    c.filter = 'blur(9px)';
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();

                    c.save();
                    c.beginPath();
                    c.ellipse(lx, ly, rw * 0.5, rh * 0.5, 0, 0, Math.PI * 2);
                    c.clip();
                    c.drawImage(offscreen, 0, 0, w, h);
                    c.restore();
                } else {
                    c.drawImage(offscreen, 0, 0, w, h);
                }
            }
        );

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(20, 20, 450, 45);
        ctx.fillStyle = state.freeform.mode === 'pronta-esferica' ? '#ff8888' : 'var(--gold-light)';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText(state.freeform.mode === 'pronta-esferica' ? '❌ Lente Pronta Esférica: Distorção e embaçamento na borda' : '✨ Personality VS Freeform Asférica: Visão cristalina até a borda', 35, 47);
    }

    // --- MÓDULO 4: COM VS SEM ANTIRREFLEXO ---
    function initArDemoEngine() {
        const canvas = document.getElementById('canvasArDemo');
        const handle = document.getElementById('sliderHandleAr');
        const wrapper = document.getElementById('wrapperArDemo');
        if (!canvas) return;

        let isDragging = false;
        const updatePos = (clientX) => {
            if (!wrapper) return;
            const rect = wrapper.getBoundingClientRect();
            let pos = (clientX - rect.left) / rect.width;
            pos = Math.max(0.05, Math.min(0.95, pos));
            state.arDemo.sliderPos = pos;
            if (handle) handle.style.left = `${pos * 100}%`;
            drawArDemo();
        };

        if (wrapper) {
            wrapper.addEventListener('mousedown', (e) => { isDragging = true; updatePos(e.clientX); });
            window.addEventListener('mousemove', (e) => { if (isDragging) updatePos(e.clientX); });
            window.addEventListener('mouseup', () => { isDragging = false; });

            wrapper.addEventListener('touchstart', (e) => { isDragging = true; updatePos(e.touches[0].clientX); });
            window.addEventListener('touchmove', (e) => { if (isDragging) updatePos(e.touches[0].clientX); });
            window.addEventListener('touchend', () => { isDragging = false; });
        }
    }

    function drawArDemo() {
        const canvas = document.getElementById('canvasArDemo');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width = canvas.offsetWidth;
        const h = canvas.height = canvas.offsetHeight;

        if (w <= 0 || h <= 0) return;

        const img = images.nightDriving;
        const splitX = w * state.arDemo.sliderPos;

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                c.fillStyle = 'rgba(212, 175, 55, 0.08)'; c.fillRect(0, 0, w, h);
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                
                c.save();
                c.globalCompositeOperation = 'screen';
                
                const flare1 = c.createRadialGradient(w * 0.72 - 30, h * 0.44, 2, w * 0.72 - 30, h * 0.44, 75);
                flare1.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                flare1.addColorStop(0.2, 'rgba(255, 240, 200, 0.55)');
                flare1.addColorStop(1, 'rgba(0, 0, 0, 0)');
                c.fillStyle = flare1;
                c.beginPath(); c.arc(w * 0.72 - 30, h * 0.44, 75, 0, Math.PI * 2); c.fill();

                const flare2 = c.createRadialGradient(w * 0.72 + 60, h * 0.46, 2, w * 0.72 + 60, h * 0.46, 60);
                flare2.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                flare2.addColorStop(0.3, 'rgba(255, 220, 180, 0.45)');
                flare2.addColorStop(1, 'rgba(0, 0, 0, 0)');
                c.fillStyle = flare2;
                c.beginPath(); c.arc(w * 0.72 + 60, h * 0.46, 60, 0, Math.PI * 2); c.fill();

                c.restore();
            }
        );

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(15, 15, 310, 45);
        ctx.fillStyle = 'var(--gold-light)'; ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText('✨ Lente Esquerda: Com Antirreflexo Gold', 25, 42);

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(w - 325, 15, 310, 45);
        ctx.fillStyle = '#ff8888'; ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText('❌ Lente Direita: Sem Antirreflexo', w - 315, 42);
    }

    // --- MÓDULO 6: FOTOSSENSÍVEIS ---
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

        if (w <= 0 || h <= 0) return;

        const img = images.outdoorSun;
        const opacity = (state.photo.uvLevel / 100) * 0.78;

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                c.fillStyle = `rgba(32, 28, 30, ${opacity})`;
                c.fillRect(0, 0, w, h);
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                c.fillStyle = `rgba(32, 28, 30, ${opacity})`;
                c.fillRect(0, 0, w, h);
            }
        );

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(20, 20, 440, 45);
        ctx.fillStyle = 'var(--gold-light)'; ctx.font = '700 13px Montserrat, sans-serif';
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

        if (w <= 0 || h <= 0) return;

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

            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.strokeStyle = idxObj.color;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x - 40, h / 2 - edgeThick / 2);
            ctx.lineTo(x + 40, h / 2 - edgeThick / 2);
            ctx.lineTo(x + 40, h / 2 + edgeThick / 2);
            ctx.lineTo(x - 40, h / 2 + edgeThick / 2);
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

    // --- MÓDULO 8: LENTES POLARIZADAS ---
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

        if (w <= 0 || h <= 0) return;

        const img = images.waterGlare;

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                
                if (state.polarized.mode === 'sem-polarizado') {
                    c.save();
                    const glare = c.createRadialGradient(rx, ry, 10, rx, ry, rw * 0.95);
                    glare.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
                    glare.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
                    glare.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    c.fillStyle = glare;
                    c.fillRect(0, 0, w, h);
                    c.restore();
                }
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                
                if (state.polarized.mode === 'sem-polarizado') {
                    c.save();
                    const glare = c.createRadialGradient(lx, ly, 10, lx, ly, rw * 0.95);
                    glare.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
                    glare.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
                    glare.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    c.fillStyle = glare;
                    c.fillRect(0, 0, w, h);
                    c.restore();
                }
            }
        );

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(20, 20, 440, 45);
        ctx.fillStyle = state.polarized.mode === 'sem-polarizado' ? '#ff8888' : 'var(--gold-light)';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.fillText(state.polarized.mode === 'sem-polarizado' ? '❌ Sem Polarizado: Reflexo de sol na água encobre a visão' : '🌊 Com Polarizado Personality: Filtra 100% dos reflexos nocivos!', 35, 47);
    }

    // --- MÓDULO 9: CORES & SHINE MIRROR ---
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

        if (w <= 0 || h <= 0) return;

        const img = images.outdoorSun;

        let colorStyle = 'rgba(80,80,80,0.6)';
        if (state.colors.color === 'marrom') colorStyle = 'rgba(120,70,30,0.58)';
        if (state.colors.color === 'g15') colorStyle = 'rgba(30,90,50,0.58)';
        if (state.colors.color === 'gold-mirror') colorStyle = 'rgba(212,175,55,0.72)';
        if (state.colors.color === 'blue-mirror') colorStyle = 'rgba(0,150,255,0.72)';

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                
                c.save();
                c.globalCompositeOperation = 'multiply';
                c.fillStyle = colorStyle;
                c.fillRect(0, 0, w, h);
                c.restore();

                if (state.colors.color.includes('mirror')) {
                    c.save();
                    c.globalCompositeOperation = 'screen';
                    const mirrorGrad = c.createLinearGradient(0, 0, w, h);
                    mirrorGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
                    mirrorGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
                    mirrorGrad.addColorStop(1, 'rgba(255,255,255,0.15)');
                    c.fillStyle = mirrorGrad;
                    c.fillRect(0, 0, w, h);
                    c.restore();
                }
            },
            (c, lx, ly, rw, rh, isCam, offscreen) => {
                c.drawImage(offscreen, 0, 0, w, h);
                
                c.save();
                c.globalCompositeOperation = 'multiply';
                c.fillStyle = colorStyle;
                c.fillRect(0, 0, w, h);
                c.restore();

                if (state.colors.color.includes('mirror')) {
                    c.save();
                    c.globalCompositeOperation = 'screen';
                    const mirrorGrad = c.createLinearGradient(0, 0, w, h);
                    mirrorGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
                    mirrorGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
                    mirrorGrad.addColorStop(1, 'rgba(255,255,255,0.15)');
                    c.fillStyle = mirrorGrad;
                    c.fillRect(0, 0, w, h);
                    c.restore();
                }
            }
        );

        ctx.fillStyle = 'rgba(10, 10, 15, 0.9)';
        ctx.fillRect(w * 0.25, 20, w * 0.5, 45);
        ctx.fillStyle = '#fff';
        ctx.font = '700 13px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`🎨 Tonalidade / Espelhado: ${state.colors.color.toUpperCase()}`, w / 2, 47);
        ctx.textAlign = 'left';
    }

    // Listener de Redimensionamento Fluido
    window.addEventListener('resize', () => {
        if (state.authenticated) renderActiveCanvas(state.activeTab);
    });

});
