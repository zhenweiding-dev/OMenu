import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

def gemini3_pro(prompt: str) -> str:
    '''
    Generate content using the specified model(default: gemini-3-pro-preview) and prompt.
    Args:
    prompt: The input text prompt to generate content from.
    model: The name of the model to use for content generation.
    Returns the generated content as a string.
    '''
    response = client.models.generate_content(
        model='gemini-3-pro-preview',
        contents=prompt
    )
    return response

def gemini3_flash(prompt: str) -> str:
    '''
    Generate content using the specified model(gemini-3-flash-preview) and prompt.
    Args:
    prompt: The input text prompt to generate content from.
    model: The name of the model to use for content generation.
    Returns the generated content as a string.
    '''
    response = client.models.generate_content(
        model='gemini-3-flash-preview',
        contents=prompt
    )
    return response

def gemini2_5_pro(prompt: str) -> str:
    '''
    Generate content using the specified model(gemini-2.5-pro-preview) and prompt.
    Args:
    prompt: The input text prompt to generate content from.
    model: The name of the model to use for content generation.
    Returns the generated content as a string.
    '''
    response = client.models.generate_content(
        model='gemini-2.5-pro-preview',
        contents=prompt
    )
    return response

# Example usage
if __name__ == "__main__":
    result = gemini3_pro("Write a short poem about architecture.")
    print(result)