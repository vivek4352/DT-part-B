export class ReflectionUI {
    constructor(container, onSubmit, onBack) {
        this.container = container;
        this.onSubmit = onSubmit;
        this.onBack = onBack;
    }

    async renderNode(node, canGoBack = false) {
        if (this.container.children.length > 0) {
            this.container.children[0].classList.add('fade-out');
            await new Promise(r => setTimeout(r, 300));
        }
        
        this.container.innerHTML = '';
        
        if (!node) return;

        let content = document.createElement('div');
        content.className = `node-container node-${node.type} fade-in`;

        if (canGoBack && this.onBack) {
            let backBtn = document.createElement('button');
            backBtn.className = 'btn-back fade-in';
            backBtn.innerText = '← Back';
            backBtn.onclick = () => this.onBack();
            content.appendChild(backBtn);
        }

        if (['start', 'bridge', 'reflection', 'summary', 'end'].includes(node.type)) {
            let textEl = document.createElement(node.type === 'start' ? 'h1' : 'h2');
            textEl.className = 'slide-up text-glow';
            textEl.innerText = node.text;
            content.appendChild(textEl);
            
            if (node.type !== 'end') {
                let btn = document.createElement('button');
                btn.className = 'btn-continue slide-up delay-1';
                btn.innerText = 'Continue';
                btn.onclick = () => this.onSubmit();
                content.appendChild(btn);
            }
        } else if (node.type === 'question') {
            let textEl = document.createElement('h2');
            textEl.className = 'slide-up';
            textEl.innerText = node.text;
            content.appendChild(textEl);
            
            let optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';
            
            node.options.forEach((opt, index) => {
                let btn = document.createElement('button');
                btn.className = `btn-option slide-up delay-${(index % 4) + 1}`;
                btn.innerText = opt;
                btn.onclick = () => this.onSubmit(opt);
                optionsContainer.appendChild(btn);
            });
            content.appendChild(optionsContainer);
        }

        this.container.appendChild(content);
    }
}
