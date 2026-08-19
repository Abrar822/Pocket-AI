import webbrowser
import pyautogui
import pyperclip
import time
import json
from .mail_generator import mail_generator
from ...pydantic_models.email_generation_models import MailStructure
from ...pocket_ai_modules.text_to_speech_module.Piper_TTS.tts import TextToSpeechModule


class EmailGenerationModule:

    def compose_email(self, task):
        email_speaker = TextToSpeechModule()

        try:
            data = mail_generator(task.parameters.prompt)
            data = json.loads(data)
    
            data = MailStructure.model_validate(data)
    
            subject = data.subject
            body = data.body
    
            webbrowser.open("https://mail.google.com/mail/u/0/#inbox?compose=new")
            time.sleep(10)
    
            pyautogui.press("tab")
            pyperclip.copy(subject)
            pyautogui.hotkey("ctrl", "v")
    
            pyautogui.press("tab")
            pyperclip.copy(body)
            pyautogui.hotkey("ctrl", "v")
        except:
            email_speaker.tts('Sorry, I could not generate the email')

    def execute(self, task):
        match task.action:
            case "compose_email":
                self.compose_email(task)
