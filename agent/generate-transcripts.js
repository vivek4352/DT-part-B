import fs from 'fs';
import { ReflectionEngine } from './engine.js';

const treeData = JSON.parse(fs.readFileSync('./public/reflection-tree.json', 'utf8'));

function generateTranscript(personaName, answersArray, outputFile) {
    const engine = new ReflectionEngine(treeData);
    let transcript = `# Transcript: ${personaName}\n\n`;
    
    let answerIndex = 0;
    
    // Safety break to prevent infinite loops
    let steps = 0;
    
    while (engine.getCurrentNode() && engine.getCurrentNode().type !== 'end' && steps < 50) {
        steps++;
        const node = engine.getCurrentNode();
        transcript += `**System (${node.type}):** ${node.text}\n`;
        
        if (node.type === 'question') {
            const answer = answersArray[answerIndex++];
            transcript += `**User:** ${answer}\n\n`;
            engine.submitAnswer(answer);
        } else {
            transcript += `**User:** [Clicks Continue]\n\n`;
            engine.advance();
        }
    }
    
    if (engine.getCurrentNode() && engine.getCurrentNode().type === 'end') {
        transcript += `**System (end):** ${engine.getCurrentNode().text}\n`;
    }
    
    fs.writeFileSync(outputFile, transcript);
}

const persona1Answers = [
    "Stormy",
    "Feel stuck",
    "I'm not sure",
    "Others were slacking",
    "Fairness",
    "Just me",
    "No"
];

const persona2Answers = [
    "Sunny",
    "I was prepared",
    "Stayed focused",
    "I went the extra mile",
    "Helped a teammate",
    "The end user",
    "Gave meaning"
];

fs.mkdirSync('../transcripts', { recursive: true });
generateTranscript('Victim / Entitled / Self-centric Persona', persona1Answers, '../transcripts/persona-1-transcript.md');
generateTranscript('Victor / Contributing / Altrocentric Persona', persona2Answers, '../transcripts/persona-2-transcript.md');

console.log('Transcripts generated successfully!');
