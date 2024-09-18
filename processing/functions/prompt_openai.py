
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


def query_openai(prompt):
    # Create a chat completion
    chat_completion = client.chat.completions.create(
        messages=[ prompt ],
        model="gpt-3.5-turbo",
    )
    return chat_completion.choices[0].message.content


def test_openai():
    prompt = { 
        "role": "system",
        "content": "What is the capital of France?" 
    }
    response = query_openai(prompt)
    return response == "The capital of France is Paris."

def prompt_acta_de_la_junta_general(text):

    data_format = '''{ 
        fecha,
        attendentes: [ { nombre, titulo, compania, numero_de_actiones }, ], 
        agenda : [ { punto, descripcion, conclusion }, ],
        conclusion,
    }'''

    prompt = {
        "role": "system",
        "content": "please provide me with the details of the acta de la junta general, into a json with the following format: " + data_format + "." + text
    }
    response = query_openai(prompt)
    return response