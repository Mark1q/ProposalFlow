from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv
import json

load_dotenv()

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.7,
    max_tokens=2048,
    max_retries=6,
)

async def generate_proposal_markdown(scopeJson: dict) -> str:
    
    system_instruction = """
    **ROLE**
    You are an expert Senior Solutions Architect writing a project proposal. 
    Your goal is to convert raw project data into a persuasive, professional document.

    **FORMATTING RULES**
    1. Output ONLY valid Markdown.
    2. Do NOT use code blocks (```markdown). Just return the raw markdown text.
    3. Do NOT include conversational filler like "Here is the proposal" or "I hope this helps".
    4. Use H2 headers (##) for main sections and H3 (###) for subsections.

    **REQUIRED STRUCTURE**
    You must include these exact sections:
    1. ## Executive Summary (High-level business value)
    2. ## Project Scope (Detailed breakdown of features)
    3. ## Technical Stack (Based on the input)
    4. ## Timeline & Roadmap (Estimated phases)
    5. ## Investment (Budget breakdown)

    **TONE**
    Professional, confident, and enterprise-grade.
    """

    formatted_data_string = json.dumps(scopeJson, indent=2)
    
    user_prompt = f"""
    Here is the project scope data provided by the client. 
    Generate the proposal based strictly on this information.
    
    <scope_data>
    {formatted_data_string}
    </scope_data>
    """

    messages = [
        SystemMessage(content=system_instruction),
        HumanMessage(content=user_prompt)
    ]
    
    response = await model.ainvoke(messages)
    
    return response.content
    
    




