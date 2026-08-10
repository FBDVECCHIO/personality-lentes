document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // Configurações do Supabase e Helpers
    // -------------------------------------------------------------
    const DEFAULT_SB_URL = 'https://mngwfearwjkpisararbe.supabase.co';
    const DEFAULT_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uZ3dmZWFyd2prcGlzYXJhcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTc5MzksImV4cCI6MjA5NjE3MzkzOX0.vk9Ol41NU2RI72-ZZKIcm7hzccYBjzPPptb6rZv_mKs';

    function getSupabaseUrl() {
        const customUrl = localStorage.getItem('personality_sb_url');
        return (customUrl && customUrl.trim()) ? customUrl.trim() : DEFAULT_SB_URL;
    }

    function getSupabaseKey() {
        const customKey = localStorage.getItem('personality_sb_key');
        return (customKey && customKey.trim()) ? customKey.trim() : DEFAULT_SB_KEY;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // =============================================================
    // Efeitos de Áudio e Animação 3D Gamificada (v3.73)
    // =============================================================
    const playSynthSound = (type) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            if (type === 'pop') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.25);
                
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(1800, ctx.currentTime);
                osc2.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.2);
                gain2.gain.setValueAtTime(0.06, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.25);
            } else if (type === 'chime') {
                const freqs = [261.63, 329.63, 392.00, 523.25];
                freqs.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
                    gain.gain.setValueAtTime(0.0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + index * 0.08 + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.6);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + index * 0.08);
                    osc.stop(ctx.currentTime + index * 0.08 + 0.75);
                });
            }
        } catch (e) {
            console.warn('Audio Context block:', e);
        }
    };

    const triggerConfettiEffect = () => {
        try {
            const duration = 2 * 1000;
            const end = Date.now() + duration;
            
            const confCanvas = document.createElement('canvas');
            confCanvas.style.position = 'fixed';
            confCanvas.style.top = '0';
            confCanvas.style.left = '0';
            confCanvas.style.width = '100vw';
            confCanvas.style.height = '100vh';
            confCanvas.style.pointerEvents = 'none';
            confCanvas.style.zIndex = '99999';
            document.body.appendChild(confCanvas);
            
            const ctx = confCanvas.getContext('2d');
            confCanvas.width = window.innerWidth;
            confCanvas.height = window.innerHeight;
            
            const colors = ['#c5a85c', '#ffffff', '#8a6d3b', '#10b981', '#3b82f6'];
            const particles = [];
            
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * confCanvas.width,
                    y: Math.random() * confCanvas.height - confCanvas.height,
                    r: Math.random() * 6 + 4,
                    d: Math.random() * confCanvas.height,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    tilt: Math.random() * 10 - 5,
                    tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                    tiltAngle: 0
                });
            }
            
            const draw = () => {
                if (Date.now() > end) {
                    confCanvas.remove();
                    return;
                }
                ctx.clearRect(0, 0, confCanvas.width, confCanvas.height);
                particles.forEach((p, idx) => {
                    p.tiltAngle += p.tiltAngleIncremental;
                    p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                    p.x += Math.sin(p.tiltAngle);
                    p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
                    
                    ctx.beginPath();
                    ctx.lineWidth = p.r;
                    ctx.strokeStyle = p.color;
                    ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                    ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                    ctx.stroke();
                    
                    if (p.y > confCanvas.height) {
                        p.x = Math.random() * confCanvas.width;
                        p.y = -20;
                    }
                });
                requestAnimationFrame(draw);
            };
            draw();
        } catch (err) {
            console.warn('Confetti error:', err);
        }
    };

    let radarAnimationId = null;
    let radarBubbles = [];
    let radarMouse = { x: 0, y: 0 };
    let radarHoveredBubble = null;
    
    function initVendedorRadar(list) {
        const canvas = document.getElementById('vendedorRadarCanvas');
        const emptyOverlay = document.getElementById('radarEmptyOverlay');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (radarAnimationId) {
            cancelAnimationFrame(radarAnimationId);
            radarAnimationId = null;
        }
        
        radarBubbles = [];
        
        if (!list || list.length === 0) {
            if (emptyOverlay) emptyOverlay.style.display = 'block';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        
        if (emptyOverlay) emptyOverlay.style.display = 'none';
        
        const resizeRadarCanvas = () => {
            const rect = canvas.parentNode.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resizeRadarCanvas();
        
        list.forEach((item) => {
            let pointsVal = 100;
            if (window.currentRewardsConfig && window.currentRewardsConfig.length > 0) {
                const lensConf = window.currentRewardsConfig.find(c => c.categoria === 'lente' && c.nome === item.lente_familia) || { pontos: 0 };
                const arConf = window.currentRewardsConfig.find(c => c.categoria === 'antirreflexo' && c.nome === item.ar_familia) || { pontos: 0 };
                pointsVal = (lensConf.pontos || 0) + (arConf.pontos || 0) || 100;
            }
            
            const radius = 40 + Math.min(pointsVal / 8, 20);
            
            radarBubbles.push({
                id: item.os,
                os: item.os,
                client: item.cliente_nome,
                lens: item.lente_familia,
                ar: item.ar_familia,
                points: pointsVal,
                radius: radius,
                x: Math.random() * (canvas.width - radius * 2) + radius,
                y: Math.random() * (canvas.height - radius * 2) + radius,
                vx: (0.4 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1),
                vy: (0.4 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1),
                pulseOffset: Math.random() * 100,
                opacity: 0,
                isExploding: false,
                particles: []
            });
        });
        
        canvas.onmousemove = (e) => {
            const rect = canvas.getBoundingClientRect();
            radarMouse.x = e.clientX - rect.left;
            radarMouse.y = e.clientY - rect.top;
        };
        
        canvas.onclick = () => {
            if (radarHoveredBubble && !radarHoveredBubble.isExploding) {
                const b = radarHoveredBubble;
                b.isExploding = true;
                playSynthSound('pop');
                
                const colors = ['#c5a85c', '#ffffff', '#8a6d3b', '#ffda79'];
                for (let i = 0; i < 35; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1.5 + Math.random() * 4.5;
                    b.particles.push({
                        x: b.x,
                        y: b.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 1,
                        radius: 1 + Math.random() * 2.5,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        alpha: 1.0,
                        decay: 0.015 + Math.random() * 0.02
                    });
                }
                
                const saleOsSelect = document.getElementById('saleOs');
                if (saleOsSelect) {
                    saleOsSelect.value = b.os;
                    saleOsSelect.dispatchEvent(new Event('change'));
                }
                
                const formCard = saleOsSelect.closest('.glass-card') || saleOsSelect.parentNode;
                if (formCard) {
                    formCard.style.transition = 'all 0.5s ease';
                    formCard.style.boxShadow = '0 0 25px rgba(197, 168, 92, 0.4)';
                    formCard.style.borderColor = '#c5a85c';
                    setTimeout(() => {
                        formCard.style.boxShadow = '';
                        formCard.style.borderColor = '';
                    }, 1200);
                }
                
                setTimeout(() => {
                    radarBubbles = radarBubbles.filter(bubble => bubble.id !== b.id);
                    if (radarBubbles.length === 0 && emptyOverlay) {
                        emptyOverlay.style.display = 'block';
                    }
                }, 1200);
            }
        };
        
        const loop = () => {
            if (!canvas.getContext) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.strokeStyle = 'rgba(197, 168, 92, 0.015)';
            ctx.lineWidth = 1;
            const size = 30;
            for (let x = 0; x < canvas.width; x += size) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += size) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }
            
            let hovered = null;
            
            radarBubbles.forEach((b) => {
                if (b.isExploding) {
                    b.particles.forEach((p) => {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += 0.03;
                        p.alpha -= p.decay;
                        
                        ctx.save();
                        ctx.globalAlpha = Math.max(0, p.alpha);
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 6;
                        ctx.fill();
                        ctx.restore();
                    });
                    b.particles = b.particles.filter(p => p.alpha > 0);
                    return;
                }
                
                if (b.opacity < 1) b.opacity += 0.05;
                
                b.x += b.vx;
                b.y += b.vy;
                b.y += Math.sin(Date.now() * 0.0015 + b.pulseOffset) * 0.08;
                
                if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -1; }
                else if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx *= -1; }
                if (b.y - b.radius < 0) { b.y = b.radius; b.vy *= -1; }
                else if (b.y + b.radius > canvas.height) { b.y = canvas.height - b.radius; b.vy *= -1; }
                
                const dx = radarMouse.x - b.x;
                const dy = radarMouse.y - b.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const isHovered = dist < b.radius;
                
                if (isHovered) {
                    hovered = b;
                }
                
                ctx.save();
                ctx.globalAlpha = b.opacity;
                ctx.shadowColor = isHovered ? '#c5a85c' : 'rgba(197, 168, 92, 0.3)';
                ctx.shadowBlur = isHovered ? 20 : 8;
                
                const radGrad = ctx.createRadialGradient(
                    b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.1,
                    b.x, b.y, b.radius
                );
                if (isHovered) {
                    radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
                    radGrad.addColorStop(0.3, 'rgba(197, 168, 92, 0.3)');
                    radGrad.addColorStop(0.9, 'rgba(197, 168, 92, 0.65)');
                    radGrad.addColorStop(1, '#c5a85c');
                } else {
                    radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                    radGrad.addColorStop(0.3, 'rgba(197, 168, 92, 0.08)');
                    radGrad.addColorStop(0.85, 'rgba(197, 168, 92, 0.3)');
                    radGrad.addColorStop(1, 'rgba(197, 168, 92, 0.75)');
                }
                
                ctx.beginPath();
                ctx.arc(b.x, b.y, isHovered ? b.radius * 1.05 : b.radius, 0, Math.PI * 2);
                ctx.fillStyle = radGrad;
                ctx.fill();
                
                ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = isHovered ? 1.5 : 1;
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.font = `bold 10px 'Montserrat', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(b.os, b.x, b.y - 6);
                
                ctx.beginPath();
                ctx.roundRect(b.x - 26, b.y + 5, 52, 12, 6);
                ctx.fillStyle = isHovered ? '#fff' : '#c5a85c';
                ctx.fill();
                
                ctx.fillStyle = '#000';
                ctx.font = `bold 9px 'Montserrat', sans-serif`;
                ctx.fillText(`+${b.points} pts`, b.x, b.y + 11);
                
                ctx.restore();
            });
            
            radarHoveredBubble = hovered;
            radarAnimationId = requestAnimationFrame(loop);
        };
        
        radarAnimationId = requestAnimationFrame(loop);
    }

    // Password Visibility Toggle (Olho) (v3.60)
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const wrapper = btn.closest('.password-wrapper');
            if (!wrapper) return;
            const input = wrapper.querySelector('input');
            if (!input) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🔒';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        });
    });

    function showError(inputElement, errorElement, isVisible) {
        if (!inputElement || !errorElement) return;
        if (isVisible) {
            inputElement.style.borderColor = '#ff5555';
            errorElement.style.display = 'block';
        } else {
            inputElement.style.borderColor = 'rgba(255,255,255,0.1)';
            errorElement.style.display = 'none';
        }
    }

    // -------------------------------------------------------------
    // Mapeamento de Elementos DOM
    // -------------------------------------------------------------
    const linkGoToRegister = document.getElementById('linkGoToRegister');
    const linkGoToLogin = document.getElementById('linkGoToLogin');
    const vendedorLoginCard = document.getElementById('vendedorLoginCard');
    const vendedorRegisterCard = document.getElementById('vendedorRegisterCard');
    const vendedorLoginForm = document.getElementById('vendedorLoginForm');
    const vendedorRegisterForm = document.getElementById('vendedorRegisterForm');
    const vendedorDashboardPanel = document.getElementById('vendedorDashboardPanel');
    const vendedorAuthContainer = document.getElementById('vendedorAuthContainer');
    const approvalWarningBox = document.getElementById('approvalWarningBox');
    
    const vendedorRegName = document.getElementById('vendedorRegName');
    const vendedorRegCpf = document.getElementById('vendedorRegCpf');
    const vendedorRegStore = document.getElementById('vendedorRegStore');
    const vendedorRegWhatsapp = document.getElementById('vendedorRegWhatsapp');
    const vendedorRegEmail = document.getElementById('vendedorRegEmail');
    const vendedorRegUser = document.getElementById('vendedorRegUser');
    const vendedorRegPass = document.getElementById('vendedorRegPass');
    
    // Switcher de Tela Login / Cadastro
    if (linkGoToRegister) {
        linkGoToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            vendedorLoginCard.style.display = 'none';
            vendedorRegisterCard.style.display = 'block';
            approvalWarningBox.style.display = 'none';
        });
    }
    if (linkGoToLogin) {
        linkGoToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            vendedorRegisterCard.style.display = 'none';
            vendedorLoginCard.style.display = 'block';
        });
    }

    // -------------------------------------------------------------
    // Mascaramento de Campos
    // -------------------------------------------------------------
    if (vendedorRegCpf) {
        vendedorRegCpf.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 9) {
                e.target.value = `${value.substring(0,3)}.${value.substring(3,6)}.${value.substring(6,9)}-${value.substring(9)}`;
            } else if (value.length > 6) {
                e.target.value = `${value.substring(0,3)}.${value.substring(3,6)}.${value.substring(6)}`;
            } else if (value.length > 3) {
                e.target.value = `${value.substring(0,3)}.${value.substring(3)}`;
            }
        });
    }

    if (vendedorRegWhatsapp) {
        vendedorRegWhatsapp.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            if (value.length > 10) {
                e.target.value = `(${value.substring(0,2)}) ${value.substring(2,7)}-${value.substring(7)}`;
            } else if (value.length > 6) {
                e.target.value = `(${value.substring(0,2)}) ${value.substring(2,6)}-${value.substring(6)}`;
            } else if (value.length > 2) {
                e.target.value = `(${value.substring(0,2)}) ${value.substring(2)}`;
            } else if (value.length > 0) {
                e.target.value = `(${value}`;
            }
        });
    }

    // Alimentação Dinâmica de Lojas
    async function loadStoresList() {
        if (!vendedorRegStore) return;
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const storesTable = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';

        let stores = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const res = await fetch(`${cleanUrl}/rest/v1/${storesTable}?select=nome&order=nome.asc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (res.ok) {
                    stores = await res.json();
                } else {
                    throw new Error('Fallback para local');
                }
            } catch (e) {
                stores = JSON.parse(localStorage.getItem('personality_stores')) || [];
            }
        } else {
            stores = JSON.parse(localStorage.getItem('personality_stores')) || [];
        }

        vendedorRegStore.innerHTML = '<option value="">Selecione sua ótica licenciada...</option>';
        stores.forEach(store => {
            const opt = document.createElement('option');
            opt.value = store.nome;
            opt.textContent = store.nome;
            vendedorRegStore.appendChild(opt);
        });
    }

    // Configurações de prêmios por família padrão
    let currentRewardsConfig = [
        { categoria: 'lente', nome: 'Linha IA (Exclusivos)', pontos: 50, valor: 50 },
        { categoria: 'lente', nome: 'Linha Tradicional', pontos: 20, valor: 20 },
        { categoria: 'lente', nome: '1.61 Gold', pontos: 30, valor: 30 },
        { categoria: 'antirreflexo', nome: 'Anti-Reflexo Premium (Classic)', pontos: 10, valor: 10 },
        { categoria: 'antirreflexo', nome: 'Filtro Azul (Blue Control)', pontos: 15, valor: 15 },
        { categoria: 'antirreflexo', nome: 'Sem Tratamento Especial', pontos: 0, valor: 0 }
    ];

    async function loadRewardsConfig() {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const configTable = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${configTable}?select=*`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        currentRewardsConfig = data;
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar configuracoes de premios:', error);
            }
        } else {
            const localConfig = localStorage.getItem('personality_premios_config');
            if (localConfig) {
                currentRewardsConfig = JSON.parse(localConfig);
            }
        }
        populateProductSelects();
    }

    function populateProductSelects() {
        const saleLensFamily = document.getElementById('saleLensFamily');
        const saleArFamily = document.getElementById('saleArFamily');
        if (saleLensFamily) {
            saleLensFamily.innerHTML = '<option value="">Selecione a lente...</option>';
            currentRewardsConfig.filter(c => c.categoria === 'lente').forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.nome;
                opt.textContent = `${item.nome} (${item.pontos} Pts)`;
                saleLensFamily.appendChild(opt);
            });
        }
        if (saleArFamily) {
            saleArFamily.innerHTML = '<option value="">Selecione o antirreflexo...</option>';
            currentRewardsConfig.filter(c => c.categoria === 'antirreflexo').forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.nome;
                opt.textContent = `${item.nome} (${item.pontos} Pts)`;
                saleArFamily.appendChild(opt);
            });
        }
    }

    // -------------------------------------------------------------
    // Cadastro de Vendedor (Status pendente por padrão)
    // -------------------------------------------------------------
    if (vendedorRegisterForm) {
        vendedorRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal = vendedorRegName.value.trim();
            const cpfVal = vendedorRegCpf.value.trim();
            const storeVal = vendedorRegStore.value;
            const whatsappVal = vendedorRegWhatsapp.value.trim();
            const emailVal = vendedorRegEmail.value.trim();
            const userVal = vendedorRegUser.value.trim().toLowerCase();
            const passVal = vendedorRegPass.value.trim();

            let isValid = true;

            if (nameVal.length < 3) {
                showError(vendedorRegName, document.getElementById('vendedorRegNameError'), true);
                isValid = false;
            } else {
                showError(vendedorRegName, document.getElementById('vendedorRegNameError'), false);
            }

            if (cpfVal.replace(/\D/g, '').length !== 11) {
                showError(vendedorRegCpf, document.getElementById('vendedorRegCpfError'), true);
                isValid = false;
            } else {
                showError(vendedorRegCpf, document.getElementById('vendedorRegCpfError'), false);
            }

            if (!storeVal) {
                showError(vendedorRegStore, document.getElementById('vendedorRegStoreError'), true);
                isValid = false;
            } else {
                showError(vendedorRegStore, document.getElementById('vendedorRegStoreError'), false);
            }

            if (whatsappVal.replace(/\D/g, '').length < 10) {
                showError(vendedorRegWhatsapp, document.getElementById('vendedorRegWhatsappError'), true);
                isValid = false;
            } else {
                showError(vendedorRegWhatsapp, document.getElementById('vendedorRegWhatsappError'), false);
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailVal)) {
                showError(vendedorRegEmail, document.getElementById('vendedorRegEmailError'), true);
                isValid = false;
            } else {
                showError(vendedorRegEmail, document.getElementById('vendedorRegEmailError'), false);
            }

            if (userVal.length < 3) {
                showError(vendedorRegUser, document.getElementById('vendedorRegUserError'), true);
                isValid = false;
            } else {
                showError(vendedorRegUser, document.getElementById('vendedorRegUserError'), false);
            }

            if (passVal.length < 4) {
                showError(vendedorRegPass, document.getElementById('vendedorRegPassError'), true);
                isValid = false;
            } else {
                showError(vendedorRegPass, document.getElementById('vendedorRegPassError'), false);
            }

            if (!isValid) return;

            const spinner = document.getElementById('vendedorRegisterSpinner');
            const btn = document.getElementById('btnVendedorRegister');
            btn.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';
            btn.querySelector('.btn-text').textContent = 'Cadastrando...';

            const vendedorData = {
                nome: nameVal,
                cpf: cpfVal,
                loja: storeVal,
                whatsapp: whatsappVal,
                email: emailVal,
                usuario: userVal,
                senha: passVal,
                aprovado: false, // Inicializa como PENDENTE de aprovação
                created_at: new Date().toISOString()
            };

            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    
                    // Verifica se o usuário já existe
                    const checkRes = await fetch(`${cleanUrl}/rest/v1/${vendTable}?usuario=eq.${encodeURIComponent(userVal)}`, {
                        method: 'GET',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });
                    if (checkRes.ok) {
                        const existing = await checkRes.json();
                        if (existing && existing.length > 0) {
                            showError(vendedorRegUser, document.getElementById('vendedorRegUserError'), true);
                            throw new Error('Usuário já cadastrado.');
                        }
                    }

                    // Faz o insert
                    const insertRes = await fetch(`${cleanUrl}/rest/v1/${vendTable}`, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(vendedorData)
                    });

                    if (!insertRes.ok) {
                        throw new Error('Falha ao registrar no Supabase.');
                    }

                    alert('Cadastro de vendedor realizado com sucesso! Aguarde a aprovação do laboratório para fazer login.');
                    vendedorRegisterForm.reset();
                    vendedorRegisterCard.style.display = 'none';
                    vendedorLoginCard.style.display = 'block';

                } catch (error) {
                    console.error(error);
                    if (error.message !== 'Usuário já cadastrado.') {
                        saveVendedorLocally(vendedorData);
                        alert('Cadastro salvo localmente. Aguarde a liberação do administrador no painel master.');
                        vendedorRegisterForm.reset();
                        vendedorRegisterCard.style.display = 'none';
                        vendedorLoginCard.style.display = 'block';
                    }
                } finally {
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    btn.querySelector('.btn-text').textContent = 'Realizar Cadastro';
                }
            } else {
                setTimeout(() => {
                    const localVends = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
                    const duplicate = localVends.find(v => v.usuario === userVal);
                    if (duplicate) {
                        showError(vendedorRegUser, document.getElementById('vendedorRegUserError'), true);
                        btn.disabled = false;
                        if (spinner) spinner.style.display = 'none';
                        btn.querySelector('.btn-text').textContent = 'Realizar Cadastro';
                        return;
                    }
                    saveVendedorLocally(vendedorData);
                    alert('Cadastro de vendedor realizado com sucesso! Aguarde a aprovação do laboratório para fazer login.');
                    vendedorRegisterForm.reset();
                    vendedorRegisterCard.style.display = 'none';
                    vendedorLoginCard.style.display = 'block';
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    btn.querySelector('.btn-text').textContent = 'Realizar Cadastro';
                }, 1000);
            }
        });
    }

    function saveVendedorLocally(data) {
        const local = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
        const localData = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            ...data
        };
        local.push(localData);
        localStorage.setItem('personality_local_vendedores', JSON.stringify(local));
    }

    // -------------------------------------------------------------
    // Login do Vendedor com Verificação de Aprovação
    // -------------------------------------------------------------
    if (vendedorLoginForm) {
        vendedorLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userVal = document.getElementById('vendedorUsername').value.trim().toLowerCase();
            const passVal = document.getElementById('vendedorPassword').value.trim();

            const spinner = document.getElementById('vendedorLoginSpinner');
            const btn = document.getElementById('btnVendedorLogin');
            const errorMsg = document.getElementById('vendedorLoginError');

            if (!userVal || !passVal) return;

            btn.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';
            errorMsg.style.display = 'none';
            approvalWarningBox.style.display = 'none';

            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/${vendTable}?usuario=eq.${encodeURIComponent(userVal)}&senha=eq.${encodeURIComponent(passVal)}&limit=1`;
                    
                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const v = data[0];
                            if (v.aprovado === true || v.aprovado === "true") {
                                loginVendedorSuccess(v);
                            } else {
                                approvalWarningBox.style.display = 'block';
                            }
                        } else {
                            throw new Error('Credenciais incorretas.');
                        }
                    } else {
                        throw new Error('Erro na API.');
                    }
                } catch (error) {
                    console.error(error);
                    const matchedLocal = checkLocalVendedorAuth(userVal, passVal);
                    if (matchedLocal) {
                        if (matchedLocal.aprovado === true || matchedLocal.aprovado === "true") {
                            loginVendedorSuccess(matchedLocal);
                        } else {
                            approvalWarningBox.style.display = 'block';
                        }
                    } else {
                        errorMsg.style.display = 'block';
                    }
                } finally {
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                }
            } else {
                setTimeout(() => {
                    const matchedLocal = checkLocalVendedorAuth(userVal, passVal);
                    if (matchedLocal) {
                        if (matchedLocal.aprovado === true || matchedLocal.aprovado === "true") {
                            loginVendedorSuccess(matchedLocal);
                        } else {
                            approvalWarningBox.style.display = 'block';
                        }
                    } else {
                        errorMsg.style.display = 'block';
                    }
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                }, 800);
            }
        });
    }

    function checkLocalVendedorAuth(user, pass) {
        const local = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
        return local.find(v => v.usuario === user && v.senha === pass) || null;
    }

    function loginVendedorSuccess(vendedor) {
        sessionStorage.setItem('active_vendedor_id', vendedor.id);
        sessionStorage.setItem('active_vendedor_nome', vendedor.nome);
        sessionStorage.setItem('active_vendedor_loja', vendedor.loja);
        sessionStorage.setItem('active_vendedor_cpf', vendedor.cpf);
        
        checkVendedorSession();
    }

    function checkVendedorSession() {
        const activeId = sessionStorage.getItem('active_vendedor_id');
        const activeNome = sessionStorage.getItem('active_vendedor_nome');
        const activeLoja = sessionStorage.getItem('active_vendedor_loja');
        const activeCpf = sessionStorage.getItem('active_vendedor_cpf');

        if (activeId && activeNome && activeLoja && activeCpf) {
            vendedorAuthContainer.style.display = 'none';
            vendedorDashboardPanel.style.display = 'block';
            approvalWarningBox.style.display = 'none';
            
            document.getElementById('vendedorSessionName').textContent = activeNome;
            document.getElementById('vendedorSessionStore').textContent = activeLoja;
            
            loadVendedorExtrato(activeId);
            loadAuthorizedOsList(activeCpf);
            startInactivityTimer();
        } else {
            vendedorDashboardPanel.style.display = 'none';
            vendedorAuthContainer.style.display = 'block';
            vendedorLoginCard.style.display = 'block';
            vendedorRegisterCard.style.display = 'none';
            stopInactivityTimer();
        }
    }

    // -------------------------------------------------------------
    // Timer de Inatividade de 2 minutos (120 segundos)
    // -------------------------------------------------------------
    let inactivityTimer = null;
    let countdownInterval = null;
    let secondsLeft = 120;

    function startInactivityTimer() {
        stopInactivityTimer();
        secondsLeft = 120;
        updateTimerDisplay();

        // Monitora as interações do usuário
        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keypress', resetInactivityTimer);
        window.addEventListener('click', resetInactivityTimer);
        window.addEventListener('scroll', resetInactivityTimer);

        countdownInterval = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();

            // Mostra toast de aviso se faltarem menos de 15 segundos
            const toast = document.getElementById('inactivityToast');
            if (secondsLeft <= 15 && secondsLeft > 0) {
                if (toast) {
                    toast.style.display = 'block';
                    toast.textContent = `⚠️ Você será desconectado em ${secondsLeft} segundos por inatividade!`;
                }
            } else if (toast) {
                toast.style.display = 'none';
            }

            if (secondsLeft <= 0) {
                triggerAutoLogout();
            }
        }, 1000);
    }

    function resetInactivityTimer() {
        secondsLeft = 120;
        updateTimerDisplay();
        const toast = document.getElementById('inactivityToast');
        if (toast) toast.style.display = 'none';
    }

    function stopInactivityTimer() {
        if (countdownInterval) clearInterval(countdownInterval);
        window.removeEventListener('mousemove', resetInactivityTimer);
        window.removeEventListener('keypress', resetInactivityTimer);
        window.removeEventListener('click', resetInactivityTimer);
        window.removeEventListener('scroll', resetInactivityTimer);
        
        const toast = document.getElementById('inactivityToast');
        if (toast) toast.style.display = 'none';
    }

    function updateTimerDisplay() {
        const display = document.getElementById('inactiveTimerDisplay');
        if (!display) return;

        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const formattedSecs = seconds < 10 ? `0${seconds}` : seconds;

        display.querySelector('b').textContent = `${minutes}:${formattedSecs}`;
    }

    function triggerAutoLogout() {
        stopInactivityTimer();
        sessionStorage.removeItem('active_vendedor_id');
        sessionStorage.removeItem('active_vendedor_nome');
        sessionStorage.removeItem('active_vendedor_loja');
        
        alert('Sessão encerrada automaticamente por inatividade de 2 minutos.');
        checkVendedorSession();
    }

    // Logout manual
    const btnVendedorLogout = document.getElementById('btnVendedorLogout');
    if (btnVendedorLogout) {
        btnVendedorLogout.addEventListener('click', () => {
            stopInactivityTimer();
            sessionStorage.removeItem('active_vendedor_id');
            sessionStorage.removeItem('active_vendedor_nome');
            sessionStorage.removeItem('active_vendedor_loja');
            checkVendedorSession();
        });
    }

    // -------------------------------------------------------------
    // Lançamento de Vendas (Resgate de O.S. Liberada)
    // -------------------------------------------------------------
    let activeAuthorizedOsList = [];

    const saleOsSelect = document.getElementById('saleOs');
    if (saleOsSelect) {
        saleOsSelect.addEventListener('change', () => {
            const selectedOsVal = saleOsSelect.value;
            if (!selectedOsVal) {
                document.getElementById('saleClientName').value = '';
                document.getElementById('saleLensFamily').value = '';
                document.getElementById('saleArFamily').value = '';
                document.getElementById('saleDate').value = '';
                return;
            }
            const osObj = activeAuthorizedOsList.find(o => o.os === selectedOsVal);
            if (osObj) {
                document.getElementById('saleClientName').value = osObj.cliente_nome;
                
                // Preenche e força exibição nos selects desabilitados
                const lensSel = document.getElementById('saleLensFamily');
                lensSel.innerHTML = `<option value="${escapeHtml(osObj.lente_familia)}">${escapeHtml(osObj.lente_familia)}</option>`;
                lensSel.value = osObj.lente_familia;

                const arSel = document.getElementById('saleArFamily');
                arSel.innerHTML = `<option value="${escapeHtml(osObj.ar_familia)}">${escapeHtml(osObj.ar_familia)}</option>`;
                arSel.value = osObj.ar_familia;

                // Preenche Data (data de hoje)
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('saleDate').value = today;
            }
        });
    }

    async function loadAuthorizedOsList(cpf) {
        const saleOs = document.getElementById('saleOs');
        if (!saleOs) return;
        
        saleOs.innerHTML = '<option value="">Buscando O.S. liberadas...</option>';
        
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const osAuthTable = localStorage.getItem('personality_sb_os_autorizadas_table') || 'os_autorizadas_personality';
        
        let list = [];
        
        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${osAuthTable}?cpf_vendedor=eq.${encodeURIComponent(cpf)}&utilizada=eq.false&order=created_at.desc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    list = await response.json();
                }
            } catch (error) {
                console.error('Erro ao buscar OS autorizadas:', error);
            }
        }
        
        if (list.length === 0) {
            const local = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
            list = local.filter(item => item.cpf_vendedor === cpf && !item.utilizada);
        }
        
        
        // Filtra as OS para garantir que nenhuma já tenha sido resgatada anteriormente (v3.75)
        if (list.length > 0) {
            const localPremios = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
            const localClaimedSet = new Set(localPremios.map(p => p.os));
            list = list.filter(item => !localClaimedSet.has(item.os));
            
            if (url && key) {
                try {
                    const premiosTable = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const osListStr = list.map(item => `"${item.os}"`).join(',');
                    const response = await fetch(`${cleanUrl}/rest/v1/${premiosTable}?os=in.(${osListStr})&select=os`, {
                        method: 'GET',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });
                    if (response.ok) {
                        const claimedOs = await response.json();
                        const claimedSet = new Set(claimedOs.map(item => item.os));
                        list = list.filter(item => !claimedSet.has(item.os));
                    }
                } catch (err) {
                    console.error('Erro ao verificar OS duplicadas no Supabase:', err);
                }
            }
        }

        activeAuthorizedOsList = list;
        
        saleOs.innerHTML = '';
        const btnSubmit = document.getElementById('btnSubmitSale');
        if (list.length === 0) {
            saleOs.innerHTML = '<option value="">Nenhuma O.S. liberada para seu CPF</option>';
            if (btnSubmit) btnSubmit.disabled = true;
        } else {
            saleOs.innerHTML = '<option value="">Selecione a O.S. liberada...</option>';
            list.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.os;
                opt.textContent = `${item.os} - Cliente: ${item.cliente_nome}`;
                saleOs.appendChild(opt);
            });
            if (btnSubmit) btnSubmit.disabled = false;
        }
        initVendedorRadar(list);
    }

    const vendedorSubmitSaleForm = document.getElementById('vendedorSubmitSaleForm');
    if (vendedorSubmitSaleForm) {
        vendedorSubmitSaleForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const osVal = document.getElementById('saleOs').value.trim();
            const clientVal = document.getElementById('saleClientName').value.trim();
            const lensVal = document.getElementById('saleLensFamily').value;
            const arVal = document.getElementById('saleArFamily').value;
            const dateVal = document.getElementById('saleDate').value;

            let isValid = true;
            if (!osVal) {
                showError(document.getElementById('saleOs'), document.getElementById('saleOsError'), true);
                isValid = false;
            } else {
                showError(document.getElementById('saleOs'), document.getElementById('saleOsError'), false);
            }

            if (clientVal.length < 2) {
                showError(document.getElementById('saleClientName'), document.getElementById('saleClientNameError'), true);
                isValid = false;
            } else {
                showError(document.getElementById('saleClientName'), document.getElementById('saleClientNameError'), false);
            }

            if (!lensVal) {
                showError(document.getElementById('saleLensFamily'), document.getElementById('saleLensFamilyError'), true);
                isValid = false;
            } else {
                showError(document.getElementById('saleLensFamily'), document.getElementById('saleLensFamilyError'), false);
            }

            if (!arVal) {
                showError(document.getElementById('saleArFamily'), document.getElementById('saleArFamilyError'), true);
                isValid = false;
            } else {
                showError(document.getElementById('saleArFamily'), document.getElementById('saleArFamilyError'), false);
            }

            if (!dateVal) {
                showError(document.getElementById('saleDate'), document.getElementById('saleDateError'), true);
                isValid = false;
            } else {
                showError(document.getElementById('saleDate'), document.getElementById('saleDateError'), false);
            }

            if (!isValid) return;

            const spinner = document.getElementById('saleSubmitSpinner');
            const btn = document.getElementById('btnSubmitSale');
            btn.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';
            btn.querySelector('.btn-text').textContent = 'Enviando Lançamento...';

            // Validação atrativa de O.S. já cadastrada no premios_lancados_personality (v3.75)
            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';

            // 1. Verifica duplicados em cache local
            const localPremios = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
            if (localPremios.some(item => item.os === osVal)) {
                alert('Erro: Esta O.S. já foi resgatada e pontuada anteriormente!');
                btn.disabled = false;
                if (spinner) spinner.style.display = 'none';
                btn.querySelector('.btn-text').textContent = 'Resgatar O.S. e Acumular Pontos 🚀';
                return;
            }

            // 2. Verifica duplicados no Supabase
            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const checkRes = await fetch(`${cleanUrl}/rest/v1/${table}?os=eq.${encodeURIComponent(osVal)}&select=os`, {
                        method: 'GET',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });
                    if (checkRes.ok) {
                        const existing = await checkRes.json();
                        if (existing && existing.length > 0) {
                            alert('Erro: Esta O.S. já foi resgatada e pontuada anteriormente no sistema!');
                            btn.disabled = false;
                            if (spinner) spinner.style.display = 'none';
                            btn.querySelector('.btn-text').textContent = 'Resgatar O.S. e Acumular Pontos 🚀';
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Erro de validação de duplicidade na rede:', err);
                }
            }

            const activeId = sessionStorage.getItem('active_vendedor_id');
            const activeNome = sessionStorage.getItem('active_vendedor_nome');
            const activeLoja = sessionStorage.getItem('active_vendedor_loja');
            const activeCpf = sessionStorage.getItem('active_vendedor_cpf');

            // Busca pontos e valores configurados
            const lensConf = currentRewardsConfig.find(c => c.categoria === 'lente' && c.nome === lensVal) || { pontos: 0, valor: 0 };
            const arConf = currentRewardsConfig.find(c => c.categoria === 'antirreflexo' && c.nome === arVal) || { pontos: 0, valor: 0 };

            const saleData = {
                vendedor_id: activeId,
                vendedor_nome: activeNome,
                loja: activeLoja,
                os: osVal,
                cliente_nome: clientVal,
                lente_familia: lensVal,
                ar_familia: arVal,
                data_venda: dateVal,
                pontos_lente: lensConf.pontos,
                valor_lente: lensConf.valor,
                pontos_ar: arConf.pontos,
                valor_ar: arConf.valor,
                status: 'Pendente',
                created_at: new Date().toISOString()
            };

            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';
            const osAuthTable = localStorage.getItem('personality_sb_os_autorizadas_table') || 'os_autorizadas_personality';

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    
                    // Envia lançamento da venda
                    const response = await fetch(`${cleanUrl}/rest/v1/${table}`, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(saleData)
                    });

                    if (!response.ok) {
                        throw new Error('Falha ao enviar venda ao Supabase.');
                    }

                    // Marca a O.S. autorizada correspondente como utilizada
                    await fetch(`${cleanUrl}/rest/v1/${osAuthTable}?os=eq.${encodeURIComponent(osVal)}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ utilizada: true })
                    });

                    // Marca local também em caso de sincronização futura
                    let localOs = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
                    const osIdx = localOs.findIndex(item => item.os === osVal);
                    if (osIdx !== -1) {
                        localOs[osIdx].utilizada = true;
                        localStorage.setItem('personality_local_os_autorizadas', JSON.stringify(localOs));
                    }

                    playSynthSound('chime');
                    triggerConfettiEffect();
                    alert('Venda resgatada com sucesso! Pontos acumulados.');
                    vendedorSubmitSaleForm.reset();
                    loadVendedorExtrato(activeId);
                    loadAuthorizedOsList(activeCpf);

                } catch (error) {
                    console.error(error);
                    saveSaleLocally(saleData);
                    alert('Lançamento salvo localmente devido à indisponibilidade de conexão.');
                    vendedorSubmitSaleForm.reset();
                    loadVendedorExtrato(activeId);
                } finally {
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    btn.querySelector('.btn-text').textContent = 'Resgatar O.S. e Acumular Pontos 🚀';
                }
            } else {
                setTimeout(() => {
                    saveSaleLocally(saleData);

                    // Marca local como utilizada
                    let localOs = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
                    const osIdx = localOs.findIndex(item => item.os === osVal);
                    if (osIdx !== -1) {
                        localOs[osIdx].utilizada = true;
                        localStorage.setItem('personality_local_os_autorizadas', JSON.stringify(localOs));
                    }

                    playSynthSound('chime');
                    triggerConfettiEffect();
                    alert('Venda resgatada com sucesso! Pontos acumulados.');
                    vendedorSubmitSaleForm.reset();
                    loadVendedorExtrato(activeId);
                    loadAuthorizedOsList(activeCpf);
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    btn.querySelector('.btn-text').textContent = 'Resgatar O.S. e Acumular Pontos 🚀';
                }, 800);
            }
        });
    }

    function saveSaleLocally(data) {
        const local = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
        const localData = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            ...data
        };
        local.push(localData);
        localStorage.setItem('personality_local_premios', JSON.stringify(local));
    }

    // Carrega Extrato de Prêmios do Vendedor
    async function loadVendedorExtrato(vendedorId) {
        const extratoTableBody = document.getElementById('vendedorExtratoTableBody');
        if (!extratoTableBody) return;

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';

        let sales = [];

        if (url && key) {
            extratoTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Buscando extrato...</td></tr>`;
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${table}?vendedor_id=eq.${encodeURIComponent(vendedorId)}&order=created_at.desc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    sales = await response.json();
                } else {
                    throw new Error('Falha ao obter extrato.');
                }
            } catch (error) {
                console.error(error);
                sales = (JSON.parse(localStorage.getItem('personality_local_premios')) || []).filter(s => s.vendedor_id === vendedorId);
            }
        } else {
            sales = (JSON.parse(localStorage.getItem('personality_local_premios')) || []).filter(s => s.vendedor_id === vendedorId);
        }

        renderVendedorExtrato(sales);
    }

    function renderVendedorExtrato(sales) {
        const extratoTableBody = document.getElementById('vendedorExtratoTableBody');
        if (!extratoTableBody) return;
        extratoTableBody.innerHTML = '';

        let ptsReceber = 0, valReceber = 0;
        let ptsPago = 0, valPago = 0;
        let ptsPendente = 0, valPendente = 0;

        if (sales.length === 0) {
            extratoTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhuma venda lançada neste portal ainda.</td></tr>`;
        } else {
            sales.forEach(sale => {
                const totPts = Number(sale.pontos_lente) + Number(sale.pontos_ar);
                const totVal = Number(sale.valor_lente) + Number(sale.valor_ar);

                if (sale.status === 'Pendente') {
                    ptsPendente += totPts;
                    valPendente += totVal;
                } else if (sale.status === 'Validado') {
                    ptsReceber += totPts;
                    valReceber += totVal;
                } else if (sale.status === 'Pago') {
                    ptsPago += totPts;
                    valPago += totVal;
                }

                // Formata data da venda
                let formattedDate = 'Data n/d';
                if (sale.data_venda) {
                    try {
                        const parts = sale.data_venda.split('-');
                        if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                        else formattedDate = new Date(sale.data_venda).toLocaleDateString('pt-BR');
                    } catch(e) {}
                }

                let statusBadge = '';
                if (sale.status === 'Pendente') {
                    statusBadge = `<span class="status-vendedor-pendente">Pendente</span>`;
                } else if (sale.status === 'Validado') {
                    statusBadge = `<span class="status-vendedor-validado">A Receber</span>`;
                } else if (sale.status === 'Pago') {
                    statusBadge = `<span class="status-vendedor-pago">Pago</span>`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(formattedDate)}</td>
                    <td><code>${escapeHtml(sale.os)}</code></td>
                    <td>${escapeHtml(sale.cliente_nome)}</td>
                    <td>${escapeHtml(sale.lente_familia)}</td>
                    <td>${escapeHtml(sale.ar_familia)}</td>
                    <td>${totPts} Pts</td>
                    <td>${statusBadge}</td>
                `;
                extratoTableBody.appendChild(tr);
            });
        }

        // Atualiza cards de estatísticas (valores ocultos, pontos visíveis)
        document.getElementById('vendedorStatReceber').textContent = `R$ ${valReceber.toFixed(2)}`;
        document.getElementById('vendedorStatReceberPontos').textContent = `${ptsReceber} Pontos Validados`;
        
        document.getElementById('vendedorStatPago').textContent = `R$ ${valPago.toFixed(2)}`;
        document.getElementById('vendedorStatPagoPontos').textContent = `${ptsPago} Pontos Pagos`;
        
        document.getElementById('vendedorStatPendente').textContent = `R$ ${valPendente.toFixed(2)}`;
        document.getElementById('vendedorStatPendentePontos').textContent = `${ptsPendente} Pontos Lançados`;
    }

    // Inicialização
    loadStoresList();
    loadRewardsConfig();
    checkVendedorSession();
});
