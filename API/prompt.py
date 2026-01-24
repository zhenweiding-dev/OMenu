import gemini_api as g

def preference_prompt(user_name: str, preferences: dict) -> str:
    '''
    Generate a personalized preference summary using Gemini API.
    
    Args:
    user_name: The name of the user.
    preferences: A dictionary containing user preferences.
    
    Returns a personalized preference summary as a string.
    '''
    user_prompts = input("What do you want to eat next week?")

    user_perferences = {
        user_moods: ['chinese food‘,],
    

    }
    
    
    
    summary = g.gemini(prompt)
    return summary