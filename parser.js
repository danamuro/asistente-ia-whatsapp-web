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

function isOutgoingMessage(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains('message-out')) return true;
    if (el.closest && el.closest('.message-out')) return true;
    if (el.querySelector && el.querySelector('.message-out')) return true;

    // Fallback: en WhatsApp Web los mensajes propios tienen data-id="true_..."
    const dataIdNode = (el.hasAttribute && el.hasAttribute('data-id'))
        ? el
        : (el.closest && el.closest('[data-id]')) || (el.querySelector && el.querySelector('[data-id]'));
    if (dataIdNode) {
        const dataId = dataIdNode.getAttribute('data-id') || '';
        if (dataId.startsWith('true_')) return true;
        if (dataId.startsWith('false_')) return false;
    }
    return false;
}

function parseHtml(mainNode, maxMessages = 10) {
    if (!mainNode) {
        return { chatHistoryShort: '', lastIsMine: false, messageCount: 0 };
    }

    const chatHistory = [];
    const linkedSet = new LinkedSet();

    // Buscar contenedores de mensajes con soporte para versiones actuales y nuevas de WhatsApp Web
    let msgContainers = Array.from(mainNode.querySelectorAll('.message-out, .message-in'));
    if (msgContainers.length === 0) {
        msgContainers = Array.from(mainNode.querySelectorAll('div[role="row"], div[data-id]')).filter((row) => {
            // Excluir nuestra propia barra o elementos vacíos
            if (row.closest('#gpt-wa-custom-bar')) return false;
            return row.querySelector('.selectable-text, .copyable-text, [data-pre-plain-text]') !== null;
        });
    }

    msgContainers = msgContainers.slice(-maxMessages);

    msgContainers.forEach((container) => {
        if (container.closest('#gpt-wa-custom-bar')) return;

        const outgoing = isOutgoingMessage(container);
        let prefix = outgoing ? 'Me: ' : '1: ';

        const prePlainNode = container.hasAttribute('data-pre-plain-text')
            ? container
            : container.querySelector('[data-pre-plain-text]');

        if (prePlainNode && !outgoing) {
            const messageLabel = prePlainNode.getAttribute('data-pre-plain-text') || '';
            const contactName = messageLabel.replace(/\[.*?\]\s*/, '').replace(/:\s*$/, '').trim();
            if (contactName) {
                linkedSet.add(contactName);
                const contactNumber = linkedSet.getPosition(contactName) + 1;
                prefix = `${contactNumber}: `;
            }
        }

        // Extraer el texto del mensaje evitando duplicar citas
        let textElement = null;
        if (prePlainNode) {
            textElement = prePlainNode.querySelector('.selectable-text.copyable-text, .selectable-text') || prePlainNode;
        } else {
            const selectables = container.querySelectorAll('.selectable-text.copyable-text, .selectable-text');
            if (selectables.length > 0) {
                textElement = selectables[selectables.length - 1];
            }
        }

        if (textElement) {
            const messageContent = getTextWithEmojis(textElement).trim();
            if (messageContent.length > 0) {
                chatHistory.push(prefix + messageContent);
            }
        }
    });

    let lastIsMine = false;
    if (chatHistory.length > 0) {
        const lastExpression = chatHistory[chatHistory.length - 1];
        lastIsMine = lastExpression.startsWith('Me:');
    }

    const chatHistoryShortAsString = chatHistory.join('\n\n');
    return {
        chatHistoryShort: chatHistoryShortAsString,
        lastIsMine: lastIsMine,
        messageCount: chatHistory.length
    };
}

function getWhatsAppComposerElement(mainNode) {
    const root = mainNode || document.getElementById('main') || document;
    const footer = root.querySelector('footer:not(#gpt-wa-custom-bar)') || root;

    // Buscar el editor Lexical de WhatsApp (excluyendo nuestra barra de IA)
    const candidates = footer.querySelectorAll(
        'div[contenteditable="true"][role="textbox"], div[contenteditable="true"][data-tab], .lexical-rich-text-input div[contenteditable="true"], div[contenteditable="true"]'
    );
    for (const el of candidates) {
        if (!el.closest('#gpt-wa-custom-bar')) {
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
