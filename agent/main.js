import { ReflectionEngine } from './engine.js';
import { ReflectionUI } from './ui.js';

async function init() {
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}reflection-tree.json`);
        const treeData = await response.json();
        
        const engine = new ReflectionEngine(treeData);
        const container = document.getElementById('container');
        
        const ui = new ReflectionUI(container, (answer) => {
            if (answer) {
                engine.submitAnswer(answer);
            } else {
                engine.advance();
            }
            ui.renderNode(engine.getCurrentNode(), engine.canGoBack());
        }, () => {
            if (engine.goBack()) {
                ui.renderNode(engine.getCurrentNode(), engine.canGoBack());
            }
        });

        ui.renderNode(engine.getCurrentNode(), engine.canGoBack());
    } catch (error) {
        console.error("Failed to initialize the app:", error);
        document.getElementById('container').innerHTML = `
            <div class="node-container">
                <h2 style="color: #ff6b6b">Could not load the tree data.</h2>
                <p>Make sure reflection-tree.json is available in the public directory.</p>
            </div>
        `;
    }
}

init();
