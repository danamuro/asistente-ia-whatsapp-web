'use strict';

function detectProviderFromKey(apiKey, chosenProvider) {
    if (!apiKey) return chosenProvider || 'gemini';
    if (apiKey.startsWith('AIza')) return 'gemini';
    if (apiKey.startsWith('gsk_')) return 'groq';
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
        const resp = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
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
        const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
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
                    !n.includes('1.0') &&
                    !n.includes('1.5')
                );
            });

        const priority = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-2.5-flash-lite',
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
            'gemini-2.0-flash'
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
                        message: 'Tu API Key de Google Gemini no es válida. Verifica que empiece por AIza...'
                    }
                };
            }
        }
    }

    return {
        error: {
            message: `Error de Google Gemini (${lastStatus}): ${lastErrorMsg}`
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
            'llama-3.3-70b-versatile',
            'meta-llama/llama-4-scout-17b-16e-instruct',
            'meta-llama/llama-4-maverick-17b-128e-instruct',
            'openai/gpt-oss-120b',
            'openai/gpt-oss-20b',
            'qwen/qwen3-32b'
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
                        message: 'Tu API Key de Groq no es válida. Verifica que empiece por gsk_...'
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
        if (overrideKey !== undefined) {
            activeKey = overrideKey.trim();
        } else if (chosenProvider === 'gemini') {
            activeKey = (stored.geminiKey || stored.apiKey || '').trim();
        } else {
            activeKey = (stored.groqKey || stored.apiKey || '').trim();
        }

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
});
