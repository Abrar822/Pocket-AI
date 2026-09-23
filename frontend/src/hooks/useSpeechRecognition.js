import { useRef, useState } from "react";
import { normalizeCommand } from "./normalizeCommand";

export default function useSpeechRecognition(onFinalText) {
    const [listening, setListening] = useState(false);
    const [liveText, setLiveText] = useState("");
    const [finalText, setFinalText] = useState("");
    const [error, setError] = useState("");

    const recognitionRef = useRef(null);
    const finalTextRef = useRef("");
    const clearTextTimeoutRef = useRef(null);

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        console.log("SpeechRecognition:", SpeechRecognition);
        console.log("User Agent:", navigator.userAgent);

        if (!SpeechRecognition) {
            setError("Speech recognition is not supported.");
            return;
        }

        if (recognitionRef.current) {
            return;
        }

        // Cancel pending text clearing
        if (clearTextTimeoutRef.current) {
            clearTimeout(clearTextTimeoutRef.current);
        }

        // Clear previous session
        finalTextRef.current = "";
        setLiveText("");
        setFinalText("");
        setError("");

        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setListening(true);
        };


        recognition.onresult = (event) => {
            let transcript = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                transcript += event.results[i][0].transcript;
            }

            transcript = transcript.trim();

            setLiveText(transcript);

            const lastResult =
                event.results[event.results.length - 1];

            if (lastResult.isFinal) {
                const correctedText = normalizeCommand(transcript);

                finalTextRef.current = correctedText;

                setFinalText(correctedText);
                setLiveText(correctedText);

                // Send final voice text to Dashboard
                if (correctedText && onFinalText) {
                    onFinalText(correctedText);
                }

                recognition.stop();
            }
        };

        recognition.onerror = (event) => {
            console.error(
                "Speech recognition error:",
                event.error
            );

            if (event.error === "not-allowed") {
                setError("Microphone permission denied.");
            } else if (
                event.error !== "no-speech" &&
                event.error !== "aborted"
            ) {
                setError(event.error);
            }
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            setListening(false);
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (error) {
            recognitionRef.current = null;
            setListening(false);
            setError(error.message);
        }
    };

    const stopListening = () => {
        const recognition = recognitionRef.current;

        if (recognition) {
            recognition.stop();
            recognitionRef.current = null;
        }

        setListening(false);

        // Clear text after 5 seconds
        clearTextTimeoutRef.current = setTimeout(() => {
            finalTextRef.current = "";
            setLiveText("");
            setFinalText("");
        }, 5000);
    };

    return {
        listening,
        liveText,
        finalText,
        error,
        startListening,
        stopListening
    };
}


// import { useRef, useState } from "react";

// export default function useSpeechRecognition() {
//     const [listening, setListening] = useState(false);
//     const [liveText, setLiveText] = useState("");
//     const [finalText, setFinalText] = useState("");
//     const [error, setError] = useState("");

//     const recognitionRef = useRef(null);
//     const finalTextRef = useRef("");
//     const clearTextTimeoutRef = useRef(null);

//     const startListening = () => {
//         const SpeechRecognition =
//             window.SpeechRecognition ||
//             window.webkitSpeechRecognition;

//         if (!SpeechRecognition) {
//             setError("Speech recognition is not supported.");
//             return;
//         }

//         if (recognitionRef.current) {
//             return;
//         }

//         // Cancel pending text clearing
//         if (clearTextTimeoutRef.current) {
//             clearTimeout(clearTextTimeoutRef.current);
//         }

//         // Clear previous session
//         finalTextRef.current = "";
//         setLiveText("");
//         setFinalText("");
//         setError("");

//         const recognition = new SpeechRecognition();

//         recognition.continuous = true;
//         recognition.interimResults = true;
//         recognition.lang = "en-IN";
//         recognition.maxAlternatives = 3;

//         recognition.onstart = () => {
//             setListening(true);
//         };


//         recognition.onresult = (event) => {
//             let transcript = "";

//             for (let i = event.resultIndex; i < event.results.length; i++) {
//                 const result = event.results[i];

//                 transcript += result[0].transcript;
//             }

//             transcript = transcript.trim();

//             setLiveText(transcript);

//             if (event.results[event.results.length - 1].isFinal) {
//                 finalTextRef.current = transcript;
//                 setFinalText(transcript);
//             }
//         };

//         recognition.onerror = (event) => {
//             console.error(
//                 "Speech recognition error:",
//                 event.error
//             );

//             if (event.error === "not-allowed") {
//                 setError("Microphone permission denied.");
//             } else if (
//                 event.error !== "no-speech" &&
//                 event.error !== "aborted"
//             ) {
//                 setError(event.error);
//             }
//         };

//         recognition.onend = () => {
//             recognitionRef.current = null;
//             setListening(false);
//         };

//         recognitionRef.current = recognition;

//         try {
//             recognition.start();
//         } catch (error) {
//             recognitionRef.current = null;
//             setListening(false);
//             setError(error.message);
//         }
//     };

//     const stopListening = () => {
//         const recognition = recognitionRef.current;

//         if (recognition) {
//             recognition.stop();
//             recognitionRef.current = null;
//         }

//         setListening(false);

//         // Clear text after 5 seconds
//         clearTextTimeoutRef.current = setTimeout(() => {
//             finalTextRef.current = "";
//             setLiveText("");
//             setFinalText("");
//         }, 5000);
//     };

//     return {
//         listening,
//         liveText,
//         finalText,
//         error,
//         startListening,
//         stopListening
//     };
// }