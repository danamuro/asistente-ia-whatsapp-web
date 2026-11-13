'use strict';

const audio = document.getElementById('popup-audio');
const text = document.getElementById('popup-text');
const auto = document.getElementById('popup-auto');
const warning = document.getElementById('popup-key-warning');

chrome.storage.local.get({
    enableAudioTranscription: true,
    enableTextAI: true,
    sendHistory: 'manual',
    apiKey: '',
    groqKey: '',
    geminiKey: ''
}, (items) => {
    audio.checked = items.enableAudioTranscription !== false;
    text.checked = items.enableTextAI !== false;
    auto.checked = items.sendHistory === 'auto';
    auto.disabled = !text.checked;
    warning.style.display = (items.apiKey || items.groqKey || items.geminiKey) ? 'none' : 'flex';
});

audio.addEventListener('change', () => chrome.storage.local.set({ enableAudioTranscription: audio.checked }));
text.addEventListener('change', () => {
    auto.disabled = !text.checked;
    chrome.storage.local.set({ enableTextAI: text.checked });
});
auto.addEventListener('change', () => chrome.storage.local.set({ sendHistory: auto.checked ? 'auto' : 'manual' }));

document.getElementById('popup-settings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
});
