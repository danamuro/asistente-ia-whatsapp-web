'use strict';

class LinkedSet {
    constructor() {
        this.set = new Set();
        this.array = [];
    }

    add(value) {
        if (!this.set.has(value)) {
            this.set.add(value);
            this.array.push(value);
        }
    }

    getPosition(value) {
        return this.array.indexOf(value);
    }
}

function getTextWithEmojis(element) {
    if (!element) return '';
    let result = '';

    for (const childNode of element.childNodes) {
        if (childNode.nodeType === Node.TEXT_NODE) {
            result += childNode.textContent;
        } else if (childNode.nodeType === Node.ELEMENT_NODE) {
            if (childNode.tagName === 'IMG') {
                const emoji = childNode.getAttribute('data-plain-text') || childNode.getAttribute('alt') || '';
                result += emoji;
            } else if (childNode.tagName === 'BR') {
                result += '\n';
            } else {
                result += getTextWithEmojis(childNode);
            }
        }
    }

    return result;
}

function isOutgoingMessage(el, mainNode, activeChatTitle = '') {
    if (!el) return false;
    if (el.classList && el.classList.contains('message-out')) return true;
    if (el.closest && el.closest('.message-out')) return true;
    if (el.querySelector && el.querySelector('.message-out')) return true;

    if (el.classList && el.classList.contains('message-in')) return false;
    if (el.closest && el.closest('.message-in')) return false;
    if (el.querySelector && el.querySelector('.message-in')) return false;

    // En WhatsApp Web los mensajes propios tienen data-id="true_..."
    const dataIdNode = (el.hasAttribute && el.hasAttribute('data-id'))
        ? el
        : (el.closest && el.closest('[data-id]')) || (el.querySelector && el.querySelector('[data-id]'));
    if (dataIdNode) {
        const dataId = dataIdNode.getAttribute('data-id') || '';
        if (dataId.startsWith('true_') || dataId.includes('_true_')) return true;
        if (dataId.startsWith('false_') || dataId.includes('_false_')) return false;
    }

    // Los iconos de check de envío/entrega/lectura solo existen en mensajes enviados por el propio usuario
    if (
        el.querySelector &&
        el.querySelector(
            'span[data-icon="msg-dblcheck"], span[data-icon="msg-check"], span[data-icon="msg-time"], span[data-icon="msg-wait"], span[data-icon^="status-dblcheck"], span[data-icon^="status-check"], span[data-icon^="status-time"], [data-testid="msg-dblcheck"], [data-testid="msg-check"], [data-testid="msg-time"], span[aria-label*="Entregado" i], span[aria-label*="Leído" i], span[aria-label*="Enviado" i], span[aria-label*="Delivered" i], span[aria-label*="Read" i], span[aria-label*="Sent" i]'
        )
    ) {
        return true;
    }

    // Verificar etiqueta de autor en data-pre-plain-text
    const prePlainNode = (el.hasAttribute && el.hasAttribute('data-pre-plain-text'))
        ? el
        : (el.querySelector && el.querySelector('[data-pre-plain-text]'));
    if (prePlainNode) {
        const messageLabel = prePlainNode.getAttribute('data-pre-plain-text') || '';
        const senderName = messageLabel.replace(/\[.*?\]\s*/, '').replace(/:\s*$/, '').trim();
        if (senderName) {
            const lowerSender = senderName.toLowerCase();
            if (lowerSender === 'tú' || lowerSender === 'tu' || lowerSender === 'you') {
                return true;
            }
            if (activeChatTitle && lowerSender === activeChatTitle.toLowerCase()) {
                return false;
            }
        }
    }

    // Fallback geométrico: en WhatsApp Web las burbujas propias están alineadas a la derecha del panel #main
    try {
        const refMain = mainNode || document.getElementById('main');
        const bubbleEl =
            (el.querySelector &&
                el.querySelector(
                    '[data-pre-plain-text], .copyable-text:not(.gpt-wa-audio-transcript-box), .selectable-text:not(.gpt-wa-audio-transcript-box), [role="slider"], input[type="range"], audio'
                )) ||
            el;
        if (refMain && bubbleEl && bubbleEl.getBoundingClientRect) {
            const mainRect = refMain.getBoundingClientRect();
            const bubbleRect = bubbleEl.getBoundingClientRect();
            if (mainRect.width > 100 && bubbleRect.width > 0) {
                const leftGap = bubbleRect.left - mainRect.left;
                const rightGap = mainRect.right - bubbleRect.right;
                if (leftGap > rightGap + 25) return true;
                if (rightGap > leftGap + 25) return false;
            }
        }
    } catch (_) {}

    return false;
}

function isQuotedMessageElement(el) {
    if (!el || !el.closest) return false;
    return Boolean(
        el.closest(
            '.quoted-mention, [data-testid="quoted-message"], [aria-label*="Mensaje citado" i], [aria-label*="Quoted message" i]'
        )
    );
}

function parseHtml(mainNode, maxMessages = 10) {
    if (!mainNode) {
        return { chatHistoryShort: '', lastIsMine: false, messageCount: 0, lastMessageText: '' };
    }

    const headerTitleEl = mainNode.querySelector('header span[dir="auto"], header [title]');
    const activeChatTitle = headerTitleEl
        ? (headerTitleEl.getAttribute('title') || headerTitleEl.textContent || '').trim()
        : '';

    const chatHistory = [];
    let lastIsMine = false;
    let lastMessageText = '';

    // Buscar contenedores de mensajes con soporte para versiones actuales y nuevas de WhatsApp Web
    let msgContainers = Array.from(
        mainNode.querySelectorAll('.message-out, .message-in, div[data-id^="true_"], div[data-id^="false_"]')
    ).filter((row) => !row.closest('#gpt-wa-custom-bar') && !row.closest('footer') && !row.closest('header'));

    if (msgContainers.length === 0) {
        msgContainers = Array.from(mainNode.querySelectorAll('div[role="row"], div[data-id]')).filter((row) => {
            // Excluir nuestra propia barra, header, footer o elementos vacíos
            if (row.closest('#gpt-wa-custom-bar') || row.closest('footer') || row.closest('header')) return false;
            return (
                row.querySelector(
                    '.selectable-text, .copyable-text, [data-pre-plain-text], .gpt-wa-audio-transcript-text, [data-gpt-transcript]'
                ) !== null
            );
        });
    }

    // Deduplicar contenedores anidados (ej. div[data-id^="true_"] que envuelve a .message-out)
    msgContainers = msgContainers.filter(
        (el, idx, arr) => !arr.some((other, otherIdx) => otherIdx !== idx && other.contains(el))
    );

    msgContainers.forEach((container) => {
        if (container.closest('#gpt-wa-custom-bar')) return;

        const outgoing = isOutgoingMessage(container, mainNode, activeChatTitle);
        const prefix = outgoing ? '[YO]: ' : '[CONTACTO]: ';

        const prePlainNode = container.hasAttribute('data-pre-plain-text')
            ? container
            : container.querySelector('[data-pre-plain-text]');

        // Si es un mensaje de voz ya transcrito por la extensión, incluirlo en el historial de contexto
        const transcriptNode = container.querySelector('.gpt-wa-audio-transcript-text');
        const transcriptAttr = container.getAttribute('data-gpt-transcript') || (transcriptNode ? transcriptNode.textContent : '');
        if (transcriptAttr && transcriptAttr.trim().length > 0) {
            const cleanAudioText = transcriptAttr.trim();
            chatHistory.push({
                line: `${prefix}[Audio]: ${cleanAudioText}`,
                outgoing,
                text: cleanAudioText
            });
            return;
        }

        // Extraer el texto del mensaje evitando duplicar citas (mensajes citados)
        let textElement = null;
        if (prePlainNode) {
            const innerSelectables = Array.from(
                prePlainNode.querySelectorAll('.selectable-text.copyable-text, .selectable-text')
            ).filter((el) => !el.closest('.gpt-wa-audio-transcribe-wrap') && !isQuotedMessageElement(el));
            textElement = innerSelectables.length > 0 ? innerSelectables[innerSelectables.length - 1] : prePlainNode;
        } else {
            const selectables = Array.from(
                container.querySelectorAll('.selectable-text.copyable-text, .selectable-text')
            ).filter((el) => !el.closest('.gpt-wa-audio-transcribe-wrap') && !isQuotedMessageElement(el));
            if (selectables.length > 0) {
                textElement = selectables[selectables.length - 1];
            }
        }

        if (textElement) {
            const messageContent = getTextWithEmojis(textElement).trim();
            if (messageContent.length > 0) {
                chatHistory.push({
                    line: prefix + messageContent,
                    outgoing,
                    text: messageContent
                });
            }
        }
    });

    const recentMessages = chatHistory.slice(-maxMessages);
    if (recentMessages.length > 0) {
        const lastEntry = recentMessages[recentMessages.length - 1];
        lastIsMine = lastEntry.outgoing;
        lastMessageText = lastEntry.text;
    }

    const chatHistoryShortAsString = recentMessages.map((item) => item.line).join('\n\n');
    return {
        chatHistoryShort: chatHistoryShortAsString,
        lastIsMine: lastIsMine,
        messageCount: recentMessages.length,
        lastMessageText: lastMessageText
    };
}

function getWhatsAppComposerElement(mainNode) {
    const liveMain = mainNode && mainNode.isConnected ? mainNode : (document.getElementById('main') || document);
    const footer = liveMain.querySelector('footer:not(#gpt-wa-custom-bar)') || liveMain;

    // Buscar el editor Lexical de WhatsApp (excluyendo nuestra barra de IA y el header)
    const candidates = footer.querySelectorAll(
        'div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][role="textbox"], div[contenteditable="true"][data-tab], .lexical-rich-text-input div[contenteditable="true"], div[contenteditable="true"]'
    );
    for (const el of candidates) {
        if (!el.closest('#gpt-wa-custom-bar') && !el.closest('header')) {
            return el;
        }
    }
    return null;
}

function getComposerText(mainNode) {
    const composer = getWhatsAppComposerElement(mainNode);
    if (!composer) return '';
    return getTextWithEmojis(composer).trim();
}
