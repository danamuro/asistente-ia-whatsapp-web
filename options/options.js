'use strict';

// Iconos Phosphor Bold desde el sprite compartido del proyecto
const phIcon = (id, size = 16, extraClass = '') =>
    `<svg class="ph-icon${extraClass ? ' ' + extraClass : ''}" width="${size}" height="${size}" aria-hidden="true"><use href="../icons/phosphor-sprite.svg#${id}"/></svg>`;
const OPT_PH_BOLD = {
    eye: phIcon('ph-eye', 17),
    eyeSlash: phIcon('ph-eye-slash', 17),
    lightning: phIcon('ph-lightning', 15, 'ph-inline'),
    sparkle: phIcon('ph-sparkle', 15, 'ph-inline'),
    checkCircle: phIcon('ph-check-circle', 16, 'ph-inline'),
    warningCircle: phIcon('ph-warning-circle', 16, 'ph-inline'),
    xCircle: phIcon('ph-x-circle', 16, 'ph-inline'),
    spinner: phIcon('ph-spinner', 16, 'opt-spinner ph-inline')
};

const PROVIDER_CONFIG = {
    groq: {
        label: 'Tu API Key Gratuita de Groq Cloud (empieza por gsk_…):',
        placeholder: 'gsk_…',
        helpHtml: `
            <strong>${OPT_PH_BOLD.lightning}100% GRATIS y Ultrarrápido (Sin tarjeta):</strong><br>
            1. Entra a <a href="https://console.groq.com/keys" target="_blank" style="font-weight:700; color:#065f46; text-decoration:underline;">Groq Console (console.groq.com/keys)</a> e inicia sesión con Google.<br>
            2. Haz clic en <b>"Create API Key"</b>, ponle cualquier nombre, cópiala y pégala abajo.
        `,
        models: [
            { value: '', label: 'Automático (Detectar el mejor modelo activo de tu cuenta)' },
            { value: 'openai/gpt-oss-120b', label: 'OpenAI GPT-OSS 120B (Gratis — Máxima inteligencia)' },
            { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Gratis — Excelente y rápido)' },
            { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout de Meta (Gratis — Ultrarrápido)' },
            { value: 'meta-llama/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick de Meta (Gratis — Natural)' },
            { value: 'qwen/qwen3-32b', label: 'Qwen 3 32B (Gratis — Excelente en español)' }
        ]
    },
    gemini: {
        label: 'Tu API Key Gratuita de Google Gemini (empieza por AIza…):',
        placeholder: 'AIzaSy…',
        helpHtml: `
            <strong>${OPT_PH_BOLD.sparkle}100% GRATIS con cuenta Gmail personal (Sin tarjeta):</strong><br>
            1. Entra a <a href="https://aistudio.google.com/apikey" target="_blank" style="font-weight:700; color:#065f46; text-decoration:underline;">Google AI Studio (aistudio.google.com/apikey)</a> con un correo <b>@gmail.com personal</b> <i>(los correos educativos/institucionales bloquean el plan gratis de la API)</i>.<br>
            2. Haz clic en <b>"Create API key"</b> → <b>"Create API key in new project"</b>, cópiala y pégala abajo.
        `,
        models: [
            { value: '', label: 'Automático (Detectar el mejor Gemini activo)' },
            { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Gratis — Rápido y muy inteligente)' },
            { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Gratis — Última generación)' },
            { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview (Gratis — Máxima capacidad)' },
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
const toggleAudioTranscription = document.getElementById('toggle-audio-transcription');
const toggleTextAI = document.getElementById('toggle-text-ai');
const featuresOffWarning = document.getElementById('features-off-warning');
const fieldsetTriggerMode = document.getElementById('fieldset-trigger-mode');
const fieldsetTone = document.getElementById('fieldset-tone');

function syncFeatureTogglesUI(persistImmediately = false) {
    const audioOn = toggleAudioTranscription ? toggleAudioTranscription.checked : true;
    const textOn = toggleTextAI ? toggleTextAI.checked : true;

    if (featuresOffWarning) {
        featuresOffWarning.style.display = !audioOn && !textOn ? 'block' : 'none';
    }
    if (fieldsetTriggerMode) {
        fieldsetTriggerMode.classList.toggle('fieldset-dimmed', !textOn);
    }
    if (fieldsetTone) {
        fieldsetTone.classList.toggle('fieldset-dimmed', !textOn);
    }

    if (persistImmediately) {
        chrome.storage.local.set({
            enableAudioTranscription: audioOn,
            enableTextAI: textOn
        });
    }
}

if (toggleAudioTranscription) {
    toggleAudioTranscription.addEventListener('change', () => syncFeatureTogglesUI(true));
}
if (toggleTextAI) {
    toggleTextAI.addEventListener('change', () => syncFeatureTogglesUI(true));
}

// Inicializar icono Phosphor Bold en el botón de mostrar/ocultar contraseña
toggleKeyBtn.innerHTML = OPT_PH_BOLD.eye;

providerSelect.addEventListener('change', () => {
    updateProviderUI(providerSelect.value, null);
});

apiKeyInput.addEventListener('input', () => {
    const val = apiKeyInput.value.trim().replace(/^["']|["']$/g, '');
    const currentProvider = providerSelect.value;

    if (val.startsWith('AIza')) {
        cachedKeys.gemini = val;
        if (currentProvider !== 'gemini') {
            providerSelect.value = 'gemini';
            updateProviderUI('gemini', null);
        }
    } else if (val.startsWith('gsk_')) {
        cachedKeys.groq = val;
        if (currentProvider !== 'groq') {
            providerSelect.value = 'groq';
            updateProviderUI('groq', null);
        }
    } else {
        cachedKeys[currentProvider] = val;
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
    testStatusBox.innerHTML = `${OPT_PH_BOLD.spinner}<span>Detectando modelos disponibles y probando conexión…</span>`;
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
            const errMsg = response.error.message || (typeof response.error === 'string' ? response.error : 'Error al verificar la clave.');
            testStatusBox.innerHTML = `${OPT_PH_BOLD.xCircle}<span>${errMsg}</span>`;
        } else if (response && (response.ok || response.text)) {
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

            const cleanTestedKey = apiKey.replace(/^["']|["']$/g, '');
            let resolvedProvider = provider;
            if (cleanTestedKey.startsWith('AIza')) {
                cachedKeys.gemini = cleanTestedKey;
                resolvedProvider = 'gemini';
            } else if (cleanTestedKey.startsWith('gsk_')) {
                cachedKeys.groq = cleanTestedKey;
                resolvedProvider = 'groq';
            } else {
                cachedKeys[provider] = cleanTestedKey;
            }
            chrome.storage.local.set({
                apiChoice: resolvedProvider,
                apiKey: cleanTestedKey,
                geminiKey: cachedKeys.gemini,
                groqKey: cachedKeys.groq,
                model: response.usedModel || model || ''
            });
        }
    });
});

function saveOptions(e) {
    e.preventDefault();
    let provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim().replace(/^["']|["']$/g, '');
    if (apiKey.startsWith('AIza')) {
        cachedKeys.gemini = apiKey;
        provider = 'gemini';
    } else if (apiKey.startsWith('gsk_')) {
        cachedKeys.groq = apiKey;
        provider = 'groq';
    } else {
        cachedKeys[provider] = apiKey;
    }

    const model = modelSelect.value;
    const historyCount = Math.min(30, Math.max(2, Number(document.getElementById('history-count').value) || 10));
    const sendHistory = document.querySelector('input[name="send-history"]:checked').value;
    const toneOfVoice = document.getElementById('tone-of-voice').value.trim();
    const enableAudioTranscription = toggleAudioTranscription ? toggleAudioTranscription.checked : true;
    const enableTextAI = toggleTextAI ? toggleTextAI.checked : true;

    chrome.storage.local.set({
        apiChoice: provider,
        apiKey: apiKey,
        geminiKey: cachedKeys.gemini,
        groqKey: cachedKeys.groq,
        model: model,
        historyCount: historyCount,
        sendHistory: sendHistory,
        toneOfVoice: toneOfVoice || 'Usa mi propio estilo de escritura con naturalidad. Sé conciso.',
        enableAudioTranscription: enableAudioTranscription,
        enableTextAI: enableTextAI,
        onboardingCompleted: true
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
        toneOfVoice: 'Usa mi propio estilo de escritura con naturalidad. Sé conciso.',
        enableAudioTranscription: true,
        enableTextAI: true,
        onboardingCompleted: false
    }, (items) => {
        const rawGem = items.geminiKey || (items.apiKey.startsWith('AIza') ? items.apiKey : '');
        const rawGroq = items.groqKey || (items.apiKey.startsWith('gsk_') ? items.apiKey : '');
        cachedKeys.gemini = rawGem && !rawGem.startsWith('gsk_') ? rawGem : '';
        cachedKeys.groq = rawGroq && !rawGroq.startsWith('AIza') ? rawGroq : '';

        let provider = items.apiChoice;
        if (cachedKeys.groq && !cachedKeys.gemini) provider = 'groq';
        if (cachedKeys.gemini && !cachedKeys.groq) provider = 'gemini';
        if (provider !== 'groq' && provider !== 'gemini') provider = 'groq';

        providerSelect.value = provider;
        const normalizedModel = items.model === 'gemini-2.5-pro' ? 'gemini-3.1-pro-preview' : items.model;
        updateProviderUI(provider, normalizedModel);

        if (toggleAudioTranscription) {
            toggleAudioTranscription.checked = items.enableAudioTranscription !== false;
        }
        if (toggleTextAI) {
            toggleTextAI.checked = items.enableTextAI !== false;
        }
        syncFeatureTogglesUI(false);

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
        statusBox.innerHTML = `${OPT_PH_BOLD.spinner}<span>Comprobando si hay actualizaciones en GitHub…</span>`;
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
