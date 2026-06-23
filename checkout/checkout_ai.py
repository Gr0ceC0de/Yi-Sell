import os

import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from together import Together # MUDOU: era groq
from dotenv import load_

load_dotenv()
app = FastAPI(title="Yi-Sell Checkout AI")

client = Together(api_key=os.getenv("TOGETHER_API_KEY")) # MUDOU: era Groq(...)

class CheckoutRequest(BaseModel):
    produto: str
    preco: float
    user_duvida: str = None

@app.post("/api/checkout/ai-helper")
async def ai_helper(data: CheckoutRequest):
    prompt = f"""
    Você é assistente de checkout do Yi-Sell. Seja direto e vendedor.
    Produto: {data.produto}
    Preço: R$ {data.preco}
    Dúvida: {data.user_duvida or 'Nenhuma'}
    Se tiver dúvida, responde em 2 linhas matando objeção.
    Se não tiver, cria 1 frase de urgência pra fechar venda.
    """

    chat = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", # MUDOU: nome do modelo
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=150
    )

    return {
        "ai_resposta": chat.choices[0].message.content,
        "model": "llama-3.1-70b",
        "tokens_usados": chat.usage.total_tokens
    }
