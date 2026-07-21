// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 0. Autenticação e Bloqueio por Senha do Painel Master
    // -------------------------------------------------------------
    const masterAuthModal = document.getElementById('masterAuthModal');
    const masterAuthForm = document.getElementById('masterAuthForm');
    const masterPasswordInput = document.getElementById('masterPasswordInput');
    const masterAuthError = document.getElementById('masterAuthError');
    const btnMasterLogout = document.getElementById('btnMasterLogout');
    const changeMasterPasswordForm = document.getElementById('changeMasterPasswordForm');
    const newMasterPassword = document.getElementById('newMasterPassword');

    const getMasterPassword = () => {
        return localStorage.getItem('personality_master_password') || 'admin123';
    };

    const checkMasterAuth = () => {
        const isAuth = sessionStorage.getItem('personality_master_auth') === 'true';
        if (isAuth) {
            if (masterAuthModal) masterAuthModal.style.display = 'none';
        } else {
            if (masterAuthModal) {
                masterAuthModal.style.display = 'flex';
                setTimeout(() => { if (masterPasswordInput) masterPasswordInput.focus(); }, 100);
            }
        }
    };

    if (masterAuthForm) {
        masterAuthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputPass = masterPasswordInput.value.trim();
            const correctPass = getMasterPassword();

            if (inputPass === correctPass) {
                sessionStorage.setItem('personality_master_auth', 'true');
                if (masterAuthError) masterAuthError.style.display = 'none';
                masterAuthForm.reset();
                masterAuthModal.style.display = 'none';
            } else {
                if (masterAuthError) masterAuthError.style.display = 'block';
                masterPasswordInput.classList.add('invalid');
                masterPasswordInput.select();
            }
        });
    }

    if (btnMasterLogout) {
        btnMasterLogout.addEventListener('click', () => {
            if (confirm('Deseja bloquear o Painel Master e encerrar a sessão de administração?')) {
                sessionStorage.removeItem('personality_master_auth');
                checkMasterAuth();
            }
        });
    }

    if (changeMasterPasswordForm) {
        changeMasterPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = newMasterPassword.value.trim();
            if (newPass.length < 4) {
                alert('A senha master deve ter pelo menos 4 caracteres.');
                return;
            }
            localStorage.setItem('personality_master_password', newPass);
            alert('Senha do Painel Master atualizada com sucesso! Use a nova senha nas próximas conexões.');
            changeMasterPasswordForm.reset();
        });
    }

    checkMasterAuth();

    // -------------------------------------------------------------
    // 1. Alternância de Seções na Sidebar
    // -------------------------------------------------------------
    const sideButtons = document.querySelectorAll('.side-btn');
    const adminSections = document.querySelectorAll('.admin-section');

    sideButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos os botões e seções
            sideButtons.forEach(b => b.classList.remove('active'));
            adminSections.forEach(s => s.classList.remove('active'));

            // Ativa o botão atual
            btn.classList.add('active');

            // Ativa a seção correspondente
            const sectionId = btn.getAttribute('data-section');
            const targetSection = document.getElementById(`sec-${sectionId}`);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            // Ações específicas ao abrir seção
            if (sectionId === 'leads') {
                loadLeads();
            } else if (sectionId === 'lojas') {
                loadStores();
            } else if (sectionId === 'acessos') {
                loadAccessManager();
            } else if (sectionId === 'tecnicos') {
                loadTechniciansManager();
            } else if (sectionId === 'assistencias') {
                loadTickets();
            } else if (sectionId === 'motivos') {
                loadMotivosManager();
            } else if (sectionId === 'downloads') {
                loadAdminDownloadsManager();
            }
        });
    });

    // -------------------------------------------------------------
    // 2. Configurações e Teste de Conexão do Supabase
    // -------------------------------------------------------------
    const configForm = document.getElementById('supabaseConfigForm');
    const sbUrlInput = document.getElementById('sbUrl');
    const sbKeyInput = document.getElementById('sbKey');
    const sbTableInput = document.getElementById('sbTable');
    const sbStoresTableInput = document.getElementById('sbStoresTable');
    const makeWebhookUrlInput = document.getElementById('makeWebhookUrl');
    const connStatus = document.getElementById('sbConnectionStatus');

    // Credenciais Padrão do Supabase
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

    // Carrega configurações existentes do localStorage ou valores padrão
    sbUrlInput.value = localStorage.getItem('personality_sb_url') || DEFAULT_SB_URL;
    sbKeyInput.value = localStorage.getItem('personality_sb_key') || DEFAULT_SB_KEY;
    sbTableInput.value = localStorage.getItem('personality_sb_table') || 'leads_personality';
    sbStoresTableInput.value = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';
    makeWebhookUrlInput.value = localStorage.getItem('personality_make_webhook') || '';

    // Testa a conexão ao carregar a página se houver dados salvos
    if (sbUrlInput.value && sbKeyInput.value) {
        testConnection(sbUrlInput.value, sbKeyInput.value, sbTableInput.value, sbStoresTableInput.value);
    }

    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const url = sbUrlInput.value.trim();
        const key = sbKeyInput.value.trim();
        const table = sbTableInput.value.trim();
        const storesTable = sbStoresTableInput.value.trim();
        const makeWebhook = makeWebhookUrlInput.value.trim();

        // Salva no localStorage
        localStorage.setItem('personality_sb_url', url);
        localStorage.setItem('personality_sb_key', key);
        localStorage.setItem('personality_sb_table', table);
        localStorage.setItem('personality_sb_stores_table', storesTable);
        localStorage.setItem('personality_make_webhook', makeWebhook);

        alert('Configurações salvas com sucesso! Testando conexão...');
        testConnection(url, key, table, storesTable);
    });

    const btnTestMakeWebhook = document.getElementById('btnTestMakeWebhook');
    if (btnTestMakeWebhook) {
        btnTestMakeWebhook.addEventListener('click', async () => {
            const webhookUrl = makeWebhookUrlInput ? makeWebhookUrlInput.value.trim() : '';

            if (!webhookUrl) {
                alert('Por favor, informe a URL do Webhook do Make.com no campo acima.');
                makeWebhookUrlInput.focus();
                return;
            }

            btnTestMakeWebhook.disabled = true;
            btnTestMakeWebhook.textContent = 'Enviando Teste...';

            const targetEmail = prompt('Digite o seu e-mail pessoal para receber o e-mail de teste no seu celular:', '');
            if (!targetEmail || !targetEmail.includes('@')) {
                btnTestMakeWebhook.disabled = false;
                btnTestMakeWebhook.textContent = '🧪 Testar Disparo do Make';
                return;
            }

            const testData = {
                name: "Teste Personality (E-mail)",
                email: targetEmail.trim(),
                whatsapp: "(11) 99999-9999",
                loja: "Ótica Licenciada Teste",
                loja_endereco: "Av. Paulista, 1000 - São Paulo/SP",
                loja_telefone: "(11) 3333-4444",
                voucher: "TESTE-15-OFF",
                message: "Teste de envio de e-mail automatizado pelo Make.com",
                timestamp: new Date().toISOString(),
                type: "INSERT",
                table: "leads_personality",
                schema: "public",
                record: {
                    name: "Teste Personality (E-mail)",
                    email: targetEmail.trim(),
                    whatsapp: "(11) 99999-9999",
                    loja: "Ótica Licenciada Teste",
                    loja_endereco: "Av. Paulista, 1000 - São Paulo/SP",
                    loja_telefone: "(11) 3333-4444",
                    voucher: "TESTE-15-OFF",
                    message: "Teste de envio de e-mail automatizado pelo Make.com"
                }
            };

            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testData)
                });
                alert('Disparo de teste enviado com sucesso para o Make.com!\n\nVerifique o seu cenário no Make.com para confirmar o recebimento e o envio do e-mail.');
            } catch (err) {
                console.warn('Tentando envio no-cors:', err);
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'text/plain' },
                        body: JSON.stringify(testData)
                    });
                    alert('Disparo de teste enviado via modo compatível!\n\nVerifique o histórico do cenário no Make.com.');
                } catch (err2) {
                    alert(`Falha ao disparar Webhook do Make: ${err2.message}`);
                }
            } finally {
                btnTestMakeWebhook.disabled = false;
                btnTestMakeWebhook.textContent = '🧪 Testar Disparo do Make';
            }
        });
    }

    async function testConnection(url, key, table, storesTable) {
        connStatus.className = 'status-box loading';
        connStatus.querySelector('.status-text').textContent = 'Testando conexão com o banco Supabase...';

        try {
            const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
            const endpointLeads = `${cleanUrl}/rest/v1/${table}?select=*&limit=1`;
            const endpointStores = `${cleanUrl}/rest/v1/${storesTable}?select=*&limit=1`;
            const endpointAccess = `${cleanUrl}/rest/v1/acessos_lojas?select=*&limit=1`;

            // Testa tabela de Leads
            const resLeads = await fetch(endpointLeads, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resLeads.ok) {
                const errText = await resLeads.text();
                throw new Error(`Tabela de Leads inválida: ${errText}`);
            }

            // Testa tabela de Lojas
            const resStores = await fetch(endpointStores, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resStores.ok) {
                const errText = await resStores.text();
                throw new Error(`Tabela de Lojas inválida: ${errText}`);
            }

            // Testa tabela de Acessos
            const resAccess = await fetch(endpointAccess, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resAccess.ok) {
                console.warn("Tabela de Acessos não encontrada ou inválida. Crie a tabela 'acessos_lojas' no Supabase.");
            }

            connStatus.className = 'status-box connected';
            connStatus.querySelector('.status-text').textContent = 'Conectado ao Supabase ( Leads, Lojas e Acessos ativos)! ✅';
        } catch (error) {
            console.error('Erro de conexão:', error);
            connStatus.className = 'status-box error';
            connStatus.querySelector('.status-text').textContent = `Falha na conexão: ${error.message}`;
        }
    }

    // -------------------------------------------------------------
    // 3. Controle da Lista de Tarefas de Domínio (Vercel)
    // -------------------------------------------------------------
    const domainCheckboxes = document.querySelectorAll('.domain-check');

    domainCheckboxes.forEach(chk => {
        const savedState = localStorage.getItem(`domain_check_${chk.id}`);
        if (savedState === 'true') {
            chk.checked = true;
        }

        chk.addEventListener('change', () => {
            localStorage.setItem(`domain_check_${chk.id}`, chk.checked);
        });
    });

    // -------------------------------------------------------------
    // 4. Gerenciamento de Lojas Licenciadas (CRUD)
    // -------------------------------------------------------------
    const addStoreForm = document.getElementById('addStoreForm');
    const storeNameInput = document.getElementById('storeName');
    const storeAddressInput = document.getElementById('storeAddress');
    const storePhoneInput = document.getElementById('storePhone');
    const storesTableBody = document.getElementById('storesTableBody');

    const btnSubmitStore = document.getElementById('btnSubmitStore');
    const btnCancelEditStore = document.getElementById('btnCancelEditStore');

    let editingStoreId = null;

    const defaultStores = [];

    btnCancelEditStore.addEventListener('click', () => {
        addStoreForm.reset();
        btnSubmitStore.textContent = 'Cadastrar Ótica Parceira';
        btnCancelEditStore.style.display = 'none';
        editingStoreId = null;
    });

    async function getStoresList() {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const storesTable = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${storesTable}?select=*&order=nome.asc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                console.error(error);
            }
        }
        return getLocalStores();
    }

    async function loadStores() {
        storesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Buscando lojas...</td></tr>`;
        const stores = await getStoresList();
        renderStoresTable(stores);
    }

    function getLocalStores() {
        const local = localStorage.getItem('personality_local_stores');
        if (!local) {
            localStorage.setItem('personality_local_stores', JSON.stringify(defaultStores));
            return defaultStores;
        }
        return JSON.parse(local);
    }

    function renderStoresTable(stores) {
        storesTableBody.innerHTML = '';
        if (stores.length === 0) {
            storesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhuma ótica parceira cadastrada.</td></tr>`;
            return;
        }

        stores.forEach(store => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(store.nome)}</strong></td>
                <td>${escapeHtml(store.endereco)}</td>
                <td>${escapeHtml(store.telefone)}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-gold btn-sm edit-store-btn" data-id="${store.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-store-btn" data-id="${store.id}">Excluir</button>
                    </div>
                </td>
            `;
            storesTableBody.appendChild(tr);
        });

        // Configura botões de edição
        document.querySelectorAll('.edit-store-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const store = stores.find(s => s.id.toString() === id.toString());
                if (store) {
                    storeNameInput.value = store.nome;
                    storeAddressInput.value = store.endereco;
                    storePhoneInput.value = store.telefone;

                    btnSubmitStore.textContent = 'Salvar Alterações 💾';
                    btnCancelEditStore.style.display = 'inline-block';
                    editingStoreId = id;

                    addStoreForm.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Configura botões de exclusão
        document.querySelectorAll('.delete-store-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Tem certeza que deseja remover esta ótica credenciada? Ela sairá do site e do formulário imediatamente.')) {
                    await deleteStore(id);
                }
            });
        });
    }

    async function deleteStore(id) {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const storesTable = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${storesTable}?id=eq.${id}`;

                const response = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (!response.ok) throw new Error('Falha ao excluir no Supabase.');
                
                if (editingStoreId === id) {
                    btnCancelEditStore.click();
                }
                
                loadStores();
            } catch (error) {
                alert(`Erro ao excluir: ${error.message}`);
            }
        } else {
            let stores = getLocalStores();
            stores = stores.filter(s => s.id !== id);
            localStorage.setItem('personality_local_stores', JSON.stringify(stores));
            if (editingStoreId === id) {
                btnCancelEditStore.click();
            }
            loadStores();
        }
    }

    addStoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = storeNameInput.value.trim();
        const endereco = storeAddressInput.value.trim();
        const telefone = storePhoneInput.value.trim();

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const storesTable = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';

        if (editingStoreId) {
            // Modo Edição (PATCH)
            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/${storesTable}?id=eq.${editingStoreId}`;

                    const response = await fetch(endpoint, {
                        method: 'PATCH',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ nome, endereco, telefone })
                    });

                    if (!response.ok) throw new Error('Falha ao atualizar no Supabase.');
                    
                    btnCancelEditStore.click();
                    loadStores();
                } catch (error) {
                    alert(`Erro ao atualizar: ${error.message}`);
                }
            } else {
                let stores = getLocalStores();
                stores = stores.map(s => s.id === editingStoreId ? { ...s, nome, endereco, telefone } : s);
                localStorage.setItem('personality_local_stores', JSON.stringify(stores));
                btnCancelEditStore.click();
                loadStores();
            }
        } else {
            // Modo Criação (POST)
            const newStore = {
                id: Date.now().toString(),
                nome,
                endereco,
                telefone
            };

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/${storesTable}`;

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ nome, endereco, telefone })
                    });

                    if (!response.ok) throw new Error('Falha ao salvar no Supabase.');
                    addStoreForm.reset();
                    loadStores();
                } catch (error) {
                    alert(`Erro: ${error.message}`);
                }
            } else {
                const stores = getLocalStores();
                stores.push(newStore);
                localStorage.setItem('personality_local_stores', JSON.stringify(stores));
                addStoreForm.reset();
                loadStores();
            }
        }
    });

    // -------------------------------------------------------------
    // 5. Gerenciamento de Acessos de Lojas Credenciadas
    // -------------------------------------------------------------
    const createAccessForm = document.getElementById('createAccessForm');
    const accessStoreSelect = document.getElementById('accessStoreSelect');
    const accessUserInput = document.getElementById('accessUser');
    const accessPasswordInput = document.getElementById('accessPassword');
    const accessTableBody = document.getElementById('accessTableBody');

    const btnSubmitAccess = document.getElementById('btnSubmitAccess');
    const btnCancelEditAccess = document.getElementById('btnCancelEditAccess');

    let editingAccessId = null;

    btnCancelEditAccess.addEventListener('click', () => {
        createAccessForm.reset();
        btnSubmitAccess.textContent = 'Criar Credencial de Acesso';
        btnCancelEditAccess.style.display = 'none';
        editingAccessId = null;
    });

    async function loadAccessManager() {
        accessStoreSelect.innerHTML = '<option value="">Carregando lojas...</option>';
        const stores = await getStoresList();
        
        accessStoreSelect.innerHTML = '<option value="">Selecione a Ótica Credenciada...</option>';
        stores.forEach(store => {
            const opt = document.createElement('option');
            opt.value = store.nome;
            opt.textContent = store.nome;
            accessStoreSelect.appendChild(opt);
        });

        loadAccessList();
    }

    async function loadAccessList() {
        accessTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Buscando acessos...</td></tr>`;

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        let accesses = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/acessos_lojas?select=*&order=loja_nome.asc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    accesses = await response.json();
                } else {
                    throw new Error('Falha ao obter credenciais no Supabase.');
                }
            } catch (error) {
                console.error(error);
                accesses = getLocalAccesses();
            }
        } else {
            accesses = getLocalAccesses();
        }

        renderAccessTable(accesses);
    }

    function getLocalAccesses() {
        return JSON.parse(localStorage.getItem('personality_local_accesses')) || [];
    }

    function renderAccessTable(accesses) {
        accessTableBody.innerHTML = '';
        if (accesses.length === 0) {
            accessTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhuma credencial de loja cadastrada.</td></tr>`;
            return;
        }

        accesses.forEach(acc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="store-badge" style="margin-top:0;">${escapeHtml(acc.loja_nome)}</span></td>
                <td><code>${escapeHtml(acc.usuario)}</code></td>
                <td><code>${escapeHtml(acc.senha)}</code></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-gold btn-sm edit-access-btn" data-id="${acc.id}">Editar</button>
                        <button class="btn btn-danger btn-sm delete-access-btn" data-id="${acc.id}">Excluir</button>
                    </div>
                </td>
            `;
            accessTableBody.appendChild(tr);
        });

        // Configura botões de edição
        document.querySelectorAll('.edit-access-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const acc = accesses.find(a => a.id.toString() === id.toString());
                if (acc) {
                    accessStoreSelect.value = acc.loja_nome;
                    accessUserInput.value = acc.usuario;
                    accessPasswordInput.value = acc.senha;

                    btnSubmitAccess.textContent = 'Salvar Alterações 💾';
                    btnCancelEditAccess.style.display = 'inline-block';
                    editingAccessId = id;

                    createAccessForm.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Configura botões de exclusão
        document.querySelectorAll('.delete-access-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Deseja excluir esta credencial de acesso? A ótica perderá acesso ao Portal.')) {
                    await deleteAccess(id);
                }
            });
        });
    }

    async function deleteAccess(id) {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/acessos_lojas?id=eq.${id}`;

                const response = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (!response.ok) throw new Error('Falha ao excluir no Supabase.');
                
                if (editingAccessId === id) {
                    btnCancelEditAccess.click();
                }

                loadAccessList();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        } else {
            let accesses = getLocalAccesses();
            accesses = accesses.filter(acc => acc.id !== id);
            localStorage.setItem('personality_local_accesses', JSON.stringify(accesses));
            if (editingAccessId === id) {
                btnCancelEditAccess.click();
            }
            loadAccessList();
        }
    }

    createAccessForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loja_nome = accessStoreSelect.value;
        const usuario = accessUserInput.value.trim().toLowerCase();
        const senha = accessPasswordInput.value.trim();

        if (!/^[a-z0-9]+$/.test(usuario)) {
            alert('O usuário deve conter apenas letras minúsculas e números, sem espaços ou acentos.');
            return;
        }

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (editingAccessId) {
            // Modo Edição (PATCH)
            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/acessos_lojas?id=eq.${editingAccessId}`;

                    const response = await fetch(endpoint, {
                        method: 'PATCH',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ loja_nome, usuario, senha })
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        if (errText.includes('duplicate key')) {
                            throw new Error('Já existe um acesso cadastrado com este usuário.');
                        }
                        throw new Error(errText || 'Falha ao atualizar acesso no Supabase.');
                    }

                    btnCancelEditAccess.click();
                    loadAccessList();
                } catch (error) {
                    alert(`Erro ao atualizar: ${error.message}`);
                }
            } else {
                let accesses = getLocalAccesses();
                if (accesses.some(a => a.id !== editingAccessId && a.usuario === usuario)) {
                    alert('Já existe um acesso cadastrado com este usuário.');
                    return;
                }
                accesses = accesses.map(a => a.id === editingAccessId ? { ...a, loja_nome, usuario, senha } : a);
                localStorage.setItem('personality_local_accesses', JSON.stringify(accesses));
                btnCancelEditAccess.click();
                loadAccessList();
            }
        } else {
            // Modo Criação (POST)
            const newAccess = {
                id: Date.now().toString(),
                loja_nome,
                usuario,
                senha
            };

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/acessos_lojas`;

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ loja_nome, usuario, senha })
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        if (errText.includes('duplicate key')) {
                            throw new Error('Já existe um acesso cadastrado para esta loja ou com este usuário.');
                        }
                        throw new Error(errText || 'Falha ao salvar acesso no Supabase.');
                    }

                    createAccessForm.reset();
                    loadAccessList();
                } catch (error) {
                    alert(`Erro: ${error.message}`);
                }
            } else {
                const accesses = getLocalAccesses();
                if (accesses.some(a => a.loja_nome === loja_nome || a.usuario === usuario)) {
                    alert('Já existe um acesso cadastrado para esta loja ou com este usuário.');
                    return;
                }
                accesses.push(newAccess);
                localStorage.setItem('personality_local_accesses', JSON.stringify(accesses));
                createAccessForm.reset();
                loadAccessList();
            }
        }
    });

    // -------------------------------------------------------------
    // 6. Carregamento e Visualização de Leads (Master Dashboard)
    // -------------------------------------------------------------
    const leadsTableBody = document.getElementById('leadsTableBody');
    const leadsCountSpan = document.getElementById('leadsCount');
    const btnExportLeads = document.getElementById('btnExportLeads');
    const btnClearLeads = document.getElementById('btnClearLeads');

    async function loadLeads() {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const table = localStorage.getItem('personality_sb_table') || 'leads_personality';

        let leads = [];

        if (url && key) {
            leadsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Buscando leads no Supabase...</td></tr>`;
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${table}?select=*&order=created_at.desc`;

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
                leadsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Erro na conexão. Carregando dados locais.</td></tr>`;
                leads = JSON.parse(localStorage.getItem('personality_local_leads')) || [];
            }
        } else {
            leads = JSON.parse(localStorage.getItem('personality_local_leads')) || [];
        }

        renderLeads(leads);
    }

    function renderLeads(leads) {
        leadsCountSpan.textContent = leads.length;
        leadsTableBody.innerHTML = '';

        if (leads.length === 0) {
            leadsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px 0;">Nenhum lead com voucher cadastrado ainda.</td></tr>`;
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
                <td>${escapeHtml(lead.email)}</td>
                <td>${waLink}</td>
                <td><span class="store-badge" style="margin-top:0;">${escapeHtml(lead.loja || 'Não selecionada')}</span></td>
                <td><code style="color: var(--gold-light); font-weight:700;">${escapeHtml(lead.voucher || 'Sem voucher')}</code></td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(lead.message || '')}">${escapeHtml(lead.message || '')}</td>
                <td>${escapeHtml(formattedDate)}</td>
            `;
            leadsTableBody.appendChild(tr);
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

    // Limpar leads locais e do Supabase
    btnClearLeads.addEventListener('click', async () => {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const table = localStorage.getItem('personality_sb_table') || 'leads_personality';

        if (url && key) {
            if (confirm('ATENÇÃO: Deseja apagar permanentemente todos os leads salvos no banco de dados Supabase? Esta ação não pode ser desfeita!')) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/${table}?id=not.is.null`;

                    const response = await fetch(endpoint, {
                        method: 'DELETE',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        throw new Error(errText || 'Falha ao deletar leads do Supabase.');
                    }

                    // Limpa também o fallback local
                    localStorage.removeItem('personality_local_leads');
                    alert('Todos os leads do banco Supabase e dados locais foram apagados com sucesso!');
                    loadLeads();
                } catch (error) {
                    console.error(error);
                    alert(`Erro ao apagar leads do Supabase: ${error.message}`);
                }
            }
        } else {
            if (confirm('Deseja limpar os dados de leads salvos localmente?')) {
                localStorage.removeItem('personality_local_leads');
                alert('Leads locais apagados com sucesso!');
                loadLeads();
            }
        }
    });

    // Exportar leads para CSV
    btnExportLeads.addEventListener('click', async () => {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
        const table = localStorage.getItem('personality_sb_table') || 'leads_personality';
        
        let leads = [];

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/${table}?select=*&order=created_at.desc`;
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
            leads = JSON.parse(localStorage.getItem('personality_local_leads')) || [];
        }

        if (leads.length === 0) {
            alert('Não há dados de leads para exportar.');
            return;
        }

        let csvContent = "\uFEFF"; 
        csvContent += "Nome;Email;Whatsapp;Telefone_Limpo;Loja_Escolhida;Voucher;Mensagem;Data_Cadastro\n";
        
        leads.forEach(lead => {
            const rawPhone = (lead.whatsapp || '').replace(/\D/g, '');
            const dateStr = lead.created_at || lead.timestamp || '';
            const line = [
                `` + `"${lead.name.replace(/"/g, '""')}"`,
                `"${lead.email.replace(/"/g, '""')}"`,
                `"${lead.whatsapp}"`,
                `"+55${rawPhone}"`,
                `"${(lead.loja || '').replace(/"/g, '""')}"`,
                `"${(lead.voucher || '').replace(/"/g, '""')}"`,
                `"${(lead.message || '').replace(/"/g, '""')}"`,
                `"${dateStr}"`
            ].join(';');
            csvContent += line + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", downloadUrl);
        link.setAttribute("download", `leads_personality_completo_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // -------------------------------------------------------------
    // 6. Gerenciamento de Equipe Técnica (Suporte & Garantia)
    // -------------------------------------------------------------
    const addTechnicianForm = document.getElementById('addTechnicianForm');
    const techNameInput = document.getElementById('techName');
    const techEmailInput = document.getElementById('techEmail');
    const techWhatsappInput = document.getElementById('techWhatsapp');
    const techSpecialtyInput = document.getElementById('techSpecialty');
    const techStoreSelect = document.getElementById('techStore');
    const btnSubmitTech = document.getElementById('btnSubmitTech');
    const btnCancelEditTech = document.getElementById('btnCancelEditTech');
    const techTableBody = document.getElementById('techTableBody');
    let editingTechId = null;

    const defaultTechs = [
        { id: "1", nome: "Carlos Andrade", email: "carlos.tecnico@personality.com.br", whatsapp: "(11) 97777-6666", especialidade: "Optometrista & Tomada de Medidas HD", loja_atendida: "Todas as Lojas" },
        { id: "2", nome: "Eng. Ricardo Santos", email: "ricardo.laboratorio@personality.com.br", whatsapp: "(11) 98888-5555", especialidade: "Garantia AR & Tratamentos de Superfície", loja_atendida: "Todas as Lojas" }
    ];

    if (btnCancelEditTech) {
        btnCancelEditTech.addEventListener('click', () => {
            addTechnicianForm.reset();
            btnSubmitTech.textContent = 'Cadastrar Técnico Responsável';
            btnCancelEditTech.style.display = 'none';
            editingTechId = null;
        });
    }

    async function loadTechniciansManager() {
        if (!techStoreSelect) return;
        techStoreSelect.innerHTML = '<option value="Todas as Lojas">Carregando lojas...</option>';
        const stores = await getStoresList();
        
        techStoreSelect.innerHTML = '<option value="Todas as Lojas">Todas as Lojas (Técnico Geral da Rede)</option>';
        stores.forEach(store => {
            const opt = document.createElement('option');
            opt.value = store.nome;
            opt.textContent = store.nome;
            techStoreSelect.appendChild(opt);
        });

        loadTechsList();
    }

    async function getTechsList() {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/tecnicos_personality?select=*&order=nome.asc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) return data;
                }
            } catch (error) {
                console.error('Erro ao buscar técnicos no Supabase:', error);
            }
        }
        return getLocalTechs();
    }

    function getLocalTechs() {
        const local = localStorage.getItem('personality_local_techs');
        if (!local) {
            localStorage.setItem('personality_local_techs', JSON.stringify(defaultTechs));
            return defaultTechs;
        }
        return JSON.parse(local);
    }

    async function loadTechsList() {
        if (!techTableBody) return;
        techTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Buscando equipe técnica...</td></tr>`;
        const techs = await getTechsList();
        renderTechsTable(techs);
    }

    function renderTechsTable(techs) {
        if (!techTableBody) return;
        techTableBody.innerHTML = '';
        if (!techs || techs.length === 0) {
            techTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhum técnico cadastrado.</td></tr>`;
            return;
        }

        techs.forEach(tech => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(tech.nome)}</strong></td>
                <td>${escapeHtml(tech.email)}</td>
                <td>${escapeHtml(tech.whatsapp)}</td>
                <td><span class="store-badge">${escapeHtml(tech.especialidade || 'Geral')}</span></td>
                <td>${escapeHtml(tech.loja_atendida || 'Todas as Lojas')}</td>
                <td>
                    <button class="btn btn-sm btn-gold btn-edit-tech" data-id="${tech.id}" data-nome="${escapeHtml(tech.nome)}" data-email="${escapeHtml(tech.email)}" data-whatsapp="${escapeHtml(tech.whatsapp)}" data-especialidade="${escapeHtml(tech.especialidade)}" data-loja="${escapeHtml(tech.loja_atendida)}">✏️ Editar</button>
                    <button class="btn btn-sm btn-danger btn-delete-tech" data-id="${tech.id}">🗑️ Excluir</button>
                </td>
            `;
            techTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-tech').forEach(btn => {
            btn.addEventListener('click', () => {
                editingTechId = btn.getAttribute('data-id');
                techNameInput.value = btn.getAttribute('data-nome');
                techEmailInput.value = btn.getAttribute('data-email');
                techWhatsappInput.value = btn.getAttribute('data-whatsapp');
                techSpecialtyInput.value = btn.getAttribute('data-especialidade');
                techStoreSelect.value = btn.getAttribute('data-loja') || 'Todas as Lojas';

                btnSubmitTech.textContent = 'Salvar Alterações do Técnico';
                btnCancelEditTech.style.display = 'inline-block';
                window.scrollTo({ top: addTechnicianForm.offsetTop - 100, behavior: 'smooth' });
            });
        });

        document.querySelectorAll('.btn-delete-tech').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Deseja excluir este técnico?')) {
                    await deleteTech(id);
                }
            });
        });
    }

    async function deleteTech(id) {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/tecnicos_personality?id=eq.${id}`;

                const response = await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (!response.ok) throw new Error('Falha ao excluir técnico no Supabase.');
                if (editingTechId === id) btnCancelEditTech.click();
                loadTechsList();
            } catch (error) {
                alert(`Erro: ${error.message}`);
            }
        } else {
            let techs = getLocalTechs();
            techs = techs.filter(t => t.id !== id);
            localStorage.setItem('personality_local_techs', JSON.stringify(techs));
            if (editingTechId === id) btnCancelEditTech.click();
            loadTechsList();
        }
    }

    if (addTechnicianForm) {
        addTechnicianForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = techNameInput.value.trim();
            const email = techEmailInput.value.trim();
            const whatsapp = techWhatsappInput.value.trim();
            const especialidade = techSpecialtyInput.value.trim();
            const loja_atendida = techStoreSelect.value;

            if (nome.length < 3 || !email.includes('@') || whatsapp.replace(/\D/g, '').length < 10) {
                alert('Por favor, preencha todos os campos do técnico corretamente.');
                return;
            }

            const url = localStorage.getItem('personality_sb_url');
            const key = localStorage.getItem('personality_sb_key');

            if (editingTechId) {
                if (url && key) {
                    try {
                        const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                        const endpoint = `${cleanUrl}/rest/v1/tecnicos_personality?id=eq.${editingTechId}`;

                        const response = await fetch(endpoint, {
                            method: 'PATCH',
                            headers: {
                                'apikey': key,
                                'Authorization': `Bearer ${key}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify({ nome, email, whatsapp, especialidade, loja_atendida })
                        });

                        if (!response.ok) throw new Error('Falha ao atualizar técnico no Supabase.');
                    } catch (error) {
                        alert(`Erro ao editar técnico: ${error.message}`);
                        return;
                    }
                } else {
                    let techs = getLocalTechs();
                    const idx = techs.findIndex(t => t.id === editingTechId);
                    if (idx !== -1) {
                        techs[idx] = { ...techs[idx], nome, email, whatsapp, especialidade, loja_atendida };
                        localStorage.setItem('personality_local_techs', JSON.stringify(techs));
                    }
                }
            } else {
                if (url && key) {
                    try {
                        const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                        const endpoint = `${cleanUrl}/rest/v1/tecnicos_personality`;

                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {
                                'apikey': key,
                                'Authorization': `Bearer ${key}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify({ nome, email, whatsapp, especialidade, loja_atendida })
                        });

                        if (!response.ok) throw new Error('Falha ao cadastrar técnico no Supabase.');
                    } catch (error) {
                        alert(`Erro ao cadastrar técnico: ${error.message}`);
                        return;
                    }
                } else {
                    let techs = getLocalTechs();
                    const newTech = { id: Date.now().toString(), nome, email, whatsapp, especialidade, loja_atendida };
                    techs.push(newTech);
                    localStorage.setItem('personality_local_techs', JSON.stringify(techs));
                }
            }

            addTechnicianForm.reset();
            if (btnCancelEditTech) btnCancelEditTech.click();
            alert('Técnico salvo com sucesso!');
            loadTechsList();
        });
    }

    // -------------------------------------------------------------
    // 7. Chamados de Assistência Técnica & Garantia
    // -------------------------------------------------------------
    const ticketsCount = document.getElementById('ticketsCount');
    const btnExportTickets = document.getElementById('btnExportTickets');
    const ticketsTableBody = document.getElementById('ticketsTableBody');

    async function getTicketsList() {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/chamados_assistencia?select=*&order=created_at.desc`;

                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data) return data;
                }
            } catch (error) {
                console.error('Erro ao buscar chamados no Supabase:', error);
            }
        }
        return JSON.parse(localStorage.getItem('personality_local_tickets')) || [];
    }

    async function loadTickets() {
        if (!ticketsTableBody) return;
        ticketsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Buscando chamados de assistência...</td></tr>`;
        const tickets = await getTicketsList();
        renderTicketsTable(tickets);
    }

    function renderTicketsTable(tickets) {
        if (!ticketsTableBody) return;
        ticketsTableBody.innerHTML = '';
        if (ticketsCount) ticketsCount.textContent = tickets.length;

        if (!tickets || tickets.length === 0) {
            ticketsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhum chamado de assistência registrado até o momento.</td></tr>`;
            return;
        }

        tickets.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong style="color: var(--gold-light);">${escapeHtml(t.protocolo || 'N/A')}</strong></td>
                <td><strong>${escapeHtml(t.cliente_nome)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(t.cliente_whatsapp)} | ${escapeHtml(t.cliente_email)}</small></td>
                <td><strong>${escapeHtml(t.loja_nome)}</strong><br><small style="color: var(--text-muted);">Comprado em: ${escapeHtml(t.data_compra || 'N/I')}</small></td>
                <td><strong>O.S.: ${escapeHtml(t.os_numero || 'N/I')}</strong><br><small style="color: var(--text-muted);">Dr(a): ${escapeHtml(t.medico_crm || 'N/I')}</small></td>
                <td><strong>${escapeHtml(t.linha_produto)}</strong><br><small style="color: var(--gold-light);">${escapeHtml(t.tratamento || 'Tratamento Padrão')}</small><br><small style="color: var(--text-muted);">${escapeHtml(t.motivo)}</small></td>
                <td>📅 ${escapeHtml(t.data_atendimento)}<br>⏰ ${escapeHtml(t.horario_atendimento)}</td>
                <td>👤 <strong>${escapeHtml(t.tecnico_nome)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(t.tecnico_whatsapp)}</small></td>
                <td><span class="store-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(10, 185, 129, 0.3);">${escapeHtml(t.status || 'Agendado')}</span></td>
            `;
            ticketsTableBody.appendChild(tr);
        });
    }

    if (btnExportTickets) {
        btnExportTickets.addEventListener('click', async () => {
            const tickets = await getTicketsList();
            if (!tickets || tickets.length === 0) {
                alert('Não há dados de chamados para exportar.');
                return;
            }

            let csvContent = "\uFEFF";
            csvContent += "Protocolo;Cliente_Nome;Cliente_Email;Cliente_Whatsapp;Data_Compra;OS_Numero;Medico_CRM;Loja_Compra;Linha_Produto;Tratamento;Motivo;Data_Atendimento;Horario;Tecnico_Responsavel;Tecnico_Email;Tecnico_Whatsapp;Status;Data_Abertura\n";

            tickets.forEach(t => {
                const line = [
                    `"${t.protocolo || ''}"`,
                    `"${(t.cliente_nome || '').replace(/"/g, '""')}"`,
                    `"${(t.cliente_email || '').replace(/"/g, '""')}"`,
                    `"${t.cliente_whatsapp || ''}"`,
                    `"${t.data_compra || ''}"`,
                    `"${(t.os_numero || '').replace(/"/g, '""')}"`,
                    `"${(t.medico_crm || '').replace(/"/g, '""')}"`,
                    `"${(t.loja_nome || '').replace(/"/g, '""')}"`,
                    `"${(t.linha_produto || '').replace(/"/g, '""')}"`,
                    `"${(t.tratamento || '').replace(/"/g, '""')}"`,
                    `"${(t.motivo || '').replace(/"/g, '""')}"`,
                    `"${t.data_atendimento || ''}"`,
                    `"${t.horario_atendimento || ''}"`,
                    `"${(t.tecnico_nome || '').replace(/"/g, '""')}"`,
                    `"${(t.tecnico_email || '').replace(/"/g, '""')}"`,
                    `"${t.tecnico_whatsapp || ''}"`,
                    `"${t.status || 'Agendado'}"`,
                    `"${t.created_at || ''}"`
                ].join(';');
                csvContent += line + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", downloadUrl);
            link.setAttribute("download", `chamados_assistencia_personality_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // -------------------------------------------------------------
    // 8. Gerenciamento de Motivos de Assistência Técnica
    // -------------------------------------------------------------
    const addReasonForm = document.getElementById('addReasonForm');
    const newReasonInput = document.getElementById('newReasonInput');
    const btnResetReasons = document.getElementById('btnResetReasons');
    const reasonsTableBody = document.getElementById('reasonsTableBody');

    const defaultReasonsList = [
        "Adaptação Visual & Ajuste de Foco",
        "Tomada de Parâmetros / DNP / Altura",
        "Garantia de Antirreflexo / Tratamento Superficial",
        "Ajuste de Armação & Montagem",
        "Análise Técnica de Laboratório",
        "Outros Assuntos de Suporte"
    ];

    async function getMotivosList() {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

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
                    if (data && data.length > 0) return data.map(d => d.motivo);
                }
            } catch (error) {
                console.error('Erro ao buscar motivos no Supabase:', error);
            }
        }
        return getLocalMotivos();
    }

    function getLocalMotivos() {
        const local = localStorage.getItem('personality_local_motivos');
        if (!local) {
            localStorage.setItem('personality_local_motivos', JSON.stringify(defaultReasonsList));
            return defaultReasonsList;
        }
        return JSON.parse(local);
    }

    async function loadMotivosManager() {
        if (!reasonsTableBody) return;
        reasonsTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Buscando motivos...</td></tr>`;
        const list = await getMotivosList();
        renderReasonsTable(list);
    }

    function renderReasonsTable(list) {
        if (!reasonsTableBody) return;
        reasonsTableBody.innerHTML = '';

        if (!list || list.length === 0) {
            reasonsTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 16px 0;">Nenhum motivo cadastrado.</td></tr>`;
            return;
        }

        list.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${index + 1}</strong></td>
                <td><strong>${escapeHtml(item)}</strong></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm btn-outline-gold btn-edit-reason" data-reason="${escapeHtml(item)}">✏️ Editar</button>
                        <button class="btn btn-sm btn-danger btn-delete-reason" data-reason="${escapeHtml(item)}">🗑️ Excluir</button>
                    </div>
                </td>
            `;
            reasonsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-edit-reason').forEach(btn => {
            btn.addEventListener('click', async () => {
                const oldReasonText = btn.getAttribute('data-reason');
                const newReasonText = prompt(`Editar descrição do motivo de atendimento:\n\nMotivo atual:\n"${oldReasonText}"`, oldReasonText);
                
                if (newReasonText !== null) {
                    const trimmedNew = newReasonText.trim();
                    if (trimmedNew.length < 3) {
                        alert('O motivo deve conter pelo menos 3 caracteres.');
                        return;
                    }
                    if (trimmedNew !== oldReasonText) {
                        await editMotivo(oldReasonText, trimmedNew);
                    }
                }
            });
        });

        document.querySelectorAll('.btn-delete-reason').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reasonToDelete = btn.getAttribute('data-reason');
                if (confirm(`Excluir o motivo "${reasonToDelete}"?`)) {
                    await deleteMotivo(reasonToDelete);
                }
            });
        });
    }

    async function editMotivo(oldReasonText, newReasonText) {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/motivos_assistencia?motivo=eq.${encodeURIComponent(oldReasonText)}`;

                const response = await fetch(endpoint, {
                    method: 'PATCH',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ motivo: newReasonText })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.warn('Erro ao atualizar motivo no Supabase:', errText);
                }
            } catch (err) {
                console.error('Erro no PATCH do motivo:', err);
            }
        }

        let list = getLocalMotivos();
        list = list.map(r => (r === oldReasonText ? newReasonText : r));
        localStorage.setItem('personality_local_motivos', JSON.stringify(list));

        alert('Motivo atualizado com sucesso!');
        loadMotivosManager();
    }

    async function deleteMotivo(reasonText) {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/motivos_assistencia?motivo=eq.${encodeURIComponent(reasonText)}`;

                await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
            } catch (err) {
                console.error(err);
            }
        }

        let list = getLocalMotivos();
        list = list.filter(r => r !== reasonText);
        localStorage.setItem('personality_local_motivos', JSON.stringify(list));
        loadMotivosManager();
    }

    if (addReasonForm) {
        addReasonForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newReason = newReasonInput.value.trim();
            if (newReason.length < 3) {
                alert('Informe um motivo válido com pelo menos 3 caracteres.');
                return;
            }

            const url = localStorage.getItem('personality_sb_url');
            const key = localStorage.getItem('personality_sb_key');

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = `${cleanUrl}/rest/v1/motivos_assistencia`;

                    await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ motivo: newReason })
                    });
                } catch (err) {
                    console.error(err);
                }
            }

            let list = getLocalMotivos();
            if (!list.includes(newReason)) {
                list.push(newReason);
                localStorage.setItem('personality_local_motivos', JSON.stringify(list));
            }

            newReasonInput.value = '';
            alert('Motivo adicionado com sucesso!');
            loadMotivosManager();
        });
    }

    if (btnResetReasons) {
        btnResetReasons.addEventListener('click', async () => {
            if (confirm('Deseja restaurar os motivos padrões de atendimento?')) {
                localStorage.setItem('personality_local_motivos', JSON.stringify(defaultReasonsList));
                alert('Motivos padrões restaurados com sucesso!');
                loadMotivosManager();
            }
        });
    }

    // -------------------------------------------------------------
    // Gerenciamento da Central de Downloads (Materiais)
    // -------------------------------------------------------------
    const downloadMaterialForm = document.getElementById('downloadMaterialForm');
    const downloadFormTitle = document.getElementById('downloadFormTitle');
    const downloadEditId = document.getElementById('downloadEditId');
    const downloadTitulo = document.getElementById('downloadTitulo');
    const downloadCategoria = document.getElementById('downloadCategoria');
    const downloadFormato = document.getElementById('downloadFormato');
    const downloadUrl = document.getElementById('downloadUrl');
    const downloadDescricao = document.getElementById('downloadDescricao');
    const btnCancelDownload = document.getElementById('btnCancelDownload');
    const downloadMaterialsTableBody = document.getElementById('downloadMaterialsTableBody');

    const defaultDownloadsAdmin = [
        {
            id: 'dl-shine-mirror',
            titulo: 'Apresentação & Ficha Técnica Shine Mirror',
            categoria: 'Lançamento Exclusivo',
            descricao: 'Especificações completas da inovadora lente fotossensível inteligente que se transforma em espelhada ao escurecer no sol.',
            formato: 'PDF • Apresentação Oficial',
            url_download: 'downloads/SHINE%20MIRROR.pdf'
        }
    ];

    async function loadAdminDownloadsManager() {
        if (!downloadMaterialsTableBody) return;
        downloadMaterialsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Buscando materiais...</td></tr>`;

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
                    throw new Error('Falha ao carregar do Supabase');
                }
            } catch (err) {
                console.error(err);
                downloads = getLocalAdminDownloads();
            }
        } else {
            downloads = getLocalAdminDownloads();
        }

        if (!downloads || downloads.length === 0) {
            downloads = defaultDownloadsAdmin;
            localStorage.setItem('personality_local_downloads', JSON.stringify(downloads));
        }

        renderAdminDownloadsTable(downloads);
    }

    function getLocalAdminDownloads() {
        const local = localStorage.getItem('personality_local_downloads');
        return local ? JSON.parse(local) : defaultDownloadsAdmin;
    }

    function renderAdminDownloadsTable(items) {
        if (!downloadMaterialsTableBody) return;
        downloadMaterialsTableBody.innerHTML = '';

        if (items.length === 0) {
            downloadMaterialsTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">Nenhum material cadastrado.</td></tr>`;
            return;
        }

        items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color:#fff;">${item.titulo}</strong><br>
                    <span style="font-size: 11px; color: var(--gold-light);">${item.categoria}</span>
                </td>
                <td style="font-size: 12.5px; color: var(--text-muted);">${item.descricao}</td>
                <td style="font-size: 12px; color: var(--gold-light);">${item.formato}</td>
                <td style="font-size: 11px; word-break: break-all;">
                    <a href="${item.url_download}" target="_blank" style="color: var(--gold-light); text-decoration: underline;">${item.url_download && item.url_download !== '#' ? 'Acessar Link' : 'Sem Link'}</a>
                </td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-gold btn-edit-dl" data-id="${item.id}">✏️ Editar</button>
                        <button class="btn btn-sm btn-danger btn-del-dl" data-id="${item.id}">🗑️ Excluir</button>
                    </div>
                </td>
            `;

            tr.querySelector('.btn-edit-dl').onclick = () => editAdminDownloadItem(item);
            tr.querySelector('.btn-del-dl').onclick = () => deleteAdminDownloadItem(item.id);

            downloadMaterialsTableBody.appendChild(tr);
        });
    }

    function editAdminDownloadItem(item) {
        if (!downloadMaterialForm) return;
        downloadEditId.value = item.id;
        downloadTitulo.value = item.titulo;
        downloadCategoria.value = item.categoria;
        downloadFormato.value = item.formato;
        downloadUrl.value = item.url_download === '#' ? '' : item.url_download;
        downloadDescricao.value = item.descricao;

        downloadFormTitle.textContent = '✏️ Editar Material de Download';
        btnCancelDownload.style.display = 'inline-block';
        window.scrollTo({ top: downloadMaterialForm.offsetTop - 100, behavior: 'smooth' });
    }

    function resetAdminDownloadForm() {
        if (!downloadMaterialForm) return;
        downloadEditId.value = '';
        downloadMaterialForm.reset();
        downloadFormTitle.textContent = '➕ Cadastrar Novo Material para Download';
        btnCancelDownload.style.display = 'none';
    }

    if (btnCancelDownload) {
        btnCancelDownload.onclick = resetAdminDownloadForm;
    }

    if (downloadMaterialForm) {
        downloadMaterialForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const isEdit = !!downloadEditId.value;
            const payload = {
                id: isEdit ? downloadEditId.value : `dl-${Date.now()}`,
                titulo: downloadTitulo.value.trim(),
                categoria: downloadCategoria.value,
                formato: downloadFormato.value.trim(),
                url_download: downloadUrl.value.trim() || '#',
                descricao: downloadDescricao.value.trim()
            };

            const url = localStorage.getItem('personality_sb_url');
            const key = localStorage.getItem('personality_sb_key');

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const endpoint = isEdit 
                        ? `${cleanUrl}/rest/v1/materiais_download?id=eq.${payload.id}`
                        : `${cleanUrl}/rest/v1/materiais_download`;

                    const method = isEdit ? 'PATCH' : 'POST';

                    await fetch(endpoint, {
                        method: method,
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(isEdit ? {
                            titulo: payload.titulo,
                            categoria: payload.categoria,
                            formato: payload.formato,
                            url_download: payload.url_download,
                            descricao: payload.descricao
                        } : payload)
                    });
                } catch (err) {
                    console.error(err);
                }
            }

            let localList = getLocalAdminDownloads();
            if (isEdit) {
                const idx = localList.findIndex(i => String(i.id) === String(payload.id));
                if (idx !== -1) localList[idx] = payload;
            } else {
                localList.unshift(payload);
            }

            localStorage.setItem('personality_local_downloads', JSON.stringify(localList));
            resetAdminDownloadForm();
            alert(isEdit ? 'Material atualizado com sucesso!' : 'Material cadastrado com sucesso!');
            loadAdminDownloadsManager();
        });
    }

    async function deleteAdminDownloadItem(id) {
        if (!confirm('Tem certeza que deseja excluir este material de download?')) return;

        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const endpoint = `${cleanUrl}/rest/v1/materiais_download?id=eq.${id}`;

                await fetch(endpoint, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
            } catch (err) {
                console.error(err);
            }
        }

        let localList = getLocalAdminDownloads();
        localList = localList.filter(i => String(i.id) !== String(id));
        localStorage.setItem('personality_local_downloads', JSON.stringify(localList));
        loadAdminDownloadsManager();
    }
});
