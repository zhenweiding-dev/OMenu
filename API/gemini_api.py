import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

# Default model name, may change to gemini-3-pro-preview if needed
model = 'gemini-3-flash-preview' 

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

def gemini(prompt: str, model: str = model) -> str:
    '''
    Generate content using the specified model(default: gemini-3-flash-preview) and prompt.
    Args:
    prompt: The input text prompt to generate content from.
    model: The name of the model to use for content generation.
    Returns the generated content as a string.
    '''
    response = client.models.generate_content(
        model=model,
        contents=prompt
    )
    return response.text

# Example usage
if __name__ == "__main__":
    result = gemini("Write a short poem about architecture.")
    print(result)