'use strict';

function detectProviderFromKey(apiKey, chosenProvider) {
    if (!apiKey) return chosenProvider || 'gemini';
    const clean = apiKey.trim().replace(/^["']|["']$/g, '');
    if (clean.startsWith('AIza')) return 'gemini';
    if (clean.startsWith('gsk_')) return 'groq';
    return chosenProvider || 'gemini';
}

function isNonChatGroqModel(modelId) {
    const id = (modelId || '').toLowerCase();
    const excludedKeywords = [
        'whisper',
        'tts',
        'playai',
        'orpheus',
        'guard',
        'safeguard',
        'embed',
        'moderation',
        'vision-preview',
        'audio',
        'allam'
    ];
    return excludedKeywords.some((kw) => id.includes(kw));
}

function rankGroqChatModels(modelIds) {
    const chatModels = modelIds.filter((id) => !isNonChatGroqModel(id));
    const priorityPatterns = [
        'llama-3.3-70b',
        'llama-4-scout',
        'llama-4-maverick',
        'gpt-oss-120b',
        'gpt-oss-20b',
        'qwen3-32b',
        'kimi-k2',
        'llama',
        'gemma',
        'qwen',
        'deepseek',
        'mixtral'
    ];

    return chatModels.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        let aScore = priorityPatterns.findIndex((p) => aLower.includes(p));
        let bScore = priorityPatterns.findIndex((p) => bLower.includes(p));
        if (aScore === -1) aScore = 999;
        if (bScore === -1) bScore = 999;
        return aScore - bScore;
    });
}

async function fetchLiveGroqModels(apiKey) {
    try {
        const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
        const resp = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cleanKey}`
            }
        });
        if (!resp.ok) return [];
        const data = await resp.json();
        const ids = (data.data || []).map((m) => m.id).filter(Boolean);
        return rankGroqChatModels(ids);
    } catch (_) {
        return [];
    }
}

async function fetchLiveGeminiModels(apiKey) {
    try {
        const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`
        );
        if (!resp.ok) return [];
        const data = await resp.json();
        const models = (data.models || [])
            .filter(
                (m) =>
                    Array.isArray(m.supportedGenerationMethods) &&
                    m.supportedGenerationMethods.includes('generateContent')
            )
            .map((m) => (m.name || '').replace(/^models\//, ''))
            .filter((name) => {
                const n = name.toLowerCase();
                return (
                    n.includes('gemini') &&
                    !n.includes('embedding') &&
                    !n.includes('imagen') &&
                    !n.includes('tts') &&
                    !n.includes('vision') &&
                    !n.includes('aqa') &&
                    !n.includes('1.0')
                );
            });

        const priority = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-2.5-pro',
            'gemini-3'
        ];
        return models.sort((a, b) => {
            let aIdx = priority.findIndex((p) => a.startsWith(p));
            let bIdx = priority.findIndex((p) => b.startsWith(p));
            if (aIdx === -1) aIdx = 999;
            if (bIdx === -1) bIdx = 999;
            return aIdx - bIdx;
        });
    } catch (_) {
        return [];
    }
}

async function callGeminiAPI(apiKey, prompt, systemInstruction, preferredModel) {
    const liveModels = await fetchLiveGeminiModels(apiKey);

    let candidateModels = [];
    if (liveModels.length > 0) {
        if (preferredModel && liveModels.includes(preferredModel)) {
            candidateModels = [preferredModel, ...liveModels.filter((m) => m !== preferredModel)];
        } else {
            candidateModels = liveModels;
        }
    } else {
        candidateModels = [
            preferredModel && preferredModel.startsWith('gemini') ? preferredModel : 'gemini-2.5-flash',
            'gemini-2.5-flash-lite',
            'gemini-2.0-flash',
            'gemini-1.5-flash'
        ];
    }

    const uniqueModels = [...new Set(candidateModels)].slice(0, 5);
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

    let lastStatus = 0;
    let lastErrorMsg = '';

    for (const m of uniqueModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const visibleParts = parts.filter((p) => !p.thought);
            const textToUse = (visibleParts.length > 0 ? visibleParts : parts)
                .map((p) => p.text || '')
                .join('')
                .trim();

            if (textToUse) {
                chrome.storage.local.set({ model: m });
                return { text: textToUse, usedModel: m, availableModels: liveModels };
            }

            if (data?.candidates?.[0]?.finishReason && data.candidates[0].finishReason !== 'STOP') {
                lastErrorMsg = `Respuesta bloqueada por filtros de contenido (${data.candidates[0].finishReason})`;
            }
        } else {
            lastStatus = response.status;
            try {
                const errData = await response.json();
                lastErrorMsg = errData?.error?.message || response.statusText;
            } catch (_) {
                lastErrorMsg = response.statusText;
            }
            if (response.status === 400 && lastErrorMsg.toLowerCase().includes('api key')) {
                return {
                    error: {
                        message: 'Tu API Key de Google Gemini no es válida. Verifica que empiece por AIza…'
                    }
                };
            }
            if (response.status === 403 && lastErrorMsg.toLowerCase().includes('free tier is not available')) {
                return {
                    error: {
                        message: 'Los correos educativos/institucionales (o este proyecto) tienen bloqueado el plan gratuito de la API de Google. Crea tu API Key de Gemini con un correo @gmail.com personal, o usa Groq Cloud que sí funciona gratis con cualquier correo.'
                    }
                };
            }
        }
    }

    return {
        error: {
            message: `Error de Google Gemini (${lastStatus}): ${lastErrorMsg || 'No se pudo generar respuesta'}`
        }
    };
}

async function callGroqAPI(apiKey, prompt, systemInstruction, preferredModel) {
    const liveModels = await fetchLiveGroqModels(apiKey);

    let modelsToTry = [];
    if (liveModels.length > 0) {
        if (preferredModel && liveModels.includes(preferredModel)) {
            modelsToTry = [preferredModel, ...liveModels.filter((m) => m !== preferredModel)];
        } else {
            modelsToTry = liveModels;
        }
    } else {
        modelsToTry = [
            preferredModel && preferredModel.length > 3 ? preferredModel : 'llama-3.3-70b-versatile',
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'openai/gpt-oss-120b',
            'openai/gpt-oss-20b',
            'mixtral-8x7b-32768'
        ];
    }

    const uniqueModels = [...new Set(modelsToTry)].slice(0, 6);

    const messages = [];
    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    let lastStatus = 0;
    let lastErrorDetails = '';

    for (const modelToUse of uniqueModels) {
        const chatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelToUse,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (chatResponse.ok) {
            const data = await chatResponse.json();
            let rawText = data?.choices?.[0]?.message?.content || '';
            rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (rawText) {
                chrome.storage.local.set({ model: modelToUse });
                return { text: rawText, usedModel: modelToUse, availableModels: liveModels };
            }
        } else {
            lastStatus = chatResponse.status;
            try {
                const errJson = await chatResponse.json();
                lastErrorDetails = errJson?.error?.message || chatResponse.statusText;
            } catch (_) {
                lastErrorDetails = chatResponse.statusText;
            }
            if (lastStatus === 401) {
                return {
                    error: {
                        message: 'Tu API Key de Groq no es válida. Verifica que empiece por gsk_…'
                    }
                };
            }
        }
    }

    return {
        error: {
            message: `Error de Groq (${lastStatus}): ${lastErrorDetails}`
        }
    };
}

async function generateAIResponse(prompt, systemInstruction, overrideKey, overrideModel, overrideProvider) {
    try {
        const stored = await chrome.storage.local.get({
            apiChoice: 'groq',
            apiKey: '',
            geminiKey: '',
            groqKey: '',
            model: ''
        });

        const chosenProvider = overrideProvider || stored.apiChoice || 'groq';
        let activeKey = '';
        if (overrideKey !== undefined && typeof overrideKey === 'string' && overrideKey.trim()) {
            activeKey = overrideKey.trim();
        } else if (chosenProvider === 'gemini') {
            activeKey = (stored.geminiKey || (stored.apiKey.startsWith('AIza') ? stored.apiKey : '') || stored.apiKey || stored.groqKey || '').trim();
        } else {
            activeKey = (stored.groqKey || (stored.apiKey.startsWith('gsk_') ? stored.apiKey : '') || stored.apiKey || stored.geminiKey || '').trim();
        }

        activeKey = activeKey.replace(/^["']|["']$/g, '').trim();

        if (!activeKey) {
            return {
                error: {
                    message: 'Configura tu API Key gratuita (Groq o Gemini) haciendo clic en el icono de la extensión en tu navegador.'
                }
            };
        }

        const effectiveProvider = detectProviderFromKey(activeKey, chosenProvider);
        const selectedModel = (overrideModel !== undefined ? overrideModel : stored.model || '').trim();

        if (effectiveProvider === 'gemini') {
            return await callGeminiAPI(activeKey, prompt, systemInstruction, selectedModel);
        } else {
            return await callGroqAPI(activeKey, prompt, systemInstruction, selectedModel);
        }
    } catch (error) {
        return {
            error: {
                message: `Error de red al conectar con la IA: ${error.message}`
            }
        };
    }
}

function base64ToBlob(base64, mimeType = 'audio/ogg') {
    const cleanBase64 = (base64 || '').replace(/^data:[^;]+;base64,/, '');
    const binaryStr = atob(cleanBase64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    const cleanMime = (mimeType || 'audio/ogg').split(';')[0].trim() || 'audio/ogg';
    return new Blob([bytes], { type: cleanMime });
}

async function transcribeWithGroqWhisper(apiKey, base64Audio, mimeType) {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const audioBlob = base64ToBlob(base64Audio, mimeType);
    const ext = (mimeType || '').includes('mp4') ? 'm4a' : (mimeType || '').includes('mpeg') ? 'mp3' : 'ogg';
    const whisperModels = ['whisper-large-v3-turbo', 'whisper-large-v3'];

    let lastStatus = 0;
    let lastErrorDetails = '';

    for (const modelId of whisperModels) {
        const formData = new FormData();
        formData.append('file', audioBlob, `whatsapp-voice.${ext}`);
        formData.append('model', modelId);
        formData.append('response_format', 'json');
        formData.append('temperature', '0');

        const resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cleanKey}`
            },
            body: formData
        });

        if (resp.ok) {
            const data = await resp.json();
            const text = (data?.text || '').trim();
            if (text) {
                return { text, usedModel: modelId };
            }
        } else {
            lastStatus = resp.status;
            try {
                const errJson = await resp.json();
                lastErrorDetails = errJson?.error?.message || resp.statusText;
            } catch (_) {
                lastErrorDetails = resp.statusText;
            }
            if (lastStatus === 401) {
                return {
                    error: {
                        message: 'Tu API Key de Groq no es válida. Verifica que empiece por gsk_…'
                    }
                };
            }
        }
    }

    return {
        error: {
            message: `Error al transcribir en Groq (${lastStatus}): ${lastErrorDetails || 'No se pudo procesar el audio'}`
        }
    };
}

async function transcribeWithGemini(apiKey, base64Audio, mimeType, preferredModel) {
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
    const cleanBase64 = (base64Audio || '').replace(/^data:[^;]+;base64,/, '');
    const cleanMime = (mimeType || 'audio/ogg').split(';')[0].trim() || 'audio/ogg';

    const liveModels = await fetchLiveGeminiModels(cleanKey);
    const candidateModels =
        liveModels.length > 0
            ? [
                  ...(preferredModel && liveModels.includes(preferredModel) ? [preferredModel] : []),
                  ...liveModels.filter((m) => m !== preferredModel)
              ]
            : ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const uniqueModels = [...new Set(candidateModels)].slice(0, 4);
    let lastStatus = 0;
    let lastErrorMsg = '';

    for (const m of uniqueModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(cleanKey)}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: 'Transcribe exactamente este mensaje de voz de WhatsApp en su idioma original. Devuelve ÚNICAMENTE el texto hablado, sin comillas, sin introducciones ni explicaciones adicionales.'
                            },
                            {
                                inlineData: {
                                    mimeType: cleanMime,
                                    data: cleanBase64
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2048
                }
            })
        });

        if (response.ok) {
            const data = await response.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const visibleParts = parts.filter((p) => !p.thought);
            const textToUse = (visibleParts.length > 0 ? visibleParts : parts)
                .map((p) => p.text || '')
                .join('')
                .trim();

            if (textToUse) {
                return { text: textToUse, usedModel: m };
            }
        } else {
            lastStatus = response.status;
            try {
                const errData = await response.json();
                lastErrorMsg = errData?.error?.message || response.statusText;
            } catch (_) {
                lastErrorMsg = response.statusText;
            }
        }
    }

    return {
        error: {
            message: `Error al transcribir en Gemini (${lastStatus}): ${lastErrorMsg || 'No se pudo procesar el audio'}`
        }
    };
}

async function transcribeAudioResponse(base64Audio, mimeType) {
    try {
        if (!base64Audio) {
            return { error: { message: 'No se recibieron datos de audio para transcribir.' } };
        }

        const stored = await chrome.storage.local.get({
            apiChoice: 'groq',
            apiKey: '',
            geminiKey: '',
            groqKey: '',
            model: ''
        });

        const groqKey = (stored.groqKey || (stored.apiKey.startsWith('gsk_') ? stored.apiKey : '')).trim().replace(/^["']|["']$/g, '');
        const geminiKey = (stored.geminiKey || (stored.apiKey.startsWith('AIza') ? stored.apiKey : '')).trim().replace(/^["']|["']$/g, '');
        const fallbackKey = (stored.apiKey || '').trim().replace(/^["']|["']$/g, '');

        if (!groqKey && !geminiKey && !fallbackKey) {
            return {
                error: {
                    message: 'Configura tu API Key gratuita (Groq o Gemini) en el icono de la extensión para transcribir audios.'
                }
            };
        }

        // Priorizar Groq Whisper si hay llave de Groq disponible (es ultrarrápido y no gasta tokens de chat)
        const preferGroq = Boolean(groqKey) && (stored.apiChoice !== 'gemini' || !geminiKey);

        if (preferGroq || (groqKey && !geminiKey)) {
            const groqRes = await transcribeWithGroqWhisper(groqKey, base64Audio, mimeType);
            if (!groqRes.error || !geminiKey) {
                return groqRes;
            }
            return await transcribeWithGemini(geminiKey, base64Audio, mimeType, stored.model);
        }

        if (geminiKey) {
            const geminiRes = await transcribeWithGemini(geminiKey, base64Audio, mimeType, stored.model);
            if (!geminiRes.error || !groqKey) {
                return geminiRes;
            }
            return await transcribeWithGroqWhisper(groqKey, base64Audio, mimeType);
        }

        // Fallback con apiKey genérica
        const detected = detectProviderFromKey(fallbackKey, stored.apiChoice);
        if (detected === 'groq') {
            return await transcribeWithGroqWhisper(fallbackKey, base64Audio, mimeType);
        }
        return await transcribeWithGemini(fallbackKey, base64Audio, mimeType, stored.model);
    } catch (error) {
        return {
            error: {
                message: `Error al transcribir el audio: ${error.message}`
            }
        };
    }
}

async function checkForUpdatesAutomatically() {
    try {
        const currentVer = chrome.runtime.getManifest().version;
        const resp = await fetch(
            'https://raw.githubusercontent.com/danamuro/asistente-ia-whatsapp-web/main/manifest.json',
            { cache: 'no-store' }
        );
        if (!resp.ok) return;
        const remoteData = await resp.json();
        const remoteVer = remoteData.version || '';

        function isNewer(vRemote, vLocal) {
            const pR = vRemote.split('.').map(Number);
            const pL = vLocal.split('.').map(Number);
            for (let i = 0; i < Math.max(pR.length, pL.length); i++) {
                const nR = pR[i] || 0;
                const nL = pL[i] || 0;
                if (nR > nL) return true;
                if (nR < nL) return false;
            }
            return false;
        }

        if (remoteVer && isNewer(remoteVer, currentVer)) {
            chrome.action.setBadgeText({ text: 'NEW' });
            chrome.action.setBadgeBackgroundColor({ color: '#00a884' });
            chrome.storage.local.set({
                hasUpdate: true,
                newVersion: remoteVer,
                downloadUrl: 'https://github.com/danamuro/asistente-ia-whatsapp-web/releases/latest'
            });
        } else {
            chrome.action.setBadgeText({ text: '' });
            chrome.storage.local.set({ hasUpdate: false });
        }
    } catch (_) {}
}

// Comprobar actualizaciones automáticamente al iniciar la extensión y periódicamente
checkForUpdatesAutomatically();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openOptionsPage') {
        chrome.runtime.openOptionsPage();
        sendResponse({ ok: true });
        return false;
    }

    if (request.action === 'testApiKey') {
        generateAIResponse(
            'Responde únicamente con: "Conexión exitosa y funcionando al 100%"',
            'Eres un asistente breve. No uses emojis.',
            request.apiKey,
            request.model,
            request.provider
        ).then((response) => {
            sendResponse(response);
        });
        return true;
    }

    if (request.message === 'sendChatToGpt') {
        generateAIResponse(request.prompt, request.systemInstruction)
            .then((response) => {
                if (sender && sender.tab && sender.tab.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        message: 'gptResponse',
                        response: response,
                        requestType: request.requestType || 'reply'
                    }).catch(() => {});
                }
                sendResponse(response);
            });
        return true;
    }

    if (request.message === 'transcribeAudio') {
        transcribeAudioResponse(request.base64Audio, request.mimeType)
            .then((response) => {
                sendResponse(response);
            });
        return true;
    }
});
