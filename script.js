// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Chaves do localStorage para Fallbacks
    const STORAGE_KEY = 'personality_local_leads';
    const STORES_STORAGE_KEY = 'personality_local_stores';
    const ACCESS_STORAGE_KEY = 'personality_local_accesses';

    // Lojas Padrão caso não haja banco configurado
    const defaultStores = [
        { id: "1", nome: "Ótica Prime & Cia", endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP", telefone: "(11) 3222-1234" },
        { id: "2", nome: "Atelier da Visão", endereco: "Al. Lorena, 452 - Jardins, São Paulo - SP", telefone: "(11) 3888-5678" },
        { id: "3", nome: "Euro Óptica Concept", endereco: "Av. Faria Lima, 2500 - Pinheiros, São Paulo - SP", telefone: "(11) 3099-4321" }
    ];

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
    // 2. Sistema de Abas de Produtos
    // -------------------------------------------------------------
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const activateTab = (tabId) => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const activePane = document.getElementById(`tab-${tabId}`);
        
        if (activeBtn && activePane) {
            activeBtn.classList.add('active');
            activePane.classList.add('active');
        }
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            activateTab(tabId);
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
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
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

        if (stores.length === 0) {
            leadStoreSelect.innerHTML = '<option value="">Nenhuma ótica credenciada cadastrada</option>';
            storesContainer.innerHTML = `<div class="store-card" style="grid-column: span 2; text-align: center;"><p>Nenhuma ótica parceira credenciada no momento.</p></div>`;
            return;
        }

        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store.nome;
            option.textContent = store.nome;
            leadStoreSelect.appendChild(option);

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
        return `PERS-50-${code}`;
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

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
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

        const messageText = `Olá! Acabei de gerar meu voucher de *50% de desconto* nas lentes *PERSONALITY*! 🎉

🎟️ *Código do Voucher:* ${voucher}

🏪 *Ótica de Resgate:* ${storeName}
📍 *Endereço:* ${storeAddress || 'Não cadastrado'}
📞 *Contato:* ${storePhone || 'Não cadastrado'}

Apresente esse cupom na loja para garantir o seu benefício!`;

        document.getElementById('btnSendWaSummary').href = `https://api.whatsapp.com/send?phone=55${rawWhatsapp}&text=${encodeURIComponent(messageText)}`;
    };

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
    // 7. Botão Voltar ao Topo
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

    // Inicia verificação do Portal do Parceiro
    checkPartnerSession();
});
