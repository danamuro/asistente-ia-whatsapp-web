'use strict';

let sendHistory = 'manual';
let historyCount = 10;
let globalMainNode = null;
let newFooterParagraph = null;
let globalSuggestionIconCol = null;
let globalGptButtonObject = null;
let globalToneSelect = null;
let globalCustomPromptInput = null;
let globalRewriteSelect = null;
let globalRewriteButton = null;
let delayTimer = null;
let lastChatSignature = '';
let lastActionWasRewrite = false;

const CS_PH_BOLD = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color:#00a884;"><circle cx="128" cy="128" r="96"/><polyline points="120 120 128 120 128 176 136 176"/><circle cx="126" cy="84" r="6" fill="currentColor"/></svg>`,
    sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color:#00a884;"><path d="M138.7,175.5l-19.2,52.1a8,8,0,0,1-15,0L85.3,175.5,33.2,156.3a8,8,0,0,1,0-15L85.3,122.1l19.2-52.1a8,8,0,0,1,15,0l19.2,52.1,52.1,19.2a8,8,0,0,1,0,15Z"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color:#d97706;"><circle cx="128" cy="128" r="96"/><line x1="128" y1="80" x2="128" y2="136"/><circle cx="128" cy="172" r="6" fill="currentColor"/></svg>`,
    spinner: `<svg class="gpt-wa-spinner-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color:#00a884;"><path d="M168,40.7a96,96,0,1,1-80,0"/></svg>`,
    waveform: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><line x1="48" y1="96" x2="48" y2="160"/><line x1="88" y1="40" x2="88" y2="216"/><line x1="128" y1="64" x2="128" y2="192"/><line x1="168" y1="88" x2="168" y2="168"/><line x1="208" y1="72" x2="208" y2="184"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="168 168 216 168 216 40 88 40 88 88"/><rect x="40" y="88" width="128" height="128"/></svg>`
};

// Caché en memoria y persistente de transcripciones por ID de mensaje para resistir recargas y el scroll virtualizado
const audioTranscriptsCache = new Map();
let fallbackAudioCounter = 0;

// Cargar transcripciones persistidas desde chrome.storage.local para no gastar tokens al recargar la pestaña
try {
    chrome.storage.local.get({ audioTranscripts: {} }, (data) => {
        if (data && data.audioTranscripts && typeof data.audioTranscripts === 'object') {
            Object.entries(data.audioTranscripts).forEach(([id, text]) => {
                if (id && text) {
                    audioTranscriptsCache.set(id, text);
                }
            });
            const mainNode = document.getElementById('main') || globalMainNode;
            if (mainNode) {
                scanAndInjectAudioButtons(mainNode);
            }
        }
    });
} catch (_) {}

function saveTranscriptToCache(messageId, transcriptText) {
    if (!messageId || !transcriptText) return;
    audioTranscriptsCache.set(messageId, transcriptText);

    try {
        chrome.storage.local.get({ audioTranscripts: {} }, (data) => {
            const transcripts = (data && data.audioTranscripts && typeof data.audioTranscripts === 'object')
                ? { ...data.audioTranscripts }
                : {};
            transcripts[messageId] = transcriptText;

            // Mantener máximo las últimas 300 transcripciones para optimizar espacio
            const keys = Object.keys(transcripts);
            if (keys.length > 300) {
                const toRemove = keys.slice(0, keys.length - 300);
                toRemove.forEach((k) => delete transcripts[k]);
            }
            chrome.storage.local.set({ audioTranscripts: transcripts });
        });
    } catch (_) {}
}

function readData() {
    try {
        chrome.storage.local.get({
            apiKey: '',
            geminiKey: '',
            groqKey: '',
            sendHistory: 'manual',
            historyCount: 10
        }, (result) => {
            sendHistory = result.sendHistory || 'manual';
            historyCount = Number(result.historyCount) || 10;
        });
    } catch (e) {
        console.error('Error leyendo configuración:', e);
    }
}

readData();

chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.sendHistory) {
        sendHistory = changes.sendHistory.newValue;
    }
    if (changes.historyCount) {
        historyCount = Number(changes.historyCount.newValue) || 10;
    }
});

async function copyToSendField(text, replaceExisting = true) {
    if (!text) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    try {
        const mainNode = document.getElementById('main') || globalMainNode;
        const textareaEl = getWhatsAppComposerElement(mainNode);
        if (!textareaEl) return;

        textareaEl.focus();
        await new Promise((resolve) => setTimeout(resolve, 20));

        const existingText = getTextWithEmojis(textareaEl).trim();

        if (replaceExisting && existingText.length > 0) {
            // Seleccionar los nodos de texto internos sin destruir los elementos <p> ni <span> de Lexical
            const selection = window.getSelection();
            const range = document.createRange();
            const walker = document.createTreeWalker(textareaEl, NodeFilter.SHOW_TEXT, null);
            const firstTextNode = walker.nextNode();
            let lastTextNode = firstTextNode;
            while (walker.nextNode()) {
                lastTextNode = walker.currentNode;
            }

            if (firstTextNode && lastTextNode) {
                range.setStart(firstTextNode, 0);
                range.setEnd(lastTextNode, lastTextNode.nodeValue.length);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                document.execCommand('selectAll', false, null);
            }

            document.dispatchEvent(new Event('selectionchange'));
            // Esperar a que Lexical sincronice su RangeSelection interna antes de borrar
            await new Promise((resolve) => setTimeout(resolve, 45));

            document.execCommand('delete', false, null);
            await new Promise((resolve) => setTimeout(resolve, 25));

            if (getTextWithEmojis(textareaEl).trim().length > 0) {
                document.execCommand('selectAll', false, null);
                document.dispatchEvent(new Event('selectionchange'));
                await new Promise((resolve) => setTimeout(resolve, 45));
                document.execCommand('delete', false, null);
                await new Promise((resolve) => setTimeout(resolve, 25));
            }
        }

        const inserted = document.execCommand('insertText', false, cleanText);
        if (!inserted) {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', cleanText);
            const pasteEvent = new ClipboardEvent('paste', {
                clipboardData: dataTransfer,
                bubbles: true,
                cancelable: true
            });
            textareaEl.dispatchEvent(pasteEvent);
        }
    } catch (e) {
        console.error('Error al insertar texto en WhatsApp:', e);
    }
}

function getToneInstruction(toneValue, customPromptText) {
    switch (toneValue) {
        case 'formal':
            return 'Usa un tono profesional, formal, cortés y bien estructurado.';
        case 'casual':
            return 'Usa un tono casual, cercano, amigable y natural.';
        case 'short':
            return 'Sé extremadamente breve y directo (máximo 1 oración corta).';
        case 'yes':
            return 'Responde afirmativamente (aceptando o confirmando de forma natural y amable).';
        case 'no':
            return 'Responde negativamente o rechazando amablemente con tacto y naturalidad.';
        case 'custom':
            return customPromptText
                ? `Sigue estrictamente esta instrucción para mi respuesta: "${customPromptText}".`
                : '';
        default:
            return '';
    }
}

async function createPrompt(lastIsMine, chatHistoryShort) {
    const mePrefix = 'Me: ';
    const promptPrefix1 =
        "You are an excellent chat-turn completer for WhatsApp. Your own turns in the provided chat-history are prefixed by 'Me: ', and the turns of others by '<integer>: '. In a one-on-one conversation the other person's turn is prefixed by '1: '. Always reply in the same language used in the conversation unless instructed otherwise. Output ONLY the message text to send, without quotes and without the 'Me:' prefix.";

    let promptCenter;
    if (lastIsMine) {
        promptCenter =
            'Complete the following chat by providing a follow-up message for my sequence. Do not react to yourself, just continue the thought, elaborate, or add a brief supplementary point without repeating the last message.';
    } else {
        promptCenter =
            'As "Me", give a natural reply completing the following chat conversation flow.';
    }

    const result = await chrome.storage.local.get({
        toneOfVoice: 'Usa mi propio estilo de escritura natural. Sé conciso y directo.'
    });

    const baseTone = result.toneOfVoice || 'Usa mi propio estilo de escritura natural. Sé conciso y directo.';
    const quickToneValue = globalToneSelect ? globalToneSelect.value : 'default';
    const customPromptText = globalCustomPromptInput ? globalCustomPromptInput.value.trim() : '';
    const extraTone = getToneInstruction(quickToneValue, customPromptText);

    return `${promptPrefix1}\n${promptCenter}\nStyle guide: ${baseTone} ${extraTone}\n\nChat history:\n${chatHistoryShort}\n\n${mePrefix}`;
}

function triggerEvent() {
    if (delayTimer) {
        clearTimeout(delayTimer);
    }
    delayTimer = setTimeout(() => {
        generateReplySuggestion();
    }, 120);
}

async function generateReplySuggestion() {
    const mainNode = document.getElementById('main') || globalMainNode;
    if (!mainNode || !newFooterParagraph) return;

    lastActionWasRewrite = false;
    const { chatHistoryShort, lastIsMine, messageCount } = parseHtml(mainNode, historyCount);

    if (messageCount === 0 && (!globalToneSelect || globalToneSelect.value !== 'custom')) {
        writeStatusHint(CS_PH_BOLD.info, 'No se detectaron mensajes recientes en este chat.');
        return;
    }

    const prompt = await createPrompt(lastIsMine, chatHistoryShort || '(Sin historial previo)');
    if (globalGptButtonObject) globalGptButtonObject.setBusy(true);
    writeTextToSuggestionField('', true);

    try {
        chrome.runtime.sendMessage({
            message: 'sendChatToGpt',
            prompt: prompt,
            requestType: 'reply'
        }, (response) => {
            if (chrome.runtime.lastError) {
                if (globalGptButtonObject) globalGptButtonObject.setBusy(false);
                writeStatusHint(CS_PH_BOLD.warning, 'Recarga la página de WhatsApp Web (F5) para reconectar la extensión.');
                return;
            }
            if (response) {
                handleAiResponse(response);
            }
        });
    } catch (e) {
        if (globalGptButtonObject) globalGptButtonObject.setBusy(false);
        writeStatusHint(CS_PH_BOLD.warning, 'Recarga la página de WhatsApp Web (F5) para reconectar la extensión.');
    }
}

async function handleRewriteClick() {
    const mainNode = document.getElementById('main') || globalMainNode;
    if (!mainNode || !newFooterParagraph) return;

    let sourceText = getComposerText(mainNode);
    let fromComposer = true;

    if (!sourceText) {
        const currentSuggestion = (newFooterParagraph.textContent || '').trim();
        if (
            currentSuggestion &&
            !newFooterParagraph.querySelector('.gpt-wa-suggestion-placeholder')
        ) {
            sourceText = currentSuggestion;
            fromComposer = false;
        }
    }

    if (!sourceText) {
        writeStatusHint(
            CS_PH_BOLD.info,
            'Escribe primero un borrador en la barra de WhatsApp (o genera una sugerencia) para mejorarlo o traducirlo.'
        );
        return;
    }

    lastActionWasRewrite = fromComposer;
    const action = globalRewriteSelect ? globalRewriteSelect.value : 'improve';

    let instruction = '';
    switch (action) {
        case 'improve':
            instruction = 'Mejora la redacción, ortografía y fluidez de este mensaje de WhatsApp manteniendo su idioma original y un tono natural. Devuelve ÚNICAMENTE el texto mejorado, sin comillas ni explicaciones.';
            break;
        case 'translate_en':
            instruction = 'Traduce este mensaje de WhatsApp al inglés de forma natural y fluida. Devuelve ÚNICAMENTE la traducción, sin comillas ni explicaciones.';
            break;
        case 'translate_es':
            instruction = 'Traduce este mensaje de WhatsApp al español de forma natural y fluida. Devuelve ÚNICAMENTE la traducción, sin comillas ni explicaciones.';
            break;
        case 'formal_rewrite':
            instruction = 'Reescribe este mensaje de WhatsApp en un tono profesional, cortés y formal manteniendo el mismo idioma. Devuelve ÚNICAMENTE el mensaje reescrito, sin comillas.';
            break;
        case 'shorter_rewrite':
            instruction = 'Haz que este mensaje de WhatsApp sea más corto, directo y conciso manteniendo su idea principal y su idioma. Devuelve ÚNICAMENTE el mensaje resumido, sin comillas.';
            break;
    }

    if (globalGptButtonObject) globalGptButtonObject.setBusy(true);
    writeTextToSuggestionField('', true);

    try {
        chrome.runtime.sendMessage({
            message: 'sendChatToGpt',
            systemInstruction: instruction,
            prompt: sourceText,
            requestType: 'rewrite'
        }, (response) => {
            if (chrome.runtime.lastError) {
                if (globalGptButtonObject) globalGptButtonObject.setBusy(false);
                writeStatusHint(CS_PH_BOLD.warning, 'Recarga la página de WhatsApp Web (F5) para reconectar la extensión.');
                return;
            }
            if (response) {
                handleAiResponse(response);
            }
        });
    } catch (e) {
        if (globalGptButtonObject) globalGptButtonObject.setBusy(false);
        writeStatusHint(CS_PH_BOLD.warning, 'Recarga la página de WhatsApp Web (F5) para reconectar la extensión.');
    }
}

function gptButtonClicked() {
    triggerEvent();
}

function maybeShowInitialHint() {
    chrome.storage.local.get({
        optionsHintShown: 0,
        apiKey: '',
        geminiKey: '',
        groqKey: '',
        hasUpdate: false,
        newVersion: '',
        downloadUrl: ''
    }, (result) => {
        if (!newFooterParagraph) return;
        const hasAnyKey = Boolean((result.apiKey || result.geminiKey || result.groqKey || '').trim());
        const count = Number(result.optionsHintShown) || 0;

        if (result.hasUpdate && result.newVersion) {
            writeStatusHint(
                CS_PH_BOLD.sparkle,
                `Nueva versión v${result.newVersion} disponible. <a href="${result.downloadUrl || 'https://github.com/danamuro/asistente-ia-whatsapp-web/releases/latest'}" target="_blank" style="color:#00a884; font-weight:600; text-decoration:underline; margin-left:4px;">Descargar actualización</a>`
            );
        } else if (!hasAnyKey) {
            writeStatusHint(
                CS_PH_BOLD.warning,
                'Haz clic en el icono de la extensión arriba en el navegador para configurar tu API Key gratuita.'
            );
        } else if (count < 3) {
            writeStatusHint(
                CS_PH_BOLD.sparkle,
                'Presiona <b>Generar IA</b> para sugerir respuesta, o escribe arriba y usa <b>Mejorar texto</b>.'
            );
            chrome.storage.local.set({ optionsHintShown: count + 1 });
        } else {
            writeStatusHint(
                CS_PH_BOLD.sparkle,
                'Listo para generar respuesta o mejorar tu mensaje…'
            );
        }
    });
}

function getActiveChatSignature(mainNode) {
    if (!mainNode) return '';
    const headerTitle = mainNode.querySelector('header span[dir="auto"], header [title]');
    const titleText = headerTitle ? (headerTitle.getAttribute('title') || headerTitle.textContent || '') : '';
    return titleText.trim();
}

function ensureGptBarMounted() {
    const mainNode = document.getElementById('main');
    if (!mainNode) return;

    const footer = mainNode.querySelector('footer:not(#gpt-wa-custom-bar)');
    if (!footer) return;

    globalMainNode = mainNode;
    const currentSignature = getActiveChatSignature(mainNode);
    const existingBar = document.getElementById('gpt-wa-custom-bar');

    if (!existingBar) {
        mountGptBar(footer, mainNode);
        lastChatSignature = currentSignature;
    } else if (currentSignature && currentSignature !== lastChatSignature) {
        lastChatSignature = currentSignature;
        lastActionWasRewrite = false;
        if (sendHistory === 'auto') {
            triggerEvent();
        } else {
            maybeShowInitialHint();
        }
    }

    scanAndInjectAudioButtons(mainNode);
}

function isVoiceMessageRow(rowEl) {
    if (!rowEl || rowEl.closest('#gpt-wa-custom-bar') || rowEl.closest('footer') || rowEl.closest('[data-testid="conversation-footer"]')) return false;

    // Asegurar que pertenezca al flujo de mensajes de chat (message-in, message-out, data-id de mensaje)
    const hasMessageClass =
        rowEl.classList.contains('message-in') ||
        rowEl.classList.contains('message-out') ||
        Boolean(rowEl.closest('.message-in, .message-out')) ||
        Boolean(rowEl.getAttribute('data-id'));
    if (!hasMessageClass) return false;

    // Descartar burbujas de video
    if (rowEl.querySelector('video, span[data-icon="media-play"], span[data-icon="video-pip"]')) {
        return false;
    }

    if (
        rowEl.querySelector(
            'span[data-icon="audio-play"], span[data-icon="audio-pause"], span[data-icon="audio-download"], span[data-icon="ptt-status"], [data-testid="audio-play"], [data-testid="ptt-play"], audio'
        )
    ) {
        return true;
    }

    const buttons = rowEl.querySelectorAll('button[aria-label]');
    for (const btn of buttons) {
        if (btn.closest('.gpt-wa-audio-transcribe-wrap')) continue;
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        if (
            label.includes('mensaje de voz') ||
            label.includes('voice message') ||
            ((label.includes('reproducir') || label.includes('play') || label.includes('pausar') || label.includes('pause')) &&
                rowEl.querySelector('input[type="range"], [role="slider"], canvas'))
        ) {
            return true;
        }
    }

    return false;
}

function getVoiceMessageId(rowEl) {
    if (!rowEl) return '';
    const existingAttr = rowEl.getAttribute('data-gpt-audio-id');
    if (existingAttr) return existingAttr;

    const dataIdNode = rowEl.hasAttribute('data-id')
        ? rowEl
        : rowEl.closest('[data-id]') || rowEl.querySelector('[data-id]');
    if (dataIdNode) {
        const id = dataIdNode.getAttribute('data-id') || '';
        if (id) {
            rowEl.setAttribute('data-gpt-audio-id', id);
            return id;
        }
    }

    fallbackAudioCounter += 1;
    const generatedId = `gpt-audio-msg-${fallbackAudioCounter}`;
    rowEl.setAttribute('data-gpt-audio-id', generatedId);
    return generatedId;
}

function findAudioInsertionTarget(rowEl, audioEl) {
    const playIcon = audioEl || rowEl.querySelector(
        'span[data-icon="audio-play"], span[data-icon="audio-pause"], span[data-icon="audio-download"], span[data-icon="ptt-status"], button[aria-label*="mensaje de voz" i], button[aria-label*="voice message" i], button[aria-label*="Reproducir" i], button[aria-label*="Play" i], audio'
    );

    if (playIcon) {
        const bubbleInner =
            playIcon.closest('.copyable-text') ||
            playIcon.closest('.message-in > div > div, .message-out > div > div') ||
            playIcon.closest('.message-in > div, .message-out > div') ||
            playIcon.closest('div[data-id] > div > div') ||
            playIcon.closest('div[data-id] > div') ||
            playIcon.closest('.message-in, .message-out');
        if (bubbleInner && bubbleInner !== rowEl) return bubbleInner;

        let p = playIcon.parentElement;
        for (let i = 0; i < 3 && p && p !== rowEl; i++) {
            if (p.parentElement && p.parentElement === rowEl) return p;
            p = p.parentElement;
        }
        if (p && p !== rowEl) return p;
    }

    const bubble = rowEl.querySelector('.message-in > div, .message-out > div, div[data-id] > div, .message-in, .message-out');
    return bubble || rowEl;
}

function requestAudioBlobFromPage(messageId) {
    return new Promise((resolve) => {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        let settled = false;

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            window.removeEventListener('gpt-wa-response-audio-blob', onResponse);
            resolve({
                ok: false,
                error: 'Tiempo de espera agotado al capturar el audio. Reproduce el audio un segundo e inténtalo de nuevo.'
            });
        }, 9000);

        function onResponse(e) {
            const detail = e.detail || {};
            if (detail.requestId !== requestId || settled) return;
            settled = true;
            clearTimeout(timeoutId);
            window.removeEventListener('gpt-wa-response-audio-blob', onResponse);
            resolve(detail);
        }

        window.addEventListener('gpt-wa-response-audio-blob', onResponse);
        window.dispatchEvent(
            new CustomEvent('gpt-wa-request-audio-blob', {
                detail: { requestId, messageId }
            })
        );
    });
}

function renderAudioTranscriptUI(rowEl, wrapEl, messageId, transcriptText, isError = false) {
    wrapEl.innerHTML = '';

    const box = document.createElement('div');
    box.className = isError
        ? 'gpt-wa-audio-transcript-box gpt-wa-audio-transcript-error'
        : 'gpt-wa-audio-transcript-box gpt-wa-audio-transcript-text selectable-text copyable-text';
    box.textContent = transcriptText;
    wrapEl.appendChild(box);

    const actionsRow = document.createElement('div');
    actionsRow.className = 'gpt-wa-audio-actions-row';

    if (!isError) {
        rowEl.setAttribute('data-gpt-transcript', transcriptText);
        saveTranscriptToCache(messageId, transcriptText);

        const replyBtn = document.createElement('button');
        replyBtn.type = 'button';
        replyBtn.className = 'gpt-wa-audio-mini-btn';
        replyBtn.innerHTML = `${CS_PH_BOLD.sparkle}<span>Responder con IA</span>`;
        replyBtn.title = 'Sugerir una respuesta a este audio en la barra inferior';
        replyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerEvent();
        });

        actionsRow.appendChild(replyBtn);
    } else {
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'gpt-wa-audio-btn';
        retryBtn.innerHTML = `${CS_PH_BOLD.waveform}<span>Reintentar transcripción</span>`;
        retryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleTranscribeAudioClick(rowEl, wrapEl, messageId);
        });
        actionsRow.appendChild(retryBtn);
    }

    wrapEl.appendChild(actionsRow);
}

async function handleTranscribeAudioClick(rowEl, wrapEl, messageId) {
    wrapEl.innerHTML = '';
    const loadingBtn = document.createElement('button');
    loadingBtn.type = 'button';
    loadingBtn.className = 'gpt-wa-audio-btn';
    loadingBtn.disabled = true;
    loadingBtn.innerHTML = `${CS_PH_BOLD.spinner}<span>Transcribiendo audio…</span>`;
    wrapEl.appendChild(loadingBtn);

    const blobResult = await requestAudioBlobFromPage(messageId);
    if (!blobResult || !blobResult.ok || !blobResult.base64) {
        renderAudioTranscriptUI(
            rowEl,
            wrapEl,
            messageId,
            (blobResult && blobResult.error) || 'No se pudo leer el audio. Reprodúcelo un instante y vuelve a intentar.',
            true
        );
        return;
    }

    try {
        chrome.runtime.sendMessage(
            {
                message: 'transcribeAudio',
                base64Audio: blobResult.base64,
                mimeType: blobResult.mimeType || 'audio/ogg'
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    renderAudioTranscriptUI(
                        rowEl,
                        wrapEl,
                        messageId,
                        'Recarga la página de WhatsApp Web (F5) para reconectar la extensión.',
                        true
                    );
                    return;
                }
                if (!response || response.error) {
                    renderAudioTranscriptUI(
                        rowEl,
                        wrapEl,
                        messageId,
                        response?.error?.message || 'Error al transcribir el audio con IA.',
                        true
                    );
                    return;
                }
                const cleanText = (response.text || '').trim();
                if (!cleanText) {
                    renderAudioTranscriptUI(
                        rowEl,
                        wrapEl,
                        messageId,
                        'No se detectó voz clara en este audio.',
                        true
                    );
                    return;
                }
                renderAudioTranscriptUI(rowEl, wrapEl, messageId, cleanText, false);
            }
        );
    } catch (_) {
        renderAudioTranscriptUI(
            rowEl,
            wrapEl,
            messageId,
            'Recarga la página de WhatsApp Web (F5) para reconectar la extensión.',
            true
        );
    }
}

function scanAndInjectAudioButtons(rootNode) {
    const mainNode = rootNode || document.getElementById('main') || globalMainNode;
    if (!mainNode) return;

    // Limpiar cualquier botón de transcripción que se haya colado por error en el footer o en la barra de WhatsApp
    document.querySelectorAll('footer .gpt-wa-audio-transcribe-wrap, #gpt-wa-custom-bar .gpt-wa-audio-transcribe-wrap, [data-testid="conversation-footer"] .gpt-wa-audio-transcribe-wrap, [data-testid="compose-box"] .gpt-wa-audio-transcribe-wrap').forEach((el) => {
        el.remove();
    });

    // Buscar directamente todos los controles e iconos de audio en el chat de WhatsApp Web
    const audioIcons = mainNode.querySelectorAll(
        'span[data-icon="audio-play"], span[data-icon="audio-pause"], span[data-icon="audio-download"], span[data-icon="ptt-status"], button[data-testid="audio-play"], button[data-testid="ptt-play"], button[aria-label*="mensaje de voz" i], button[aria-label*="voice message" i], button[aria-label*="Reproducir" i], button[aria-label*="Play" i], audio'
    );

    audioIcons.forEach((iconEl) => {
        // Descartar ABSOLUTAMENTE cualquier elemento dentro del footer, composer o barra de la extensión
        if (
            iconEl.closest('footer') ||
            iconEl.closest('#gpt-wa-custom-bar') ||
            iconEl.closest('[data-testid="conversation-footer"]') ||
            iconEl.closest('[data-testid="compose-box"]') ||
            iconEl.closest('.gpt-wa-audio-transcribe-wrap')
        ) {
            return;
        }

        // Subir al mensaje contenedor exclusivo de los mensajes del chat
        const rowEl = iconEl.closest('[data-id], div[role="row"], .message-in, .message-out');
        if (!rowEl) return;
        if (
            rowEl.closest('footer') ||
            rowEl.closest('#gpt-wa-custom-bar') ||
            rowEl.closest('[data-testid="conversation-footer"]') ||
            rowEl.closest('[data-testid="compose-box"]')
        ) {
            return;
        }

        // Validar que realmente sea una fila de nota de voz del chat
        if (!isVoiceMessageRow(rowEl)) return;

        // Encontrar la burbuja de inserción interna
        const targetContainer = findAudioInsertionTarget(rowEl, iconEl);
        if (!targetContainer) return;

        const existingWrap = targetContainer.querySelector('.gpt-wa-audio-transcribe-wrap') || rowEl.querySelector('.gpt-wa-audio-transcribe-wrap');
        const messageId = getVoiceMessageId(rowEl);

        if (existingWrap) {
            if (messageId && audioTranscriptsCache.has(messageId) && !existingWrap.querySelector('.gpt-wa-audio-transcript-box')) {
                const cachedText = audioTranscriptsCache.get(messageId);
                renderAudioTranscriptUI(rowEl, existingWrap, messageId, cachedText, false);
            }
            return;
        }

        const wrap = document.createElement('div');
        wrap.className = 'gpt-wa-audio-transcribe-wrap';

        if (messageId && audioTranscriptsCache.has(messageId)) {
            const cachedText = audioTranscriptsCache.get(messageId);
            renderAudioTranscriptUI(rowEl, wrap, messageId, cachedText, false);
        } else {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'gpt-wa-audio-btn';
            btn.innerHTML = `${CS_PH_BOLD.waveform}<span>Transcribir audio</span>`;
            btn.title = 'Transcribir esta nota de voz a texto con IA gratis (Groq Whisper / Gemini)';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleTranscribeAudioClick(rowEl, wrap, messageId);
            });
            wrap.appendChild(btn);
        }

        targetContainer.appendChild(wrap);
    });
}

function mountGptBar(footer, mainNode) {
    readData();
    const {
        suggestionParagraph,
        suggestionIconCol,
        gptButtonObject,
        toneSelect,
        customPromptInput,
        rewriteSelect,
        rewriteButton,
        copyButton,
        clearButton
    } = createGptFooter(footer, mainNode);

    globalGptButtonObject = gptButtonObject;
    newFooterParagraph = suggestionParagraph;
    globalSuggestionIconCol = suggestionIconCol;
    globalToneSelect = toneSelect;
    globalCustomPromptInput = customPromptInput;
    globalRewriteSelect = rewriteSelect;
    globalRewriteButton = rewriteButton;

    maybeShowInitialHint();

    copyButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    copyButton.addEventListener('click', () => {
        const text = (newFooterParagraph.textContent || '').trim();
        if (!text || newFooterParagraph.querySelector('.gpt-wa-suggestion-placeholder')) return;
        copyToSendField(text, true);
    });

    if (clearButton) {
        clearButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        clearButton.addEventListener('click', () => {
            newFooterParagraph.innerHTML = '';
            maybeShowInitialHint();
        });
    }

    gptButtonObject.gptButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    gptButtonObject.gptButton.addEventListener('click', () => {
        gptButtonClicked();
    });

    customPromptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            gptButtonClicked();
        }
    });

    rewriteButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    rewriteButton.addEventListener('click', () => {
        handleRewriteClick();
    });

    toneSelect.addEventListener('change', () => {
        // Solo actualizar estado o abrir personalizado, SIN llamar a la API automáticamente
        if (toneSelect.value === 'custom') {
            if (globalCustomPromptInput) globalCustomPromptInput.focus();
        }
    });

    rewriteSelect.addEventListener('change', () => {
        // Solo actualizar acción elegida en el botón, sin llamar a la API automáticamente
    });

    if (sendHistory === 'auto') {
        triggerEvent();
    }
}

const observer = new MutationObserver((mutations) => {
    let shouldCheckBar = false;
    let newRowAdded = false;

    for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (const addedNode of mutation.addedNodes) {
                if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
                if (addedNode.id === 'gpt-wa-custom-bar' || addedNode.closest('#gpt-wa-custom-bar')) continue;

                if (
                    addedNode.id === 'main' ||
                    addedNode.tagName === 'FOOTER' ||
                    (addedNode.querySelector && (addedNode.querySelector('#main') || addedNode.querySelector('footer')))
                ) {
                    shouldCheckBar = true;
                }

                if (
                    addedNode.getAttribute('role') === 'row' ||
                    addedNode.classList.contains('message-in') ||
                    addedNode.classList.contains('message-out') ||
                    (addedNode.querySelector && addedNode.querySelector('.message-in, .message-out'))
                ) {
                    newRowAdded = true;
                }
            }
        }
    }

    if (shouldCheckBar) {
        ensureGptBarMounted();
    }
    if (newRowAdded) {
        scanAndInjectAudioButtons();
    }

    if (newRowAdded && sendHistory === 'auto') {
        triggerEvent();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

setInterval(ensureGptBarMounted, 1000);
ensureGptBarMounted();

function updateSuggestionBoxUI({ iconHtml = '', text = '', isHtml = false }) {
    if (globalSuggestionIconCol) {
        globalSuggestionIconCol.innerHTML = iconHtml || '';
    }
    if (newFooterParagraph) {
        newFooterParagraph.setAttribute('contenteditable', 'false');
        if (isHtml) {
            newFooterParagraph.innerHTML = text;
        } else {
            newFooterParagraph.textContent = text;
        }
        if (newFooterParagraph.parentElement) {
            newFooterParagraph.parentElement.scrollTop = 0;
        }
    }
}

function writeStatusHint(iconSvg, htmlMessage) {
    updateSuggestionBoxUI({
        iconHtml: iconSvg,
        text: `<span class="gpt-wa-suggestion-placeholder">${htmlMessage}</span>`,
        isHtml: true
    });
}

function writeTextToSuggestionField(response, isLoading = false) {
    if (isLoading) {
        updateSuggestionBoxUI({
            iconHtml: CS_PH_BOLD.spinner,
            text: '<span class="gpt-wa-suggestion-placeholder">Generando respuesta con IA…</span>',
            isHtml: true
        });
    } else {
        updateSuggestionBoxUI({
            iconHtml: CS_PH_BOLD.sparkle,
            text: response,
            isHtml: false
        });
    }
}

function handleAiResponse(response) {
    if (globalGptButtonObject) {
        globalGptButtonObject.setBusy(false);
    }
    if (!response) {
        writeStatusHint(CS_PH_BOLD.warning, 'No se recibió respuesta de la IA. Comprueba tu conexión o API Key.');
        return;
    }
    if (response.error) {
        writeStatusHint(CS_PH_BOLD.warning, response.error.message || 'Error al comunicarse con la IA.');
        return;
    }
    if (typeof response.text === 'string') {
        const clean = response.text
            .replace(/^Me:\s*/i, '')
            .replace(/^["«]|["»]$/g, '')
            .trim();
        writeTextToSuggestionField(clean, false);
    }
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.message === 'gptResponse') {
        handleAiResponse(request.response);
    }
});
