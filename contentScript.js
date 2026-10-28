'use strict';

let sendHistory = 'manual';
let historyCount = 10;
let globalMainNode = null;
let newFooterParagraph = null;
let globalGptButtonObject = null;
let globalToneSelect = null;
let globalCustomPromptInput = null;
let globalRewriteSelect = null;
let globalRewriteButton = null;
let delayTimer = null;
let lastChatSignature = '';
let lastActionWasRewrite = false;

const CS_PH_BOLD = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px; color:#00a884;"><circle cx="128" cy="128" r="96"/><polyline points="120 120 128 120 128 176 136 176"/><circle cx="126" cy="84" r="6" fill="currentColor"/></svg>`,
    sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:3px; color:#00a884;"><path d="M138.7,175.5l-19.2,52.1a8,8,0,0,1-15,0L85.3,175.5,33.2,156.3a8,8,0,0,1,0-15L85.3,122.1l19.2-52.1a8,8,0,0,1,15,0l19.2,52.1,52.1,19.2a8,8,0,0,1,0,15Z"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px; margin-right:4px; color:#d97706;"><circle cx="128" cy="128" r="96"/><line x1="128" y1="80" x2="128" y2="136"/><circle cx="128" cy="172" r="6" fill="currentColor"/></svg>`,
    spinner: `<svg class="gpt-wa-spinner-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"><path d="M168,40.7a96,96,0,1,1-80,0"/></svg>`
};

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

async function copyToSendField(text, replaceExisting = false) {
    if (!text) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    try {
        const textareaEl = getWhatsAppComposerElement(globalMainNode);
        if (!textareaEl) return;

        textareaEl.focus();

        if (replaceExisting) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(textareaEl);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('delete', false, null);
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
        });
    } catch (e) {
        if (globalGptButtonObject) globalGptButtonObject.setBusy(false);
        writeStatusHint(CS_PH_BOLD.warning, 'Recarga la página de WhatsApp Web para reconectar la extensión.');
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

    chrome.runtime.sendMessage({
        message: 'sendChatToGpt',
        systemInstruction: instruction,
        prompt: sourceText,
        requestType: 'rewrite'
    });
}

function gptButtonClicked() {
    triggerEvent();
}

function writeStatusHint(iconSvg, htmlMessage) {
    if (!newFooterParagraph) return;
    newFooterParagraph.innerHTML = `<span class="gpt-wa-suggestion-placeholder">${iconSvg}<span>${htmlMessage}</span></span>`;
    if (newFooterParagraph.parentElement) {
        newFooterParagraph.parentElement.scrollTop = 0;
    }
}

function maybeShowInitialHint() {
    chrome.storage.local.get({
        optionsHintShown: 0,
        apiKey: '',
        geminiKey: '',
        groqKey: ''
    }, (result) => {
        if (!newFooterParagraph) return;
        const hasAnyKey = Boolean((result.apiKey || result.geminiKey || result.groqKey || '').trim());
        const count = Number(result.optionsHintShown) || 0;
        if (!hasAnyKey) {
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
                'Listo para generar respuesta o mejorar tu mensaje...'
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
}

function mountGptBar(footer, mainNode) {
    readData();
    const {
        suggestionParagraph,
        gptButtonObject,
        toneSelect,
        customPromptInput,
        rewriteSelect,
        rewriteButton,
        copyButton
    } = createGptFooter(footer, mainNode);

    globalGptButtonObject = gptButtonObject;
    newFooterParagraph = suggestionParagraph;
    globalToneSelect = toneSelect;
    globalCustomPromptInput = customPromptInput;
    globalRewriteSelect = rewriteSelect;
    globalRewriteButton = rewriteButton;

    maybeShowInitialHint();

    copyButton.addEventListener('click', () => {
        const text = (newFooterParagraph.textContent || '').trim();
        if (!text || newFooterParagraph.querySelector('.gpt-wa-suggestion-placeholder')) return;
        copyToSendField(text, lastActionWasRewrite);
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

    rewriteButton.addEventListener('click', () => {
        handleRewriteClick();
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

    if (newRowAdded && sendHistory === 'auto') {
        triggerEvent();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

setInterval(ensureGptBarMounted, 900);
ensureGptBarMounted();

function writeTextToSuggestionField(response, isLoading = false) {
    if (!newFooterParagraph) return;
    try {
        if (isLoading) {
            newFooterParagraph.innerHTML = `
                <div class="gpt-wa-spinner-wrap">
                    ${CS_PH_BOLD.spinner}
                    <span>Generando respuesta con IA...</span>
                </div>
            `;
        } else {
            newFooterParagraph.textContent = response;
            if (newFooterParagraph.parentElement) {
                newFooterParagraph.parentElement.scrollTop = 0;
            }
        }
    } catch (e) {
        console.error(e);
    }
}

chrome.runtime.onMessage.addListener((request) => {
    if (request.message === 'gptResponse') {
        const response = request.response;
        if (globalGptButtonObject) {
            globalGptButtonObject.setBusy(false);
        }
        if (response && response.error) {
            writeStatusHint(CS_PH_BOLD.warning, response.error.message);
            return;
        }
        if (response && typeof response.text === 'string') {
            const clean = response.text
                .replace(/^Me:\s*/i, '')
                .replace(/^["«]|["»]$/g, '')
                .trim();
            writeTextToSuggestionField(clean, false);
        }
    }
});
