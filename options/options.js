'use strict';

// Iconos vectoriales Phosphor Bold (256x256, stroke-width="24", round caps/joins)
const OPT_PH_BOLD = {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z"/><circle cx="128" cy="128" r="36"/></svg>`,
    eyeSlash: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><line x1="48" y1="40" x2="208" y2="216"/><path d="M154.9,157.6A36,36,0,0,1,101.1,98.4"/><path d="M74,68.6C33.2,89.2,16,128,16,128s32,72,112,72a118.1,118.1,0,0,0,54-12.6"/><path d="M208.6,169.1C230.4,149.6,240,128,240,128s-32-72-112-72a126,126,0,0,0-20.1,1.6"/></svg>`,
    lightning: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><polygon points="160 16 144 96 208 120 96 240 112 160 48 136 160 16"/></svg>`,
    sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px;"><path d="M138.7,175.5l-19.2,52.1a8,8,0,0,1-15,0L85.3,175.5,33.2,156.3a8,8,0,0,1,0-15L85.3,122.1l19.2-52.1a8,8,0,0,1,15,0l19.2,52.1,52.1,19.2a8,8,0,0,1,0,15Z"/></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:5px;"><circle cx="128" cy="128" r="96"/><polyline points="88 136 112 160 168 104"/></svg>`,
    warningCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:5px;"><circle cx="128" cy="128" r="96"/><line x1="128" y1="80" x2="128" y2="136"/><circle cx="128" cy="172" r="6" fill="currentColor"/></svg>`,
    xCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:5px;"><circle cx="128" cy="128" r="96"/><line x1="160" y1="96" x2="96" y2="160"/><line x1="160" y1="160" x2="96" y2="96"/></svg>`,
    spinner: `<svg class="opt-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px; margin-right:5px;"><path d="M168,40.7a96,96,0,1,1-80,0"/></svg>`
};

const PROVIDER_CONFIG = {
    groq: {
        label: 'Tu API Key Gratuita de Groq Cloud (empieza por gsk_...):',
        placeholder: 'gsk_...',
        helpHtml: `
            <strong>${OPT_PH_BOLD.lightning}100% GRATIS y Ultrarrápido (Sin tarjeta):</strong><br>
            1. Entra a <a href="https://console.groq.com/keys" target="_blank" style="font-weight:700; color:#065f46; text-decoration:underline;">Groq Console (console.groq.com/keys)</a> e inicia sesión con Google.<br>
            2. Haz clic en <b>"Create API Key"</b>, ponle cualquier nombre, cópiala y pégala abajo.
        `,
        models: [
            { value: '', label: 'Automático (Detectar el mejor modelo activo de tu cuenta)' },
            { value: 'openai/gpt-oss-120b', label: 'OpenAI GPT-OSS 120B (Gratis — Máxima inteligencia)' },
            { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout de Meta (Gratis — Ultrarrápido)' },
            { value: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick de Meta (Gratis — Natural)' },
            { value: 'qwen/qwen3-32b', label: 'Qwen 3 32B (Gratis — Excelente en español)' }
        ]
    },
    gemini: {
        label: 'Tu API Key Gratuita de Google Gemini (empieza por AIza...):',
        placeholder: 'AIzaSy...',
        helpHtml: `
            <strong>${OPT_PH_BOLD.sparkle}100% GRATIS con tu cuenta de Google (Sin tarjeta):</strong><br>
            1. Entra a <a href="https://aistudio.google.com/apikey" target="_blank" style="font-weight:700; color:#065f46; text-decoration:underline;">Google AI Studio (aistudio.google.com/apikey)</a>.<br>
            2. Haz clic en el botón azul <b>"Create API key"</b>, cópiala y pégala abajo.
        `,
        models: [
            { value: '', label: 'Automático (Detectar el mejor Gemini Flash activo)' },
            { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Gratis — Rápido y muy inteligente)' },
            { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Gratis — Estable y veloz)' }
        ]
    }
};

let cachedKeys = {
    gemini: '',
    groq: ''
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('options-form').addEventListener('submit', saveOptions);

const providerSelect = document.getElementById('provider-select');
const modelSelect = document.getElementById('model-select');
const apiKeyInput = document.getElementById('api-key');
const apiKeyLabel = document.getElementById('api-key-label');
const providerHelpBox = document.getElementById('provider-help-box');
const chatHistoryWarningAlert = document.getElementById('chatHistoryWarningAlert');
const closeAlertButton = document.getElementById('hideHistoryWarningAlert');
const toggleKeyBtn = document.getElementById('toggle-key-btn');
const testApiBtn = document.getElementById('test-api-btn');
const testStatusBox = document.getElementById('test-status');

// Inicializar icono Phosphor Bold en el botón de mostrar/ocultar contraseña
toggleKeyBtn.innerHTML = OPT_PH_BOLD.eye;

providerSelect.addEventListener('change', () => {
    updateProviderUI(providerSelect.value, null);
});

apiKeyInput.addEventListener('input', () => {
    const val = apiKeyInput.value.trim();
    const currentProvider = providerSelect.value;
    cachedKeys[currentProvider] = val;

    if (val.startsWith('AIza') && currentProvider !== 'gemini') {
        cachedKeys.gemini = val;
        providerSelect.value = 'gemini';
        updateProviderUI('gemini', null);
    } else if (val.startsWith('gsk_') && currentProvider !== 'groq') {
        cachedKeys.groq = val;
        providerSelect.value = 'groq';
        updateProviderUI('groq', null);
    }
});

function updateProviderUI(provider, preferredModel) {
    const safeProvider = PROVIDER_CONFIG[provider] ? provider : 'groq';
    const cfg = PROVIDER_CONFIG[safeProvider];
    apiKeyLabel.textContent = cfg.label;
    apiKeyInput.placeholder = cfg.placeholder;
    providerHelpBox.innerHTML = cfg.helpHtml;
    apiKeyInput.value = cachedKeys[safeProvider] || '';

    modelSelect.innerHTML = '';
    cfg.models.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.value;
        opt.textContent = m.label;
        modelSelect.appendChild(opt);
    });

    if (preferredModel && cfg.models.some((m) => m.value === preferredModel)) {
        modelSelect.value = preferredModel;
    } else {
        modelSelect.value = '';
    }
    testStatusBox.style.display = 'none';
}

closeAlertButton.addEventListener('click', () => {
    chatHistoryWarningAlert.style.visibility = 'hidden';
});

document.getElementById('send-history-auto').addEventListener('click', () => {
    chatHistoryWarningAlert.style.visibility = 'visible';
});

toggleKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleKeyBtn.innerHTML = OPT_PH_BOLD.eyeSlash;
    } else {
        apiKeyInput.type = 'password';
        toggleKeyBtn.innerHTML = OPT_PH_BOLD.eye;
    }
});

document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
        document.getElementById('tone-of-voice').value = chip.getAttribute('data-tone');
    });
});

testApiBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    const provider = providerSelect.value;
    const model = modelSelect.value;

    testStatusBox.style.display = 'block';
    if (!apiKey) {
        testStatusBox.className = 'test-status err';
        testStatusBox.innerHTML = `${OPT_PH_BOLD.warningCircle}<span>Ingresa primero tu API Key gratuita arriba.</span>`;
        return;
    }

    testStatusBox.className = 'test-status';
    testStatusBox.innerHTML = `${OPT_PH_BOLD.spinner}<span>Detectando modelos disponibles y probando conexión...</span>`;
    testApiBtn.disabled = true;

    chrome.runtime.sendMessage({
        action: 'testApiKey',
        apiKey: apiKey,
        provider: provider,
        model: model
    }, (response) => {
        testApiBtn.disabled = false;
        if (chrome.runtime.lastError) {
            testStatusBox.className = 'test-status err';
            testStatusBox.innerHTML = `${OPT_PH_BOLD.xCircle}<span>Error: ${chrome.runtime.lastError.message}</span>`;
            return;
        }
        if (response && response.error) {
            testStatusBox.className = 'test-status err';
            testStatusBox.innerHTML = `${OPT_PH_BOLD.xCircle}<span>${response.error.message}</span>`;
        } else if (response && response.text) {
            if (Array.isArray(response.availableModels) && response.availableModels.length > 0) {
                modelSelect.innerHTML = '';
                const autoOpt = document.createElement('option');
                autoOpt.value = '';
                autoOpt.textContent = `Automático (Usando: ${response.usedModel})`;
                modelSelect.appendChild(autoOpt);

                response.availableModels.forEach((mId) => {
                    const opt = document.createElement('option');
                    opt.value = mId;
                    opt.textContent = `${mId} (Activo en tu cuenta)`;
                    modelSelect.appendChild(opt);
                });
                modelSelect.value = response.usedModel || '';
            }
            testStatusBox.className = 'test-status ok';
            testStatusBox.innerHTML = `${OPT_PH_BOLD.checkCircle}<span>${response.text} — Modelo activo: <b>${response.usedModel || 'Automático'}</b></span>`;
        }
    });
});

function saveOptions(e) {
    e.preventDefault();
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    cachedKeys[provider] = apiKey;

    const model = modelSelect.value;
    const historyCount = Math.min(30, Math.max(2, Number(document.getElementById('history-count').value) || 10));
    const sendHistory = document.querySelector('input[name="send-history"]:checked').value;
    const toneOfVoice = document.getElementById('tone-of-voice').value.trim();

    chrome.storage.local.set({
        apiChoice: provider,
        apiKey: apiKey,
        geminiKey: cachedKeys.gemini,
        groqKey: cachedKeys.groq,
        model: model,
        historyCount: historyCount,
        sendHistory: sendHistory,
        toneOfVoice: toneOfVoice || 'Usa mi propio estilo de escritura con naturalidad. Sé conciso.'
    }, () => {
        const toast = document.getElementById('save-toast');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 2500);
    });
}

function restoreOptions() {
    chrome.storage.local.get({
        apiChoice: 'groq',
        apiKey: '',
        geminiKey: '',
        groqKey: '',
        model: '',
        historyCount: 10,
        sendHistory: 'manual',
        toneOfVoice: 'Usa mi propio estilo de escritura con naturalidad. Sé conciso.'
    }, (items) => {
        cachedKeys.gemini = items.geminiKey || (items.apiKey.startsWith('AIza') ? items.apiKey : '');
        cachedKeys.groq = items.groqKey || (items.apiKey.startsWith('gsk_') ? items.apiKey : '');

        let provider = items.apiChoice;
        if (cachedKeys.groq && !cachedKeys.gemini) provider = 'groq';
        if (provider !== 'groq' && provider !== 'gemini') provider = 'groq';

        providerSelect.value = provider;
        updateProviderUI(provider, items.model);

        document.getElementById('history-count').value = items.historyCount || 10;
        document.getElementById('tone-of-voice').value = items.toneOfVoice;

        const radio = document.querySelector(`input[name="send-history"][value="${items.sendHistory}"]`);
        if (radio) {
            radio.checked = true;
        }

        initUpdateChecker();
    });
}

function compareVersions(v1, v2) {
    const p1 = (v1 || '0').replace(/^v/, '').split('.').map(Number);
    const p2 = (v2 || '0').replace(/^v/, '').split('.').map(Number);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
        const n1 = p1[i] || 0;
        const n2 = p2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
    }
    return 0;
}

function initUpdateChecker() {
    const currentVer = chrome.runtime.getManifest().version;
    const currentVerEl = document.getElementById('current-version');
    if (currentVerEl) {
        currentVerEl.textContent = 'v' + currentVer;
    }

    const checkBtn = document.getElementById('check-update-btn');
    const statusBox = document.getElementById('update-status');
    if (!checkBtn || !statusBox) return;

    checkBtn.addEventListener('click', async () => {
        statusBox.style.display = 'flex';
        statusBox.className = 'update-status';
        statusBox.innerHTML = `${OPT_PH_BOLD.spinner}<span>Comprobando si hay actualizaciones en GitHub...</span>`;
        checkBtn.disabled = true;

        try {
            let latestVersion = '';
            let downloadUrl = 'https://github.com/danamuro/asistente-ia-whatsapp-web/releases';

            // 1. Intentar consultar la API de Releases de GitHub
            const resp = await fetch('https://api.github.com/repos/danamuro/asistente-ia-whatsapp-web/releases/latest');
            if (resp.ok) {
                const data = await resp.json();
                latestVersion = (data.tag_name || '').replace(/^v/, '');
                const zipAsset = (data.assets || []).find((a) => a.name && a.name.endsWith('.zip'));
                if (zipAsset && zipAsset.browser_download_url) {
                    downloadUrl = zipAsset.browser_download_url;
                } else if (data.html_url) {
                    downloadUrl = data.html_url;
                }
            } else {
                // 2. Si aún no hay release publicada, consultar directamente el manifest.json en la rama principal
                const rawResp = await fetch('https://raw.githubusercontent.com/danamuro/asistente-ia-whatsapp-web/main/manifest.json');
                if (rawResp.ok) {
                    const rawData = await rawResp.json();
                    latestVersion = rawData.version || '';
                }
            }

            checkBtn.disabled = false;
            if (!latestVersion) {
                statusBox.className = 'update-status ok';
                statusBox.innerHTML = `${OPT_PH_BOLD.checkCircle}<span>Tienes la versión más reciente (v${currentVer}).</span>`;
                return;
            }

            if (compareVersions(latestVersion, currentVer) > 0) {
                statusBox.className = 'update-status alert';
                statusBox.innerHTML = `
                    <span><b>¡Nueva versión v${latestVersion} disponible!</b></span>
                    <a class="btn-download-update" href="${downloadUrl}" target="_blank">Descargar .zip</a>
                `;
            } else {
                statusBox.className = 'update-status ok';
                statusBox.innerHTML = `${OPT_PH_BOLD.checkCircle}<span>Tienes la versión más reciente (v${currentVer}).</span>`;
            }
        } catch (err) {
            checkBtn.disabled = false;
            statusBox.className = 'update-status err';
            statusBox.innerHTML = `${OPT_PH_BOLD.xCircle}<span>No se pudo comprobar la conexión con GitHub.</span>`;
        }
    });
}
