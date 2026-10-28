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
        19
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
                gptButton.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Generando...</span>`;
            } else {
                gptButton.style.opacity = '1';
                gptButton.innerHTML = `${PH_BOLD_ICONS.sparkle}<span>Generar IA</span>`;
            }
        }
    };
}

function createToneSelector() {
    const wrap = document.createElement('div');
    wrap.className = 'gpt-wa-select-row';

    const iconHolder = document.createElement('span');
    iconHolder.className = 'gpt-wa-select-icon';
    iconHolder.innerHTML = TONE_ICON_MAP.default;

    const select = document.createElement('select');
    select.className = 'gpt-wa-tone-select';
    select.title = 'Elige el tono o intención para la respuesta';

    const options = [
        { value: 'default', label: 'Mi estilo' },
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' },
        { value: 'short', label: 'Corto' },
        { value: 'yes', label: 'Decir Sí' },
        { value: 'no', label: 'Decir No' },
        { value: 'custom', label: 'Personalizado...' }
    ];

    options.forEach((opt) => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.label;
        select.appendChild(el);
    });

    select.addEventListener('change', () => {
        iconHolder.innerHTML = TONE_ICON_MAP[select.value] || PH_BOLD_ICONS.target;
    });

    wrap.appendChild(iconHolder);
    wrap.appendChild(select);

    return { toneWrap: wrap, toneSelect: select };
}

function createRewriteControls() {
    const stack = document.createElement('div');
    stack.className = 'gpt-wa-stack-col';

    const selectWrap = document.createElement('div');
    selectWrap.className = 'gpt-wa-select-row';

    const iconHolder = document.createElement('span');
    iconHolder.className = 'gpt-wa-select-icon';
    iconHolder.innerHTML = REWRITE_ICON_MAP.improve;

    const select = document.createElement('select');
    select.className = 'gpt-wa-rewrite-select';
    select.title = 'Acción sobre el texto que tienes escrito en la barra de mensaje de WhatsApp';

    const actions = [
        { value: 'improve', label: 'Mejorar texto' },
        { value: 'translate_en', label: 'A Inglés' },
        { value: 'translate_es', label: 'A Español' },
        { value: 'formal_rewrite', label: 'Más formal' },
        { value: 'shorter_rewrite', label: 'Más corto' }
    ];

    actions.forEach((act) => {
        const el = document.createElement('option');
        el.value = act.value;
        el.textContent = act.label;
        select.appendChild(el);
    });

    select.addEventListener('change', () => {
        iconHolder.innerHTML = REWRITE_ICON_MAP[select.value] || PH_BOLD_ICONS.magicWand;
    });

    selectWrap.appendChild(iconHolder);
    selectWrap.appendChild(select);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gpt-wa-rewrite-btn';
    btn.innerHTML = `${PH_BOLD_ICONS.check}<span>Aplicar</span>`;
    btn.title = 'Aplicar al texto que escribiste en la caja de WhatsApp (o a la sugerencia actual)';

    stack.appendChild(selectWrap);
    stack.appendChild(btn);

    return { stack, rewriteSelect: select, rewriteButton: btn };
}

function createCopyButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gpt-wa-icon-btn';
    btn.title = 'Subir sugerencia a la barra de mensaje de WhatsApp';
    btn.innerHTML = PH_BOLD_ICONS.exportUp;
    return btn;
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

    const copyButton = createCopyButton();
    const { stack: rewriteStack, rewriteSelect, rewriteButton } = createRewriteControls();

    rightControls.appendChild(copyButton);
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
    customPromptInput.placeholder = 'Escribe qué quieres responder (ej: "dile que el martes a las 7pm me queda perfecto") y presiona Enter...';

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
