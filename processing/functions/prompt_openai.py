
import os
from dotenv import load_dotenv
from openai import OpenAI
# Load the .env file
load_dotenv()
# Example usage
api_key = os.getenv('OPENAI_KEY')
# Initialize the OpenAI client
client = OpenAI(
    api_key=api_key,
)

def query_openai(prompt, schema=None):
    # Create a chat completion
    system_role = {
        "role": "system",
        "content": 'You are a Spanish data parser who is able to read and extract data from PDFs.'
    }
    query = {
        "role": "user",
        "content": prompt
    }
    # if we pass a schema we will get a json response
    format = schema if schema else "davinci"
    # Create a chat completion
    chat_completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[ system_role, query ],
        response_format=format,
    )
    return chat_completion.choices[0].message.parsed

def test_openai():
    prompt = { 
        "role": "system",
        "content": "What is the capital of France?" 
    }
    response = query_openai(prompt)
    return response == "The capital of France is Paris."