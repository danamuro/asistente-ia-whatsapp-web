'use strict';

const ICONS = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z"/><circle cx="128" cy="128" r="36"/></svg>`,
    eyeSlash: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><line x1="48" y1="40" x2="208" y2="216"/><path d="M154.9,157.6A36,36,0,0,1,101.1,98.4"/><path d="M74,68.6C33.2,89.2,16,128,16,128s32,72,112,72a118.1,118.1,0,0,0,54-12.6"/><path d="M208.6,169.1C230.4,149.6,240,128,240,128s-32-72-112-72a126,126,0,0,0-20.1,1.6"/></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><circle cx="128" cy="128" r="96"/><polyline points="88 136 112 160 168 104"/></svg>`,
    warningCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><circle cx="128" cy="128" r="96"/><line x1="128" y1="80" x2="128" y2="136"/><circle cx="128" cy="172" r="6" fill="currentColor"/></svg>`,
    xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><circle cx="128" cy="128" r="96"/><line x1="160" y1="96" x2="96" y2="160"/><line x1="160" y1="160" x2="96" y2="96"/></svg>`,
    spinner: `<svg class="opt-spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M168,40.7a96,96,0,1,1-80,0"/></svg>`
};

const PROVIDERS = {
    groq: {
        name: 'Groq Cloud',
        label: 'Pega tu API Key de Groq (comienza por gsk_…):',
        placeholder: 'gsk_…',
        instructions: `
            <strong>⚡ 100% GRATIS y Ultrarrápido (Sin tarjeta):</strong><br>
            1. Abre <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">Groq Console (console.groq.com/keys)</a> e inicia sesión con Google.<br>
            2. Haz clic en <b>"Create API Key"</b>, escribe cualquier nombre, cópiala y pégala abajo.
        `
    },
    gemini: {
        name: 'Google Gemini',
        label: 'Pega tu API Key de Google Gemini (comienza por AIza…):',
        placeholder: 'AIzaSy…',
        instructions: `
            <strong>✨ 100% GRATIS con cuenta Gmail personal (Sin tarjeta):</strong><br>
            1. Abre <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio (aistudio.google.com/apikey)</a> con tu correo <b>@gmail.com</b> personal.<br>
            2. Haz clic en <b>"Create API key"</b> → <b>"Create API key in new project"</b>, cópiala y pégala abajo.
        `
    }
};

let selectedMode = 'both';
let selectedProvider = 'groq';
let cachedKeys = {
    groq: '',
    gemini: ''
};

// Elementos del DOM
const modeCards = document.querySelectorAll('.mode-card');
const providerTabs = document.querySelectorAll('.provider-tab');
const providerInstructions = document.getElementById('provider-instructions');
const apiKeyInput = document.getElementById('welcome-api-key');
const apiKeyLabel = document.getElementById('api-key-input-label');
const toggleKeyBtn = document.getElementById('welcome-toggle-key');
const testBtn = document.getElementById('welcome-test-btn');
const testStatus = document.getElementById('welcome-test-status');
const finishBtn = document.getElementById('btn-finish-onboarding');

// 1. Manejo de Selección de Modo (Paso 1)
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
});

// 2. Manejo de Proveedor de IA (Paso 2)
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

// 3. Probar Conexión
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

            if (resp && resp.ok) {
                testStatus.className = 'test-status ok';
                testStatus.innerHTML = `${ICONS.checkCircle}<span>¡Conexión exitosa! Tu API Key de ${PROVIDERS[selectedProvider].name} está funcionando correctamente.</span>`;
            } else {
                testStatus.className = 'test-status err';
                const errText = resp && resp.error ? resp.error : 'No se pudo verificar la clave.';
                testStatus.innerHTML = `${ICONS.xCircle}<span>Error al probar la clave: ${errText}</span>`;
            }
        }
    );
});

// 4. Finalizar Onboarding y Guardar
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

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateProviderUI('groq');
});
