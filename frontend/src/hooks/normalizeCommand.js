export function normalizeCommand(text) {
    let command = text.trim();

    const corrections = [
        [/\byou too\b/gi, "YouTube"],
        [/\bgo pilot\b/gi, "Copilot"],
        [/\bfast api\b/gi, "FastAPI"],
        [/\bvisual studio code\b/gi, "VS Code"],
        [/\bfile explorer\b/gi, "File Explorer"],
        [/\bgoogle chrome\b/gi, "Chrome"],
    ];

    for (const [pattern, replacement] of corrections) {
        command = command.replace(pattern, replacement);
    }

    return command;
}