/* ==========================================================================
   PERSONALITY LENTES - DEMONSTRADOR DIGITAL FOTORREALISTA EM 1ª PESSOA (POV)
   Motor de Efeitos Óticos Premium & Alta Robustez (Prevenção de Falhas)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. ESTADO GLOBAL DA APLICAÇÃO
    // -------------------------------------------------------------
    const state = {
        authenticated: false,
        storeName: 'Modo Demonstração',
        trail: [],
        activeTab: 'tab-progressivos',
        cameraActive: false,
        videoStream: null,
        
        progressive: { lensLeft: 'premium-hd-ia', lensRight: 'convencional-padrao', sliderPos: 0.5 },
        office: { mode: 'office-personality' },
        freeform: { mode: 'freeform-asferica' },
        arDemo: { sliderPos: 0.5 },
        photo: { mode: 'gen-s', uvLevel: 0 },
        thickness: { diopter: -5.00 },
        polarized: { mode: 'com-polarizado' },
        colors: { color: 'cinza' }
    };

    // -------------------------------------------------------------
    // 2. CARREGAMENTO DE IMAGENS FOTORREALISTAS HD
    // -------------------------------------------------------------
    const images = {
        nightDriving: new Image(),
        officeScene: new Image(),
        waterGlare: new Image(),
        outdoorSun: new Image(),
        lenteImg: new Image()
    };

    // Configura os handlers onload antes de setar o src
    Object.values(images).forEach(img => {
        img.onload = () => {
            if (state && state.authenticated) {
                renderActiveCanvas(state.activeTab);
            }
        };
    });

    images.nightDriving.src = 'images/sim_night_driving.png';
    images.officeScene.src = 'images/sim_office_scene.png';
    images.waterGlare.src = 'images/sim_water_glare.png';
    images.outdoorSun.src = 'images/sim_outdoor_sun.png';
    images.lenteImg.src = 'images/LENTE.png';

    // Offscreen canvas auxiliar para renderizar efeitos de desfoque ótico (Blur)
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

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

    // Controles Flutuantes e Overlay (Tablet Mode)
    const btnFloatCamera = document.getElementById('btnFloatCamera');
    const btnFloatMenu = document.getElementById('btnFloatMenu');
    const btnFloatTrail = document.getElementById('btnFloatTrail');
    const simMenuOverlay = document.getElementById('simMenuOverlay');
    const btnCloseMenuOverlay = document.getElementById('btnCloseMenuOverlay');
    const simTrailPanel = document.getElementById('simTrailPanel');
    const btnCloseTrailPanel = document.getElementById('btnCloseTrailPanel');
    const btnClearTrailFloat = document.getElementById('btnClearTrailFloat');
    const btnFinishTrailFloat = document.getElementById('btnFinishTrailFloat');

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
        initTabletControllers();
        showActiveDockControls(state.activeTab);
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
            if (btnFloatCamera) {
                btnFloatCamera.style.background = 'rgba(40, 199, 111, 0.2)';
                btnFloatCamera.style.borderColor = 'var(--success)';
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
        if (btnFloatCamera) {
            btnFloatCamera.style.background = 'rgba(10, 10, 15, 0.35)';
            btnFloatCamera.style.borderColor = 'rgba(255, 255, 255, 0.15)';
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

            showActiveDockControls(targetTab);
            renderActiveCanvas(targetTab);
        });
    });

    if (btnViewTrailSummary) {
        btnViewTrailSummary.addEventListener('click', () => {
            const summaryBtn = document.querySelector('.sim-tab-btn[data-tab="tab-summary"]');
            if (summaryBtn) summaryBtn.click();
        });
    }

    // Exibição Dinâmica de Controles no Dock Inferior
    function showActiveDockControls(tabId) {
        document.querySelectorAll('.dock-controls-block').forEach(block => {
            block.style.display = 'none';
        });
        const activeBlockId = `dock-controls-${tabId.replace('tab-', '')}`;
        const activeBlock = document.getElementById(activeBlockId);
        if (activeBlock) {
            activeBlock.style.display = 'flex';
        }
    }

    // -------------------------------------------------------------
    // 7. CONTROLES PREMIUM PARA TABLET (POPUP VERTICAL & DOCK INFERIOR)
    // -------------------------------------------------------------
    function initTabletControllers() {
        
        // 1. Câmera (Canto Superior Direito)
        if (btnFloatCamera) {
            btnFloatCamera.addEventListener('click', async () => {
                if (state.cameraActive) {
                    stopCamera();
                } else {
                    await startCamera();
                }
            });
        }

        // 1.2. Tela Cheia (Canto Superior Esquerdo - Compatível com iPadOS/Safari/Android/Chrome)
        const btnFullscreen = document.getElementById('btnFullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => {
                const doc = window.document;
                // Prefere rodar fullscreen no contêiner do simulador ou no body
                const targetEl = doc.getElementById('simAppContent') || doc.body || doc.documentElement;

                // Mapeia métodos de entrada em tela cheia cross-browser
                const requestFS = targetEl.requestFullscreen || 
                                  targetEl.webkitRequestFullscreen || 
                                  targetEl.webkitRequestFullScreen || 
                                  targetEl.mozRequestFullScreen || 
                                  targetEl.msRequestFullscreen;

                // Mapeia métodos de saída de tela cheia
                const exitFS = doc.exitFullscreen || 
                               doc.webkitExitFullscreen || 
                               doc.webkitCancelFullScreen || 
                               doc.mozCancelFullScreen || 
                               doc.msExitFullscreen;

                // Verifica se já está em tela cheia
                const isFS = doc.fullscreenElement || 
                             doc.webkitFullscreenElement || 
                             doc.webkitIsFullScreen || 
                             doc.mozFullScreenElement || 
                             doc.msFullscreenElement;

                if (!isFS) {
                    if (requestFS) {
                        try {
                            requestFS.call(targetEl);
                        } catch (err) {
                            // Fallback caso falhe no contêiner
                            const fallbackFS = doc.documentElement.requestFullscreen || 
                                               doc.documentElement.webkitRequestFullscreen || 
                                               doc.documentElement.mozRequestFullScreen || 
                                               doc.documentElement.msRequestFullscreen;
                            if (fallbackFS) {
                                fallbackFS.call(doc.documentElement);
                            }
                        }
                    } else {
                        // Alerta instrutivo para iOS/iPad se o Safari do usuário estiver com o recurso desativado
                        alert("A API de Tela Cheia não foi permitida ou não é suportada diretamente pelo Safari neste dispositivo.\n\nPara usar em Tela Cheia no balcão sem barra de endereços:\n1. Toque no ícone de Compartilhar (seta para cima) no Safari.\n2. Escolha 'Adicionar à Tela de Início'.\n3. Abra o ícone criado na tela inicial do seu iPad.");
                    }
                } else {
                    if (exitFS) {
                        exitFS.call(doc);
                    }
                }
            });
        }

        // Eventos de alteração de tela cheia com suporte a prefixos de navegadores
        const fsEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        fsEvents.forEach(evt => {
            document.addEventListener(evt, () => {
                const isFSNow = document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.webkitIsFullScreen || 
                                document.mozFullScreenElement || 
                                document.msFullscreenElement;

                if (btnFullscreen) {
                    if (isFSNow) {
                        btnFullscreen.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #fff; width: 20px; height: 20px;">
                                <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4"></path>
                            </svg>
                        `;
                    } else {
                        btnFullscreen.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #fff; width: 20px; height: 20px;">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                        `;
                    }
                }
            });
        });

        // 2. Abrir Menu de Módulos (Canto Inferior Esquerdo - Popup Vertical que sobe)
        const simModulesPopupMenu = document.getElementById('simModulesPopupMenu');
        if (btnFloatMenu && simModulesPopupMenu) {
            btnFloatMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                if (simModulesPopupMenu.style.display === 'flex') {
                    simModulesPopupMenu.style.display = 'none';
                } else {
                    simModulesPopupMenu.style.display = 'flex';
                }
            });
        }

        // Fechar popup de módulos se clicar fora
        document.addEventListener('click', (e) => {
            if (simModulesPopupMenu && !simModulesPopupMenu.contains(e.target) && e.target !== btnFloatMenu) {
                simModulesPopupMenu.style.display = 'none';
            }
        });

        // 3. Seleção de Abas via Popup de Módulos Vertical
        const popupBtns = document.querySelectorAll('.sim-menu-popup-btn');
        popupBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                const targetBtn = document.querySelector(`.sim-tab-btn[data-tab="${targetTab}"]`);
                if (targetBtn) {
                    targetBtn.click(); // Troca de aba real
                }
                if (simModulesPopupMenu) {
                    simModulesPopupMenu.style.display = 'none'; // Auto-recolhe ao selecionar!
                }
                popupBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // 4. Botão Flutuante de Trilha
        if (btnFloatTrail && simTrailPanel) {
            btnFloatTrail.addEventListener('click', () => {
                if (simTrailPanel.style.display === 'block') {
                    simTrailPanel.style.display = 'none';
                } else {
                    simTrailPanel.style.display = 'block';
                    renderTrailChipsFloat();
                }
            });
        }

        if (btnCloseTrailPanel && simTrailPanel) {
            btnCloseTrailPanel.addEventListener('click', () => {
                simTrailPanel.style.display = 'none';
            });
        }

        if (btnFinishTrailFloat) {
            btnFinishTrailFloat.addEventListener('click', () => {
                if (simTrailPanel) simTrailPanel.style.display = 'none';
                const summaryBtn = document.querySelector('.sim-tab-btn[data-tab="tab-summary"]');
                if (summaryBtn) summaryBtn.click();
            });
        }

        if (btnClearTrailFloat) {
            btnClearTrailFloat.addEventListener('click', () => {
                state.trail = [];
                renderTrailChips();
                renderTrailChipsFloat();
            });
        }
    }

    // -------------------------------------------------------------
    // 8. TRILHA DE ESCOLHAS DO CLIENTE
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
                btn.textContent = '➕ Recomendar';
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

        // Atualiza contagem no botão flutuante
        const countSpanFloat = document.getElementById('trailCountFloat');
        if (countSpanFloat) countSpanFloat.textContent = state.trail.length;

        renderTrailChipsFloat();
        renderTrailChipsSubtle();

        if (state.trail.length === 0) {
            simTrailChipsContainer.innerHTML = `<span style="font-size: 11px; color: var(--text-muted);">Nenhuma opção marcada ainda.</span>`;
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

    function renderTrailChipsFloat() {
        const container = document.getElementById('simTrailChipsContainerFloat');
        if (!container) return;
        container.innerHTML = '';

        if (state.trail.length === 0) {
            container.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 16px 0; display: block;">Nenhuma escolha registrada.</span>`;
            return;
        }

        state.trail.forEach((t, idx) => {
            const row = document.createElement('div');
            row.style.cssText = `background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;`;
            row.innerHTML = `
                <div>
                    <span style="color: var(--gold-light); font-weight: 700; display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px;">${t.category}</span>
                    <strong style="color: #fff;">${t.item}</strong>
                </div>
                <span class="sim-chip-remove-float" data-idx="${idx}" style="cursor: pointer; color: #ff5555; font-weight: 700; padding: 2px 6px;">✕</span>
            `;
            container.appendChild(row);
        });

        container.querySelectorAll('.sim-chip-remove-float').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                state.trail.splice(idx, 1);
                renderTrailChips();
            });
        });
    }

    // Renderiza a trilha de escolhas sutis na base inferior
    function renderTrailChipsSubtle() {
        const container = document.getElementById('simTrailChipsContainerSubtle');
        if (!container) return;
        container.innerHTML = '';

        if (state.trail.length === 0) {
            container.innerHTML = `<span style="font-size: 9px; color: var(--text-muted);">Nenhuma recomendação salva.</span>`;
            return;
        }

        state.trail.forEach((t, idx) => {
            const chip = document.createElement('div');
            chip.style.cssText = `background: rgba(255,255,255,0.03); border: 1px solid var(--border-gold); border-radius: 6px; padding: 3px 8px; display: flex; align-items: center; gap: 6px; font-size: 9.5px; color: #fff; white-space: nowrap;`;
            chip.innerHTML = `
                <span><strong>${t.category}:</strong> ${t.item}</span>
                <span class="sim-chip-remove-subtle" data-idx="${idx}" style="cursor: pointer; color: #ff5555; font-weight: 700; padding-left: 2px;">✕</span>
            `;
            container.appendChild(chip);
        });

        container.querySelectorAll('.sim-chip-remove-subtle').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'));
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
    // 9. MOTOR DE VISÃO EM PRIMEIRA PESSOA (POV GLASSES ENGINE)
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
            const vidW = simVideoFeed.videoWidth || 1280;
            const vidH = simVideoFeed.videoHeight || 720;
            const aspectVid = vidW / vidH;
            const aspectCanvas = w / h;
            let sx = 0, sy = 0, sw = vidW, sh = vidH;

            if (aspectCanvas > aspectVid) {
                sh = vidW / aspectCanvas;
                sy = (vidH - sh) / 2;
            } else {
                sw = vidH * aspectCanvas;
                sx = (vidW - sw) / 2;
            }
            offscreenCtx.drawImage(simVideoFeed, sx, sy, sw, sh, 0, 0, w, h);
        } else if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            const imgW = bgImg.naturalWidth;
            const imgH = bgImg.naturalHeight;
            const aspectImg = imgW / imgH;
            const aspectCanvas = w / h;
            let sx = 0, sy = 0, sw = imgW, sh = imgH;

            if (aspectCanvas > aspectImg) {
                sh = imgW / aspectCanvas;
                sy = (imgH - sh) / 2;
            } else {
                sw = imgH * aspectCanvas;
                sx = (imgW - sw) / 2;
            }
            offscreenCtx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h);
        } else {
            offscreenCtx.fillStyle = '#0a0a0f';
            offscreenCtx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(offscreenCanvas, 0, 0, w, h);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        const rx = w * 0.25;
        const ry = h * 0.40;
        const rw = w * 0.21;
        const rh = h * 0.36;

        const lx = w * 0.75;
        const ly = h * 0.40;

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
    // 10. FUNÇÃO PARA DESENHAR MAPA DE ABERRAÇÃO PEDAGÓGICA (HEATMAP)
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
    // 11. RENDERIZADORES DOS MÓDULOS DE SIMULAÇÃO
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

    // --- MÓDULO 1: BATALHA DE PROGRESSIVOS ---
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
            // Multifocais IA (Alta Tecnologia)
            'gold-design-ia': { title: '👑 Gold Design IA', sub: 'Tecnologia Inteligência Artificial', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 1.0 },
            'premium-hd-ia': { title: '✨ Premium HD IA', sub: 'Cálculo por IA de Última Geração', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 1.3 },
            'tecno-line-ia': { title: '⚡ Tecno Line IA', sub: 'Otimização de Linha IA', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 1.7 },
            
            // Progressivos Digitais
            'gold-design': { title: '⚡ Gold Design Digital', sub: 'Lente Digital de Alto Padrão', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 2.1 },
            'premium-hd': { title: '⚡ Premium HD Digital', sub: 'Cálculo Digital Otimizado', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 2.6 },
            'tecno-line': { title: '⚡ Tecno Line Digital', sub: 'Corredor Otimizado Digital', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 3.6 },
            'maxvision': { title: '⚡ Maxvision Digital', sub: 'Lente Digital de Entrada', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 4.6 },
            'multi-premium': { title: '⚡ Multi Premium', sub: 'Multifocal Digital Econômica', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 5.6 },
            'gold-line': { title: '⚡ Gold Line', sub: 'Multifocal Básica Econômica', color: 'var(--gold-light)', border: 'var(--gold-primary)', isBad: false, blur: 6.6 },
            
            // Comparativos (Concorrente)
            'concorrente-basica': { title: '❌ Concorrente Básica', sub: 'Aberrações Médias nas Laterais', color: '#ffaa66', border: '#ffaa66', isBad: true, blur: 9.0 },
            'convencional-padrao': { title: '❌ Convencional Padrão', sub: 'Visão Túnel Restrita & Distorções', color: '#ff8888', border: '#ff5555', isBad: true, blur: 14.0 }
        };
        return map[key] || map['premium-hd-ia'];
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

        // Atualiza crachás flutuantes HTML no topo esquerdo/direito (apenas nome da lente para minimizar altura)
        const badgeL = document.getElementById('badgeProgressiveLeft');
        if (badgeL) {
            badgeL.innerHTML = `<span>${metaLeft.title}</span>`;
            badgeL.style.borderColor = metaLeft.border;
        }

        const badgeR = document.getElementById('badgeProgressiveRight');
        if (badgeR) {
            badgeR.innerHTML = `<span>${metaRight.title}</span>`;
            badgeR.style.borderColor = metaRight.border;
        }

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
    }

    // --- MÓDULO 2: OFFICE VS PERTO ---
    function initOfficeEngine() {
        const btns = document.querySelectorAll('#dock-controls-office button[data-type="office"]');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
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

        if (w <= 0 || h <= 0) return;

        const img = images.officeScene;
        const isPersonality = state.office.mode !== 'perto-simples';

        // Atualiza crachá flutuante HTML
        const badgeOffice = document.getElementById('badgeOffice');
        if (badgeOffice) {
            badgeOffice.innerHTML = isPersonality ? `
                <strong>💼 PERSONALITY OFFICE</strong>
                <span>Foco Dinâmico e Contínuo (40cm a 4 metros)</span>
                <small>Campo intermediário ampliado e perto confortável</small>
            ` : `
                <strong style="color: #ff8888;">❌ LENTE DE PERTO SIMPLES</strong>
                <span>Visão Fina Limitada a Apenas 40cm</span>
                <small>Tudo além de 40cm fica completamente embaçado</small>
            `;
            badgeOffice.style.borderColor = isPersonality ? 'var(--gold-primary)' : '#ff5555';
        }

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                if (!isPersonality) {
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
                if (!isPersonality) {
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
    }

    // --- MÓDULO 3: VS FREEFORM VS PRONTAS ---
    function initFreeformEngine() {
        const btns = document.querySelectorAll('#dock-controls-freeform button[data-type="freeform"]');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
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

        if (w <= 0 || h <= 0) return;

        const img = images.officeScene;
        const isFreeform = state.freeform.mode !== 'pronta-esferica';

        // Atualiza crachá flutuante HTML
        const badgeFreeform = document.getElementById('badgeFreeform');
        if (badgeFreeform) {
            badgeFreeform.innerHTML = isFreeform ? `
                <strong>✨ PERSONALITY VS FREEFORM ASFERICA</strong>
                <span>Nitidez Absoluta de Ponta a Ponta</span>
                <small>Asfericidade premium elimina distorções nas bordas</small>
            ` : `
                <strong style="color: #ff8888;">❌ LENTE PRONTA COMUM (ESFÉRICA)</strong>
                <span>Distorção "Olho de Peixe" Periférica</span>
                <small>Nitidez restrita ao centro óptico da lente</small>
            `;
            badgeFreeform.style.borderColor = isFreeform ? 'var(--gold-primary)' : '#ff5555';
        }

        drawGlassesPOV(ctx, w, h, img,
            (c, rx, ry, rw, rh, isCam, offscreen) => {
                if (!isFreeform) {
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
                if (!isFreeform) {
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
    }

    // --- MÓDULO 4: COM VS SEM ANTIRREFLEXO ---
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
        const btns = document.querySelectorAll('#dock-controls-photo button[data-type="photo"]');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
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
        const isGenS = state.photo.mode === 'gen-s';

        // Atualiza crachá flutuante HTML
        const badgePhoto = document.getElementById('badgePhoto');
        if (badgePhoto) {
            badgePhoto.innerHTML = `
                <strong>☀️ TECNOLOGIA TRANSITIONS</strong>
                <span>${isGenS ? 'Transitions GEN S (Ativação Ultrarrápida)' : 'Transitions Xtractive (Ativação no Carro)'}</span>
                <small>Intensidade da Radiação UV: ${state.photo.uvLevel}%</small>
            `;
            badgePhoto.style.borderColor = 'var(--gold-primary)';
        }

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
    }

    // --- MÓDULO 7: CALCULADORA DE ESPESSURA DE BORDA ---
    initThicknessEngine(); // Inicia a escuta da dioptria de imediato

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
        const btns = document.querySelectorAll('#dock-controls-polarized button[data-type="polar"]');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
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

        ctx.clearRect(0, 0, w, h);

        const isCamActive = state.cameraActive && simVideoFeed && simVideoFeed.readyState >= 2;

        offscreenCanvas.width = w;
        offscreenCanvas.height = h;

        // 1. Fundo Geral da Cena (Visão Periférica)
        ctx.save();
        if (isCamActive) {
            const vidW = simVideoFeed.videoWidth || 1280;
            const vidH = simVideoFeed.videoHeight || 720;
            const aspectVid = vidW / vidH;
            const aspectCanvas = w / h;
            let sx = 0, sy = 0, sw = vidW, sh = vidH;

            if (aspectCanvas > aspectVid) {
                sh = vidW / aspectCanvas;
                sy = (vidH - sh) / 2;
            } else {
                sw = vidH * aspectCanvas;
                sx = (vidW - sw) / 2;
            }
            offscreenCtx.drawImage(simVideoFeed, sx, sy, sw, sh, 0, 0, w, h);
        } else {
            const img = images.waterGlare;
            if (img && img.complete && img.naturalWidth > 0) {
                const imgW = img.naturalWidth;
                const imgH = img.naturalHeight;
                const aspectImg = imgW / imgH;
                const aspectCanvas = w / h;
                let sx = 0, sy = 0, sw = imgW, sh = imgH;

                if (aspectCanvas > aspectImg) {
                    sh = imgW / aspectCanvas;
                    sy = (imgH - sh) / 2;
                } else {
                    sw = imgH * aspectCanvas;
                    sx = (imgW - sw) / 2;
                }
                offscreenCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
            }
        }

        // Desenha a cena original no canvas
        ctx.drawImage(offscreenCanvas, 0, 0, w, h);

        // Aplica o escurecimento do ambiente ao redor (fora das lentes)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();

        // Coordenadas centrais das duas lentes
        const rx = w * 0.25;
        const ry = h * 0.40;
        const lx = w * 0.75;
        const ly = h * 0.40;

        // Proporções exatas da imagem atualizada: 5874x4566 pixels
        const imgW = 5874;
        const imgH = 4566;
        const aspect = imgW / imgH; // 1.286465

        // Largura base estática ampliada para maior destaque na tela
        let drawW = 440; 
        const maxW = w * 0.22 * 2; // Clampa a largura máxima para 44% da tela para evitar sobreposição em telas pequenas
        if (drawW > maxW) {
            drawW = maxW;
        }

        const drawH = drawW / aspect; // Altura calculada estritamente proporcional
        const rw = drawW / 2;
        const actualRh = drawH / 2;

        // 2. VISÃO INTERNA DA LENTE ESQUERDA (DENTRO DA IMAGEM LENS/FRAME - MIOLO CLARO - SEMPRE POLARIZADA)
        ctx.save();
        ctx.beginPath();
        // A elipse de recorte acompanha perfeitamente a proporção original de 5850x4557
        ctx.ellipse(rx, ry, rw * 0.88, actualRh * 0.88, 0, 0, Math.PI * 2);
        ctx.clip();
        
        // Desenha a cena clara/brilhante sem o escurecimento externo (revela os peixes!)
        ctx.drawImage(offscreenCanvas, 0, 0, w, h);
        ctx.restore();

        // 3. VISÃO INTERNA DA LENTE DIREITA (DENTRO DA IMAGEM LENS/FRAME ESPELHADA - MIOLO CLARO - SEMPRE NÃO POLARIZADA)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(lx, ly, rw * 0.88, actualRh * 0.88, 0, 0, Math.PI * 2);
        ctx.clip();
        
        // Desenha a cena clara/brilhante
        ctx.drawImage(offscreenCanvas, 0, 0, w, h);

        // Aplica o ofuscamento de sol na água (glare) sobre o canal direito não-polarizado
        ctx.save();
        const glare = ctx.createRadialGradient(lx, ly, 10, lx, ly, rw * 0.95);
        glare.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
        glare.addColorStop(0.5, 'rgba(255, 255, 255, 0.48)');
        glare.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glare;
        ctx.fillRect(lx - rw, ly - actualRh, rw * 2, drawH);
        ctx.restore();
        
        ctx.restore();

        // 4. DESENHO DA IMAGEM LENTE.PNG SOBRE AS DUAS ÁREAS
        // Lente Esquerda (Proporcional à largura de 5850x4557 e sem distorção)
        if (images.lenteImg && images.lenteImg.complete && images.lenteImg.naturalWidth > 0) {
            ctx.drawImage(images.lenteImg, rx - rw, ry - actualRh, rw * 2, drawH);
        }

        // Lente Direita (Espelhada horizontalmente, Proporcional e sem distorção)
        if (images.lenteImg && images.lenteImg.complete && images.lenteImg.naturalWidth > 0) {
            ctx.save();
            ctx.translate(lx, ly);
            ctx.scale(-1, 1);
            ctx.drawImage(images.lenteImg, -rw, -actualRh, rw * 2, drawH);
            ctx.restore();
        }
    }

    // --- MÓDULO 9: CORES & SHINE MIRROR ---
    function initColorsEngine() {
        const btns = document.querySelectorAll('#dock-controls-colors button.sim-color-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
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

        // Atualiza crachá flutuante HTML
        const badgeColors = document.getElementById('badgeColors');
        if (badgeColors) {
            badgeColors.innerHTML = `
                <strong>🎨 ACABAMENTO ESPELHADO / SOLAR</strong>
                <span>Tonalidade: ${state.colors.color.toUpperCase()}</span>
                <small>${state.colors.color.includes('mirror') ? 'Tecnologia Shine Mirror Reflexiva' : 'Filtro Solar de Conforto Clássico'}</small>
            `;
            badgeColors.style.borderColor = 'var(--gold-primary)';
        }

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
    }

    // -------------------------------------------------------------
    // 12. INICIALIZAÇÃO DO AR ENGINE MÓDULO ANTIRREFLEXO
    // -------------------------------------------------------------
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

    // Listener de Redimensionamento Fluido
    window.addEventListener('resize', () => {
        if (state.authenticated) renderActiveCanvas(state.activeTab);
    });

});
