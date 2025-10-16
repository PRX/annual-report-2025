import { Host, h } from "@stencil/core";
export class PrxAudioQuote {
    el;
    src;
    transcriptUrl;
    playing = false;
    progress = 0;
    audioEl;
    trackEl;
    wordSpans = [];
    currentWordIndex = 0;
    wrapWordsInSpans = (node) => {
        const self = this;
        // If the node is a Text Node
        if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent.trim(); // Get and trim the text content
            if (textContent.length > 0) { // Only process if there's actual text
                const words = textContent.split(/\s+/); // Split text into words by whitespace
                // Create a DocumentFragment to efficiently build the new content
                const fragment = document.createDocumentFragment();
                words.forEach((word, index) => {
                    // Avoid creating spans for empty strings if multiple spaces were present.
                    if (word.length > 0) {
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.classList.add('word');
                        // span.addEventListener('click', self.handleWordClick);
                        fragment.appendChild(span);
                        self.wordSpans.push(span);
                        // Add a space after each word except the last one
                        if (index < words.length - 1 || node.nextSibling) {
                            fragment.appendChild(document.createTextNode(' '));
                        }
                    }
                });
                // Replace the original text node with the new fragment
                node.parentNode.replaceChild(fragment, node);
            }
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
            // If the node is an Element Node, iterate through its children
            // Create a copy of childNodes to avoid issues when modifying the DOM during iteration
            const children = Array.from(node.childNodes);
            children.forEach(child => this.wrapWordsInSpans(child)); // Recursively call for each child
        }
    };
    prepareWordForCompare = (word) => word.replaceAll(/[^\w]/g, '').toLowerCase();
    reset = () => {
        this.audioEl.currentTime = 0;
        this.currentWordIndex = 0;
        this.wordSpans.forEach((span) => span.classList.remove('heard', 'active'));
    };
    handleCueChange = (e) => {
        const cues = e.target.track.activeCues;
        const cue = cues[0];
        const { text, startTime } = cue || {};
        if (!text)
            return;
        const word = this.prepareWordForCompare(text);
        const activeSpan = this.el.querySelector('span.word.active');
        const currentWordIndex = this.currentWordIndex + this.wordSpans.slice(this.currentWordIndex)
            .findIndex((span) => {
            return this.prepareWordForCompare(span.textContent) === word;
        });
        if (currentWordIndex < 0 || currentWordIndex > this.currentWordIndex + 3) {
            console.log(`Transcript word out of sync with quote text. "${text}" @ ${startTime} seconds.`);
            return;
        }
        const currentSpan = this.wordSpans.at(currentWordIndex);
        activeSpan?.classList.remove('active');
        this.wordSpans.forEach((span) => { span.classList.remove('heard'); });
        if (!this.playing)
            return;
        currentSpan.classList.add('active');
        this.wordSpans.slice(0, currentWordIndex).forEach((span) => { span.classList.add('heard'); });
        this.currentWordIndex = currentWordIndex;
    };
    handlePlayToggleClick = () => {
        const { paused } = this.audioEl;
        if (paused) {
            this.audioEl.play();
        }
        else {
            this.audioEl.pause();
        }
    };
    handleRestartClick = () => {
        this.reset();
    };
    connectedCallback() {
        const { el, src } = this;
        if (!src)
            return;
        // Prepare text content for highlighting.
        const blockquote = el.querySelector('blockquote');
        if (!blockquote) {
            const citeElement = el.querySelector('[slot=citation]');
            // Temporarily remove citation element so it doesn't get words wrapped.
            citeElement?.remove();
            this.wrapWordsInSpans(el);
            // Restore citation element.
            el.appendChild(citeElement);
        }
        // Initialize audio element.
        this.audioEl = document.createElement('audio');
        this.audioEl.crossOrigin = "anonymous";
        this.audioEl.preload = "none";
        this.audioEl.src = this.src;
        this.audioEl.addEventListener('timeupdate', () => {
            const { currentTime, duration } = this.audioEl;
            this.progress = currentTime / duration;
        });
        this.audioEl.addEventListener('play', () => { this.playing = true; });
        this.audioEl.addEventListener('pause', () => {
            this.playing = false;
            // this.reset();
        });
        this.audioEl.addEventListener('ended', () => {
            this.reset();
        });
        // Initialize track element.
        if (this.transcriptUrl?.length) {
            this.trackEl = document.createElement('track');
            this.trackEl.default = true;
            this.trackEl.kind = 'captions';
            this.trackEl.src = this.transcriptUrl;
            this.trackEl.addEventListener('cuechange', this.handleCueChange);
            this.audioEl.appendChild(this.trackEl);
        }
    }
    disconnectCallback() {
        this.audioEl = null;
        this.trackEl = null;
    }
    render() {
        const { playing, progress, src, transcriptUrl, handlePlayToggleClick, handleRestartClick } = this;
        const hasAudio = !!src?.length;
        const hasTranscript = !!transcriptUrl?.length;
        return (h(Host, { key: '55bf54134c09556a5d42ac7c6ed6a5dcc228e9a6', playing: playing, highlight: hasTranscript, style: { '--prx-audio-quote--progress': `${progress}` } }, h("blockquote", { key: 'd9ebe5635c853fb166f8da220b2a94d720fec574' }, h("prx-quote", { key: 'b322e80779bcb2403cb5d54b05facda9ac95ef41' }, h("slot", { key: '3e19d83acbe8c9d02cb08f22670d9787c64e4865' })), h("cite", { key: 'b3140384027ae03cd8a562e49fe0598a5c8a9d91' }, h("slot", { key: '64ba7622307dcef6673ec8ee92eb06f8434c6511', name: 'citation' })), hasAudio && (h("prx-audio-quote-controls", { key: 'a76bea5e220175e0c164b0e0aeaef55431b026fa' }, h("button", { key: '1d5ccb4670be9f1f2b2db361fa6635d69247c8bd', type: "button", class: "restart-button", onClick: handleRestartClick, "aria-label": "Restart" }), h("button", { key: '485c5435d1d3652278fda359ed52feee353e61de', type: "button", class: "play-button", onClick: handlePlayToggleClick, "aria-label": playing ? 'Pause' : 'Play' }, h("span", { key: '578cd34c8da6551947ff98c765c32d3f708df876', class: "play-icon" })))))));
    }
    static get is() { return "prx-audio-quote"; }
    static get encapsulation() { return "scoped"; }
    static get originalStyleUrls() {
        return {
            "$": ["prx-audio-quote.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["prx-audio-quote.css"]
        };
    }
    static get properties() {
        return {
            "src": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "src"
            },
            "transcriptUrl": {
                "type": "string",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": ""
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "attribute": "transcript-url"
            }
        };
    }
    static get states() {
        return {
            "playing": {},
            "progress": {}
        };
    }
    static get elementRef() { return "el"; }
}
//# sourceMappingURL=prx-audio-quote.js.map
