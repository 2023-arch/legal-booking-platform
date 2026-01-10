import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.rag import rag_engine

async def main():
    print("Starting data indexing...")
    
    # Mock Legal Data
    documents = [
        {
            "id": "doc1",
            "text": "Under Section 138 of the Negotiable Instruments Act, 1881, the dishonour of a cheque is a criminal offence. The payee must send a legal notice to the drawer within 30 days of the dishonour."
        },
        {
            "id": "doc2",
            "text": "The Hindu Marriage Act, 1955 governs marriage and divorce among Hindus. Divorce can be granted on grounds like cruelty, adultery, desertion, or mutual consent."
        },
        {
            "id": "doc3",
            "text": "Regular bail is granted to a person who has been arrested or is in police custody. Anticipatory bail is granted under Section 438 of CrPC to a person expecting arrest."
        },
        {
            "id": "doc4",
            "text": "Consumer Protection Act, 2019 allows consumers to file complaints against defects in goods or deficiency in services. The complaint can be filed in District, State, or National Commissions based on the claim amount."
        }
    ]
    
    count = 0
    try:
        for doc in documents:
            print(f"Indexing document: {doc['id']}")
            rag_engine.upsert_document(doc['id'], doc['text'])
            count += 1
            
        print(f"Successfully indexed {count} documents.")
    except Exception as e:
        print(f"Error indexing data: {e}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
