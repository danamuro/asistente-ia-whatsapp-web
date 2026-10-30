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
        11
    ),
    trash: phBoldSvg(
        '<line x1="216" y1="56" x2="40" y2="56"/><line x1="104" y1="104" x2="104" y2="168"/><line x1="152" y1="104" x2="152" y2="168"/><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56"/><path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56"/>',
        14
    )
};

const TONE_ICON_MAP = {
    default: PH_BOLD_ICONS.sparkle,
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

// Botón unificado Split Button: botón principal de acción + flecha para desplegar opciones
function createToneSplitButton() {
    const container = document.createElement('div');
    container.className = 'gpt-wa-split-btn gpt-wa-split-generate';

    let currentTone = 'default';

    const mainBtn = document.createElement('button');
    mainBtn.type = 'button';
    mainBtn.className = 'gpt-wa-split-main';
    mainBtn.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Mi estilo</span>`;
    mainBtn.title = 'Generar respuesta con IA (Mi estilo natural)';

    const arrowBtn = document.createElement('button');
    arrowBtn.type = 'button';
    arrowBtn.className = 'gpt-wa-split-arrow';
    arrowBtn.innerHTML = PH_BOLD_ICONS.caretDown;
    arrowBtn.title = 'Elegir tono para la respuesta';

    const menu = document.createElement('div');
    menu.className = 'gpt-wa-custom-select-menu align-left';

    const options = [
        { value: 'default', label: 'Mi estilo' },
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'short', label: 'Corto' },
        { value: 'yes', label: 'Decir Sí' },
        { value: 'no', label: 'Decir No' },
        { value: 'custom', label: 'Personalizado…' }
    ];

    function updateSelection() {
        menu.querySelectorAll('.gpt-wa-custom-select-item').forEach((item) => {
            if (item.dataset.value === currentTone) {
                item.classList.add('is-selected');
            } else {
                item.classList.remove('is-selected');
            }
        });
        const found = options.find((o) => o.value === currentTone);
        const iconHtml = TONE_ICON_MAP[currentTone] || PH_BOLD_ICONS.sparkle;
        const labelText = found ? found.label : 'Mi estilo';
        mainBtn.innerHTML = `${iconHtml}<span>${labelText}</span>`;
        mainBtn.title = `Generar respuesta con IA (${labelText})`;
    }

    options.forEach((opt) => {
        const item = document.createElement('div');
        item.className = 'gpt-wa-custom-select-item';
        item.dataset.value = opt.value;

        const iconHtml = TONE_ICON_MAP[opt.value] || '';
        item.innerHTML = `
            <span class="gpt-wa-item-icon">${iconHtml}</span>
            <span class="gpt-wa-item-text">${opt.label}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            currentTone = opt.value;
            updateSelection();
            closeMenu();
            // Disparar evento change para actualizar estado SIN generar automáticamente
            container.dispatchEvent(new Event('change', { bubbles: true }));
        });

        menu.appendChild(item);
    });

    updateSelection();

    function openMenu() {
        document.querySelectorAll('.gpt-wa-split-btn.is-open').forEach((el) => {
            if (el !== container) el.classList.remove('is-open');
        });
        container.classList.add('is-open');
    }

    function closeMenu() {
        container.classList.remove('is-open');
    }

    arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (container.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
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

    container.appendChild(mainBtn);
    container.appendChild(arrowBtn);
    container.appendChild(menu);

    Object.defineProperty(container, 'value', {
        get() {
            return currentTone;
        },
        set(val) {
            currentTone = val;
            updateSelection();
        }
    });

    return {
        container,
        gptButton: mainBtn,
        toneSelect: container,
        setBusy(value) {
            const currentLabel = mainBtn.querySelector('span')?.textContent || 'Generar IA';
            if (value) {
                mainBtn.style.opacity = '0.75';
                mainBtn.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Generando…</span>`;
            } else {
                mainBtn.style.opacity = '1';
                updateSelection();
            }
        }
    };
}

// Botón unificado Split Button para Reescribir / Traducir
function createRewriteSplitButton() {
    const container = document.createElement('div');
    container.className = 'gpt-wa-split-btn gpt-wa-split-rewrite secondary';

    let currentAction = 'improve';

    const actions = [
        { value: 'improve', label: 'Mejorar' },
        { value: 'translate_en', label: 'A Inglés' },
        { value: 'translate_es', label: 'A Español' },
        { value: 'formal_rewrite', label: 'Más formal' },
        { value: 'shorter_rewrite', label: 'Más corto' }
    ];

    const mainBtn = document.createElement('button');
    mainBtn.type = 'button';
    mainBtn.className = 'gpt-wa-split-main';
    mainBtn.innerHTML = `${PH_BOLD_ICONS.magicWand}<span>Mejorar</span>`;
    mainBtn.title = 'Mejorar redacción y ortografía del texto con IA';

    const arrowBtn = document.createElement('button');
    arrowBtn.type = 'button';
    arrowBtn.className = 'gpt-wa-split-arrow';
    arrowBtn.innerHTML = PH_BOLD_ICONS.caretDown;
    arrowBtn.title = 'Elegir acción: traducir, resumir o cambiar formalidad';

    const menu = document.createElement('div');
    menu.className = 'gpt-wa-custom-select-menu align-right';

    function updateSelection() {
        const found = actions.find((o) => o.value === currentAction);
        const iconHtml = REWRITE_ICON_MAP[currentAction] || PH_BOLD_ICONS.magicWand;
        const labelText = found ? found.label : 'Mejorar';
        mainBtn.innerHTML = `${iconHtml}<span>${labelText}</span>`;
        mainBtn.title = `Aplicar: ${labelText}`;

        menu.querySelectorAll('.gpt-wa-custom-select-item').forEach((item) => {
            if (item.dataset.value === currentAction) {
                item.classList.add('is-selected');
            } else {
                item.classList.remove('is-selected');
            }
        });
    }

    actions.forEach((opt) => {
        const item = document.createElement('div');
        item.className = 'gpt-wa-custom-select-item';
        item.dataset.value = opt.value;

        const iconHtml = REWRITE_ICON_MAP[opt.value] || '';
        item.innerHTML = `
            <span class="gpt-wa-item-icon">${iconHtml}</span>
            <span class="gpt-wa-item-text">${opt.label}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            currentAction = opt.value;
            updateSelection();
            closeMenu();
            // Disparar evento change para actualizar estado SIN ejecutar automáticamente
            container.dispatchEvent(new Event('change', { bubbles: true }));
        });

        menu.appendChild(item);
    });

    updateSelection();

    function openMenu() {
        document.querySelectorAll('.gpt-wa-split-btn.is-open').forEach((el) => {
            if (el !== container) el.classList.remove('is-open');
        });
        container.classList.add('is-open');
    }

    function closeMenu() {
        container.classList.remove('is-open');
    }

    arrowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (container.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
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

    container.appendChild(mainBtn);
    container.appendChild(arrowBtn);
    container.appendChild(menu);

    Object.defineProperty(container, 'value', {
        get() {
            return currentAction;
        },
        set(val) {
            currentAction = val;
            updateSelection();
        }
    });

    return {
        container,
        rewriteButton: mainBtn,
        rewriteSelect: container
    };
}

function createSuggestionActionStack() {
    const group = document.createElement('div');
    group.className = 'gpt-wa-suggestion-actions-col';

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'gpt-wa-btn-action-insert';
    insertBtn.title = 'Insertar sugerencia en WhatsApp (reemplaza texto actual)';
    insertBtn.innerHTML = PH_BOLD_ICONS.exportUp;

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'gpt-wa-btn-action-clear';
    clearBtn.title = 'Borrar sugerencia';
    clearBtn.innerHTML = PH_BOLD_ICONS.trash;

    group.appendChild(insertBtn);
    group.appendChild(clearBtn);

    return { stack: group, insertBtn, clearBtn };
}

function createGptFooter(footer, mainNode) {
    const existingBar = document.getElementById('gpt-wa-custom-bar');
    if (existingBar) {
        existingBar.remove();
    }

    // Usar elemento div propio sin heredar clases de WhatsApp para evitar alturas o paddings asimétricos
    const customBar = document.createElement('div');
    customBar.id = 'gpt-wa-custom-bar';

    const mainRow = document.createElement('div');
    mainRow.className = 'gpt-wa-main-row';

    // 1. Botón unificado Generar IA + Selector de tono integrado
    const toneSplit = createToneSplitButton();

    // 2. Caja central unificada e integrada: Icono dinámico + Texto sugerido + Botones de acción integrados
    const suggestionBox = document.createElement('div');
    suggestionBox.className = 'gpt-wa-suggestion-box';

    const suggestionIconCol = document.createElement('div');
    suggestionIconCol.className = 'gpt-wa-suggestion-icon-col';
    suggestionIconCol.innerHTML = PH_BOLD_ICONS.sparkle;

    const suggestionContentCol = document.createElement('div');
    suggestionContentCol.className = 'gpt-wa-suggestion-content-col';

    const suggestionParagraph = document.createElement('div');
    suggestionParagraph.className = 'selectable-text gpt-wa-suggestion-text';
    suggestionParagraph.setAttribute('contenteditable', 'false');
    suggestionParagraph.setAttribute('spellcheck', 'false');

    suggestionContentCol.appendChild(suggestionParagraph);

    // Acciones integradas en el extremo derecho de la misma caja (sin separación de gap externa)
    const { stack: actionStack, insertBtn: copyButton, clearBtn: clearButton } = createSuggestionActionStack();

    suggestionBox.appendChild(suggestionIconCol);
    suggestionBox.appendChild(suggestionContentCol);
    suggestionBox.appendChild(actionStack);

    // 3. Botón unificado Reescribir / Traducir
    const rewriteSplit = createRewriteSplitButton();

    mainRow.appendChild(toneSplit.container);
    mainRow.appendChild(suggestionBox);
    mainRow.appendChild(rewriteSplit.container);

    // Fila secundaria desplegable cuando el usuario selecciona "Personalizado..."
    const customPromptRow = document.createElement('div');
    customPromptRow.className = 'gpt-wa-custom-prompt-row';

    const customPromptInput = document.createElement('input');
    customPromptInput.type = 'text';
    customPromptInput.className = 'gpt-wa-custom-prompt-input';
    customPromptInput.placeholder = 'Escribe qué quieres responder (ej: "dile que el martes a las 7pm me queda perfecto") y presiona Enter…';

    customPromptRow.appendChild(customPromptInput);

    toneSplit.toneSelect.addEventListener('change', () => {
        if (toneSplit.toneSelect.value === 'custom') {
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
        suggestionIconCol,
        gptButtonObject: {
            gptButton: toneSplit.gptButton,
            setBusy: toneSplit.setBusy
        },
        toneSelect: toneSplit.toneSelect,
        customPromptInput,
        rewriteSelect: rewriteSplit.rewriteSelect,
        rewriteButton: rewriteSplit.rewriteButton,
        copyButton,
        clearButton
    };
}
