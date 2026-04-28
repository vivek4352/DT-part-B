export class ReflectionEngine {
    constructor(treeData) {
        this.tree = new Map(treeData.map(node => [node.id, node]));
        this.state = {
            answers: {},
            signals: {
                axis1: { internal: 0, external: 0 },
                axis2: { contribution: 0, entitlement: 0 },
                axis3: { selfcentric: 0, altrocentric: 0 }
            }
        };
        this.currentNodeId = 'START';
        this.history = [];
    }

    getCurrentNode() {
        let node = this.tree.get(this.currentNodeId);
        return node ? this.interpolate(node) : null;
    }

    interpolate(node) {
        let clonedNode = JSON.parse(JSON.stringify(node));
        if (clonedNode.text) {
            clonedNode.text = clonedNode.text.replace(/\{([^}]+)\}/g, (match, path) => {
                if (path.endsWith('.answer')) {
                    const nodeId = path.split('.')[0];
                    return this.state.answers[nodeId] || match;
                } else if (path.endsWith('.dominant')) {
                    const axis = path.split('.')[0];
                    return this.getDominant(axis);
                }
                return match;
            });
        }
        return clonedNode;
    }

    getDominant(axis) {
        const counts = this.state.signals[axis];
        if (!counts) return 'unknown';
        const keys = Object.keys(counts);
        return counts[keys[0]] > counts[keys[1]] ? keys[0] : keys[1];
    }

    submitAnswer(answerText) {
        this.saveState();
        const node = this.tree.get(this.currentNodeId);
        
        if (node.type === 'question') {
            this.state.answers[this.currentNodeId] = answerText;
        }
        
        this._advance();
    }

    advance() {
        this.saveState();
        this._advance();
    }

    _advance() {
        const node = this.tree.get(this.currentNodeId);
        
        if (node.target) {
            this.moveTo(node.target);
            return;
        }

        const children = Array.from(this.tree.values()).filter(n => n.parentId === this.currentNodeId);
        if (children.length === 1) {
            this.moveTo(children[0].id);
        } else {
            console.error("Stuck at node:", this.currentNodeId);
        }
    }

    saveState() {
        if (!this.history) this.history = [];
        this.history.push({
            currentNodeId: this.currentNodeId,
            state: JSON.parse(JSON.stringify(this.state))
        });
    }

    goBack() {
        if (this.history && this.history.length > 0) {
            const prev = this.history.pop();
            this.currentNodeId = prev.currentNodeId;
            this.state = prev.state;
            return true;
        }
        return false;
    }

    canGoBack() {
        return this.history && this.history.length > 0;
    }

    moveTo(nodeId) {
        this.currentNodeId = nodeId;
        const node = this.tree.get(nodeId);
        
        if (!node) {
            console.error("Node not found:", nodeId);
            return;
        }

        if (node.signal) {
            const [axis, pole] = node.signal.split(':');
            if (this.state.signals[axis]) {
                this.state.signals[axis][pole] = (this.state.signals[axis][pole] || 0) + 1;
            }
        }
        
        if (node.type === 'decision') {
            const parentNodeId = node.parentId;
            const parentAnswer = this.state.answers[parentNodeId];
            
            let matchedTarget = null;
            for (const rule of node.options) {
                const [conditions, target] = rule.split(':');
                const allowedAnswers = conditions.split('|');
                if (allowedAnswers.includes(parentAnswer)) {
                    matchedTarget = target;
                    break;
                }
            }
            
            if (matchedTarget) {
                this.moveTo(matchedTarget);
            } else {
                console.error("Decision node failed to match answer:", parentAnswer, "for node", node.id);
                // Fallback attempt to next child
                const children = Array.from(this.tree.values()).filter(n => n.parentId === this.currentNodeId);
                if (children.length > 0) {
                    this.moveTo(children[0].id);
                }
            }
        }
    }
}
