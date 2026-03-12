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

    // Monitor DOM changes to inject fields when modals open
    const observer = new MutationObserver((mutations) => {
        injectFields();
    });

    observer.observe(document.body, { childList: true, subtree: true });

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

