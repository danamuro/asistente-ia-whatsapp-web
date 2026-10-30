'use strict';

(function () {
    if (window.__gptWaAudioInterceptorInstalled) return;
    window.__gptWaAudioInterceptorInstalled = true;

    const blobRegistry = new Map();
    let lastCreatedBlobUrl = null;
    let lastActiveAudioElement = null;
    let activeCaptureResolver = null;
    let activeCaptureTimer = null;

    function isLikelyAudioBlob(blob) {
        if (!(blob instanceof Blob)) return false;
        const type = (blob.type || '').toLowerCase();
        return (
            type.startsWith('audio/') ||
            type.includes('ogg') ||
            type.includes('opus') ||
            type.includes('mpeg') ||
            type.includes('mp4') ||
            type.includes('wav') ||
            type.includes('webm')
        );
    }

    // Interceptar URL.createObjectURL para registrar los Blobs de notas de voz de WhatsApp
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = function (obj) {
        const url = originalCreateObjectURL.apply(this, arguments);
        try {
            if (isLikelyAudioBlob(obj)) {
                blobRegistry.set(url, obj);
                lastCreatedBlobUrl = url;

                // Limitar tamaño del registro en memoria a los últimos 80 audios
                if (blobRegistry.size > 80) {
                    const oldestKey = blobRegistry.keys().next().value;
                    blobRegistry.delete(oldestKey);
                }
            }
        } catch (_) {}
        return url;
    };

    // Interceptar HTMLMediaElement.prototype.play para capturar el audio sin reproducir sonido cuando se solicita transcripción
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
        try {
            const isAudio =
                this.tagName === 'AUDIO' ||
                (this.src && this.src.startsWith('blob:')) ||
                (this.currentSrc && this.currentSrc.startsWith('blob:'));

            if (isAudio) {
                lastActiveAudioElement = this;

                if (activeCaptureResolver) {
                    const resolve = activeCaptureResolver;
                    activeCaptureResolver = null;
                    if (activeCaptureTimer) {
                        clearTimeout(activeCaptureTimer);
                        activeCaptureTimer = null;
                    }

                    const srcUrl = this.currentSrc || this.src || lastCreatedBlobUrl;
                    const prevMuted = this.muted;
                    const prevVolume = this.volume;

                    // Silenciar de inmediato para que el usuario no escuche ruido al transcribir
                    this.muted = true;
                    this.volume = 0;

                    const playPromise = originalPlay.apply(this, arguments);
                    Promise.resolve(playPromise)
                        .catch(() => {})
                        .finally(() => {
                            try {
                                this.pause();
                                this.currentTime = 0;
                            } catch (_) {}
                            setTimeout(() => {
                                try {
                                    this.muted = prevMuted;
                                    this.volume = prevVolume;
                                } catch (_) {}
                            }, 50);
                        });

                    resolve(srcUrl);
                    return Promise.resolve();
                }
            }
        } catch (_) {}

        return originalPlay.apply(this, arguments);
    };

    async function blobToBase64Data(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result || '';
                const commaIdx = typeof dataUrl === 'string' ? dataUrl.indexOf(',') : -1;
                const base64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : '';
                resolve({
                    base64,
                    mimeType: blob.type || 'audio/ogg'
                });
            };
            reader.onerror = () => reject(new Error('No se pudo leer el archivo de audio.'));
            reader.readAsDataURL(blob);
        });
    }

    async function fetchBlobFromUrl(blobUrl) {
        if (!blobUrl) throw new Error('URL de audio vacía');
        if (blobRegistry.has(blobUrl)) {
            return blobRegistry.get(blobUrl);
        }
        const resp = await fetch(blobUrl);
        if (!resp.ok) {
            throw new Error('No se pudo obtener el blob de audio desde WhatsApp Web');
        }
        return await resp.blob();
    }

    function findPlayButtonInBubble(bubbleEl) {
        if (!bubbleEl) return null;

        // 1. Buscar por iconos estándar de WhatsApp Web para notas de voz
        const iconSelectors = [
            'span[data-icon="audio-play"]',
            'span[data-icon="audio-download"]',
            'span[data-icon="audio-pause"]'
        ];
        for (const sel of iconSelectors) {
            const icon = bubbleEl.querySelector(sel);
            if (icon) {
                return icon.closest('button') || icon.parentElement || icon;
            }
        }

        // 2. Buscar botón por aria-label de reproducción de mensaje de voz
        const buttons = bubbleEl.querySelectorAll('button[aria-label]');
        for (const btn of buttons) {
            if (btn.closest('.gpt-wa-audio-transcribe-wrap')) continue;
            const label = (btn.getAttribute('aria-label') || '').toLowerCase();
            if (
                label.includes('reproducir') ||
                label.includes('play') ||
                label.includes('mensaje de voz') ||
                label.includes('voice message') ||
                label.includes('pausar') ||
                label.includes('pause')
            ) {
                return btn;
            }
        }

        return null;
    }

    window.addEventListener('gpt-wa-request-audio-blob', async (event) => {
        const detail = event.detail || {};
        const requestId = detail.requestId;
        const messageId = detail.messageId;
        if (!requestId) return;

        const reply = (payload) => {
            window.dispatchEvent(
                new CustomEvent('gpt-wa-response-audio-blob', {
                    detail: { requestId, ...payload }
                })
            );
        };

        try {
            let bubbleEl = null;
            if (messageId) {
                bubbleEl =
                    document.querySelector(`[data-gpt-audio-id="${CSS.escape(messageId)}"]`) ||
                    document.querySelector(`div[data-id="${CSS.escape(messageId)}"]`);
            }

            // Caso 1: Si hay un elemento <audio> directo dentro de la burbuja
            const directAudio = bubbleEl ? bubbleEl.querySelector('audio[src^="blob:"]') : null;
            if (directAudio && directAudio.src) {
                const blob = await fetchBlobFromUrl(directAudio.src);
                const { base64, mimeType } = await blobToBase64Data(blob);
                reply({ ok: true, base64, mimeType });
                return;
            }

            // Caso 2: Si el audio ya se está reproduciendo actualmente en esta burbuja
            const isCurrentlyPlayingHere =
                bubbleEl &&
                (bubbleEl.querySelector('span[data-icon="audio-pause"]') ||
                    bubbleEl.querySelector('button[aria-label*="Pausar" i], button[aria-label*="Pause" i]'));

            if (isCurrentlyPlayingHere && lastActiveAudioElement && (lastActiveAudioElement.currentSrc || lastActiveAudioElement.src)) {
                const blob = await fetchBlobFromUrl(lastActiveAudioElement.currentSrc || lastActiveAudioElement.src);
                const { base64, mimeType } = await blobToBase64Data(blob);
                reply({ ok: true, base64, mimeType });
                return;
            }

            // Caso 3: Activar captura silenciosa y disparar el botón de Play de la burbuja
            const playBtn = findPlayButtonInBubble(bubbleEl);
            if (!playBtn) {
                reply({ ok: false, error: 'No se encontró el botón de reproducción del audio en este mensaje.' });
                return;
            }

            // Si primero tiene icono de descarga (audio-download), hacer clic y esperar un momento
            const needsDownload = Boolean(bubbleEl && bubbleEl.querySelector('span[data-icon="audio-download"]'));

            const capturedUrlPromise = new Promise((resolve) => {
                activeCaptureResolver = resolve;
                activeCaptureTimer = setTimeout(() => {
                    if (activeCaptureResolver === resolve) {
                        activeCaptureResolver = null;
                        resolve(null);
                    }
                }, needsDownload ? 7000 : 3500);
            });

            playBtn.click();

            // Si requería descarga, a veces WhatsApp necesita un segundo clic para iniciar play() tras descargar
            if (needsDownload) {
                setTimeout(() => {
                    if (activeCaptureResolver) {
                        const updatedBtn = findPlayButtonInBubble(bubbleEl);
                        if (updatedBtn) updatedBtn.click();
                    }
                }, 900);
            }

            const capturedUrl = await capturedUrlPromise;
            const finalUrl = capturedUrl || lastCreatedBlobUrl;

            if (!finalUrl) {
                reply({
                    ok: false,
                    error: 'Reproduce el audio un instante primero para que WhatsApp Web lo descargue y vuelve a pulsar Transcribir.'
                });
                return;
            }

            const blob = await fetchBlobFromUrl(finalUrl);
            const { base64, mimeType } = await blobToBase64Data(blob);
            reply({ ok: true, base64, mimeType });
        } catch (err) {
            reply({
                ok: false,
                error: err && err.message ? err.message : 'Error al capturar el audio de WhatsApp Web.'
            });
        }
    });
})();
