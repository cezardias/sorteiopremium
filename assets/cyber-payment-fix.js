/**
 * Cyber Payment Frontend Hack
 * This script injects CPF and Email fields into the registration/purchase modals
 * because the original source code is not available.
 */

(function () {
    console.log('Cyber Payment Hack Loaded');

    const CONFIG = {
        apiBase: '/api/v1',
    };

    function injectFields() {
        // Find the registration/purchase form
        // Usually, it has inputs for 'name', 'surname', 'cellphone'
        const phoneInput = document.querySelector('input[name="cellphone"]') ||
            document.querySelector('input[placeholder*="Celular"]') ||
            document.querySelector('input[placeholder*="Telefone"]');

        if (phoneInput && !document.getElementById('cyber-cpf-field')) {
            console.log('Found phone input, injecting fields...');

            const formGroup = phoneInput.closest('div'); // Try to find the container
            if (!formGroup) return;

            // Create CPF field
            const cpfDiv = document.createElement('div');
            cpfDiv.id = 'cyber-cpf-field';
            cpfDiv.style.marginTop = '10px';
            cpfDiv.innerHTML = `
                <label style="display:block; font-size:14px; margin-bottom:5px;">CPF (obrigatório para pagamento)</label>
                <input type="text" id="cyber-cpf" placeholder="000.000.000-00" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
            `;

            // Create Email field
            const emailDiv = document.createElement('div');
            emailDiv.id = 'cyber-email-field';
            emailDiv.style.marginTop = '10px';
            emailDiv.innerHTML = `
                <label style="display:block; font-size:14px; margin-bottom:5px;">E-mail (obrigatório para pagamento)</label>
                <input type="email" id="cyber-email" placeholder="seu@email.com" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
            `;

            formGroup.parentNode.insertBefore(emailDiv, formGroup.nextSibling);
            formGroup.parentNode.insertBefore(cpfDiv, emailDiv);

            // Intercept Submit button
            const submitBtn = document.querySelector('button[type="submit"]') ||
                document.querySelector('button:last-of-type');

            if (submitBtn) {
                submitBtn.addEventListener('click', function (e) {
                    const cpf = document.getElementById('cyber-cpf').value;
                    const email = document.getElementById('cyber-email').value;

                    if (!cpf || !email) {
                        alert('Por favor, preencha CPF e E-mail para prosseguir com o pagamento.');
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }

                    // Store in localStorage so we can use it in the next request if needed
                    localStorage.setItem('cyber_cpf', cpf);
                    localStorage.setItem('cyber_email', email);
                }, true);
            }
        }
    }

    // Monitor DOM changes to inject fields
    const observer = new MutationObserver((mutations) => {
        injectFields();
        injectDashboardSettings();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function injectDashboardSettings() {
        if (!window.location.pathname.includes('/config')) return; // Adjust based on dash route

        const settingsTitle = Array.from(document.querySelectorAll('h1, h2, h3')).find(el => el.textContent.includes('Configurações') || el.textContent.includes('Site'));
        if (!settingsTitle) return;

        const mpSection = document.querySelector('input[name="secretmercadopago"]')?.closest('div')?.parentElement;
        if (mpSection && !document.getElementById('cyber-settings-group')) {
            console.log('Injecting Cyber Settings into Dashboard...');

            const cyberGroup = document.createElement('div');
            cyberGroup.id = 'cyber-settings-group';
            cyberGroup.style.padding = '20px';
            cyberGroup.style.border = '1px solid #eee';
            cyberGroup.style.borderRadius = '8px';
            cyberGroup.style.marginTop = '20px';
            cyberGroup.style.background = '#f9f9f9';

            cyberGroup.innerHTML = `
                <h4 style="margin-bottom:15px; font-weight:bold;">Gateway de Pagamento</h4>
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px;">Selecionar GatewayAtivo</label>
                    <select id="dash-gateway" name="gateway" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ccc;">
                        <option value="mercadopago">Mercado Pago</option>
                        <option value="cyber">Escale Cyber</option>
                    </select>
                </div>
                
                <div id="cyber-keys-fields" style="display:none;">
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px;">Cyber Public Key</label>
                        <input type="text" id="dash-cyber-public" name="cyber_public" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ccc;">
                    </div>
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:5px;">Cyber Secret Key</label>
                        <input type="text" id="dash-cyber-secret" name="cyber_secret" style="width:100%; padding:8px; border-radius:4px; border:1px solid #ccc;">
                    </div>
                </div>
            `;

            mpSection.parentNode.insertBefore(cyberGroup, mpSection.nextSibling);

            const gatewaySelect = document.getElementById('dash-gateway');
            const cyberKeysFields = document.getElementById('cyber-keys-fields');

            gatewaySelect.addEventListener('change', (e) => {
                cyberKeysFields.style.display = e.target.value === 'cyber' ? 'block' : 'none';
            });

            // Try to load existing values
            fetch(`${CONFIG.apiBase}/dashboard/site-settings`).then(r => r.json()).then(res => {
                if (res.success && res.data) {
                    gatewaySelect.value = res.data.gateway || 'mercadopago';
                    document.getElementById('dash-cyber-public').value = res.data.cyberPublicKey || '';
                    document.getElementById('dash-cyber-secret').value = res.data.cyberSecretKey || '';
                    if (gatewaySelect.value === 'cyber') cyberKeysFields.style.display = 'block';
                }
            });
        }
    }

    // Polling logic for auto-closing QR code modal

    let pollingInterval = null;
    function startPolling(rifaPayId) {
        if (pollingInterval) clearInterval(pollingInterval);
        console.log('Starting polling for RifaPay:', rifaPayId);

        pollingInterval = setInterval(async () => {
            try {
                const response = await originalFetch(`${CONFIG.apiBase}/compra-rifas-status/${rifaPayId}`);
                const data = await response.json();

                if (data.success && data.status == 1) {
                    console.log('Payment Approved! Closing modal...');
                    clearInterval(pollingInterval);

                    // Try to find and click the close button or remove the modal
                    const closeBtn = document.querySelector('button[aria-label="Close"]') ||
                        document.querySelector('.modal-close') ||
                        document.querySelector('button:contains("Fechar")');
                    if (closeBtn) closeBtn.click();

                    // Optionally refresh or show success
                    alert('Pagamento aprovado com sucesso!');
                    window.location.reload();
                }
            } catch (e) {
                console.error('Polling error', e);
            }
        }, 5000); // Check every 5 seconds
    }

    // Also try to intercept fetch/XHR to inject the data into the request
    const originalFetch = window.fetch;
    window.fetch = function () {
        let [resource, config] = arguments;

        // Intercept purchase request
        if (resource.includes('/compra-rifas') || resource.includes('/comprar-rifa')) {
            console.log('Intercepting purchase request...');
            try {
                if (config && config.body) {
                    let body = JSON.parse(config.body);
                    body.cpf = localStorage.getItem('cyber_cpf');
                    body.email = localStorage.getItem('cyber_email');
                    config.body = JSON.stringify(body);
                }
            } catch (e) {
                console.error('Error injecting data into request', e);
            }

            // Capture the response to get the RifaPay ID for polling
            return originalFetch.apply(this, arguments).then(async (response) => {
                const clonedResponse = response.clone();
                try {
                    const data = await clonedResponse.json();
                    if (data.success && data.data && data.data.id) {
                        startPolling(data.data.id);
                    }
                } catch (e) { }
                return response;
            });
        }

        return originalFetch.apply(this, arguments);
    };

})();

