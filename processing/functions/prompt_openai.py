
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
    query = {
        "role": "system",
        "content": prompt
    }
    # if we pass a schema we will get a json response
    json_schema = {
        'type': "json_schema",
        'json_schema': schema
    } if schema else None
    # Create a chat completion
    chat_completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[ query ],
        response_format=json_schema,
        
    )
    return chat_completion.choices[0].message.content

def query_openai_file(prompt, filename, schema=None):
    # create file 
    file = client.files.create(file=open(filename, 'rb'))
    # Create a chat completion
    query = {
        "role": "system",
        "content": prompt
    }
    # if we pass a schema we will get a json response
    json_schema = {
        'type': "json_schema",
        'json_schema': schema
    } if schema else None
    # Create a chat completion
    chat_completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[ query ],
        response_format=json_schema,
        file_ids=[file.id]
    )
    return chat_completion.choices[0].message.content


def test_openai():
    prompt = { 
        "role": "system",
        "content": "What is the capital of France?" 
    }
    response = query_openai(prompt)
    return response == "The capital of France is Paris."


# Example usage for testing purposes
pdf_filename = "./storage/pdfs/1790721450001_DocumentosGenerales_Oficio Nombramiento Administradores_2020-09-04_ALVERNIA DE CHACON IMELDA_PRESIDENTE.pdf"
text = query_openai_file("analyze the text in this pdf file", pdf_filename)
print(text)