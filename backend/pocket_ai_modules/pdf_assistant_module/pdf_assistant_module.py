class PdfAssistantModule:
    def pdf_assist(self, task):
        print("Pdf summarised")

    def execute(self, task):
        if task.action == "pdf_assist":
            return self.pdf_assist(task)
