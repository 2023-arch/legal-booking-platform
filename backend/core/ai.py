import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_case_summary(description: str) -> str:
    """
    Generates a structured legal summary from a user's case description using Gemini.
    """
    if not settings.GEMINI_API_KEY:
        return "AI Summary unavailable (API Key missing). Original Description: " + description

    prompt = f"""You are a legal assistant helping to summarize case descriptions for lawyers.

Given the following case description from a user, generate a clear, professional summary that captures the key legal issues and relevant details.

User's Description:
"{description}"

Generate a concise summary (100-150 words) that:
1. Identifies the main legal issue
2. Highlights key facts
3. Notes any urgency or time sensitivity
4. Uses professional legal terminology where appropriate
5. Is objective and factual

Summary:"""

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating AI summary: {e}")
        # Fallback to original text if AI fails
        return f"Auto-generated summary failed. Original text: {description}"

async def generate_generic_response(prompt: str) -> str:
    """
    Generates a generic response from Gemini based on a prompt.
    """
    if not settings.GEMINI_API_KEY:
        return "AI unavailable."

    try:
        model = genai.GenerativeModel('gemini-pro')
        response = await model.generate_content_async(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "Sorry, I encountered an error processing your request."
