import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pinecone import Pinecone
from core.config import settings
from typing import List

class KnowledgeBase:
    def __init__(self):
        self.index = None
        self.embeddings = None
        
        try:
            self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
            self.index_name = "legal-booking-index" 
            self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=settings.GEMINI_API_KEY)
            self.index = self.pc.Index(self.index_name)
        except Exception as e:
            print(f"RAG Warning: Could not initialize Pinecone. RAG features will be disabled. Error: {e}")

    def embed_text(self, text: str) -> List[float]:
        return self.embeddings.embed_query(text)

    def query_knowledge_base(self, query: str, top_k: int = 3) -> str:
        """
        Query Pinecone for relevant context.
        """
        if not self.index:
            return ""
            
        try:
            vector = self.embed_text(query)
            results = self.index.query(vector=vector, top_k=top_k, include_metadata=True)
            
            context = ""
            for match in results.matches:
                if match.score > 0.7: # Threshold
                    context += f"{match.metadata.get('text', '')}\n\n"
            
            return context
        except Exception as e:
            print(f"Error querying Knowledge Base: {e}")
            return ""

    def upsert_document(self, doc_id: str, text: str):
        """
        Embed and upload a document chunk.
        """
        if not self.index:
            return
            
        vector = self.embed_text(text)
        self.index.upsert(vectors=[(doc_id, vector, {"text": text})])

rag_engine = KnowledgeBase()
