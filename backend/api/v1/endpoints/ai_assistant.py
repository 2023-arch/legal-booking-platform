from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api import deps
from models.user import User
from core import ai
from core.rag import rag_engine

router = APIRouter()

class AskRequest(BaseModel):
    query: str

class AskResponse(BaseModel):
    answer: str
    context_used: bool

@router.post("/ask", response_model=AskResponse)
async def ask_assistant(
    request: AskRequest,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Ask the AI Assistant a legal question.
    Uses RAG to find relevant context from the knowledge base.
    """
    # 1. Retrieve Context
    context = rag_engine.query_knowledge_base(request.query)
    
    # 2. Construct Prompt
    if context:
        prompt = f"Context from Legal Knowledge Base:\n{context}\n\nUser Question: {request.query}\n\nAnswer the question based on the context provided. If the context is unsure, provide a general legal disclaimer."
        context_used = True
    else:
        # Fallback to general knowledge if no context found (or strictly refuse to answer)
        prompt = f"User Question: {request.query}\n\nProvide a helpful response. Include a disclaimer that you are an AI and this is not legal advice."
        context_used = False
        
    # 3. Generate Answer
    # We reuse the core.ai module but might need a generic 'generate_content' method there.
    # Currently core.ai has 'generate_case_summary'. Let's assume we add 'generate_response' or reuse logic.
    # For now, I'll call a new method I'll add to core.ai
    
    answer = await ai.generate_generic_response(prompt)
    
    return {
        "answer": answer,
        "context_used": context_used
    }
