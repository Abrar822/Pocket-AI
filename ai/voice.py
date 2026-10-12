import sherpa_onnx
import sounddevice as sd
import numpy as np
import os
import sys
import json
import threading
import queue
import time
import re
from pathlib import Path

# ============================================================
# MODEL
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL = BASE_DIR / "models" / "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
# MODEL = r"V:\B.TECH\7TH SEM\PocketAI\ai\models\sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"

SAMPLE_RATE = 16000
BLOCK_SIZE = 800
CHANNELS = 1

SILENCE_THRESHOLD = 0.008
SILENCE_DURATION = 0.65
MIN_SPEECH_DURATION = 0.25
MAX_SPEECH_DURATION = 15.0


# ============================================================
# MODEL FILES
# ============================================================

encoder = os.path.join(MODEL, "encoder.int8.onnx")
decoder = os.path.join(MODEL, "decoder.int8.onnx")
joiner = os.path.join(MODEL, "joiner.int8.onnx")
tokens = os.path.join(MODEL, "tokens.txt")


# ============================================================
# SHERPA ONNX
# ============================================================

recognizer = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=encoder,
    decoder=decoder,
    joiner=joiner,
    tokens=tokens,
    num_threads=8,
    sample_rate=SAMPLE_RATE,
    feature_dim=80,
    decoding_method="greedy_search",
    provider="cpu",
    model_type="nemo_transducer",
)


# ============================================================
# GLOBALS
# ============================================================

audio_queue = queue.Queue(maxsize=100)

listening = False
worker = None


# ============================================================
# SEND DATA
# ============================================================

def send(data):
    print(json.dumps(data), flush=True)


# ============================================================
# AUDIO CALLBACK
# ============================================================

def audio_callback(indata, frames, time_info, status):

    if not listening:
        return

    audio = indata[:, 0].copy()

    try:
        audio_queue.put_nowait(audio)

    except queue.Full:
        pass


# ============================================================
# CLEAR QUEUE
# ============================================================

def clear_queue():

    while True:

        try:
            audio_queue.get_nowait()

        except queue.Empty:
            break


# ============================================================
# RECOGNIZE AUDIO
# ============================================================

def recognize_audio(audio):

    if len(audio) == 0:
        return ""

    audio = np.asarray(
        audio,
        dtype=np.float32
    )

    stream = recognizer.create_stream()

    stream.accept_waveform(
        SAMPLE_RATE,
        audio
    )

    recognizer.decode_stream(stream)

    return stream.result.text.strip()


# ============================================================
# COMMAND EXECUTOR
# ============================================================

def perform_command(text):

    original_text = text.strip()

    command = original_text.lower().strip()

    if not command:
        return


    # ========================================================
    # REMOVE POLITE WORDS
    # ========================================================

    command = re.sub(
        r"^(please|hey pocket ai|pocket ai|hey)\s+",
        "",
        command
    ).strip()


    # ========================================================
    # SEND RECOGNIZED COMMAND TO FRONTEND
    # ========================================================

    send({
        "type": "command",
        "command": "text",
        "text": original_text
    })


# ============================================================
# LISTEN
# ============================================================

def listen():

    global listening

    send({
        "type": "listening"
    })

    clear_queue()

    speech_buffer = []

    speaking = False

    speech_start = 0

    last_voice_time = 0


    try:

        with sd.InputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype="float32",
            blocksize=BLOCK_SIZE,
            callback=audio_callback
        ):

            while listening:

                try:

                    audio = audio_queue.get(
                        timeout=0.2
                    )

                except queue.Empty:

                    continue


                # =================================================
                # CALCULATE VOLUME
                # =================================================

                volume = float(
                    np.sqrt(
                        np.mean(
                            np.square(audio)
                        )
                    )
                )

                now = time.time()


                # =================================================
                # SPEECH DETECTED
                # =================================================

                if volume > SILENCE_THRESHOLD:

                    if not speaking:

                        speaking = True

                        speech_start = now

                        speech_buffer = []


                    speech_buffer.extend(
                        audio.tolist()
                    )

                    last_voice_time = now


                # =================================================
                # SILENCE DETECTED
                # =================================================

                elif speaking:

                    speech_buffer.extend(
                        audio.tolist()
                    )

                    silence_time = (
                        now - last_voice_time
                    )

                    speech_time = (
                        now - speech_start
                    )


                    # =================================================
                    # SPEECH FINISHED
                    # =================================================

                    if (
                        silence_time >= SILENCE_DURATION
                        and speech_time >= MIN_SPEECH_DURATION
                    ):

                        audio_data = np.asarray(
                            speech_buffer,
                            dtype=np.float32
                        )


                        text = recognize_audio(
                            audio_data
                        )


                        if text:

                            send({
                                "type": "text",
                                "text": text
                            })


                            # =====================================
                            # EXECUTE COMMAND
                            # =====================================

                            perform_command(
                                text
                            )


                        speech_buffer = []

                        speaking = False


                # =================================================
                # MAXIMUM SPEECH DURATION
                # =================================================

                if speaking:

                    speech_time = (
                        now - speech_start
                    )


                    if speech_time >= MAX_SPEECH_DURATION:

                        audio_data = np.asarray(
                            speech_buffer,
                            dtype=np.float32
                        )


                        text = recognize_audio(
                            audio_data
                        )


                        if text:

                            send({
                                "type": "text",
                                "text": text
                            })


                            perform_command(
                                text
                            )


                        speech_buffer = []

                        speaking = False


    except Exception as e:

        send({
            "type": "error",
            "message": str(e)
        })


    send({
        "type": "stopped"
    })


# ============================================================
# COMMAND LOOP
# ============================================================

def command_loop():

    global listening
    global worker


    send({
        "type": "ready"
    })


    for line in sys.stdin:

        command = line.strip().upper()


        # ====================================================
        # START
        # ====================================================

        if command == "START":

            if not listening:

                listening = True

                worker = threading.Thread(
                    target=listen,
                    daemon=True
                )

                worker.start()


        # ====================================================
        # STOP
        # ====================================================

        elif command == "STOP":

            listening = False


        # ====================================================
        # QUIT
        # ====================================================

        elif command == "QUIT":

            listening = False

            break


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    command_loop()