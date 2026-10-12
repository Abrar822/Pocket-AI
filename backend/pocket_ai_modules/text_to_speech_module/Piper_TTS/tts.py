import subprocess
import sounddevice as sd
import soundfile as sf


class TextToSpeechModule:

    def tts(self, text: str):
        PIPER_EXE = (
            r"backend\pocket_ai_modules\text_to_speech_module\Piper_TTS\piper\piper.exe"
        )
        MODEL = r"backend\pocket_ai_modules\text_to_speech_module\Piper_TTS\voices\en_US-ryan-medium.onnx"
        OUTPUT = "output.wav"

        subprocess.run(
            [
                PIPER_EXE,
                "--model",
                MODEL,
                "--output_file",
                OUTPUT,
            ],
            input=text,
            text=True,
            check=True,
        )

        audio, sample_rate = sf.read(OUTPUT)
        sd.play(audio, sample_rate)
        sd.wait()