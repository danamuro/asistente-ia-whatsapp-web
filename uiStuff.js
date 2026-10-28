'use strict';

// Librería de iconos vectoriales Phosphor Bold (256x256, stroke-width="24", round caps/joins)
function phBoldSvg(innerElements, size = 14, extraClass = '') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" class="${extraClass}" style="flex-shrink:0;">${innerElements}</svg>`;
}

const PH_BOLD_ICONS = {
    sparkle: phBoldSvg(
        '<path d="M138.7,175.5l-19.2,52.1a8,8,0,0,1-15,0L85.3,175.5,33.2,156.3a8,8,0,0,1,0-15L85.3,122.1l19.2-52.1a8,8,0,0,1,15,0l19.2,52.1,52.1,19.2a8,8,0,0,1,0,15Z"/><line x1="176" y1="16" x2="176" y2="64"/><line x1="200" y1="40" x2="152" y2="40"/><line x1="224" y1="72" x2="224" y2="104"/><line x1="240" y1="88" x2="208" y2="88"/>',
        15
    ),
    target: phBoldSvg(
        '<circle cx="128" cy="128" r="96"/><circle cx="128" cy="128" r="56"/><circle cx="128" cy="128" r="16"/>',
        13
    ),
    briefcase: phBoldSvg(
        '<rect x="32" y="64" width="192" height="144" rx="8"/><path d="M168,64V48a16,16,0,0,0-16-16H104A16,16,0,0,0,88,48V64"/><path d="M32,120H224"/>',
        13
    ),
    smiley: phBoldSvg(
        '<circle cx="128" cy="128" r="96"/><path d="M168,152c-8.3,14.3-22.2,24-40,24s-31.7-9.7-40-24"/><circle cx="92" cy="108" r="6" fill="currentColor"/><circle cx="164" cy="108" r="6" fill="currentColor"/>',
        13
    ),
    lightning: phBoldSvg(
        '<polygon points="160 16 144 96 208 120 96 240 112 160 48 136 160 16"/>',
        13
    ),
    thumbsUp: phBoldSvg(
        '<path d="M32,104H80a0,0,0,0,1,0,0V208a0,0,0,0,1,0,0H32a8,8,0,0,1-8-8V112A8,8,0,0,1,32,104Z"/><path d="M80,104l40-80a32,32,0,0,1,32,32V80h56a16,16,0,0,1,15.8,18.6l-12,88A16,16,0,0,1,196,200H80"/>',
        13
    ),
    thumbsDown: phBoldSvg(
        '<path d="M32,48H80a0,0,0,0,1,0,0V152a0,0,0,0,1,0,0H32a8,8,0,0,1-8-8V56A8,8,0,0,1,32,48Z"/><path d="M80,152l40,80a32,32,0,0,0,32-32V176h56a16,16,0,0,0,15.8-18.6l-12-88A16,16,0,0,0,196,56H80"/>',
        13
    ),
    pencil: phBoldSvg(
        '<path d="M92.7,216H48a8,8,0,0,1-8-8V163.3a7.9,7.9,0,0,1,2.3-5.6l120-120a8,8,0,0,1,11.4,0l44.6,44.6a8,8,0,0,1,0,11.4l-120,120A7.9,7.9,0,0,1,92.7,216Z"/><line x1="136" y1="64" x2="192" y2="120"/>',
        13
    ),
    magicWand: phBoldSvg(
        '<line x1="216" y1="128" x2="216" y2="176"/><line x1="192" y1="152" x2="240" y2="152"/><line x1="80" y1="40" x2="80" y2="88"/><line x1="56" y1="64" x2="104" y2="64"/><line x1="168" y1="184" x2="168" y2="216"/><line x1="152" y1="200" x2="184" y2="200"/><rect x="38.1" y="102.6" width="179.8" height="50.91" rx="8" transform="translate(-53 128) rotate(-45)"/><line x1="144" y1="80" x2="176" y2="112"/>',
        13
    ),
    translate: phBoldSvg(
        '<polyline points="232 216 176 104 120 216"/><line x1="136" y1="184" x2="216" y2="184"/><line x1="88" y1="32" x2="88" y2="56"/><line x1="24" y1="56" x2="152" y2="56"/><path d="M120,56a96,96,0,0,1-96,96"/><path d="M61.5,88A96,96,0,0,0,152,152"/>',
        13
    ),
    scissors: phBoldSvg(
        '<circle cx="60" cy="76" r="28"/><circle cx="60" cy="180" r="28"/><line x1="136" y1="128" x2="83.1" y2="164.2"/><line x1="232" y1="62.3" x2="83.1" y2="91.8"/><line x1="232" y1="193.7" x2="136" y2="128"/>',
        13
    ),
    check: phBoldSvg(
        '<polyline points="216 72 104 184 48 128"/>',
        14
    ),
    exportUp: phBoldSvg(
        '<polyline points="88 136 128 96 168 136"/><line x1="128" y1="216" x2="128" y2="96"/><path d="M176,184h24a16,16,0,0,0,16-16V56a16,16,0,0,0-16-16H56A16,16,0,0,0,40,56V168a16,16,0,0,0,16,16H80"/>',
        15
    ),
    caretDown: phBoldSvg(
        '<polyline points="208 96 128 176 48 96"/>',
        12
    ),
    trash: phBoldSvg(
        '<line x1="216" y1="56" x2="40" y2="56"/><line x1="104" y1="104" x2="104" y2="168"/><line x1="152" y1="104" x2="152" y2="168"/><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56"/><path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56"/>',
        14
    )
};

const TONE_ICON_MAP = {
    default: PH_BOLD_ICONS.target,
    formal: PH_BOLD_ICONS.briefcase,
    casual: PH_BOLD_ICONS.smiley,
    short: PH_BOLD_ICONS.lightning,
    yes: PH_BOLD_ICONS.thumbsUp,
    no: PH_BOLD_ICONS.thumbsDown,
    custom: PH_BOLD_ICONS.pencil
};

const REWRITE_ICON_MAP = {
    improve: PH_BOLD_ICONS.magicWand,
    translate_en: PH_BOLD_ICONS.translate,
    translate_es: PH_BOLD_ICONS.translate,
    formal_rewrite: PH_BOLD_ICONS.briefcase,
    shorter_rewrite: PH_BOLD_ICONS.scissors
};

function createGptButton() {
    const gptButton = document.createElement('button');
    gptButton.type = 'button';
    gptButton.className = 'gpt-wa-btn-main';
    gptButton.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Generar IA</span>`;
    gptButton.title = 'Generar respuesta sugerida con IA para esta conversación';

    return {
        gptButton,
        setBusy(value) {
            if (value) {
                gptButton.style.opacity = '0.75';
                gptButton.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Generando…</span>`;
            } else {
                gptButton.style.opacity = '1';
                gptButton.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Generar IA</span>`;
            }
        }
    };
}

// Componente de selector desplegable personalizado con iconos Phosphor Bold y fuente Figtree
function createCustomSelect({ title, options, defaultValue, iconMap, align = 'left' }) {
    const container = document.createElement('div');
    container.className = 'gpt-wa-custom-select';
    container.title = title;

    let currentValue = defaultValue || (options[0] && options[0].value);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'gpt-wa-custom-select-trigger';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'gpt-wa-custom-select-label';

    const caretSpan = document.createElement('span');
    caretSpan.className = 'gpt-wa-select-caret';
    caretSpan.innerHTML = PH_BOLD_ICONS.caretDown;

    trigger.appendChild(labelSpan);
    trigger.appendChild(caretSpan);

    const menu = document.createElement('div');
    menu.className = `gpt-wa-custom-select-menu ${align === 'right' ? 'align-right' : 'align-left'}`;

    function updateSelection() {
        const found = options.find((o) => o.value === currentValue);
        labelSpan.textContent = found ? found.label : currentValue;

        menu.querySelectorAll('.gpt-wa-custom-select-item').forEach((item) => {
            if (item.dataset.value === currentValue) {
                item.classList.add('is-selected');
            } else {
                item.classList.remove('is-selected');
            }
        });
    }

    options.forEach((opt) => {
        const item = document.createElement('div');
        item.className = 'gpt-wa-custom-select-item';
        item.dataset.value = opt.value;

        const iconHtml = iconMap && iconMap[opt.value] ? iconMap[opt.value] : '';
        item.innerHTML = `
            <span class="gpt-wa-item-icon">${iconHtml}</span>
            <span class="gpt-wa-item-text">${opt.label}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentValue !== opt.value) {
                currentValue = opt.value;
                updateSelection();
                container.dispatchEvent(new Event('change', { bubbles: true }));
            }
            closeMenu();
        });

        menu.appendChild(item);
    });

    updateSelection();

    function openMenu() {
        document.querySelectorAll('.gpt-wa-custom-select.is-open').forEach((el) => {
            if (el !== container) el.classList.remove('is-open');
        });
        container.classList.add('is-open');
    }

    function closeMenu() {
        container.classList.remove('is-open');
    }

    function toggleMenu() {
        if (container.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && container.classList.contains('is-open')) {
            closeMenu();
        }
    });

    container.appendChild(trigger);
    container.appendChild(menu);

    Object.defineProperty(container, 'value', {
        get() {
            return currentValue;
        },
        set(val) {
            currentValue = val;
            updateSelection();
            container.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    return {
        selectWrap: container,
        selectElement: container
    };
}

function createToneSelector() {
    const options = [
        { value: 'default', label: 'Mi estilo' },
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'short', label: 'Corto' },
        { value: 'yes', label: 'Decir Sí' },
        { value: 'no', label: 'Decir No' },
        { value: 'custom', label: 'Personalizado…' }
    ];

    const { selectWrap, selectElement } = createCustomSelect({
        title: 'Elige el tono o intención para la respuesta',
        options,
        defaultValue: 'default',
        iconMap: TONE_ICON_MAP,
        align: 'left'
    });

    return { toneWrap: selectWrap, toneSelect: selectElement };
}

function createRewriteControls() {
    const stack = document.createElement('div');
    stack.className = 'gpt-wa-stack-col';

    const actions = [
        { value: 'improve', label: 'Mejorar texto' },
        { value: 'translate_en', label: 'A Inglés' },
        { value: 'translate_es', label: 'A Español' },
        { value: 'formal_rewrite', label: 'Más formal' },
        { value: 'shorter_rewrite', label: 'Más corto' }
    ];

    const { selectWrap, selectElement } = createCustomSelect({
        title: 'Acción sobre el texto que tienes escrito en WhatsApp o sugerencia',
        options: actions,
        defaultValue: 'improve',
        iconMap: REWRITE_ICON_MAP,
        align: 'right'
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gpt-wa-rewrite-btn';
    btn.innerHTML = `${PH_BOLD_ICONS.check}<span>Aplicar</span>`;
    btn.title = 'Aplicar al texto que escribiste en la caja de WhatsApp (o a la sugerencia actual)';

    stack.appendChild(selectWrap);
    stack.appendChild(btn);

    return { stack, rewriteSelect: selectElement, rewriteButton: btn };
}

function createSuggestionActionStack() {
    const stack = document.createElement('div');
    stack.className = 'gpt-wa-stack-col gpt-wa-stack-actions';

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'gpt-wa-btn-action-top';
    insertBtn.title = 'Insertar sugerencia en el chat de WhatsApp';
    insertBtn.innerHTML = PH_BOLD_ICONS.exportUp;

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'gpt-wa-btn-action-bottom';
    clearBtn.title = 'Borrar sugerencia y volver al inicio';
    clearBtn.innerHTML = PH_BOLD_ICONS.trash;

    stack.appendChild(insertBtn);
    stack.appendChild(clearBtn);

    return { stack, insertBtn, clearBtn };
}

function createGptFooter(footer, mainNode) {
    const existingBar = document.getElementById('gpt-wa-custom-bar');
    if (existingBar) {
        existingBar.remove();
    }

    const customBar = document.createElement('footer');
    customBar.id = 'gpt-wa-custom-bar';
    if (footer && footer.className) {
        customBar.className = footer.className;
    }

    const mainRow = document.createElement('div');
    mainRow.className = 'gpt-wa-main-row';

    // Columna izquierda unida (Fila 1: Selector de estilo con icono Phosphor Bold, Fila 2: Botón Generar IA)
    const leftStack = document.createElement('div');
    leftStack.className = 'gpt-wa-stack-col';

    const { toneWrap, toneSelect } = createToneSelector();
    const gptButtonObject = createGptButton();

    leftStack.appendChild(toneWrap);
    leftStack.appendChild(gptButtonObject.gptButton);

    // Caja central de sugerencia
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'gpt-wa-suggestion-box';

    const suggestionParagraph = document.createElement('div');
    suggestionParagraph.className = 'selectable-text copyable-text gpt-wa-suggestion-text';
    suggestionParagraph.setAttribute('contenteditable', 'true');
    suggestionParagraph.setAttribute('spellcheck', 'false');
    suggestionBox.appendChild(suggestionParagraph);

    // Controles derechos: Botón de subir sugerencia pegado a la caja + Columna de Mejorar/Aplicar
    const rightControls = document.createElement('div');
    rightControls.className = 'gpt-wa-right-controls';

    const { stack: actionStack, insertBtn: copyButton, clearBtn: clearButton } = createSuggestionActionStack();
    const { stack: rewriteStack, rewriteSelect, rewriteButton } = createRewriteControls();

    rightControls.appendChild(actionStack);
    rightControls.appendChild(rewriteStack);

    mainRow.appendChild(leftStack);
    mainRow.appendChild(suggestionBox);
    mainRow.appendChild(rightControls);

    // Fila secundaria desplegable cuando el usuario selecciona "Personalizado..."
    const customPromptRow = document.createElement('div');
    customPromptRow.className = 'gpt-wa-custom-prompt-row';

    const customPromptInput = document.createElement('input');
    customPromptInput.type = 'text';
    customPromptInput.className = 'gpt-wa-custom-prompt-input';
    customPromptInput.placeholder = 'Escribe qué quieres responder (ej: "dile que el martes a las 7pm me queda perfecto") y presiona Enter…';

    customPromptRow.appendChild(customPromptInput);

    toneSelect.addEventListener('change', () => {
        if (toneSelect.value === 'custom') {
            customPromptRow.classList.add('visible');
            customPromptInput.focus();
        } else {
            customPromptRow.classList.remove('visible');
        }
    });

    customBar.appendChild(mainRow);
    customBar.appendChild(customPromptRow);

    if (footer && footer.parentNode) {
        footer.querySelectorAll('input[type="file"]').forEach((fileInput) => {
            fileInput.style.display = 'none';
        });
        footer.parentNode.insertBefore(customBar, footer.nextSibling);
    } else if (mainNode) {
        mainNode.appendChild(customBar);
    }

    requestAnimationFrame(() => {
        const chatContainer = mainNode ? mainNode.querySelector('[role="application"]') : null;
        if (chatContainer && chatContainer.parentElement) {
            chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;
        }
    });

    return {
        newFooter: customBar,
        suggestionBox,
        suggestionParagraph,
        gptButtonObject,
        toneSelect,
        customPromptInput,
        rewriteSelect,
        rewriteButton,
        copyButton
    };
}
