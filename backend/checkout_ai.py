import os
from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Yi-Sell Checkout AI")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class CheckoutRequest(BaseModel):
    produto: str
    preco: float
    user_duvida: str = None

@app.get("/")
def health_check():
    return {"status": "Yi-Sell Checkout AI Online"}

@app.post("/api/checkout/ai-helper")
async def ai_helper(data: CheckoutRequest):
    prompt = f"""
    Você é assistente de checkout do Yi-Sell. Seja direto e vendedor.
    Produto: {data.produto}
    Preço: R$ {data.preco}
    Dúvida do cliente: {data.user_duvida or 'Nenhuma'}

    Tarefa:
    1. Se tiver dúvida, responde em 2 linhas matando objeção de compra
    2. Se não tiver dúvida, cria 1 frase de urgência/escassez pra fechar venda
    3. Não invente promoção. Não é recomendação financeira.
    """

    chat = client.chat.completions.create(
        model="llama-3.1-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=150
    )

    return {
        "ai_resposta": chat.choices[0].message.content,
        "model": "llama-3.1-70b",
        "tokens_usados": chat.usage.total_tokens
    }
