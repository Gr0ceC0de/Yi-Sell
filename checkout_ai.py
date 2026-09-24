import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from together import Together
from dotenv import load_dotenv

# 1. Cargar variables de entorno de forma segura
load_dotenv()

app = FastAPI(title="Yi-Sell Checkout AI")

# 2. Validar y configurar la API Key de Together
TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
if not TOGETHER_API_KEY:
    raise ValueError("ERROR CRÍTICO: Falta la variable de entorno TOGETHER_API_KEY en el archivo .env")

client = Together(api_key=TOGETHER_API_KEY)

# 3. Modelo de datos de entrada validado
class CheckoutRequest(BaseModel):
    produto: str
    preco: float
    user_duvida: Optional[str] = None

# 4. Endpoint del asistente de IA
@app.post("/api/checkout/ai-helper")
async def ai_helper(data: CheckoutRequest):
    try:
        prompt = f"""
        Você é um assistente de checkout especializado do Yi-Sell. Seja direto, persuasivo e profissional.
        Produto: {data.produto}
        Preço: R$ {data.preco:.2f}
        Dúvida do cliente: {data.user_duvida or 'Nenhuma dúvida específica'}
        
        INSTRUÇÕES RÍGIDAS:
        - Se o cliente tiver uma dúvida, responda em NO MÁXIMO 2 linhas matando a objeção de forma clara.
        - Se NÃO tiver dúvida, crie 1 frase curta de urgência ou escassez para incentivar o fechamento da venda agora.
        - Responda APENAS com texto puro. NÃO use markdown, negrito ou emojis.
        """

        response = client.chat.completions.create(
            model="meta-llama/Meta-Llama-3-8B-Instruct", 
            messages=[
                {"role": "system", "content": "Eres un asistente de ventas experto, conciso y directo."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )

        ai_message = response.choices[0].message.content.strip()

        return {
            "success": True,
            "resposta": ai_message
        }

    except Exception as e:
        print(f"[ERROR] Fallo en AI Helper: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Erro interno ao processar a assistência de IA. Tente novamente."
        )