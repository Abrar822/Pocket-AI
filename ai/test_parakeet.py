import sherpa_onnx
import sounddevice as sd
import os

MODEL = r"V:\B.TECH\7TH SEM\PocketAI\ai\models\sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"

encoder = os.path.join(MODEL, "encoder.int8.onnx")
decoder = os.path.join(MODEL, "decoder.int8.onnx")
joiner = os.path.join(MODEL, "joiner.int8.onnx")
tokens = os.path.join(MODEL, "tokens.txt")

print("Loading Parakeet model...")

recognizer = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=encoder,
    decoder=decoder,
    joiner=joiner,
    tokens=tokens,
    num_threads=8,
    sample_rate=16000,
    feature_dim=80,
    decoding_method="greedy_search",
    provider="cpu",
    model_type="nemo_transducer",
)

print("Model loaded successfully.")
print()
print("Speak for 5 seconds...")

audio = sd.rec(
    int(5 * 16000),
    samplerate=16000,
    channels=1,
    dtype="float32"
)

sd.wait()

print("Recording finished.")
print("Processing...")

audio = audio[:, 0]

stream = recognizer.create_stream()

stream.accept_waveform(
    16000,
    audio
)

recognizer.decode_stream(stream)

print()
print("================================")
print("TEXT:")
print(stream.result.text)
print("================================")