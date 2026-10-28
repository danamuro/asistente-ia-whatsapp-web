'use strict';

let confirmVisible = false;

function confirmDialog(message) {
    if (confirmVisible) {
        return Promise.resolve(false);
    }
    return new Promise((resolve) => {
        confirmVisible = true;
        const dialog = document.createElement('div');
        dialog.id = 'confirmDialog';
        dialog.innerHTML = `
            <style>
                #confirmDialog ul li {
                    list-style-type: disc;
                    margin-bottom: 10px;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #111b21;
                }
                #confirmDialog a {
                    color: #0077ff;
                    text-decoration: underline;
                }
            </style>
            ${message}
            <div id="buttonsContainer" style="display:flex; justify-content:center; margin-top:12px;">
                <button id="confirmYes" type="button">Aceptar</button>
                <button id="confirmNo" type="button">Cancelar</button>
            </div>
        `;
        document.body.appendChild(dialog);

        const confirmYes = dialog.querySelector('#confirmYes');
        const confirmNo = dialog.querySelector('#confirmNo');

        confirmYes.addEventListener('click', () => {
            dialog.remove();
            confirmVisible = false;
            resolve(true);
        });

        confirmNo.addEventListener('click', () => {
            dialog.remove();
            confirmVisible = false;
            resolve(false);
        });

        dialog.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 55%;
            transform: translateX(-50%);
            background-color: #ffffff;
            color: #111b21;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.28);
            padding: 20px 24px 20px 36px;
            text-align: start;
            z-index: 99999;
            max-width: 480px;
        `;

        const buttonStyle = `
            background-color: #00a884;
            color: #fff;
            border: none;
            padding: 9px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin: 6px 10px;
            font-weight: 600;
        `;
        confirmYes.style.cssText = buttonStyle;
        confirmNo.style.cssText = buttonStyle + 'background-color: #667781;';
    });
}
