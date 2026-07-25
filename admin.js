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
            } else if (sectionId === 'profissionais') {
                loadProfessionals();
            } else if (sectionId === 'premios-config') {
                loadRewardsConfig();
            } else if (sectionId === 'premios-autorizar') {
                loadPremiosAutorizarSection();
            } else if (sectionId === 'premios-relatorio') {
                loadPremiosManager();
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
    const sbProfsTableInput = document.getElementById('sbProfsTable');
    const sbVendedoresTableInput = document.getElementById('sbVendedoresTable');
    const sbPremiosTableInput = document.getElementById('sbPremiosTable');
    const sbPremiosConfigTableInput = document.getElementById('sbPremiosConfigTable');
    const sbOsAutorizadasTableInput = document.getElementById('sbOsAutorizadasTable');
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
    if (sbUrlInput) sbUrlInput.value = localStorage.getItem('personality_sb_url') || DEFAULT_SB_URL;
    if (sbKeyInput) sbKeyInput.value = localStorage.getItem('personality_sb_key') || DEFAULT_SB_KEY;
    if (sbTableInput) sbTableInput.value = localStorage.getItem('personality_sb_table') || 'leads_personality';
    if (sbStoresTableInput) sbStoresTableInput.value = localStorage.getItem('personality_sb_stores_table') || 'lojas_licenciadas';
    if (sbProfsTableInput) sbProfsTableInput.value = localStorage.getItem('personality_sb_profs_table') || 'profissionais_personality';
    if (sbVendedoresTableInput) sbVendedoresTableInput.value = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';
    if (sbPremiosTableInput) sbPremiosTableInput.value = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';
    if (sbPremiosConfigTableInput) sbPremiosConfigTableInput.value = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';
    if (sbOsAutorizadasTableInput) sbOsAutorizadasTableInput.value = localStorage.getItem('personality_sb_os_autorizadas_table') || 'os_autorizadas_personality';
    if (makeWebhookUrlInput) makeWebhookUrlInput.value = localStorage.getItem('personality_make_webhook') || '';

    // Testa a conexão ao carregar a página se houver dados salvos
    if (sbUrlInput && sbUrlInput.value && sbKeyInput && sbKeyInput.value) {
        testConnection(
            sbUrlInput.value, 
            sbKeyInput.value, 
            sbTableInput ? sbTableInput.value : 'leads_personality', 
            sbStoresTableInput ? sbStoresTableInput.value : 'lojas_licenciadas',
            sbProfsTableInput ? sbProfsTableInput.value : 'profissionais_personality',
            sbVendedoresTableInput ? sbVendedoresTableInput.value : 'vendedores_personality',
            sbPremiosTableInput ? sbPremiosTableInput.value : 'premios_lancados_personality',
            sbPremiosConfigTableInput ? sbPremiosConfigTableInput.value : 'premios_config_personality'
        );
    }

    if (configForm) {
        configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const url = sbUrlInput.value.trim();
            const key = sbKeyInput.value.trim();
            const table = sbTableInput.value.trim();
            const storesTable = sbStoresTableInput.value.trim();
            const profsTable = sbProfsTableInput.value.trim();
            const vendedoresTable = sbVendedoresTableInput.value.trim();
            const premiosTable = sbPremiosTableInput.value.trim();
            const configTable = sbPremiosConfigTableInput.value.trim();
            const osAuthTable = sbOsAutorizadasTableInput ? sbOsAutorizadasTableInput.value.trim() : 'os_autorizadas_personality';
            const makeWebhook = makeWebhookUrlInput.value.trim();

            // Salva no localStorage
            localStorage.setItem('personality_sb_url', url);
            localStorage.setItem('personality_sb_key', key);
            localStorage.setItem('personality_sb_table', table);
            localStorage.setItem('personality_sb_stores_table', storesTable);
            localStorage.setItem('personality_sb_profs_table', profsTable);
            localStorage.setItem('personality_sb_vendedores_table', vendedoresTable);
            localStorage.setItem('personality_sb_premios_table', premiosTable);
            localStorage.setItem('personality_sb_premios_config_table', configTable);
            localStorage.setItem('personality_sb_os_autorizadas_table', osAuthTable);
            localStorage.setItem('personality_make_webhook', makeWebhook);

            alert('Configurações salvas com sucesso! Testando conexão...');
            testConnection(url, key, table, storesTable, profsTable, vendedoresTable, premiosTable, configTable);
        });
    }

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
                email: targetEmail.trim(),
                to: targetEmail.trim(),
                recipient: targetEmail.trim(),
                name: "Teste Personality (E-mail)",
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
                    email: targetEmail.trim(),
                    to: targetEmail.trim(),
                    name: "Teste Personality (E-mail)",
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

    async function testConnection(url, key, table, storesTable, profsTable, vendedoresTable, premiosTable, configTable) {
        connStatus.className = 'status-box loading';
        connStatus.querySelector('.status-text').textContent = 'Testando conexão com o banco Supabase...';

        try {
            const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
            const endpointLeads = `${cleanUrl}/rest/v1/${table}?select=*&limit=1`;
            const endpointStores = `${cleanUrl}/rest/v1/${storesTable}?select=*&limit=1`;
            const endpointAccess = `${cleanUrl}/rest/v1/acessos_lojas?select=*&limit=1`;
            
            const activeProfsTable = profsTable || localStorage.getItem('personality_sb_profs_table') || 'profissionais_personality';
            const endpointProfs = `${cleanUrl}/rest/v1/${activeProfsTable}?select=*&limit=1`;

            const activeVendedoresTable = vendedoresTable || localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';
            const endpointVend = `${cleanUrl}/rest/v1/${activeVendedoresTable}?select=*&limit=1`;

            const activePremiosTable = premiosTable || localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';
            const endpointPrem = `${cleanUrl}/rest/v1/${activePremiosTable}?select=*&limit=1`;

            const activeConfigTable = configTable || localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';
            const endpointConf = `${cleanUrl}/rest/v1/${activeConfigTable}?select=*&limit=1`;

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
                console.warn("Tabela de Acessos não encontrada ou inválida.");
            }

            // Testa tabela de Profissionais
            const resProfs = await fetch(endpointProfs, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resProfs.ok) {
                console.warn(`Tabela de Profissionais (${activeProfsTable}) não encontrada ou inválida.`);
            }

            // Testa tabela de Vendedores
            const resVend = await fetch(endpointVend, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resVend.ok) {
                console.warn(`Tabela de Vendedores (${activeVendedoresTable}) não encontrada ou inválida.`);
            }

            // Testa tabela de Prêmios Lançados
            const resPrem = await fetch(endpointPrem, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resPrem.ok) {
                console.warn(`Tabela de Prêmios Lançados (${activePremiosTable}) não encontrada ou inválida.`);
            }

            // Testa tabela de Configuração de Prêmios
            const resConf = await fetch(endpointConf, {
                method: 'GET',
                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
            });

            if (!resConf.ok) {
                console.warn(`Tabela de Configuração de Prêmios (${activeConfigTable}) não encontrada ou inválida.`);
            }

            connStatus.className = 'status-box connected';
            connStatus.querySelector('.status-text').textContent = 'Conectado ao Supabase (Tabelas de Leads, Lojas, Profissionais, Vendedores e Prêmios configurados)! ✅';
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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
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

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
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

        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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

        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
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
    // Carregamento e Visualização de Profissionais & Vendedores (Unificado)
    // -------------------------------------------------------------
    const profTableBody = document.getElementById('profTableBody');
    const profCountSpan = document.getElementById('profCount');
    const btnExportProfs = document.getElementById('btnExportProfs');
    const btnClearProfs = document.getElementById('btnClearProfs');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    let currentFilterType = 'all'; // 'all', 'prof', 'vend'
    let loadedMembersList = [];

    // Switcher de Abas de Filtros de Tipos
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilterType = tab.getAttribute('data-type');
            renderUnifiedMembers();
        });
    });

    async function loadProfessionals() {
        if (!profTableBody) return;
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        
        const profsTable = localStorage.getItem('personality_sb_profs_table') || 'profissionais_personality';
        const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';

        let profs = [];
        let vends = [];

        profTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Buscando cadastros no banco de dados...</td></tr>`;

        // 1. Carrega Profissionais
        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${profsTable}?select=*&order=created_at.desc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    profs = await response.json();
                } else {
                    throw new Error('Falha ao obter profissionais.');
                }
            } catch (error) {
                console.error(error);
                profs = JSON.parse(localStorage.getItem('personality_professionals')) || [];
            }
        } else {
            profs = JSON.parse(localStorage.getItem('personality_professionals')) || [];
        }

        // 2. Carrega Vendedores
        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${vendTable}?select=*&order=created_at.desc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    vends = await response.json();
                } else {
                    throw new Error('Falha ao obter vendedores.');
                }
            } catch (error) {
                console.error(error);
                vends = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
            }
        } else {
            vends = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
        }

        // Combina com normalização
        loadedMembersList = [];
        profs.forEach(p => {
            loadedMembersList.push({
                id: p.id,
                tipo: 'prof',
                nome: p.nome,
                cpf_cnpj: p.cpf_cnpj || p.cpf,
                email: p.email,
                whatsapp: p.whatsapp,
                loja_clinica: p.clinica,
                info: p.newsletter ? 'Newsletter: Sim ✅' : 'Newsletter: Não ❌',
                aprovado: true,
                created_at: p.created_at || p.timestamp
            });
        });
        vends.forEach(v => {
            loadedMembersList.push({
                id: v.id,
                tipo: 'vend',
                nome: v.nome,
                cpf_cnpj: v.cpf,
                email: v.email,
                whatsapp: v.whatsapp,
                loja_clinica: v.loja,
                info: `Usuário: <code>${v.usuario}</code>`,
                aprovado: v.aprovado === true || v.aprovado === "true",
                created_at: v.created_at || v.timestamp
            });
        });

        // Ordena por data descendente
        loadedMembersList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        renderUnifiedMembers();
    }

    function renderUnifiedMembers() {
        if (!profTableBody) return;
        profTableBody.innerHTML = '';

        // Filtra pelo tipo ativo
        const filtered = loadedMembersList.filter(m => {
            if (currentFilterType === 'all') return true;
            return m.tipo === currentFilterType;
        });

        if (profCountSpan) profCountSpan.textContent = filtered.length;

        if (filtered.length === 0) {
            profTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px 0;">Nenhum cadastro encontrado para este filtro.</td></tr>`;
            return;
        }

        filtered.forEach(m => {
            const dateStr = m.created_at;
            let formattedDate = 'Data indisponível';
            if (dateStr) {
                try {
                    formattedDate = new Date(dateStr).toLocaleString('pt-BR');
                } catch(e) {}
            }

            const rawPhone = (m.whatsapp || '').replace(/\D/g, '');
            const waLink = rawPhone ? `<a href="https://wa.me/55${rawPhone}" target="_blank" class="wa-link">💬 ${escapeHtml(m.whatsapp)}</a>` : 'Não informado';
            
            const badgeTipo = m.tipo === 'prof' 
                ? `<span class="store-badge" style="margin-top:0; background: rgba(197, 168, 92, 0.1); color: var(--gold-light); border: 1px solid rgba(197, 168, 92, 0.3); font-weight:700;">🩺 Profissional</span>`
                : `<span class="store-badge" style="margin-top:0; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); font-weight:700;">🏆 Vendedor</span>`;

            let approvalBtn = '';
            let statusPill = m.info;

            if (m.tipo === 'vend') {
                if (m.aprovado) {
                    statusPill = `<span style="color:#10b981; font-weight:700; display:block; margin-bottom: 4px;">Aprovado ✅</span><small style="color:var(--text-muted);">${m.info}</small>`;
                } else {
                    statusPill = `<span style="color:#f59e0b; font-weight:700; display:block; margin-bottom: 4px;">Pendente ⏳</span><small style="color:var(--text-muted);">${m.info}</small>`;
                    approvalBtn = `<button class="btn btn-sm btn-success btn-approve-seller" data-id="${m.id}" style="margin-right: 5px; padding: 4px 8px; font-size:11px; font-weight:700; background:#10b981; border-color:#10b981; color:#000;">Aprovar ✅</button>`;
                }
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${badgeTipo}</td>
                <td><strong>${escapeHtml(m.nome)}</strong></td>
                <td><code>${escapeHtml(m.cpf_cnpj)}</code></td>
                <td>${escapeHtml(m.email)}</td>
                <td>${waLink}</td>
                <td>${escapeHtml(m.loja_clinica)}</td>
                <td>${statusPill}</td>
                <td>${escapeHtml(formattedDate)}</td>
                <td>
                    ${approvalBtn}
                    <button class="btn btn-sm btn-outline-gold btn-delete-member" data-id="${m.id}" data-type="${m.tipo}" style="border-color: rgba(255, 85, 85, 0.3); color: #fca5a5; padding: 4px 8px; font-size:11px;">🗑️ Apagar</button>
                </td>
            `;
            profTableBody.appendChild(tr);
        });

        // Adiciona listeners para exclusão individual
        profTableBody.querySelectorAll('.btn-delete-member').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const tipo = btn.getAttribute('data-type');
                
                if (confirm(`Deseja realmente excluir este cadastro? Esta ação é irreversível!`)) {
                    await deleteMemberRecord(id, tipo);
                }
            });
        });

        // Adiciona listeners para aprovação de vendedor
        profTableBody.querySelectorAll('.btn-approve-seller').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Deseja realmente aprovar este vendedor?')) {
                    await approveSellerRecord(id);
                }
            });
        });
    }

    async function approveSellerRecord(id) {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${vendTable}?id=eq.${id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ aprovado: true })
                });
                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(txt);
                }
                alert('Vendedor aprovado com sucesso!');
            } catch (err) {
                console.error(err);
                approveSellerLocally(id);
                alert('Vendedor aprovado localmente.');
            }
        } else {
            approveSellerLocally(id);
            alert('Vendedor aprovado localmente.');
        }

        loadProfessionals();
    }

    function approveSellerLocally(id) {
        const local = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
        const found = local.find(v => v.id === id);
        if (found) {
            found.aprovado = true;
            localStorage.setItem('personality_local_vendedores', JSON.stringify(local));
        }
    }

    async function deleteMemberRecord(id, tipo) {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

        const activeTable = tipo === 'prof'
            ? (localStorage.getItem('personality_sb_profs_table') || 'profissionais_personality')
            : (localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality');

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${activeTable}?id=eq.${id}`, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(txt || 'Erro ao deletar.');
                }
                alert('Cadastro apagado com sucesso!');
            } catch (err) {
                console.error(err);
                deleteMemberLocally(id, tipo);
                alert('Cadastro excluído localmente.');
            }
        } else {
            deleteMemberLocally(id, tipo);
            alert('Cadastro local excluído com sucesso.');
        }

        loadProfessionals();
    }

    function deleteMemberLocally(id, tipo) {
        if (tipo === 'prof') {
            const local = JSON.parse(localStorage.getItem('personality_professionals')) || [];
            const filtered = local.filter(p => p.id !== id);
            localStorage.setItem('personality_professionals', JSON.stringify(filtered));
        } else {
            const local = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
            const filtered = local.filter(v => v.id !== id);
            localStorage.setItem('personality_local_vendedores', JSON.stringify(filtered));
        }
    }

    // Limpar Banco de Membros
    if (btnClearProfs) {
        btnClearProfs.addEventListener('click', async () => {
            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            
            const profsTable = localStorage.getItem('personality_sb_profs_table') || 'profissionais_personality';
            const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';

            const confirmAction = confirm('ATENÇÃO: Deseja apagar permanentemente TODOS os cadastros (Profissionais E Vendedores) do banco de dados? Esta ação é irreversível!');
            if (!confirmAction) return;

            const typedPass = prompt('Por favor, digite a senha master para confirmar a limpeza geral do banco de cadastros:');
            const masterPass = localStorage.getItem('personality_master_password') || 'admin123';
            if (typedPass !== masterPass) {
                alert('Senha incorreta! Operação cancelada.');
                return;
            }

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    
                    // Limpa profissionais
                    await fetch(`${cleanUrl}/rest/v1/${profsTable}?id=not.is.null`, {
                        method: 'DELETE',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });
                    
                    // Limpa vendedores
                    await fetch(`${cleanUrl}/rest/v1/${vendTable}?id=not.is.null`, {
                        method: 'DELETE',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });

                    localStorage.removeItem('personality_professionals');
                    localStorage.removeItem('personality_local_vendedores');
                    
                    alert('Banco de dados limpo com sucesso!');
                } catch(e) {
                    console.error(e);
                    alert('Houve um problema durante a limpeza remota. Limpando dados locais.');
                }
            } else {
                localStorage.removeItem('personality_professionals');
                localStorage.removeItem('personality_local_vendedores');
                alert('Membros locais apagados com sucesso!');
            }

            loadProfessionals();
        });
    }

    // Exportar Planilha de Membros
    if (btnExportProfs) {
        btnExportProfs.addEventListener('click', () => {
            const filtered = loadedMembersList.filter(m => {
                if (currentFilterType === 'all') return true;
                return m.tipo === currentFilterType;
            });

            if (filtered.length === 0) {
                alert('Não há dados cadastrados neste filtro para exportar.');
                return;
            }

            let csvContent = "\uFEFF"; 
            csvContent += "Tipo;Nome;CPF_CNPJ;Email;Whatsapp;Loja_Clinica;Info_Adicional;Data_Cadastro\n";
            
            filtered.forEach(m => {
                const dateStr = m.created_at;
                let formattedDate = '';
                if (dateStr) {
                    try {
                        formattedDate = new Date(dateStr).toLocaleString('pt-BR');
                    } catch(e) {}
                }
                const infoText = m.info.replace(/<[^>]*>/g, ''); // Remove tags html do info

                const line = [
                    `"${m.tipo === 'prof' ? 'Profissional' : 'Vendedor'}"`,
                    `"${m.nome.replace(/"/g, '""')}"`,
                    `"${m.cpf_cnpj}"`,
                    `"${m.email.replace(/"/g, '""')}"`,
                    `"${m.whatsapp}"`,
                    `"${m.loja_clinica.replace(/"/g, '""')}"`,
                    `"${infoText.replace(/"/g, '""')}"`,
                    `"${formattedDate}"`
                ].join(';');
                csvContent += line + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", downloadUrl);
            link.setAttribute("download", `personality_credenciados_${currentFilterType}_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // -------------------------------------------------------------
    // 5.1 Configuração de Valores de Prêmios
    // -------------------------------------------------------------
    const rewardsConfigForm = document.getElementById('rewardsConfigForm');
    const rewardsLentesConfigBody = document.getElementById('rewardsLentesConfigBody');
    const rewardsArConfigBody = document.getElementById('rewardsArConfigBody');

    let adminPremiosConfig = [
        { categoria: 'lente', nome: 'Linha IA (Exclusivos)', pontos: 50, valor: 50 },
        { categoria: 'lente', nome: 'Linha Tradicional', pontos: 20, valor: 20 },
        { categoria: 'lente', nome: '1.61 Gold', pontos: 30, valor: 30 },
        { categoria: 'antirreflexo', nome: 'Anti-Reflexo Premium (Classic)', pontos: 10, valor: 10 },
        { categoria: 'antirreflexo', nome: 'Filtro Azul (Blue Control)', pontos: 15, valor: 15 },
        { categoria: 'antirreflexo', nome: 'Sem Tratamento Especial', pontos: 0, valor: 0 }
    ];

    let editingProductIndex = null;

    async function loadRewardsConfig() {
        if (!rewardsLentesConfigBody || !rewardsArConfigBody) return;

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
                        adminPremiosConfig = data;
                    }
                } else {
                    throw new Error('Erro ao buscar do Supabase');
                }
            } catch (error) {
                console.error('Erro ao carregar configuracoes de premios:', error);
                const localConfig = localStorage.getItem('personality_premios_config');
                if (localConfig) {
                    adminPremiosConfig = JSON.parse(localConfig);
                }
            }
        } else {
            const localConfig = localStorage.getItem('personality_premios_config');
            if (localConfig) {
                adminPremiosConfig = JSON.parse(localConfig);
            }
        }

        renderRewardsConfig();
    }

    function renderRewardsConfig() {
        if (!rewardsLentesConfigBody || !rewardsArConfigBody) return;

        rewardsLentesConfigBody.innerHTML = '';
        rewardsArConfigBody.innerHTML = '';

        adminPremiosConfig.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(item.nome)}</strong></td>
                <td>
                    <input type="number" class="config-points-input" data-index="${index}" value="${item.pontos}" min="0" required style="width: 80px; padding: 6px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color:#fff;"> Pts
                </td>
                <td>
                    R$ <input type="number" step="0.01" class="config-value-input" data-index="${index}" value="${item.valor}" min="0" required style="width: 100px; padding: 6px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color:#fff;">
                </td>
                <td>
                    <button type="button" class="btn btn-xs btn-outline-gold btn-edit-reward-config" data-index="${index}" style="margin-right: 5px; padding: 4px 8px; font-size:11px; background:none; border-color: rgba(197, 168, 92, 0.4); color: var(--gold-light);">✏️ Editar</button>
                    <button type="button" class="btn btn-xs btn-outline-gold btn-delete-reward-config" data-name="${escapeHtml(item.nome)}" style="border-color: rgba(255,85,85,0.3); color:#fca5a5; padding: 4px 8px; font-size:11px; background:none;">🗑️ Deletar</button>
                </td>
            `;
            if (item.categoria === 'lente') {
                rewardsLentesConfigBody.appendChild(tr);
            } else {
                rewardsArConfigBody.appendChild(tr);
            }
        });

        // Adiciona listeners para deleção
        const deleteConfigBtns = document.querySelectorAll('.btn-delete-reward-config');
        deleteConfigBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.getAttribute('data-name');
                deleteRewardConfigItem(name);
            });
        });

        // Adiciona listeners para edição
        const editConfigBtns = document.querySelectorAll('.btn-edit-reward-config');
        editConfigBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                startEditingRewardConfig(idx);
            });
        });
    }

    function startEditingRewardConfig(index) {
        editingProductIndex = index;
        const item = adminPremiosConfig[index];
        
        document.getElementById('newProdCategory').value = item.categoria;
        document.getElementById('newProdName').value = item.nome;
        document.getElementById('newProdPoints').value = item.pontos;
        document.getElementById('newProdValue').value = item.valor;

        const formCard = document.getElementById('addRewardProductForm').closest('.section-card');
        if (formCard) {
            const h2 = formCard.querySelector('h2');
            if (h2) h2.innerHTML = `✏️ Editar Família de Produto: <span class="gold-text">${escapeHtml(item.nome)}</span>`;
        }
        
        const submitBtn = document.getElementById('addRewardProductForm').querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Salvar Alterações 💾';
            submitBtn.style.background = 'var(--gold-light)';
            submitBtn.style.color = '#000';
        }
        
        // Scroll para o formulário
        document.getElementById('addRewardProductForm').scrollIntoView({ behavior: 'smooth' });
    }

    async function deleteRewardConfigItem(name) {
        if (!confirm(`Deseja realmente remover a família "${name}" da lista de prêmios?`)) return;

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const configTable = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const res = await fetch(`${cleanUrl}/rest/v1/${configTable}?nome=eq.${encodeURIComponent(name)}`, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (!res.ok) {
                    throw new Error('Falha ao excluir no Supabase.');
                }
            } catch (err) {
                console.error(err);
            }
        }
        
        adminPremiosConfig = adminPremiosConfig.filter(item => item.nome !== name);
        localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
        alert('Família removida com sucesso!');
        loadRewardsConfig();
    }

    // Carga em Massa de Catálogo Completo Personality (v3.60)
    const btnBulkImportCatalog = document.getElementById('btnBulkImportCatalog');
    if (btnBulkImportCatalog) {
        btnBulkImportCatalog.addEventListener('click', async () => {
            const confirmMsg = "Tem certeza que deseja importar em massa o catálogo completo de lentes e tratamentos da Personality?\n\nOs produtos serão cadastrados com 0 pontos e 0 prêmio em R$, e você poderá configurar o que pagará por produto clicando no botão Editar (✏️) na listagem abaixo.";
            if (!confirm(confirmMsg)) return;

            const catalog = [
                // Linha IA (Lentes de Inteligência Artificial)
                { categoria: 'lente', nome: 'Gold Design IA', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Premium HD IA', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Tecno Line IA', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Design Office IA', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Comfort IA', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Premium IA', pontos: 0, valor: 0 },

                // Linha Tradicional (Lentes Digitais/Tradicionais)
                { categoria: 'lente', nome: 'Gold Design Digital', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Premium HD Digital', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Tecno Line Digital', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Maxvision Digital', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Multi Premium', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Line', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Design Office', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Comfort', pontos: 0, valor: 0 },
                { categoria: 'lente', nome: 'Gold Premium', pontos: 0, valor: 0 },

                // Tratamentos (Antirreflexos)
                { categoria: 'antirreflexo', nome: 'Antirreflexo Classic', pontos: 0, valor: 0 },
                { categoria: 'antirreflexo', nome: 'Antirreflexo Premium (Super Clean)', pontos: 0, valor: 0 },
                { categoria: 'antirreflexo', nome: 'Filtro Azul (Blue Control)', pontos: 0, valor: 0 },
                { categoria: 'antirreflexo', nome: 'Fotossensível (Active Transitions)', pontos: 0, valor: 0 },
                { categoria: 'antirreflexo', nome: 'Sem Antirreflexo (Básico)', pontos: 0, valor: 0 }
            ];

            // Filtra os itens que já existem
            const newItems = [];
            catalog.forEach(item => {
                const exists = adminPremiosConfig.some(existing => existing.nome.toLowerCase() === item.nome.toLowerCase());
                if (!exists) {
                    newItems.push(item);
                }
            });

            if (newItems.length === 0) {
                alert("Todos os produtos do catálogo já estão cadastrados na lista!");
                return;
            }

            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const configTable = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';

            btnBulkImportCatalog.disabled = true;
            btnBulkImportCatalog.textContent = 'Importando... ⏳';

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const response = await fetch(`${cleanUrl}/rest/v1/${configTable}`, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(newItems)
                    });

                    if (response.ok) {
                        alert(`${newItems.length} novos itens do catálogo importados com sucesso!`);
                    } else {
                        throw new Error('Falha no upload para a base online.');
                    }
                } catch (error) {
                    console.error(error);
                    alert("Aviso: Conexão online indisponível. Salvando importação localmente.");
                }
            } else {
                alert(`${newItems.length} novos itens do catálogo importados localmente!`);
            }

            // Atualiza memória local e renderiza
            adminPremiosConfig.push(...newItems);
            localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
            
            btnBulkImportCatalog.disabled = false;
            btnBulkImportCatalog.textContent = '📦 Importar Catálogo Completo Personality';

            loadRewardsConfig();
        });
    }

    // Listener para o formulário de adicionar novo produto de prêmio
    const addRewardProductForm = document.getElementById('addRewardProductForm');
    if (addRewardProductForm) {
        addRewardProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const categoryVal = document.getElementById('newProdCategory').value;
            const nameVal = document.getElementById('newProdName').value.trim();
            const pointsVal = Number(document.getElementById('newProdPoints').value);
            const valueVal = Number(document.getElementById('newProdValue').value);

            if (!nameVal) return;

            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const configTable = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';

            if (editingProductIndex !== null) {
                // Modo Edição!
                const originalItem = adminPremiosConfig[editingProductIndex];
                
                // Evita duplicação se o nome mudou e já existe outro com esse novo nome
                if (originalItem.nome.toLowerCase() !== nameVal.toLowerCase()) {
                    const duplicate = adminPremiosConfig.find((item, idx) => idx !== editingProductIndex && item.nome.toLowerCase() === nameVal.toLowerCase());
                    if (duplicate) {
                        alert('Já existe outra família cadastrada com este nome!');
                        return;
                    }
                }

                const updatedProduct = {
                    ...originalItem,
                    categoria: categoryVal,
                    nome: nameVal,
                    pontos: pointsVal,
                    valor: valueVal
                };

                if (url && key) {
                    try {
                        const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                        
                        // Se o nome mudou, atualiza usando o id ou primeiro deleta e reinsere se não tiver id
                        if (originalItem.id) {
                            const res = await fetch(`${cleanUrl}/rest/v1/${configTable}?id=eq.${originalItem.id}`, {
                                method: 'PATCH',
                                headers: {
                                    'apikey': key,
                                    'Authorization': `Bearer ${key}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    categoria: categoryVal,
                                    nome: nameVal,
                                    pontos: pointsVal,
                                    valor: valueVal
                                })
                            });
                            if (!res.ok) throw new Error('Erro ao editar no Supabase.');
                        } else {
                            // Sem id: deleta pelo nome antigo e insere o novo
                            await fetch(`${cleanUrl}/rest/v1/${configTable}?nome=eq.${encodeURIComponent(originalItem.nome)}`, {
                                method: 'DELETE',
                                headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                            });
                            
                            await fetch(`${cleanUrl}/rest/v1/${configTable}`, {
                                method: 'POST',
                                headers: {
                                    'apikey': key,
                                    'Authorization': `Bearer ${key}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    categoria: categoryVal,
                                    nome: nameVal,
                                    pontos: pointsVal,
                                    valor: valueVal
                                })
                            });
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

                adminPremiosConfig[editingProductIndex] = updatedProduct;
                localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
                
                alert('Família de produto editada com sucesso!');
                
                // Reseta modo edição
                editingProductIndex = null;
                const formCard = addRewardProductForm.closest('.section-card');
                if (formCard) {
                    const h2 = formCard.querySelector('h2');
                    if (h2) h2.innerHTML = '➕ Adicionar Nova Família de Produto para Prêmios';
                }
                const submitBtn = addRewardProductForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = 'Adicionar Família ➕';
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                }

            } else {
                // Modo Adição!
                const duplicate = adminPremiosConfig.find(item => item.nome.toLowerCase() === nameVal.toLowerCase());
                if (duplicate) {
                    alert('Já existe uma família cadastrada com este nome!');
                    return;
                }

                const newProduct = {
                    categoria: categoryVal,
                    nome: nameVal,
                    pontos: pointsVal,
                    valor: valueVal
                };

                if (url && key) {
                    try {
                        const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                        const res = await fetch(`${cleanUrl}/rest/v1/${configTable}`, {
                            method: 'POST',
                            headers: {
                                'apikey': key,
                                'Authorization': `Bearer ${key}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify(newProduct)
                        });
                        if (!res.ok) {
                            throw new Error('Erro ao salvar no Supabase.');
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

                adminPremiosConfig.push(newProduct);
                localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
                
                alert('Nova família de produto adicionada com sucesso!');
            }

            addRewardProductForm.reset();
            loadRewardsConfig();
        });
    }

    if (rewardsConfigForm) {
        rewardsConfigForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Atualiza o array local
            const pointsInputs = rewardsConfigForm.querySelectorAll('.config-points-input');
            const valueInputs = rewardsConfigForm.querySelectorAll('.config-value-input');

            pointsInputs.forEach(input => {
                const idx = parseInt(input.getAttribute('data-index'));
                adminPremiosConfig[idx].pontos = Number(input.value);
            });

            valueInputs.forEach(input => {
                const idx = parseInt(input.getAttribute('data-index'));
                adminPremiosConfig[idx].valor = Number(input.value);
            });

            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const configTable = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    
                    // Executa o upsert/insert para cada linha
                    for (const item of adminPremiosConfig) {
                        const bodyData = {
                            categoria: item.categoria,
                            nome: item.nome,
                            pontos: item.pontos,
                            valor: item.valor
                        };
                        
                        // Primeiro tenta dar select pelo nome para ver se atualiza ou insere
                        const checkRes = await fetch(`${cleanUrl}/rest/v1/${configTable}?nome=eq.${encodeURIComponent(item.nome)}`, {
                            method: 'GET',
                            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                        });
                        
                        let method = 'POST';
                        let endpoint = `${cleanUrl}/rest/v1/${configTable}`;
                        
                        if (checkRes.ok) {
                            const exist = await checkRes.json();
                            if (exist && exist.length > 0) {
                                method = 'PATCH';
                                endpoint = `${cleanUrl}/rest/v1/${configTable}?nome=eq.${encodeURIComponent(item.nome)}`;
                            }
                        }
                        
                        await fetch(endpoint, {
                            method: method,
                            headers: {
                                'apikey': key,
                                'Authorization': `Bearer ${key}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify(bodyData)
                        });
                    }

                    localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
                    alert('Valores de prêmios salvos com sucesso no Supabase!');
                } catch (err) {
                    console.error(err);
                    localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
                    alert('Houve erro no Supabase. Configuração salva localmente.');
                }
            } else {
                localStorage.setItem('personality_premios_config', JSON.stringify(adminPremiosConfig));
                alert('Valores de prêmios locais salvos com sucesso!');
            }

            loadRewardsConfig();
        });
    }

    // -------------------------------------------------------------
    // 5.2 Relatório Gerencial e Conciliação de Prêmios (O.S.)
    // -------------------------------------------------------------
    const adminPremiosTableBody = document.getElementById('adminPremiosTableBody');
    const adminConsolidadoTableBody = document.getElementById('adminConsolidadoTableBody');
    const btnExportPremios = document.getElementById('btnExportPremios');
    
    // Filtros
    const filterPremVendedor = document.getElementById('filterPremVendedor');
    const filterPremLoja = document.getElementById('filterPremLoja');
    const filterPremStatus = document.getElementById('filterPremStatus');

    let allSubmittedSales = [];

    // Listeners de Filtros
    [filterPremVendedor, filterPremLoja, filterPremStatus].forEach(el => {
        if (el) el.addEventListener('input', () => renderPremiosManager());
        if (el && el.tagName === 'SELECT') el.addEventListener('change', () => renderPremiosManager());
    });

    // Listeners do Dashboard (v3.60)
    const btnApplyDashFilter = document.getElementById('btnApplyDashFilter');
    const btnClearDashFilter = document.getElementById('btnClearDashFilter');
    if (btnApplyDashFilter) {
        btnApplyDashFilter.addEventListener('click', () => renderDashboardPremios());
    }
    if (btnClearDashFilter) {
        btnClearDashFilter.addEventListener('click', () => {
            const startInput = document.getElementById('dashDateStart');
            const endInput = document.getElementById('dashDateEnd');
            if (startInput) startInput.value = '';
            if (endInput) endInput.value = '';
            renderDashboardPremios();
        });
    }

    async function loadPremiosManager() {
        if (!adminPremiosTableBody) return;

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';

        if (url && key) {
            adminPremiosTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Buscando lançamentos...</td></tr>`;
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${table}?select=*&order=created_at.desc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (response.ok) {
                    allSubmittedSales = await response.json();
                } else {
                    throw new Error('Falha ao buscar.');
                }
            } catch (error) {
                console.error(error);
                allSubmittedSales = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
            }
        } else {
            allSubmittedSales = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
        }

        renderPremiosManager();
        renderDashboardPremios();
    }

    function renderDashboardPremios() {
        if (!allSubmittedSales) return;

        const startInput = document.getElementById('dashDateStart');
        const endInput = document.getElementById('dashDateEnd');
        const startVal = startInput ? startInput.value : '';
        const endVal = endInput ? endInput.value : '';

        // Filtra vendas pela data (YYYY-MM-DD)
        const filtered = allSubmittedSales.filter(sale => {
            if (!sale.data_venda) return true;
            const saleDate = sale.data_venda.substring(0, 10);
            if (startVal && saleDate < startVal) return false;
            if (endVal && saleDate > endVal) return false;
            return true;
        });

        // 1. Métricas Rápidas
        const totalSales = filtered.length;
        let totalPoints = 0;
        const storesSet = new Set();

        filtered.forEach(sale => {
            totalPoints += (Number(sale.pontos_lente) || 0) + (Number(sale.pontos_ar) || 0);
            if (sale.loja) storesSet.add(sale.loja.trim());
        });

        const avgPoints = totalSales > 0 ? Math.round(totalPoints / totalSales) : 0;

        const elTotalSales = document.getElementById('dashTotalSales');
        const elTotalPoints = document.getElementById('dashTotalPoints');
        const elAvgPoints = document.getElementById('dashAveragePoints');
        const elActiveStores = document.getElementById('dashActiveStores');

        if (elTotalSales) elTotalSales.textContent = totalSales;
        if (elTotalPoints) elTotalPoints.textContent = `${totalPoints} Pts`;
        if (elAvgPoints) elAvgPoints.textContent = avgPoints;
        if (elActiveStores) elActiveStores.textContent = storesSet.size;

        // 2. Agrupamentos para Rankings
        const sellersMap = {};
        const storesMap = {};
        const lensesMap = {};
        const arsMap = {};

        filtered.forEach(sale => {
            // Vendedores (por pontos)
            const pts = (Number(sale.pontos_lente) || 0) + (Number(sale.pontos_ar) || 0);
            const seller = sale.vendedor_nome || 'Desconhecido';
            if (!sellersMap[seller]) sellersMap[seller] = 0;
            sellersMap[seller] += pts;

            // Lojas (por pontos)
            const store = sale.loja || 'Sem Loja';
            if (!storesMap[store]) storesMap[store] = 0;
            storesMap[store] += pts;

            // Lentes (por quantidade)
            if (sale.lente_familia) {
                const lens = sale.lente_familia;
                if (!lensesMap[lens]) lensesMap[lens] = 0;
                lensesMap[lens]++;
            }

            // Antirreflexos (por quantidade)
            if (sale.ar_familia) {
                const ar = sale.ar_familia;
                if (!arsMap[ar]) arsMap[ar] = 0;
                arsMap[ar]++;
            }
        });

        // Converte em arrays e ordena
        const sellersList = Object.keys(sellersMap).map(k => ({ name: k, val: sellersMap[k] })).sort((a,b) => b.val - a.val);
        const storesList = Object.keys(storesMap).map(k => ({ name: k, val: storesMap[k] })).sort((a,b) => b.val - a.val);
        const lensesList = Object.keys(lensesMap).map(k => ({ name: k, val: lensesMap[k] })).sort((a,b) => b.val - a.val);
        const arsList = Object.keys(arsMap).map(k => ({ name: k, val: arsMap[k] })).sort((a,b) => b.val - a.val);

        // Renderiza
        renderRankingList('dashRankingSellers', sellersList, 'points');
        renderRankingList('dashRankingStores', storesList, 'points');
        renderRankingList('dashRankingLenses', lensesList, 'sales');
        renderRankingList('dashRankingArs', arsList, 'sales');
    }

    function renderRankingList(containerId, list, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = '<div style="padding: 15px 0; text-align: center; color: var(--text-muted); font-size: 11px;">Nenhum lançamento no período</div>';
            return;
        }

        const maxVal = list[0].val;
        container.innerHTML = '';

        list.slice(0, 5).forEach((item, index) => {
            const pct = maxVal > 0 ? (item.val / maxVal) * 100 : 0;
            const textSuffix = type === 'points' ? 'Pts' : (item.val === 1 ? 'venda' : 'vendas');
            const itemHtml = `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #fff;">
                        <span style="font-weight: 500;">#${index + 1} ${escapeHtml(item.name)}</span>
                        <strong style="color: var(--gold-light);">${item.val} ${textSuffix}</strong>
                    </div>
                    <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.03); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #cfad52, #e5c060); border-radius: 3px;"></div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHtml);
        });
    }

    function renderPremiosManager() {
        if (!adminPremiosTableBody || !adminConsolidadoTableBody) return;

        adminPremiosTableBody.innerHTML = '';
        adminConsolidadoTableBody.innerHTML = '';

        // Filtra dados com base nos inputs
        const vendedorVal = filterPremVendedor ? filterPremVendedor.value.trim().toLowerCase() : '';
        const lojaVal = filterPremLoja ? filterPremLoja.value.trim().toLowerCase() : '';
        const statusVal = filterPremStatus ? filterPremStatus.value : '';

        const filteredSales = allSubmittedSales.filter(sale => {
            const vendMatch = !vendedorVal || (sale.vendedor_nome || '').toLowerCase().includes(vendedorVal);
            const lojaMatch = !lojaVal || (sale.loja || '').toLowerCase().includes(lojaVal);
            const statusMatch = !statusVal || sale.status === statusVal;
            return vendMatch && lojaMatch && statusMatch;
        });

        // 1. Calcula Resumos Gerais baseando-se em TODOS os lançamentos (não filtrados)
        let valPendente = 0, countPendente = 0;
        let valSaldoAPagar = 0, countSaldoAPagar = 0;
        let valTotalPago = 0, countTotalPago = 0;

        allSubmittedSales.forEach(sale => {
            const totalVal = Number(sale.valor_lente) + Number(sale.valor_ar);
            if (sale.status === 'Pendente') {
                valPendente += totalVal;
                countPendente++;
            } else if (sale.status === 'Validado') {
                valSaldoAPagar += totalVal;
                countSaldoAPagar++;
            } else if (sale.status === 'Pago') {
                valTotalPago += totalVal;
                countTotalPago++;
            }
        });

        document.getElementById('adminPendenteVal').textContent = `R$ ${valPendente.toFixed(2)}`;
        document.getElementById('adminPendenteValOS').textContent = `${countPendente} O.S. Pendentes`;

        document.getElementById('adminSaldoPagar').textContent = `R$ ${valSaldoAPagar.toFixed(2)}`;
        document.getElementById('adminSaldoPagarOS').textContent = `${countSaldoAPagar} O.S. Validadas`;

        document.getElementById('adminTotalPago').textContent = `R$ ${valTotalPago.toFixed(2)}`;
        document.getElementById('adminTotalPagoOS').textContent = `${countTotalPago} O.S. Pagas`;

        // 2. Renderiza Tabela Detalhada
        if (filteredSales.length === 0) {
            adminPremiosTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhum lançamento corresponde aos filtros ativos.</td></tr>`;
        } else {
            filteredSales.forEach(sale => {
                const totalVal = Number(sale.valor_lente) + Number(sale.valor_ar);
                const totalPts = Number(sale.pontos_lente) + Number(sale.pontos_ar);

                let statusText = '';
                let actionBtn = '';

                if (sale.status === 'Pendente') {
                    statusText = `<span class="status-vendedor-pendente">Pendente</span>`;
                    actionBtn = `<button class="btn btn-success btn-xs btn-os-validate" data-id="${sale.id}" style="padding: 4px 8px; font-size:11px; margin-right: 5px;">Validar O.S. ✅</button>`;
                } else if (sale.status === 'Validado') {
                    statusText = `<span class="status-vendedor-validado">A Pagar</span>`;
                    actionBtn = `<button class="btn btn-primary btn-xs btn-os-pay" data-id="${sale.id}" style="padding: 4px 8px; font-size:11px; margin-right: 5px; background: var(--gold-light); color:#000;">Marcar Pago 💵</button>`;
                } else {
                    statusText = `<span class="status-vendedor-pago">Pago</span>`;
                }

                // Botão de deletar lançamento
                actionBtn += `<button class="btn btn-outline-gold btn-xs btn-os-delete" data-id="${sale.id}" style="border-color: rgba(255, 85, 85, 0.3); color: #fca5a5; padding: 4px 8px; font-size:11px;">🗑️ Excluir</button>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${escapeHtml(sale.vendedor_nome)}</strong></td>
                    <td>${escapeHtml(sale.loja)}</td>
                    <td><code>${escapeHtml(sale.os)}</code></td>
                    <td>${escapeHtml(sale.cliente_nome)}</td>
                    <td>${escapeHtml(sale.lente_familia)}</td>
                    <td>${escapeHtml(sale.ar_familia)}</td>
                    <td><strong>R$ ${totalVal.toFixed(2)}</strong> <br><small style="color:var(--text-muted);">${totalPts} Pts</small></td>
                    <td>${statusText}</td>
                    <td>${actionBtn}</td>
                `;
                adminPremiosTableBody.appendChild(tr);
            });
        }

        // 3. Renderiza Tabela de Payout Consolidados por Vendedor
        // Agrupa todas as O.S. com status 'Validado' (A pagar)
        const validadosPorVendedor = {};
        
        allSubmittedSales.forEach(sale => {
            if (sale.status === 'Validado') {
                const vId = sale.vendedor_id;
                if (!validadosPorVendedor[vId]) {
                    validadosPorVendedor[vId] = {
                        vendedor_nome: sale.vendedor_nome,
                        loja: sale.loja,
                        total_apagar: 0,
                        vendedor_id: vId
                    };
                }
                validadosPorVendedor[vId].total_apagar += (Number(sale.valor_lente) + Number(sale.valor_ar));
            }
        });

        // Agrupa todas as O.S. com status 'Pago' (Já Pago)
        const pagosPorVendedor = {};
        
        allSubmittedSales.forEach(sale => {
            if (sale.status === 'Pago') {
                const vId = sale.vendedor_id;
                if (!pagosPorVendedor[vId]) {
                    pagosPorVendedor[vId] = {
                        vendedor_nome: sale.vendedor_nome,
                        loja: sale.loja,
                        total_pago: 0,
                        vendedor_id: vId
                    };
                }
                pagosPorVendedor[vId].total_pago += (Number(sale.valor_lente) + Number(sale.valor_ar));
            }
        });

        // Para pegar o WhatsApp e o CPF do vendedor, vamos mapear com a lista de vendedores locais/remotos
        const sellersList = loadedMembersList.filter(m => m.tipo === 'vend');
        const consolidadoRows = Object.values(validadosPorVendedor);
        const consolidadoPagosRows = Object.values(pagosPorVendedor);

        if (consolidadoRows.length === 0) {
            adminConsolidadoTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhum vendedor possui saldo pendente de pagamento no momento.</td></tr>`;
        } else {
            consolidadoRows.forEach(row => {
                const sellerInfo = sellersList.find(s => s.id === row.vendedor_id) || {};
                
                const rawPhone = (sellerInfo.whatsapp || '').replace(/\D/g, '');
                const waLink = rawPhone ? `<a href="https://wa.me/55${rawPhone}" target="_blank" class="wa-link">💬 ${escapeHtml(sellerInfo.whatsapp)}</a>` : 'Não informado';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${escapeHtml(row.vendedor_nome)}</strong></td>
                    <td><code>${escapeHtml(sellerInfo.cpf_cnpj || 'n/d')}</code></td>
                    <td>${escapeHtml(row.loja)}</td>
                    <td>${waLink}</td>
                    <td><strong style="color: #10b981; font-size:16px;">R$ ${row.total_apagar.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn btn-success btn-sm btn-bulk-payout" data-vendedor-id="${row.vendedor_id}" data-name="${escapeHtml(row.vendedor_nome)}" style="font-weight:700;">Pagar Todos desse Vendedor 💰</button>
                    </td>
                `;
                adminConsolidadoTableBody.appendChild(tr);
            });
        }

        const adminConsolidadoPagosTableBody = document.getElementById('adminConsolidadoPagosTableBody');
        if (adminConsolidadoPagosTableBody) {
            adminConsolidadoPagosTableBody.innerHTML = '';
            if (consolidadoPagosRows.length === 0) {
                adminConsolidadoPagosTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px 0;">Nenhum pagamento realizado ainda.</td></tr>`;
            } else {
                consolidadoPagosRows.forEach(row => {
                    const sellerInfo = sellersList.find(s => s.id === row.vendedor_id) || {};
                    
                    const rawPhone = (sellerInfo.whatsapp || '').replace(/\D/g, '');
                    const waLink = rawPhone ? `<a href="https://wa.me/55${rawPhone}" target="_blank" class="wa-link">💬 ${escapeHtml(sellerInfo.whatsapp)}</a>` : 'Não informado';

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${escapeHtml(row.vendedor_nome)}</strong></td>
                        <td><code>${escapeHtml(sellerInfo.cpf_cnpj || 'n/d')}</code></td>
                        <td>${escapeHtml(row.loja)}</td>
                        <td>${waLink}</td>
                        <td><strong style="color: #60a5fa; font-size:16px;">R$ ${row.total_pago.toFixed(2)}</strong></td>
                        <td><span class="status-vendedor-pago">Pago e Conciliado ✅</span></td>
                    `;
                    adminConsolidadoPagosTableBody.appendChild(tr);
                });
            }
        }

        // Configura os Listeners dos botões de ação do relatório
        configureRelatorioActions();
    }

    function configureRelatorioActions() {
        // Validar O.S.
        const osValidateBtns = adminPremiosTableBody.querySelectorAll('.btn-os-validate');
        if (osValidateBtns) {
            osValidateBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    await updateSaleStatus(id, 'Validado');
                });
            });
        }

        // Pagar O.S. Individual
        const osPayBtns = adminPremiosTableBody.querySelectorAll('.btn-os-pay');
        if (osPayBtns) {
            osPayBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    await updateSaleStatus(id, 'Pago');
                });
            });
        }

        // Excluir O.S.
        const osDeleteBtns = adminPremiosTableBody.querySelectorAll('.btn-os-delete');
        if (osDeleteBtns) {
            osDeleteBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (confirm('Deseja realmente deletar este lançamento de venda do sistema?')) {
                        await deleteSaleRecord(id);
                    }
                });
            });
        }

        // Pagar em Lote por Vendedor
        const bulkPayoutBtns = adminConsolidadoTableBody.querySelectorAll('.btn-bulk-payout');
        if (bulkPayoutBtns) {
            bulkPayoutBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const vendedorId = btn.getAttribute('data-vendedor-id');
                    const vendedorName = btn.getAttribute('data-name');
                    if (confirm(`Confirmar o pagamento geral de prêmios em lote para o vendedor "${vendedorName}"? Todas as O.S. validadas dele serão marcadas como Pagas.`)) {
                        await payBulkSalesForSeller(vendedorId);
                    }
                });
            });
        }
    }

    async function updateSaleStatus(saleId, newStatus) {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${table}?id=eq.${saleId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(txt);
                }
            } catch (err) {
                console.error(err);
                updateLocalSaleStatus(saleId, newStatus);
            }
        } else {
            updateLocalSaleStatus(saleId, newStatus);
        }

        loadPremiosManager();
    }

    function updateLocalSaleStatus(saleId, newStatus) {
        const local = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
        const found = local.find(s => s.id === saleId);
        if (found) {
            found.status = newStatus;
            localStorage.setItem('personality_local_premios', JSON.stringify(local));
        }
    }

    async function deleteSaleRecord(saleId) {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const response = await fetch(`${cleanUrl}/rest/v1/${table}?id=eq.${saleId}`, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (!response.ok) {
                    throw new Error('Erro ao deletar.');
                }
            } catch (err) {
                console.error(err);
                deleteLocalSale(saleId);
            }
        } else {
            deleteLocalSale(saleId);
        }

        loadPremiosManager();
    }

    function deleteLocalSale(saleId) {
        const local = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
        const filtered = local.filter(s => s.id !== saleId);
        localStorage.setItem('personality_local_premios', JSON.stringify(filtered));
    }

    async function payBulkSalesForSeller(vendedorId) {
        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const table = localStorage.getItem('personality_sb_premios_table') || 'premios_lancados_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                // Filtra as validadas desse vendedor
                const response = await fetch(`${cleanUrl}/rest/v1/${table}?vendedor_id=eq.${vendedorId}&status=eq.Validado`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': key,
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'Pago' })
                });
                if (!response.ok) {
                    throw new Error('Falha no update em lote.');
                }
                alert('Pagamento geral em lote concluído com sucesso!');
            } catch (err) {
                console.error(err);
                payLocalBulkSales(vendedorId);
                alert('Pagamento geral concluído localmente.');
            }
        } else {
            payLocalBulkSales(vendedorId);
            alert('Pagamento geral concluído localmente.');
        }

        loadPremiosManager();
    }

    function payLocalBulkSales(vendedorId) {
        const local = JSON.parse(localStorage.getItem('personality_local_premios')) || [];
        local.forEach(s => {
            if (s.vendedor_id === vendedorId && s.status === 'Validado') {
                s.status = 'Pago';
            }
        });
        localStorage.setItem('personality_local_premios', JSON.stringify(local));
    }

    // Exportar CSV de Lançamentos de Prêmios
    if (btnExportPremios) {
        btnExportPremios.addEventListener('click', () => {
            if (allSubmittedSales.length === 0) {
                alert('Não há dados de lançamentos para exportar.');
                return;
            }

            let csvContent = "\uFEFF"; 
            csvContent += "Vendedor;Loja;OS;Cliente;Lente;Antirreflexo;Pontos_Total;Premio_Total_R$;Status;Data_Cadastro\n";
            
            allSubmittedSales.forEach(s => {
                const totPts = Number(s.pontos_lente) + Number(s.pontos_ar);
                const totVal = Number(s.valor_lente) + Number(s.valor_ar);
                
                let formattedDate = '';
                if (s.created_at) {
                    try {
                        formattedDate = new Date(s.created_at).toLocaleString('pt-BR');
                    } catch(e) {}
                }

                const line = [
                    `"${s.vendedor_nome.replace(/"/g, '""')}"`,
                    `"${s.loja.replace(/"/g, '""')}"`,
                    `"${s.os}"`,
                    `"${s.cliente_nome.replace(/"/g, '""')}"`,
                    `"${s.lente_familia}"`,
                    `"${s.ar_familia}"`,
                    `"${totPts}"`,
                    `"${totVal.toFixed(2)}"`,
                    `"${s.status}"`,
                    `"${formattedDate}"`
                ].join(';');
                csvContent += line + "\n";
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", downloadUrl);
            link.setAttribute("download", `personality_relatorio_premios_${new Date().toISOString().slice(0,10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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

            const url = getSupabaseUrl();
            const key = getSupabaseKey();

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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
        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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

            const url = getSupabaseUrl();
            const key = getSupabaseKey();

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

        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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

            const url = getSupabaseUrl();
            const key = getSupabaseKey();

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

        const url = getSupabaseUrl();
        const key = getSupabaseKey();

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

    // -------------------------------------------------------------
    // 12. Pré-lançamento de O.S. Autorizadas (Laboratório)
    // -------------------------------------------------------------
    const authOsForm = document.getElementById('authOsForm');
    const authOsNumber = document.getElementById('authOsNumber');
    const authOsSellerCpf = document.getElementById('authOsSellerCpf');
    const authOsClientName = document.getElementById('authOsClientName');
    const authOsLens = document.getElementById('authOsLens');
    const authOsAr = document.getElementById('authOsAr');
    const authOsTableBody = document.getElementById('authOsTableBody');

    async function loadPremiosAutorizarSection() {
        if (!authOsTableBody) return;
        authOsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Buscando O.S. liberadas...</td></tr>`;

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        
        const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';
        const configTable = localStorage.getItem('personality_sb_premios_config_table') || 'premios_config_personality';
        const osAuthTable = localStorage.getItem('personality_sb_os_autorizadas_table') || 'os_autorizadas_personality';

        let approvedVendedores = [];
        let rewardsConfig = [];
        let authorizedList = [];

        // 1. Carrega Vendedores Aprovados para o Select
        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const res = await fetch(`${cleanUrl}/rest/v1/${vendTable}?select=*`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    approvedVendedores = data.filter(v => v.aprovado === true || v.aprovado === 'true');
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (approvedVendedores.length === 0) {
            const local = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
            approvedVendedores = local.filter(v => v.aprovado === true || v.aprovado === 'true');
        }

        // Popula Select de Vendedores
        if (authOsSellerCpf) {
            authOsSellerCpf.innerHTML = '<option value="">Selecione o vendedor...</option>';
            approvedVendedores.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.cpf;
                opt.textContent = `${v.nome} (CPF: ${v.cpf}) - ${v.loja}`;
                authOsSellerCpf.appendChild(opt);
            });
        }

        // 2. Carrega Famílias de Lentes e Antirreflexo para os Selects
        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const res = await fetch(`${cleanUrl}/rest/v1/${configTable}?select=*`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (res.ok) {
                    rewardsConfig = await res.json();
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (rewardsConfig.length === 0) {
            rewardsConfig = adminPremiosConfig;
        }

        if (authOsLens && authOsAr) {
            authOsLens.innerHTML = '<option value="">Selecione a lente...</option>';
            authOsAr.innerHTML = '<option value="">Selecione o antirreflexo...</option>';

            rewardsConfig.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.nome;
                opt.textContent = `${item.nome} (${item.pontos} Pts)`;
                if (item.categoria === 'lente') {
                    authOsLens.appendChild(opt);
                } else {
                    authOsAr.appendChild(opt);
                }
            });
        }

        // 3. Carrega O.S. Autorizadas cadastradas
        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                const res = await fetch(`${cleanUrl}/rest/v1/${osAuthTable}?select=*&order=created_at.desc`, {
                    method: 'GET',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
                if (res.ok) {
                    authorizedList = await res.json();
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (authorizedList.length === 0) {
            authorizedList = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
        }

        // Renderiza Tabela de O.S. Autorizadas
        renderAuthOsTable(authorizedList, approvedVendedores);
    }

    function renderAuthOsTable(items, sellersList) {
        if (!authOsTableBody) return;
        authOsTableBody.innerHTML = '';

        if (items.length === 0) {
            authOsTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nenhuma O.S. autorizada no momento.</td></tr>`;
            return;
        }

        items.forEach(item => {
            // Acha o nome do vendedor correspondente ao CPF
            const vend = sellersList.find(v => v.cpf === item.cpf_vendedor) || { nome: 'Desconhecido', loja: item.loja || 'N/A' };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(item.os)}</strong></td>
                <td>${escapeHtml(vend.nome)}</td>
                <td>${escapeHtml(item.cpf_vendedor)}</td>
                <td>${escapeHtml(item.loja || vend.loja)}</td>
                <td>${escapeHtml(item.cliente_nome)}</td>
                <td><span class="gold-text">${escapeHtml(item.lente_familia)}</span></td>
                <td><span style="color: #93c5fd;">${escapeHtml(item.ar_familia)}</span></td>
                <td>
                    ${item.utilizada ? '<span class="badge badge-success" style="background:#10b981; color:#fff; padding: 2px 6px; border-radius: 4px; font-size:11px;">Resgatada ✅</span>' : '<span class="badge badge-warning" style="background:#f59e0b; color:#000; padding: 2px 6px; border-radius: 4px; font-size:11px;">Pendente ⏳</span>'}
                </td>
                <td>
                    <button class="btn btn-xs btn-danger btn-delete-auth-os" data-os="${escapeHtml(item.os)}" style="padding: 4px 8px; font-size:11px; border-color: rgba(255,85,85,0.3); color:#fca5a5; background:none;">Cancel 🗑️</button>
                </td>
            `;

            const btnDel = tr.querySelector('.btn-delete-auth-os');
            if (btnDel) {
                btnDel.addEventListener('click', () => {
                    deleteAuthOs(item.os);
                });
            }

            authOsTableBody.appendChild(tr);
        });
    }

    async function deleteAuthOs(osNumber) {
        if (!confirm(`Deseja realmente cancelar a liberação da O.S. "${osNumber}"?`)) return;

        const url = getSupabaseUrl();
        const key = getSupabaseKey();
        const osAuthTable = localStorage.getItem('personality_sb_os_autorizadas_table') || 'os_autorizadas_personality';

        if (url && key) {
            try {
                const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                await fetch(`${cleanUrl}/rest/v1/${osAuthTable}?os=eq.${encodeURIComponent(osNumber)}`, {
                    method: 'DELETE',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                });
            } catch (err) {
                console.error(err);
            }
        }

        let local = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
        local = local.filter(item => item.os !== osNumber);
        localStorage.setItem('personality_local_os_autorizadas', JSON.stringify(local));

        alert('Liberação cancelada!');
        loadPremiosAutorizarSection();
    }

    // Submit do formulário de liberação de O.S.
    if (authOsForm) {
        authOsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const osVal = authOsNumber.value.trim();
            const cpfVal = authOsSellerCpf.value;
            const clientVal = authOsClientName.value.trim();
            const lensVal = authOsLens.value;
            const arVal = authOsAr.value;

            if (!osVal || !cpfVal || !clientVal || !lensVal || !arVal) {
                alert('Preencha todos os campos!');
                return;
            }

            // Busca a loja do vendedor correspondente ao CPF
            let storeVal = 'Desconhecida';
            const url = getSupabaseUrl();
            const key = getSupabaseKey();
            const vendTable = localStorage.getItem('personality_sb_vendedores_table') || 'vendedores_personality';
            const osAuthTable = localStorage.getItem('personality_sb_os_autorizadas_table') || 'os_autorizadas_personality';

            let approvedVendedores = [];
            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const res = await fetch(`${cleanUrl}/rest/v1/${vendTable}?cpf=eq.${encodeURIComponent(cpfVal)}`, {
                        method: 'GET',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });
                    if (res.ok) {
                        approvedVendedores = await res.json();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            if (approvedVendedores.length === 0) {
                const local = JSON.parse(localStorage.getItem('personality_local_vendedores')) || [];
                approvedVendedores = local.filter(v => v.cpf === cpfVal);
            }
            if (approvedVendedores.length > 0) {
                storeVal = approvedVendedores[0].loja;
            }

            const newAuth = {
                os: osVal,
                cpf_vendedor: cpfVal,
                loja: storeVal,
                cliente_nome: clientVal,
                lente_familia: lensVal,
                ar_familia: arVal,
                utilizada: false,
                created_at: new Date().toISOString()
            };

            if (url && key) {
                try {
                    const cleanUrl = url.replace(/\/$/, "").replace(/\/rest\/v1$/, "");
                    const checkRes = await fetch(`${cleanUrl}/rest/v1/${osAuthTable}?os=eq.${encodeURIComponent(osVal)}`, {
                        method: 'GET',
                        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
                    });
                    if (checkRes.ok) {
                        const existing = await checkRes.json();
                        if (existing && existing.length > 0) {
                            alert('Erro: Esta O.S. já foi liberada no sistema anteriormente!');
                            return;
                        }
                    }

                    const res = await fetch(`${cleanUrl}/rest/v1/${osAuthTable}`, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${key}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(newAuth)
                    });
                    if (!res.ok) {
                        throw new Error('Falha ao registrar no Supabase.');
                    }
                } catch (err) {
                    console.error(err);
                    saveAuthOsLocally(newAuth);
                }
            } else {
                const local = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
                if (local.find(item => item.os === osVal)) {
                    alert('Erro: Esta O.S. já foi liberada no sistema anteriormente!');
                    return;
                }
                saveAuthOsLocally(newAuth);
            }

            authOsForm.reset();
            alert(`O.S. ${osVal} liberada com sucesso para o vendedor!`);
            loadPremiosAutorizarSection();
        });
    }

    function saveAuthOsLocally(data) {
        const local = JSON.parse(localStorage.getItem('personality_local_os_autorizadas')) || [];
        const localData = {
            id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
            ...data
        };
        local.push(localData);
        localStorage.setItem('personality_local_os_autorizadas', JSON.stringify(local));
    }
});
