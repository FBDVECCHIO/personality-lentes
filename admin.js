// admin.js

document.addEventListener('DOMContentLoaded', () => {
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

    // Carrega configurações existentes do localStorage
    sbUrlInput.value = localStorage.getItem('personality_sb_url') || '';
    sbKeyInput.value = localStorage.getItem('personality_sb_key') || '';
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

    const defaultStores = [
        { id: "1", nome: "Ótica Prime & Cia", endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP", telefone: "(11) 3222-1234" },
        { id: "2", nome: "Atelier da Visão", endereco: "Al. Lorena, 452 - Jardins, São Paulo - SP", telefone: "(11) 3888-5678" }
    ];

    btnCancelEditStore.addEventListener('click', () => {
        addStoreForm.reset();
        btnSubmitStore.textContent = 'Cadastrar Ótica Parceira';
        btnCancelEditStore.style.display = 'none';
        editingStoreId = null;
    });

    async function getStoresList() {
        const url = localStorage.getItem('personality_sb_url');
        const key = localStorage.getItem('personality_sb_key');
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
                <td><strong>${escapeHtml(t.cliente_nome)}</strong></td>
                <td>${escapeHtml(t.cliente_whatsapp)}<br><small style="color: var(--text-muted);">${escapeHtml(t.cliente_email)}</small></td>
                <td>${escapeHtml(t.loja_nome)}</td>
                <td><strong>${escapeHtml(t.linha_produto)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(t.motivo)}</small></td>
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
            csvContent += "Protocolo;Cliente_Nome;Cliente_Email;Cliente_Whatsapp;Loja_Compra;Linha_Produto;Motivo;Data_Atendimento;Horario;Tecnico_Responsavel;Tecnico_Email;Tecnico_Whatsapp;Status;Data_Abertura\n";

            tickets.forEach(t => {
                const line = [
                    `"${t.protocolo || ''}"`,
                    `"${(t.cliente_nome || '').replace(/"/g, '""')}"`,
                    `"${(t.cliente_email || '').replace(/"/g, '""')}"`,
                    `"${t.cliente_whatsapp || ''}"`,
                    `"${(t.loja_nome || '').replace(/"/g, '""')}"`,
                    `"${(t.linha_produto || '').replace(/"/g, '""')}"`,
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
});
