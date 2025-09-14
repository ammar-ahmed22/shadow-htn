from flask import Flask, request, jsonify
import openai
import dotenv
import os
import requests

prompt = "FROM FRONT END"
dotenv.load_dotenv()
MARTIAN_API_KEY = os.getenv("MARTIAN_API_KEY")
url = "http://127.0.0.1:5000/code-context"
data =  {"prompt": prompt} 
response = requests.post(url, data=data)

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "martian-api"}), 200

@app.route('/ticket-code', methods=['POST'])
def make_ticket():
    global prompt
    data = request.json
    user_prompt = data.get("prompt", "FROM FRONT END")
    code_context = data.get("code_context", "")
    
    oai_client = openai.OpenAI(
        base_url="https://api.withmartian.com/v1",
        api_key=MARTIAN_API_KEY
    )

    prompt = f"""
Based on the following user requirements, generate a list of development tickets/todos in JSON format.

User requirements: {user_prompt}

Generate tickets that break down the work into actionable items. Each ticket should have:
- title: Brief, clear title
- description: Concise description of the work
- stage: One of "Discovery", "Development", "Testing", "Production"
- priority: One of "low", "medium", "high", "critical"
- estimate: Time estimate (e.g., "0.5d", "2d", "1w")

Legacy Code context: {code_context}
"""
    
    try:
        response = oai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000,
            timeout=120,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "ticket_generation_schema",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "tickets": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "additionalProperties": False,
                                    "properties": {
                                        "title": {"type": "string"},
                                        "description": {"type": "string"},
                                        "stage": {
                                            "type": "string",
                                            "enum": ["Discovery", "Development", "Testing", "Production"]
                                        },
                                        "priority": {
                                            "type": "string",
                                            "enum": ["low", "medium", "high", "critical"]
                                        },
                                        "estimate": {"type": "string"}
                                    },
                                    "required": ["title", "description", "stage", "priority", "estimate"]
                                }
                            }
                        },
                        "required": ["tickets"]
                    }
                }
            }
        )

        ai_response = response.choices[0].message.content
        ai_response = ai_response.replace("\n", "").strip()

        return jsonify(ai_response)
            
    except Exception as e:
        return jsonify({"error": f"{str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
