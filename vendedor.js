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
                opt.textContent = `${item.nome} (${item.pontos} Pts / R$ ${Number(item.valor).toFixed(2)})`;
                saleLensFamily.appendChild(opt);
            });
        }
        if (saleArFamily) {
            saleArFamily.innerHTML = '<option value="">Selecione o antirreflexo...</option>';
            currentRewardsConfig.filter(c => c.categoria === 'antirreflexo').forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.nome;
                opt.textContent = `${item.nome} (${item.pontos} Pts / R$ ${Number(item.valor).toFixed(2)})`;
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
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
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
        local.push(data);
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
        
        checkVendedorSession();
    }

    function checkVendedorSession() {
        const activeId = sessionStorage.getItem('active_vendedor_id');
        const activeNome = sessionStorage.getItem('active_vendedor_nome');
        const activeLoja = sessionStorage.getItem('active_vendedor_loja');

        if (activeId && activeNome && activeLoja) {
            vendedorAuthContainer.style.display = 'none';
            vendedorDashboardPanel.style.display = 'block';
            approvalWarningBox.style.display = 'none';
            
            document.getElementById('vendedorSessionName').textContent = activeNome;
            document.getElementById('vendedorSessionStore').textContent = activeLoja;
            
            loadVendedorExtrato(activeId);
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
    // Lançamento de Vendas
    // -------------------------------------------------------------
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

            const activeId = sessionStorage.getItem('active_vendedor_id');
            const activeNome = sessionStorage.getItem('active_vendedor_nome');
            const activeLoja = sessionStorage.getItem('active_vendedor_loja');

            // Busca pontos e valores configurados
            const lensConf = currentRewardsConfig.find(c => c.categoria === 'lente' && c.nome === lensVal) || { pontos: 0, valor: 0 };
            const arConf = currentRewardsConfig.find(c => c.categoria === 'antirreflexo' && c.nome === arVal) || { pontos: 0, valor: 0 };

            const saleData = {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
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

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
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

                    alert('Venda lançada com sucesso! Aguarde a validação do laboratório.');
                    vendedorSubmitSaleForm.reset();
                    loadVendedorExtrato(activeId);

                } catch (error) {
                    console.error(error);
                    saveSaleLocally(saleData);
                    alert('Lançamento salvo localmente devido à indisponibilidade de conexão.');
                    vendedorSubmitSaleForm.reset();
                    loadVendedorExtrato(activeId);
                } finally {
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    btn.querySelector('.btn-text').textContent = 'Enviar Lançamento de Venda';
                }
            } else {
                setTimeout(() => {
                    saveSaleLocally(saleData);
                    alert('Venda lançada com sucesso! Aguarde a validação do laboratório.');
                    vendedorSubmitSaleForm.reset();
                    loadVendedorExtrato(activeId);
                    btn.disabled = false;
                    if (spinner) spinner.style.display = 'none';
                    btn.querySelector('.btn-text').textContent = 'Enviar Lançamento de Venda';
                }, 800);
            }
        });
    }

    function saveSaleLocally(data) {
        const local = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
        local.push(data);
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
            extratoTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Buscando extrato...</td></tr>`;
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
            extratoTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhuma venda lançada neste portal ainda.</td></tr>`;
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
                    <td><strong>R$ ${totVal.toFixed(2)}</strong></td>
                    <td>${statusBadge}</td>
                `;
                extratoTableBody.appendChild(tr);
            });
        }

        // Atualiza cards de estatísticas
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
