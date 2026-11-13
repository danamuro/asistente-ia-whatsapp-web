'use strict';

const phIcon = (id, size = 18, extraClass = '') =>
    `<svg class="ph-icon${extraClass ? ' ' + extraClass : ''}" width="${size}" height="${size}" aria-hidden="true"><use href="../icons/phosphor-sprite.svg#${id}"/></svg>`;

const ICONS = {
    eye: phIcon('ph-eye', 18),
    eyeSlash: phIcon('ph-eye-slash', 18),
    checkCircle: phIcon('ph-check-circle', 18),
    warningCircle: phIcon('ph-warning-circle', 18),
    xCircle: phIcon('ph-x-circle', 18),
    spinner: phIcon('ph-spinner', 18, 'opt-spinner'),
    lightning: phIcon('ph-lightning', 15, 'ph-inline'),
    sparkle: phIcon('ph-sparkle', 15, 'ph-inline')
};

const PROVIDERS = {
    groq: {
        name: 'Groq Cloud',
        label: 'Pega tu API Key de Groq (comienza por gsk_…):',
        placeholder: 'gsk_…',
        instructions: `
            <strong class="guide-title">${ICONS.lightning}<span>100% gratis y ultrarrápido (sin tarjeta bancaria):</span></strong><br>
            1. Abre <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">Groq Console (console.groq.com/keys)</a> e inicia sesión con tu cuenta de Google.<br>
            2. Haz clic en <b>"Create API Key"</b>, dale cualquier nombre, cópiala y pégala aquí abajo.
        `
    },
    gemini: {
        name: 'Google Gemini',
        label: 'Pega tu API Key de Google Gemini (comienza por AIza…):',
        placeholder: 'AIzaSy…',
        instructions: `
            <strong class="guide-title">${ICONS.sparkle}<span>100% gratis con cuenta Gmail personal (sin tarjeta bancaria):</span></strong><br>
            1. Abre <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio (aistudio.google.com/apikey)</a> con tu correo <b>@gmail.com</b> personal.<br>
            2. Haz clic en <b>"Create API key"</b> → <b>"Create API key in new project"</b>, cópiala y pégala abajo.
        `
    }
};

let currentStep = 1;
let selectedMode = 'both';
let selectedProvider = 'groq';
let cachedKeys = {
    groq: '',
    gemini: ''
};

// Elementos del DOM
const welcomeTitle = document.getElementById('welcome-title');
const welcomeSubtitle = document.getElementById('welcome-subtitle');
const stepIndicator1 = document.getElementById('step-indicator-1');
const stepIndicator2 = document.getElementById('step-indicator-2');
const stepperLine = document.getElementById('stepper-line');

const stepPane1 = document.getElementById('step-pane-1');
const stepPane2 = document.getElementById('step-pane-2');
const btnNextStep = document.getElementById('btn-next-step');
const btnPrevStep = document.getElementById('btn-prev-step');

const modeCards = document.querySelectorAll('.mode-card');
const providerTabs = document.querySelectorAll('.provider-tab');
const providerInstructions = document.getElementById('provider-instructions');
const apiKeyInput = document.getElementById('welcome-api-key');
const apiKeyLabel = document.getElementById('api-key-input-label');
const toggleKeyBtn = document.getElementById('welcome-toggle-key');
const testBtn = document.getElementById('welcome-test-btn');
const testStatus = document.getElementById('welcome-test-status');
const finishBtn = document.getElementById('btn-finish-onboarding');

// 1. Control de Pasos (Wizard UX)
function setStep(step) {
    currentStep = step;
    if (step === 1) {
        stepPane1.style.display = 'block';
        stepPane2.style.display = 'none';

        stepIndicator1.className = 'stepper-step active';
        stepIndicator2.className = 'stepper-step';
        stepperLine.classList.remove('completed');

        welcomeTitle.textContent = 'Configura tu Asistente IA en 2 sencillos pasos';
        welcomeSubtitle.textContent = 'Elige qué funciones deseas activar en tu WhatsApp Web.';
    } else {
        stepPane1.style.display = 'none';
        stepPane2.style.display = 'block';

        stepIndicator1.className = 'stepper-step completed';
        stepIndicator2.className = 'stepper-step active';
        stepperLine.classList.add('completed');

        welcomeTitle.textContent = 'Conecta tu API Key gratuita';
        welcomeSubtitle.textContent = 'Genera tu clave en 30 segundos sin costo y pégala aquí para activar la IA.';

        // Enfocar el input para mayor comodidad
        setTimeout(() => {
            apiKeyInput.focus();
        }, 50);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

btnNextStep.addEventListener('click', () => {
    setStep(2);
});

btnPrevStep.addEventListener('click', () => {
    setStep(1);
});

// 2. Manejo de Selección de Modo (Paso 1)
modeCards.forEach((card) => {
    card.addEventListener('click', () => {
        modeCards.forEach((c) => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        selectedMode = card.getAttribute('data-mode') || 'both';
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
});

// 3. Manejo de Proveedor de IA (Paso 2)
function updateProviderUI(provider) {
    selectedProvider = provider;
    providerTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.getAttribute('data-provider') === provider);
    });

    const info = PROVIDERS[provider];
    if (info) {
        providerInstructions.innerHTML = info.instructions;
        apiKeyLabel.textContent = info.label;
        apiKeyInput.placeholder = info.placeholder;
        apiKeyInput.value = cachedKeys[provider] || '';
    }
    hideTestStatus();
}

providerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        const prov = tab.getAttribute('data-provider');
        if (prov && prov !== selectedProvider) {
            cachedKeys[selectedProvider] = apiKeyInput.value.trim();
            updateProviderUI(prov);
        }
    });
});

// Auto-detección inteligente al pegar clave
apiKeyInput.addEventListener('input', () => {
    const val = apiKeyInput.value.trim().replace(/^["']|["']$/g, '');
    cachedKeys[selectedProvider] = val;

    if (val.startsWith('gsk_') && selectedProvider !== 'groq') {
        cachedKeys.groq = val;
        updateProviderUI('groq');
    } else if (val.startsWith('AIza') && selectedProvider !== 'gemini') {
        cachedKeys.gemini = val;
        updateProviderUI('gemini');
    }
});

// Mostrar/Ocultar clave
let keyVisible = false;
toggleKeyBtn.addEventListener('click', () => {
    keyVisible = !keyVisible;
    apiKeyInput.type = keyVisible ? 'text' : 'password';
    toggleKeyBtn.innerHTML = keyVisible ? ICONS.eyeSlash : ICONS.eye;
});

// 4. Probar Conexión con la API
function hideTestStatus() {
    testStatus.style.display = 'none';
    testStatus.className = 'test-status';
    testStatus.innerHTML = '';
}

testBtn.addEventListener('click', () => {
    const rawKey = apiKeyInput.value.trim().replace(/^["']|["']$/g, '');
    if (!rawKey) {
        testStatus.className = 'test-status err';
        testStatus.innerHTML = `${ICONS.warningCircle}<span>Por favor, pega primero tu API Key arriba para probarla.</span>`;
        testStatus.style.display = 'flex';
        return;
    }

    testStatus.className = 'test-status loading';
    testStatus.innerHTML = `${ICONS.spinner}<span>Probando conexión con ${PROVIDERS[selectedProvider].name}…</span>`;
    testStatus.style.display = 'flex';
    testBtn.disabled = true;

    chrome.runtime.sendMessage(
        {
            action: 'testApiKey',
            apiKey: rawKey,
            provider: selectedProvider,
            model: ''
        },
        (resp) => {
            testBtn.disabled = false;
            if (chrome.runtime.lastError) {
                testStatus.className = 'test-status err';
                testStatus.innerHTML = `${ICONS.xCircle}<span>Error de comunicación: ${chrome.runtime.lastError.message}</span>`;
                return;
            }

            // Detección robusta de éxito: resp.ok === true O presencia de texto de respuesta sin errores
            const isSuccess = Boolean(resp && (resp.ok === true || (resp.text && !resp.error)));

            if (isSuccess) {
                testStatus.className = 'test-status ok';
                const modelUsed = resp.usedModel ? ` (Modelo activo: <b>${resp.usedModel}</b>)` : '';
                testStatus.innerHTML = `${ICONS.checkCircle}<span>¡Conexión exitosa! Tu API Key de ${PROVIDERS[selectedProvider].name} está funcionando correctamente.${modelUsed}</span>`;
            } else {
                testStatus.className = 'test-status err';
                let errText = 'No se pudo verificar la clave.';
                if (resp && resp.error) {
                    errText = typeof resp.error === 'string' ? resp.error : (resp.error.message || JSON.stringify(resp.error));
                }
                testStatus.innerHTML = `${ICONS.xCircle}<span>Error al probar la clave: ${errText}</span>`;
            }
        }
    );
});

// 5. Finalizar Onboarding y Guardar
finishBtn.addEventListener('click', () => {
    const rawKey = apiKeyInput.value.trim().replace(/^["']|["']$/g, '');
    cachedKeys[selectedProvider] = rawKey;

    const enableAudio = selectedMode === 'both' || selectedMode === 'audio-only';
    const enableText = selectedMode === 'both' || selectedMode === 'text-only';

    const settingsToSave = {
        enableAudioTranscription: enableAudio,
        enableTextAI: enableText,
        apiChoice: selectedProvider,
        apiKey: rawKey,
        onboardingCompleted: true
    };

    if (selectedProvider === 'groq') {
        settingsToSave.groqKey = rawKey;
    } else {
        settingsToSave.geminiKey = rawKey;
    }

    chrome.storage.local.set(settingsToSave, () => {
        // Redirigir o abrir WhatsApp Web y cerrar pestaña de bienvenida
        chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }, (tabs) => {
            if (tabs && tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { active: true });
                window.close();
            } else {
                chrome.tabs.create({ url: 'https://web.whatsapp.com' }, () => {
                    window.close();
                });
            }
        });
    });
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateProviderUI('groq');
    setStep(1);
});
