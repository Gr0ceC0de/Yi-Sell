import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from together import Together
import json

load_dotenv()
app = Flask(__name__)
together = Together(api_key=os.getenv("TOGETHER_API_KEY"))

# Mapeia os produtos
PRODUTOS = {
    "bot_trading": {
        "nome": "Bot Trading Assistant",
        "valor": 899.99,
        "link": os.getenv("LINK_BOT_TRADING_ASSISTANT_899"),
        "obs": ""
    },
    "indicators": {
        "nome": "Pack de Indicators",
        "valor": 350.00,
        "link": os.getenv("LINK_INDICATORS_350"),
        "obs": "Imposto de 15% já incluso no valor de R$ 350,00"
    }
}

@app.route("/checkout", methods=["POST"])
def checkout():
    try:
        data = json.loads(request.data.decode('utf-8', errors='ignore'))
        id_produto = data.get("id_produto")

        if id_produto not in PRODUTOS:
            return jsonify({"erro": "Produto inválido. Use 'bot_trading' ou 'indicators'"}), 400

        produto = PRODUTOS[id_produto]

        ia_copy = together.chat.completions.create(
            model="meta-llama/Llama-3.1-8b-instruct-turbo",
            messages=[{
                "role": "user",
                "content": f"Cria frase de venda para '{produto['nome']}' por R${produto['valor']}. Max 12 palavras. Urgência."
            }],
            max_tokens=25,
            temperature=0.7
        ).choices[0].message.content.strip()

        return jsonify({
            "produto": produto["nome"],
            "valor": produto["valor"],
            "copy_gerada": ia_copy,
            "url_pagamento": produto["link"],
            "observacao": produto["obs"]
        })

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)