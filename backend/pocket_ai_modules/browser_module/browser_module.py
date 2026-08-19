import webbrowser
from urllib.parse import quote
from playwright.sync_api import sync_playwright
from .content_extractor import generate_content
from pathlib import Path
from datetime import datetime


class BrowserModule:

    def __init__(self):
        self.actions = {
            "open_website": self.open_website,
            "summarize_website": self.summarize_website,
            "search_specific_website": self.search_specific_website,
        }
        self.search_engines = {
            "youtube": "https://www.youtube.com/results?search_query={}",
            "google": "https://www.google.com/search?q={}",
            "github": "https://www.github.com/search?q={}&type=repositories",
            "wikipedia": "https://en.wikipedia.org/wiki/{}",
            "reddit": "https://www.reddit.com/search/?q={}",
            "amazon": "https://www.amazon.in/s?k={}",
            "linkedin": "https://www.linkedin.com/search/results/all/?keywords={}",
            "facebook": "https://www.facebook.com/search/top?q={}",
            "instagram": "https://www.instagram.com/explore/tags/{}/",
            "twitter": "https://twitter.com/search?q={}",
            "x": "https://twitter.com/search?q={}",
            "spotify": "https://open.spotify.com/search/{}",
        }

    def open_website(self, task):
        webbrowser.open(task.parameters.url)

    def search_specific_website(self, task):
        query = quote(task.parameters.query)
        website_name = task.parameters.website_name
        search_url = self.search_engines[website_name.strip().lower()]
        webbrowser.open(search_url.format(query))

    def summarize_website(self, task):
        browser = None
        engine = None

        try:
            url = task.parameters.url
            if not url.startswith("http"):
                url = f"https://{url}"

            engine = sync_playwright().start()
            browser = engine.chromium.launch(headless=False)
            page = browser.new_page()

            page.goto(url, wait_until="domcontentloaded")
            page.wait_for_timeout(5000)
            text = page.locator("body").inner_text()

            content = generate_content(text.strip())
            path = Path.home() / 'Downloads' / f"summarized_{datetime.now().strftime('%d_%m_%Y-%H-%M-%S')}.txt"
            path.write_text(content, encoding='utf-8')
            
        finally:
            if browser:
                browser.close()
            if engine:
                engine.stop()

    def execute(self, task):
        action = self.actions.get(task.action)
        if action:
            action(task)
