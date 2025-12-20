from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
from prompts.base import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
import json

load_dotenv()

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    max_tokens=2048,
    max_retries=6,
)

async def generate_proposal_markdown(scopeJson: dict, audience: str = "mixed") -> str:
    
    project_data_str = json.dumps(scopeJson, indent=2)
    
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=USER_PROMPT_TEMPLATE.format(project_data=project_data_str))
    ]
    
    response = await model.ainvoke(messages)
    return response.content