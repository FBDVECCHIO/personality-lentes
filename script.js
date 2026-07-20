// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Chaves do localStorage para Fallbacks
    const STORAGE_KEY = 'personality_local_leads';
    const STORES_STORAGE_KEY = 'personality_local_stores';
    const ACCESS_STORAGE_KEY = 'personality_local_accesses';

    // Credenciais Padrão do Supabase (Disponíveis Globalmente para Celulares e Novos Navegadores)
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

    // Lojas Padrão (Sem dados fictícios de exemplo)
    const defaultStores = [];

    // Chaves de Sessão do Parceiro
    const SESSION_STORE = 'partner_session_store';
    const SESSION_USER = 'partner_session_user';

    // Lista global de lojas para consulta rápida
    let loadedStoresList = [];

    // -------------------------------------------------------------
    // 1. Menu Mobile e Dropdown
    // -------------------------------------------------------------
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll');

            if (link.classList.contains('submenu-link')) {
                const tabId = link.getAttribute('data-tab');
                activateTab(tabId);
            }
        });
    });

    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            activateTab(tabId);
        });
    });

    // -------------------------------------------------------------
    // 2. Sistema de Abas e Filtros de Produtos
    // -------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const resetPaneCards = (pane) => {
        if (!pane) return;
        const allFilterBtn = pane.querySelector('.filter-btn[data-filter="all"]');
        if (allFilterBtn) {
            const paneFilterBtns = pane.querySelectorAll('.filter-btn');
            paneFilterBtns.forEach(btn => btn.classList.remove('active'));
            allFilterBtn.classList.add('active');
        }
        const cards = pane.querySelectorAll('.product-card');
        cards.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-out';
        });
    };

    const activateTab = (tabId) => {
        let mainTabId = tabId;
        let subFilterVal = null;

        // Mapeamento de subfiltros do menu para as abas principais
        if (tabId === 'visaosimples') {
            mainTabId = 'linha-ia';
            subFilterVal = 'visaosimples';
        } else if (tabId === 'progressivos' || tabId === 'progressivo') {
            mainTabId = 'linha-ia';
            subFilterVal = 'progressivo';
        } else if (tabId === 'ocupacionais' || tabId === 'office') {
            mainTabId = 'linha-ia';
            subFilterVal = 'office';
        }

        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        const activeBtn = document.querySelector(`.tab-btn[data-tab="${mainTabId}"]`);
        const activePane = document.getElementById(`tab-${mainTabId}`);
        
        if (activeBtn && activePane) {
            activeBtn.classList.add('active');
            activePane.classList.add('active');
            
            if (subFilterVal) {
                const filterBtn = activePane.querySelector(`.filter-btn[data-filter="${subFilterVal}"]`);
                if (filterBtn) {
                    const paneFilterBtns = activePane.querySelectorAll('.filter-btn');
                    paneFilterBtns.forEach(btn => btn.classList.remove('active'));
                    filterBtn.classList.add('active');

                    const cards = activePane.querySelectorAll('.product-card');
                    cards.forEach(card => {
                        const cardType = card.getAttribute('data-type');
                        if (cardType === subFilterVal) {
                            card.style.display = 'block';
                            card.style.animation = 'fadeIn 0.3s ease-out';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                } else {
                    resetPaneCards(activePane);
                }
            } else {
                resetPaneCards(activePane);
            }
        } else {
            const fallbackBtn = document.querySelector(`.tab-btn[data-tab="linha-ia"]`);
            const fallbackPane = document.getElementById(`tab-linha-ia`);
            if (fallbackBtn && fallbackPane) {
                fallbackBtn.classList.add('active');
                fallbackPane.classList.add('active');
                resetPaneCards(fallbackPane);
            }
        }
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            activateTab(tabId);
        });
    });

    // Filtros de Subcategorias
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterVal = button.getAttribute('data-filter');
            const pane = button.closest('.tab-pane');
            
            const paneFilterBtns = pane.querySelectorAll('.filter-btn');
            paneFilterBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const cards = pane.querySelectorAll('.product-card');
            cards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                if (filterVal === 'all' || cardType === filterVal) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // -------------------------------------------------------------
    // 2b. Sistema de Abas de Tecnologias
    // -------------------------------------------------------------
    const techTabButtons = document.querySelectorAll('.tech-tab-btn');
    const techPanes = document.querySelectorAll('.tech-pane');

    const activateTechTab = (techId) => {
        techTabButtons.forEach(btn => btn.classList.remove('active'));
        techPanes.forEach(pane => pane.classList.remove('active'));

        const activeBtn = document.querySelector(`.tech-tab-btn[data-tech="${techId}"]`);
        const activePane = document.getElementById(`tech-${techId}`);
        
        if (activeBtn && activePane) {
            activeBtn.classList.add('active');
            activePane.classList.add('active');
        }
    };

    techTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const techId = button.getAttribute('data-tech');
            activateTechTab(techId);
        });
    });

    // -------------------------------------------------------------
    // 3. Máscara de Telefone (WhatsApp)
    // -------------------------------------------------------------
    const whatsappInput = document.getElementById('whatsapp');
    whatsappInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            value = '(' + value;
        }
        if (value.length > 3) {
            value = value.slice(0, 3) + ') ' + value.slice(3);
        }
        if (value.length > 10) {
            value = value.slice(0, 10) + '-' + value.slice(10);
        }
        if (value.length > 15) {
            value = value.slice(0, 15);
        }
        e.target.value = value;
    });

    // -------------------------------------------------------------
    // 4. Carregamento Dinâmico de Lojas Licenciadas
    // -------------------------------------------------------------
    const leadStoreSelect = document.getElementById('leadStore');
    const storesContainer = document.getElementById('storesContainer');

    async function loadLicensedStores() {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const storesTable = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';

        let stores = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${storesTable}?select=*&order=nome.asc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    stores = await response.json();
                } else {
                    throw new Error('Falha ao obter lojas do Supabase.');
                }
            } catch (error) {
                console.error(error);
                stores = getLocalStores();
            }
        } else {
            stores = getLocalStores();
        }

        loadedStoresList = stores;
        renderStoresOnPage(stores);
    }

    function getLocalStores() {
        const local = localStorage.getItem(STORES_STORAGE_KEY);
        if (!local) {
            localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(defaultStores));
            return defaultStores;
        }
        return JSON.parse(local);
    }

    function renderStoresOnPage(stores) {
        leadStoreSelect.innerHTML = '<option value="">Selecione uma Ótica Licenciada...</option>';
        storesContainer.innerHTML = '';

        const astStoreSelect = document.getElementById('astStore');
        if (astStoreSelect) {
            astStoreSelect.innerHTML = '<option value="">Selecione a Ótica onde realizou a compra...</option>';
        }

        if (stores.length === 0) {
            leadStoreSelect.innerHTML = '<option value="">Nenhuma ótica credenciada cadastrada</option>';
            if (astStoreSelect) astStoreSelect.innerHTML = '<option value="">Nenhuma ótica parceira cadastrada</option>';
            storesContainer.innerHTML = `<div class="store-card" style="grid-column: span 2; text-align: center;"><p>Nenhuma ótica parceira credenciada no momento.</p></div>`;
            return;
        }

        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store.nome;
            option.textContent = store.nome;
            leadStoreSelect.appendChild(option);

            if (astStoreSelect) {
                const astOpt = document.createElement('option');
                astOpt.value = store.nome;
                astOpt.textContent = store.nome;
                astStoreSelect.appendChild(astOpt);
            }

            const card = document.createElement('div');
            card.className = 'store-card';
            card.innerHTML = `
                <h4>${escapeHtml(store.nome)}</h4>
                <p>📍 ${escapeHtml(store.endereco)}</p>
                <p>📞 ${escapeHtml(store.telefone)}</p>
                <span class="store-badge">Parceiro Oficial 🌟</span>
            `;
            storesContainer.appendChild(card);
        });
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadLicensedStores();

    // -------------------------------------------------------------
    // 5. Validação e Envio de Leads (Geração de Voucher)
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const successAlert = document.getElementById('successAlert');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const leadStoreError = document.getElementById('leadStoreError');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnSpinner = document.getElementById('btnSpinner');
    const generatedVoucherH3 = document.getElementById('generatedVoucher');
    const btnCopyVoucher = document.getElementById('btnCopyVoucher');

    const showError = (input, errorEl, show) => {
        if (show) {
            errorEl.style.display = 'block';
            input.classList.add('invalid');
        } else {
            errorEl.style.display = 'none';
            input.classList.remove('invalid');
        }
    };

    function generateRandomVoucher() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return `PERS-15-${code}`;
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const whatsappVal = whatsappInput.value.trim();
        const rawWhatsapp = whatsappVal.replace(/\D/g, '');
        const storeVal = leadStoreSelect.value;
        const messageVal = messageInput.value.trim();

        let isValid = true;

        if (nameVal.length < 3) {
            showError(nameInput, document.getElementById('nameError'), true);
            isValid = false;
        } else {
            showError(nameInput, document.getElementById('nameError'), false);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            showError(emailInput, document.getElementById('emailError'), true);
            isValid = false;
        } else {
            showError(emailInput, document.getElementById('emailError'), false);
        }

        if (rawWhatsapp.length < 10 || rawWhatsapp.length > 11) {
            showError(whatsappInput, document.getElementById('whatsappError'), true);
            isValid = false;
        } else {
            showError(whatsappInput, document.getElementById('whatsappError'), false);
        }

        if (!storeVal) {
            leadStoreError.style.display = 'block';
            leadStoreSelect.classList.add('invalid');
            isValid = false;
        } else {
            leadStoreError.style.display = 'none';
            leadStoreSelect.classList.remove('invalid');
        }

        if (!isValid) return;

        btnSubmit.disabled = true;
        btnSpinner.style.display = 'inline-block';
        btnSubmit.querySelector('.btn-text').textContent = 'Gerando Voucher...';

        const voucherCode = generateRandomVoucher();

        // Detalhes extras da loja para registro
        const chosenStoreObj = loadedStoresList.find(s => s.nome === storeVal);
        const storeAddress = chosenStoreObj ? chosenStoreObj.endereco : '';
        const storePhone = chosenStoreObj ? chosenStoreObj.telefone : '';

        const leadData = {
            name: nameVal,
            email: emailVal,
            whatsapp: whatsappVal,
            raw_whatsapp: rawWhatsapp,
            loja: storeVal,
            loja_endereco: storeAddress,
            loja_telefone: storePhone,
            voucher: voucherCode,
            message: messageVal,
            timestamp: new Date().toISOString()
        };

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const table = localStorage.getItem('personality_sb_table') || 'leads_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${table}`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        name: leadData.name,
                        email: leadData.email,
                        whatsapp: leadData.whatsapp,
                        loja: leadData.loja,
                        loja_endereco: leadData.loja_endereco,
                        loja_telefone: leadData.loja_telefone,
                        voucher: leadData.voucher,
                        message: leadData.message
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Falha ao registrar no Supabase.');
                }

                showFormSuccess(voucherCode, storeVal, storeAddress, storePhone, rawWhatsapp);
                
                const activeStore = sessionStorage.getItem(SESSION_STORE);
                if (activeStore === storeVal) {
                    loadPartnerLeads(activeStore);
                }
            } catch (error) {
                console.error('Erro no Supabase:', error);
                alert(`Erro: ${error.message}. Salvo localmente.`);
                saveToLocalStorageFallback(leadData);
                showFormSuccess(voucherCode, storeVal, storeAddress, storePhone, rawWhatsapp);
            } finally {
                resetSubmitButton();
            }
        } else {
            setTimeout(() => {
                saveToLocalStorageFallback(leadData);
                showFormSuccess(voucherCode, storeVal, storeAddress, storePhone, rawWhatsapp);
                resetSubmitButton();
            }, 1000);
        }
    });

    const saveToLocalStorageFallback = (data) => {
        const storedLeads = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        storedLeads.push(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedLeads));
    };

    const showFormSuccess = (voucher, storeName, storeAddress, storePhone, rawWhatsapp) => {
        contactForm.style.display = 'none';
        successAlert.style.display = 'flex';
        generatedVoucherH3.textContent = voucher;

        document.getElementById('successStoreName').textContent = storeName;
        document.getElementById('successStoreAddress').textContent = storeAddress || 'Endereço não cadastrado';
        document.getElementById('successStorePhone').textContent = storePhone ? `Telefone: ${storePhone}` : 'Telefone não cadastrado';

        const messageText = `Olá! Acabei de gerar meu voucher de *15% de desconto* nas lentes *PERSONALITY*! 🎉

🎟️ *Código do Voucher:* ${voucher}

🏪 *Ótica de Resgate:* ${storeName}
📍 *Endereço:* ${storeAddress || 'Não cadastrado'}
📞 *Contato:* ${storePhone || 'Não cadastrado'}

Apresente esse cupom na loja para garantir o seu benefício!`;

        document.getElementById('btnSendWaSummary').href = `https://api.whatsapp.com/send?phone=55${rawWhatsapp}&text=${encodeURIComponent(messageText)}`;

        // Dispara o Webhook do Make diretamente via Frontend
        triggerMakeWebhookFrontend({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            whatsapp: whatsappInput.value.trim(),
            loja: storeName,
            loja_endereco: storeAddress,
            loja_telefone: storePhone,
            voucher: voucher,
            message: messageInput.value.trim()
        });
    };

    async function triggerMakeWebhookFrontend(data) {
        const webhookUrl = localStorage.getItem('personality_make_webhook') || '';
        if (!webhookUrl) return;

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'INSERT',
                    table: 'leads_personality',
                    schema: 'public',
                    record: data
                })
            });
            console.log('Webhook do Make disparado com sucesso via frontend.');
        } catch (e) {
            console.error('Erro ao disparar Webhook do Make:', e);
        }
    }

    const resetSubmitButton = () => {
        btnSubmit.disabled = false;
        btnSpinner.style.display = 'none';
        btnSubmit.querySelector('.btn-text').textContent = 'Garantir Meu Voucher (50% OFF)';
    };

    btnCopyVoucher.addEventListener('click', () => {
        navigator.clipboard.writeText(generatedVoucherH3.textContent).then(() => {
            btnCopyVoucher.textContent = 'Copiado! ✓';
            btnCopyVoucher.style.background = 'var(--success)';
            btnCopyVoucher.style.color = '#fff';
            btnCopyVoucher.style.borderColor = 'transparent';
            setTimeout(() => {
                btnCopyVoucher.textContent = 'Copiar Código';
                btnCopyVoucher.style.background = 'transparent';
                btnCopyVoucher.style.color = 'var(--gold-light)';
                btnCopyVoucher.style.borderColor = 'var(--gold-primary)';
            }, 2000);
        });
    });

    // -------------------------------------------------------------
    // 6. Portal do Parceiro Licenciado (Login & Leads Filtrados)
    // -------------------------------------------------------------
    const partnerLoginCard = document.getElementById('partnerLoginCard');
    const partnerLeadsPanel = document.getElementById('partnerLeadsPanel');
    const partnerLoginForm = document.getElementById('partnerLoginForm');
    const partnerUsernameInput = document.getElementById('partnerUsername');
    const partnerPasswordInput = document.getElementById('partnerPassword');
    const partnerLoginError = document.getElementById('partnerLoginError');
    const btnPartnerLogin = document.getElementById('btnPartnerLogin');
    const partnerLoginSpinner = document.getElementById('partnerLoginSpinner');
    const sessionStoreNameSpan = document.getElementById('sessionStoreName');
    const partnerLeadsCountSpan = document.getElementById('partnerLeadsCount');
    const partnerLeadsTableBody = document.getElementById('partnerLeadsTableBody');
    const btnPartnerExportCSV = document.getElementById('btnPartnerExportCSV');
    const btnPartnerLogout = document.getElementById('btnPartnerLogout');

    // Checagem de Sessão do Parceiro
    const checkPartnerSession = () => {
        const storeName = sessionStorage.getItem(SESSION_STORE);
        const username = sessionStorage.getItem(SESSION_USER);

        if (storeName && username) {
            showPartnerLeads(storeName);
        } else {
            showPartnerLogin();
        }
    };

    const showPartnerLogin = () => {
        partnerLoginCard.style.display = 'block';
        partnerLeadsPanel.style.display = 'none';
        partnerLoginForm.reset();
        partnerLoginError.style.display = 'none';
    };

    const showPartnerLeads = (storeName) => {
        partnerLoginCard.style.display = 'none';
        partnerLeadsPanel.style.display = 'block';
        sessionStoreNameSpan.textContent = storeName;
        loadPartnerLeads(storeName);
    };

    // Submissão do Login do Parceiro
    partnerLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userVal = partnerUsernameInput.value.trim().toLowerCase();
        const passVal = partnerPasswordInput.value.trim();

        partnerLoginError.style.display = 'none';
        btnPartnerLogin.disabled = true;
        partnerLoginSpinner.style.display = 'inline-block';
        btnPartnerLogin.querySelector('.btn-text').textContent = 'Autenticando...';

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        let authSuccess = false;
        let authenticatedStore = '';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/acessos_lojas?usuario=eq.${encodeURIComponent(userVal)}&senha=eq.${encodeURIComponent(passVal)}&limit=1`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        authSuccess = true;
                        authenticatedStore = data[0].loja_nome;
                    }
                } else {
                    throw new Error('Falha na resposta do servidor.');
                }
            } catch (error) {
                console.error(error);
                const localAuth = checkLocalCredentials(userVal, passVal);
                authSuccess = localAuth.success;
                authenticatedStore = localAuth.store;
            }
        } else {
            const localAuth = checkLocalCredentials(userVal, passVal);
            authSuccess = localAuth.success;
            authenticatedStore = localAuth.store;
        }

        btnPartnerLogin.disabled = false;
        partnerLoginSpinner.style.display = 'none';
        btnPartnerLogin.querySelector('.btn-text').textContent = 'Entrar no Portal';

        if (authSuccess) {
            sessionStorage.setItem(SESSION_STORE, authenticatedStore);
            sessionStorage.setItem(SESSION_USER, userVal);
            showPartnerLeads(authenticatedStore);
        } else {
            partnerLoginError.style.display = 'block';
            partnerLoginError.textContent = 'Usuário ou senha incorretos.';
        }
    });

    const checkLocalCredentials = (user, pass) => {
        const localAccesses = JSON.parse(localStorage.getItem(ACCESS_STORAGE_KEY)) || [];
        const match = localAccesses.find(acc => acc.usuario === user && acc.senha === pass);
        if (match) {
            return { success: true, store: match.loja_nome };
        }
        return { success: false, store: '' };
    };

    // Logout
    btnPartnerLogout.addEventListener('click', () => {
        sessionStorage.clear();
        showPartnerLogin();
    });

    // Carrega os leads filtrados para a tabela do parceiro
    async function loadPartnerLeads(storeName) {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const table = localStorage.getItem('personality_sb_table') || 'leads_personality';

        let leads = [];

        if (url && key) {
            partnerLeadsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Buscando vouchers...</td></tr>`;
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${table}?loja=eq.${encodeURIComponent(storeName)}&order=created_at.desc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    leads = await response.json();
                } else {
                    throw new Error('Falha ao obter leads.');
                }
            } catch (error) {
                console.error(error);
                partnerLeadsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger);">Falha de conexão. Mostrando dados locais.</td></tr>`;
                leads = getFilteredLocalLeads(storeName);
            }
        } else {
            leads = getFilteredLocalLeads(storeName);
        }

        renderPartnerLeadsTable(leads);
    }

    function getFilteredLocalLeads(storeName) {
        const localLeads = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        return localLeads.filter(lead => lead.loja === storeName);
    }

    function renderPartnerLeadsTable(leads) {
        partnerLeadsCountSpan.textContent = leads.length;
        partnerLeadsTableBody.innerHTML = '';

        if (leads.length === 0) {
            partnerLeadsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhum lead com voucher direcionado para sua loja.</td></tr>`;
            return;
        }

        leads.forEach(lead => {
            const dateStr = lead.created_at || lead.timestamp;
            let formattedDate = 'Data indisponível';
            if (dateStr) {
                try {
                    formattedDate = new Date(dateStr).toLocaleString('pt-BR');
                } catch(e) {}
            }

            const rawPhone = (lead.whatsapp || '').replace(/\D/g, '');
            const waLink = rawPhone ? `<a href="https://wa.me/55${rawPhone}" target="_blank" class="wa-link">💬 ${escapeHtml(lead.whatsapp)}</a>` : 'Não informado';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(lead.name)}</strong></td>
                <td>${waLink}</td>
                <td><code style="color: var(--gold-light); font-weight:700;">${escapeHtml(lead.voucher || 'Sem voucher')}</code></td>
                <td>${escapeHtml(formattedDate)}</td>
            `;
            partnerLeadsTableBody.appendChild(tr);
        });
    }

    // Exportar em CSV
    btnPartnerExportCSV.addEventListener('click', async () => {
        const storeName = sessionStorage.getItem(SESSION_STORE);
        if (!storeName) return;

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const table = localStorage.getItem('personality_sb_table') || 'leads_personality';
        
        let leads = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${table}?loja=eq.${encodeURIComponent(storeName)}&order=created_at.desc`;
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    leads = await response.json();
                }
            } catch (error) {
                console.error(error);
            }
        }
        
        if (leads.length === 0) {
            leads = getFilteredLocalLeads(storeName);
        }

        if (leads.length === 0) {
            alert('Não há dados para exportar.');
            return;
        }

        let csvContent = "\uFEFF"; 
        csvContent += "Nome;Whatsapp;Telefone_Limpo;Voucher;Data_Cadastro\n";
        
        leads.forEach(lead => {
            const rawPhone = (lead.whatsapp || '').replace(/\D/g, '');
            const dateStr = lead.created_at || lead.timestamp || '';
            const line = [
                `"${lead.name.replace(/"/g, '""')}"`,
                `"${lead.whatsapp}"`,
                `"+55${rawPhone}"`,
                `"${(lead.voucher || '').replace(/"/g, '""')}"`,
                `"${dateStr}"`
            ].join(';');
            csvContent += line + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", downloadUrl);
        link.setAttribute("download", `leads_${storeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // -------------------------------------------------------------
    // 7. Agendamento de Assistência Técnica & Garantia
    // -------------------------------------------------------------
    const assistanceForm = document.getElementById('assistanceForm');
    const astPurchaseDateInput = document.getElementById('astPurchaseDate');
    const astNameInput = document.getElementById('astName');
    const astEmailInput = document.getElementById('astEmail');
    const astWhatsappInput = document.getElementById('astWhatsapp');
    const astOsNumberInput = document.getElementById('astOsNumber');
    const astDoctorCrmInput = document.getElementById('astDoctorCrm');
    const astStoreSelect = document.getElementById('astStore');
    const astProductSelect = document.getElementById('astProduct');
    const astCoatingSelect = document.getElementById('astCoating');
    const astReasonSelect = document.getElementById('astReason');
    const astDateInput = document.getElementById('astDate');
    const astTimeSelect = document.getElementById('astTime');
    const astObsInput = document.getElementById('astObs');
    const btnSubmitAst = document.getElementById('btnSubmitAst');
    const btnAstSpinner = document.getElementById('btnAstSpinner');
    
    const astSuccessAlert = document.getElementById('astSuccessAlert');
    const astProtocolH3 = document.getElementById('astProtocol');
    const astSummaryStore = document.getElementById('astSummaryStore');
    const astSummaryOs = document.getElementById('astSummaryOs');
    const astSummaryDoctor = document.getElementById('astSummaryDoctor');
    const astSummaryPurchaseDate = document.getElementById('astSummaryPurchaseDate');
    const astSummaryProductCoating = document.getElementById('astSummaryProductCoating');
    const astSummaryDateTime = document.getElementById('astSummaryDateTime');
    const astSummaryTech = document.getElementById('astSummaryTech');
    const astSummaryTechContact = document.getElementById('astSummaryTechContact');
    const btnCopyAstProtocol = document.getElementById('btnCopyAstProtocol');
    const btnSendAstWaSummary = document.getElementById('btnSendAstWaSummary');

    if (astDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        astDateInput.min = tomorrow.toISOString().split('T')[0];
    }

    if (astWhatsappInput) {
        astWhatsappInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) value = '(' + value;
            if (value.length > 3) value = value.slice(0, 3) + ') ' + value.slice(3);
            if (value.length > 10) value = value.slice(0, 10) + '-' + value.slice(10);
            if (value.length > 15) value = value.slice(0, 15);
            e.target.value = value;
        });
    }

    // Carrega motivos de assistência dinâmicos do Supabase/Local
    async function loadAssistanceReasons() {
        if (!astReasonSelect) return;
        const defaultReasons = [
            "Adaptação Visual & Ajuste de Foco",
            "Tomada de Parâmetros / DNP / Altura",
            "Garantia de Antirreflexo / Tratamento Superficial",
            "Ajuste de Armação & Montagem",
            "Análise Técnica de Laboratório",
            "Outros Assuntos de Suporte"
        ];

        let list = [];
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/motivos_assistencia?select=*&order=created_at.asc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) list = data.map(d => d.motivo);
                }
            } catch (err) {
                console.error(err);
            }
        }

        if (!list || list.length === 0) {
            const local = localStorage.getItem('personality_local_motivos');
            list = local ? JSON.parse(local) : defaultReasons;
        }

        astReasonSelect.innerHTML = '<option value="">Selecione o Motivo Principal...</option>';
        list.forEach(reason => {
            const opt = document.createElement('option');
            opt.value = reason;
            opt.textContent = reason;
            astReasonSelect.appendChild(opt);
        });
    }

    loadAssistanceReasons();

    function generateAssistanceProtocol() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return `PERS-AST-${code}`;
    }

    async function getAssignedTechnician(storeName) {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

        const fallbackTechs = [
            { nome: "Carlos Andrade", email: "carlos.tecnico@personality.com.br", whatsapp: "(11) 97777-6666", especialidade: "Optometrista & Medidas HD", loja_atendida: "Todas as Lojas" },
            { nome: "Eng. Ricardo Santos", email: "ricardo.laboratorio@personality.com.br", whatsapp: "(11) 98888-5555", especialidade: "Garantia AR & Laboratório", loja_atendida: "Todas as Lojas" }
        ];

        let techs = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/tecnicos_personality?select=*`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    techs = await response.json();
                }
            } catch (error) {
                console.error(error);
            }
        }

        if (!techs || techs.length === 0) {
            const local = localStorage.getItem('personality_local_techs');
            techs = local ? JSON.parse(local) : fallbackTechs;
        }

        if (!techs || techs.length === 0) {
            techs = fallbackTechs;
        }

        const storeTech = techs.find(t => t.loja_atendida && t.loja_atendida.toLowerCase() === storeName.toLowerCase());
        if (storeTech) return storeTech;

        return techs[0];
    }

    if (assistanceForm) {
        assistanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const purchaseDateVal = astPurchaseDateInput.value;
            const nameVal = astNameInput.value.trim();
            const emailVal = astEmailInput.value.trim();
            const whatsappVal = astWhatsappInput.value.trim();
            const rawWhatsapp = whatsappVal.replace(/\D/g, '');
            const osVal = astOsNumberInput.value.trim();
            const doctorCrmVal = astDoctorCrmInput.value.trim();
            const storeVal = astStoreSelect.value;
            const productVal = astProductSelect.value;
            const coatingVal = astCoatingSelect.value;
            const reasonVal = astReasonSelect.value;
            const dateVal = astDateInput.value;
            const timeVal = astTimeSelect.value;
            const obsVal = astObsInput ? astObsInput.value.trim() : '';

            let isValid = true;

            if (!purchaseDateVal) {
                showError(astPurchaseDateInput, document.getElementById('astPurchaseDateError'), true);
                isValid = false;
            } else {
                showError(astPurchaseDateInput, document.getElementById('astPurchaseDateError'), false);
            }

            if (nameVal.length < 3) {
                showError(astNameInput, document.getElementById('astNameError'), true);
                isValid = false;
            } else {
                showError(astNameInput, document.getElementById('astNameError'), false);
            }

            if (!emailVal.includes('@')) {
                showError(astEmailInput, document.getElementById('astEmailError'), true);
                isValid = false;
            } else {
                showError(astEmailInput, document.getElementById('astEmailError'), false);
            }

            if (rawWhatsapp.length < 10 || rawWhatsapp.length > 11) {
                showError(astWhatsappInput, document.getElementById('astWhatsappError'), true);
                isValid = false;
            } else {
                showError(astWhatsappInput, document.getElementById('astWhatsappError'), false);
            }

            if (osVal.length < 2) {
                showError(astOsNumberInput, document.getElementById('astOsNumberError'), true);
                isValid = false;
            } else {
                showError(astOsNumberInput, document.getElementById('astOsNumberError'), false);
            }

            if (doctorCrmVal.length < 3) {
                showError(astDoctorCrmInput, document.getElementById('astDoctorCrmError'), true);
                isValid = false;
            } else {
                showError(astDoctorCrmInput, document.getElementById('astDoctorCrmError'), false);
            }

            if (!storeVal) {
                document.getElementById('astStoreError').style.display = 'block';
                astStoreSelect.classList.add('invalid');
                isValid = false;
            } else {
                document.getElementById('astStoreError').style.display = 'none';
                astStoreSelect.classList.remove('invalid');
            }

            if (!productVal) {
                document.getElementById('astProductError').style.display = 'block';
                astProductSelect.classList.add('invalid');
                isValid = false;
            } else {
                document.getElementById('astProductError').style.display = 'none';
                astProductSelect.classList.remove('invalid');
            }

            if (!coatingVal) {
                document.getElementById('astCoatingError').style.display = 'block';
                astCoatingSelect.classList.add('invalid');
                isValid = false;
            } else {
                document.getElementById('astCoatingError').style.display = 'none';
                astCoatingSelect.classList.remove('invalid');
            }

            if (!reasonVal) {
                document.getElementById('astReasonError').style.display = 'block';
                astReasonSelect.classList.add('invalid');
                isValid = false;
            } else {
                document.getElementById('astReasonError').style.display = 'none';
                astReasonSelect.classList.remove('invalid');
            }

            if (!dateVal) {
                showError(astDateInput, document.getElementById('astDateError'), true);
                isValid = false;
            } else {
                showError(astDateInput, document.getElementById('astDateError'), false);
            }

            if (!timeVal) {
                document.getElementById('astTimeError').style.display = 'block';
                astTimeSelect.classList.add('invalid');
                isValid = false;
            } else {
                document.getElementById('astTimeError').style.display = 'none';
                astTimeSelect.classList.remove('invalid');
            }

            if (!isValid) return;

            btnSubmitAst.disabled = true;
            btnAstSpinner.style.display = 'inline-block';
            btnSubmitAst.querySelector('.btn-text').textContent = 'Enviando Solicitação...';

            const protocolCode = generateAssistanceProtocol();

            const chosenStoreObj = loadedStoresList.find(s => s.nome === storeVal);
            const storeAddress = chosenStoreObj ? chosenStoreObj.endereco : '';
            const storePhone = chosenStoreObj ? chosenStoreObj.telefone : '';

            const assignedTech = await getAssignedTechnician(storeVal);

            const ticketData = {
                protocolo: protocolCode,
                cliente_nome: nameVal,
                cliente_email: emailVal,
                cliente_whatsapp: whatsappVal,
                data_compra: purchaseDateVal,
                os_numero: osVal,
                medico_crm: doctorCrmVal,
                loja_nome: storeVal,
                linha_produto: productVal,
                tratamento: coatingVal,
                motivo: reasonVal,
                data_atendimento: dateVal,
                horario_atendimento: timeVal,
                tecnico_nome: assignedTech.nome,
                tecnico_email: assignedTech.email,
                tecnico_whatsapp: assignedTech.whatsapp,
                status: 'Agendado',
                observacoes: obsVal,
                timestamp: new Date().toISOString()
            };

            const url = getSupabaseUrl();
            const key = getSupabaseKey();

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/chamados_assistencia`;

                    await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(ticketData)
                    });
                } catch (error) {
                    console.error('Erro ao salvar chamado no Supabase:', error);
                }
            }

            saveTicketToLocalStorage(ticketData);

            const makeWebhookUrl = localStorage.getItem('personality_make_webhook');
            if (makeWebhookUrl) {
                try {
                    await fetch(makeWebhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            tipo_evento: "CHAMADO_ASSISTENCIA",
                            protocolo: ticketData.protocolo,
                            cliente: {
                                nome: ticketData.cliente_nome,
                                email: ticketData.cliente_email,
                                whatsapp: ticketData.cliente_whatsapp
                            },
                            compra: {
                                data_compra: ticketData.data_compra,
                                os_numero: ticketData.os_numero,
                                medico_crm: ticketData.medico_crm,
                                loja_nome: ticketData.loja_nome,
                                loja_endereco: storeAddress,
                                loja_telefone: storePhone
                            },
                            produto: {
                                linha: ticketData.linha_produto,
                                tratamento: ticketData.tratamento
                            },
                            tecnico: {
                                nome: ticketData.tecnico_nome,
                                email: ticketData.tecnico_email,
                                whatsapp: ticketData.tecnico_whatsapp,
                                especialidade: assignedTech.especialidade || 'Assistência Técnica'
                            },
                            agendamento: {
                                motivo: ticketData.motivo,
                                data_atendimento: ticketData.data_atendimento,
                                horario_atendimento: ticketData.horario_atendimento,
                                observacoes: ticketData.observacoes
                            }
                        })
                    });
                } catch (webhookErr) {
                    console.warn('Alerta Webhook Make:', webhookErr);
                }
            }

            showAstFormSuccess(ticketData, assignedTech);
        });
    }

    function saveTicketToLocalStorage(ticketData) {
        const local = localStorage.getItem('personality_local_tickets');
        const tickets = local ? JSON.parse(local) : [];
        tickets.unshift(ticketData);
        localStorage.setItem('personality_local_tickets', JSON.stringify(tickets));
    }

    function showAstFormSuccess(ticketData, assignedTech) {
        assistanceForm.style.display = 'none';
        astSuccessAlert.style.display = 'flex';

        astProtocolH3.textContent = ticketData.protocolo;
        if (astSummaryStore) astSummaryStore.textContent = ticketData.loja_nome;
        if (astSummaryOs) astSummaryOs.textContent = ticketData.os_numero;
        if (astSummaryDoctor) astSummaryDoctor.textContent = ticketData.medico_crm;
        if (astSummaryPurchaseDate) astSummaryPurchaseDate.textContent = ticketData.data_compra;
        if (astSummaryProductCoating) astSummaryProductCoating.textContent = `${ticketData.linha_produto} - ${ticketData.tratamento}`;
        if (astSummaryDateTime) astSummaryDateTime.textContent = `${ticketData.data_atendimento} às ${ticketData.horario_atendimento}`;
        if (astSummaryTech) astSummaryTech.textContent = `${assignedTech.nome} (${assignedTech.especialidade || 'Técnico Especialista'})`;
        if (astSummaryTechContact) astSummaryTechContact.textContent = `${assignedTech.whatsapp} / ${assignedTech.email}`;

        btnCopyAstProtocol.onclick = () => {
            navigator.clipboard.writeText(ticketData.protocolo);
            btnCopyAstProtocol.textContent = 'Copiado! ✓';
            setTimeout(() => { btnCopyAstProtocol.textContent = 'Copiar Protocolo'; }, 2000);
        };

        const techRawPhone = (assignedTech.whatsapp || '').replace(/\D/g, '');
        const waMsg = encodeURIComponent(`Olá ${assignedTech.nome}! Gostaria de confirmar a solicitação do meu agendamento técnico (Protocolo *${ticketData.protocolo}*, O.S.: ${ticketData.os_numero}) para o dia ${ticketData.data_atendimento} às ${ticketData.horario_atendimento}. (Cliente: ${ticketData.cliente_nome})`);
        btnSendAstWaSummary.href = `https://wa.me/55${techRawPhone}?text=${waMsg}`;
    }

    // -------------------------------------------------------------
    // 8. Botão Voltar ao Topo
    // -------------------------------------------------------------
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // -------------------------------------------------------------
    // Tab Switching para Seção Tecnologias & Materiais
    // -------------------------------------------------------------
    const tmTabButtons = document.querySelectorAll('.tm-tab-btn');
    const tmPanes = document.querySelectorAll('.tm-pane');

    tmTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tmId = btn.getAttribute('data-tm');
            
            tmTabButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'rgba(255,255,255,0.03)';
                b.style.color = 'var(--text-muted)';
                b.style.border = '1px solid var(--border-gray)';
                b.style.fontWeight = '600';
            });
            
            btn.classList.add('active');
            btn.style.background = 'var(--gold-gradient)';
            btn.style.color = '#000';
            btn.style.border = '1px solid var(--border-gold)';
            btn.style.fontWeight = '700';

            tmPanes.forEach(pane => {
                if (pane.id === `tm-${tmId}`) {
                    pane.style.display = 'block';
                    pane.classList.add('active');
                } else {
                    pane.style.display = 'none';
                    pane.classList.remove('active');
                }
            });
        });
    });

    // -------------------------------------------------------------
    // Central de Downloads (Carregamento via Supabase + Fallback Local)
    // -------------------------------------------------------------
    const downloadsGrid = document.getElementById('downloadsGrid');

    const defaultDownloads = [
        {
            id: 'dl-1',
            titulo: 'Catálogo Oficial Personality 2026',
            categoria: 'Catálogo Geral',
            descricao: 'Apresentação completa das linhas de inteligência artificial, multifocais e antirreflexos.',
            formato: 'PDF • 5.8 MB',
            url_download: '#'
        },
        {
            id: 'dl-2',
            titulo: 'Tabela Comparativa de Dioptrias & Índices',
            categoria: 'Tabela Técnica',
            descricao: 'Guia completo com os índices de refração de 1.50 a 1.76, espessuras e diâmetros.',
            formato: 'PDF • 2.1 MB',
            url_download: '#'
        },
        {
            id: 'dl-3',
            titulo: 'Guia de Tratamentos Antirreflexo & Garantia',
            categoria: 'Manual & Garantia',
            descricao: 'Especificações das 22 camadas de proteção, certificado e recomendações de limpeza.',
            formato: 'PDF • 1.5 MB',
            url_download: '#'
        }
    ];

    async function loadDownloadsList() {
        if (!downloadsGrid) return;

        downloadsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">Carregando materiais de download...</div>`;

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        let downloads = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/materiais_download?select=*&order=created_at.desc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    downloads = await response.json();
                } else {
                    throw new Error('Falha ao carregar materiais do Supabase.');
                }
            } catch (error) {
                console.error(error);
                downloads = getLocalDownloads();
            }
        } else {
            downloads = getLocalDownloads();
        }

        if (!downloads || downloads.length === 0) {
            downloads = defaultDownloads;
        }

        renderDownloadsGrid(downloads);
    }

    function getLocalDownloads() {
        const local = localStorage.getItem('personality_local_downloads');
        return local ? JSON.parse(local) : defaultDownloads;
    }

    function renderDownloadsGrid(items) {
        if (!downloadsGrid) return;
        downloadsGrid.innerHTML = '';

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'glass-card download-card';
            card.style.cssText = `padding: 24px; border-radius: 16px; border: 1px solid var(--border-gray); background: rgba(20, 20, 26, 0.7); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s ease;`;

            const hasUrl = item.url_download && item.url_download !== '#' && item.url_download.trim() !== '';
            const downloadLinkAttr = hasUrl ? `href="${item.url_download}" target="_blank" download` : `onclick="alert('Arquivo estará disponível para download em breve!')" style="cursor: pointer;"`;

            card.innerHTML = `
                <div>
                    <span style="background: rgba(197, 168, 92, 0.15); border: 1px solid var(--border-gold); color: var(--gold-light); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; margin-bottom: 12px;">${item.categoria || 'Documento'}</span>
                    <h3 style="font-family: var(--font-heading); font-size: 18px; color: #fff; margin-bottom: 8px; line-height: 1.3;">${item.titulo}</h3>
                    <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">${item.descricao}</p>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--gold-light); font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; gap: 6px;">
                        <span>📑</span> <span>${item.formato || 'PDF'}</span>
                    </div>
                    <a ${downloadLinkAttr} class="btn btn-gold btn-full btn-sm" style="font-size: 13.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px;">
                        📥 Baixar Material
                    </a>
                </div>
            `;

            downloadsGrid.appendChild(card);
        });
    }

    loadDownloadsList();

    // Inicia verificação do Portal do Parceiro
    checkPartnerSession();
});
