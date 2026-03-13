/**
 * Dashboard Client Fix
 * Injects CPF and Email fields into the Client Edit Modal
 */
(function () {
    console.log('[Dash Fix] Loader initialized v3');

    let clientsList = [];

    // 1. Intercept fetch to steal client data and inject updates
    const originalFetch = window.fetch;
    window.fetch = async function () {
        let [resource, config] = arguments;

        // Intercept client update request to inject CPF/Email
        if (typeof resource === 'string' && 
            (resource.includes('/admin/dashboard/editar/cliente') || resource.includes('/cliente')) &&
            config && config.method && config.method.toUpperCase() !== 'GET') {
            try {
                if (config.body) {
                    let body = JSON.parse(config.body);
                    const savedCpf = localStorage.getItem('dash_update_cpf');
                    const savedEmail = localStorage.getItem('dash_update_email');
                    
                    if (savedCpf !== null && savedCpf !== undefined) body.cpf = savedCpf;
                    if (savedEmail !== null && savedEmail !== undefined) body.email = savedEmail;
                    
                    config.body = JSON.stringify(body);
                    console.log('[Dash Fix] Intercepted Admin Client Update, injected:', { cpf: body.cpf, email: body.email });
                    
                    // Clear after use
                    localStorage.removeItem('dash_update_cpf');
                    localStorage.removeItem('dash_update_email');
                }
            } catch (e) {
                console.error('[Dash Fix] Error injecting data into dash update request', e);
            }
        }

        const responsePromise = originalFetch.apply(this, arguments);

        // Intercept client list request to steal data for pre-filling
        if (typeof resource === 'string' && resource.includes('/admin/dashboard/todos/clientes')) {
            responsePromise.then(response => {
                const clonedResponse = response.clone();
                clonedResponse.json().then(data => {
                    if (Array.isArray(data)) {
                        clientsList = data; 
                        console.log('[Dash Fix] Captured clients list:', clientsList.length);
                    }
                }).catch(e => console.error("[Dash Fix] Could not parse clients list", e));
            });
        }

        return responsePromise;
    };

    function injectDashClientFields() {
        // In React, sometimes elements are nested deeply. Let's find any element containing 'EDITAR CLIENTE' or just 'CLIENTE'
        const allElements = Array.from(document.querySelectorAll('*'));
        const modalTitle = allElements.find(
            el => el.children.length === 0 && el.textContent && (
                el.textContent.trim() === 'CLIENTE' || 
                el.textContent.trim().toUpperCase() === 'EDITAR CLIENTE' || 
                el.textContent.includes('Editar Cliente')
            )
        );
        
        if (!modalTitle) return;
        if (!window.loggedModalOnce) {
            console.log('[Dash Fix] Found modal title:', modalTitle.textContent.trim());
            window.loggedModalOnce = true;
        }

        // Ensure we find inputs (at least Name, Surname, Phone)
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"]'));
        if (inputs.length < 2) return;

        // Attempting to find the modal container
        let targetContainer = null;
        
        // Find the title and get its parent container (usually a modal content div)
        if (modalTitle) {
            targetContainer = modalTitle.parentElement;
            for (let i = 0; i < 5; i++) { // Go up a few levels to find a suitable container
                if (targetContainer && targetContainer.tagName !== 'FORM' && targetContainer.tagName !== 'DIV') {
                    targetContainer = targetContainer.parentElement;
                }
            }
        }
        
        // Fallback to the closest div of the last input
        if (!targetContainer && inputs.length > 0) {
            targetContainer = inputs[inputs.length - 1].closest('div').parentElement;
        }
        
        // Also figure out current phone to try and fetch data
        let currentClient = {};
        for (let i = 0; i < inputs.length; i++) {
            const val = inputs[i].value;
            if (val && val.match(/\(\d{2}\)\s\d{4,5}-\d{4}/)) {
                currentClient = clientsList.find(c => c.cellphone === val) || {};
                break;
            }
        }

        if (targetContainer && !document.getElementById('dash-cpf-field-wrapper')) {
            console.log('[Dash Fix] Found modal body, Injecting CPF and Email fields...');

            // Create container
            const injectContainer = document.createElement('div');
            injectContainer.id = 'dash-cpf-field-wrapper';
            injectContainer.style.display = 'flex';
            injectContainer.style.flexDirection = 'column';
            injectContainer.style.gap = '15px';
            injectContainer.style.marginTop = '15px';
            injectContainer.style.marginBottom = '15px';
            injectContainer.style.width = '100%';

            // Style matches the dark theme shown in the screenshot
            injectContainer.innerHTML = `
                <div style="width: 100%;">
                    <label style="display:block; font-size:12px; font-weight:bold; color:#aaa; margin-bottom:8px;">CPF / Documento</label>
                    <input type="text" id="dash-cyber-cpf" placeholder="000.000.000-00" value="${currentClient.cpf || ''}" style="width:100%; padding:10px 14px; border:1px solid #333; border-radius:6px; background: #3b3b44; color: #fff; outline:none; transition: border-color 0.2s;">
                </div>
                <div style="width: 100%;">
                    <label style="display:block; font-size:12px; font-weight:bold; color:#aaa; margin-bottom:8px;">E-mail</label>
                    <input type="email" id="dash-cyber-email" placeholder="cliente@email.com" value="${currentClient.email || ''}" style="width:100%; padding:10px 14px; border:1px solid #333; border-radius:6px; background: #3b3b44; color: #fff; outline:none; transition: border-color 0.2s;">
                </div>
            `;

            // Add slight focus effects
            injectContainer.addEventListener('focusin', (e) => {
                if (e.target.tagName === 'INPUT') e.target.style.borderColor = '#00e676'; // Matching the green button tone
            });
            injectContainer.addEventListener('focusout', (e) => {
                if (e.target.tagName === 'INPUT') e.target.style.borderColor = '#333';
            });

            // Just append to the end of the container, before the button section if possible
            targetContainer.appendChild(injectContainer);
            
            // Setup listener for the submit mechanism
            setupSubmitInterceptor();
        }
    }

    function setupSubmitInterceptor() {
        const submitBtns = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Atualizar') || btn.textContent.includes('Salvar')
        );

        submitBtns.forEach(submitBtn => {
            if (!submitBtn.hasAttribute('data-hacked')) {
                submitBtn.setAttribute('data-hacked', 'true');
                
                // Listening on mousedown to ensure we capture the values right before validation/submit click
                submitBtn.addEventListener('mousedown', function () {
                    const cpfInput = document.getElementById('dash-cyber-cpf');
                    const emailInput = document.getElementById('dash-cyber-email');
                    
                    if (cpfInput && emailInput) {
                        localStorage.setItem('dash_update_cpf', cpfInput.value);
                        localStorage.setItem('dash_update_email', emailInput.value);
                        console.log('[Dash Fix] Stored fields before submit:', cpfInput.value, emailInput.value);
                    }
                });
            }
        });
    }

    // Monitor DOM changes to inject fields when modal opens
    let lastScanTime = 0;
    const observer = new MutationObserver((mutations) => {
        const now = Date.now();
        if (now - lastScanTime > 300) { // Throttle
            lastScanTime = now;
            requestAnimationFrame(() => {
                injectDashClientFields();
                if (document.getElementById('dash-cpf-field-wrapper')) {
                    setupSubmitInterceptor();
                }
            });
        }
    });

    // Run once on load just in case
    setTimeout(injectDashClientFields, 1000);
    observer.observe(document.body, { childList: true, subtree: true });

})();
