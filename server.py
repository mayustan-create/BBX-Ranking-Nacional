from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime
from data_loader import (
    populate_database, calculate_base_stats, get_blade_type, 
    get_bit_type, BITS_DATA
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ==================== MODELS ====================

class Blade(BaseModel):
    name: str
    type: str  # BX, UX, CX
    display_name: str

class Ratchet(BaseModel):
    name: str
    contact_points: int
    height: int
    display_name: str

class Bit(BaseModel):
    code: str
    name: str
    type: str  # Attack, Defense, Stamina, Balance
    display_name: str

class PartsResponse(BaseModel):
    blades: List[Dict]
    ratchets: List[Dict]
    bits: List[Dict]

class ComboRequest(BaseModel):
    blade: str
    ratchet: str
    bit: str

class ComboStats(BaseModel):
    combo_string: str
    attack: int
    defense: int
    stamina: int
    xtreme_dash: int
    burst_resistance: int
    overall_rating: float  # 0-10
    usage_count: int
    popularity_boost: float

class ComboInput(BaseModel):
    blade: str
    ratchet: str
    bit: str

class DeckRegistration(BaseModel):
    player_name: str
    city: str
    event_name: str
    event_date: str
    combo1: ComboInput
    combo2: ComboInput
    combo3: ComboInput

class DeckResponse(BaseModel):
    id: str
    player_name: str
    city: str
    event_name: str
    event_date: str
    combos: List[str]
    registered_at: datetime

class RankingItem(BaseModel):
    combo: str
    usage_count: int
    percentage: float


# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_db():
    """Inicializa o banco de dados com todas as peças"""
    try:
        # Verificar se já existem peças no banco
        blade_count = await db.blades.count_documents({})
        if blade_count == 0:
            logger.info("Populando banco de dados com peças...")
            await populate_database(db)
            logger.info("✅ Banco de dados populado com sucesso!")
        else:
            logger.info(f"✅ Banco já possui {blade_count} blades")
    except Exception as e:
        logger.error(f"Erro ao inicializar banco: {e}")


# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {
        "message": "Beyblade X Combo Builder API",
        "version": "1.0",
        "endpoints": [
            "/api/parts",
            "/api/calculate-combo",
            "/api/register-deck",
            "/api/ranking",
            "/api/combo-stats/{combo}"
        ]
    }

@api_router.get("/parts", response_model=PartsResponse)
async def get_parts():
    """Retorna todas as peças disponíveis"""
    try:
        blades = await db.blades.find({}, {"_id": 0}).to_list(1000)
        ratchets = await db.ratchets.find({}, {"_id": 0}).to_list(1000)
        bits = await db.bits.find({}, {"_id": 0}).to_list(1000)
        
        return {
            "blades": blades,
            "ratchets": ratchets,
            "bits": bits
        }
    except Exception as e:
        logger.error(f"Erro ao buscar peças: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar peças")

@api_router.post("/calculate-combo", response_model=ComboStats)
async def calculate_combo(combo: ComboRequest):
    """Calcula as estatísticas de um combo"""
    try:
        # Buscar informações da blade
        blade_type = get_blade_type(combo.blade)
        
        # Buscar informações do bit
        bit_code = combo.bit.split(" ")[0]  # Pega apenas o código (ex: "H" de "H (Hexa)")
        bit_type = get_bit_type(bit_code)
        
        # Calcular stats base
        base_stats = calculate_base_stats(blade_type, combo.ratchet, bit_type)
        
        # Verificar uso do combo (popularidade)
        combo_string = f"{combo.blade} {combo.ratchet} {combo.bit}"
        usage_doc = await db.combo_usage.find_one({"combo": combo_string})
        usage_count = usage_doc["count"] if usage_doc else 0
        
        # Boost de popularidade (combos mais usados ganham até +1.0 na nota)
        popularity_boost = min(usage_count / 100, 1.0)
        
        # Calcular nota geral (0-10)
        total_stats = sum(base_stats.values())
        max_possible = 500  # 5 stats × 100
        base_rating = (total_stats / max_possible) * 10
        overall_rating = min(10.0, base_rating + popularity_boost)
        
        return ComboStats(
            combo_string=combo_string,
            attack=base_stats["attack"],
            defense=base_stats["defense"],
            stamina=base_stats["stamina"],
            xtreme_dash=base_stats["xtreme_dash"],
            burst_resistance=base_stats["burst_resistance"],
            overall_rating=round(overall_rating, 1),
            usage_count=usage_count,
            popularity_boost=round(popularity_boost, 2)
        )
    except Exception as e:
        logger.error(f"Erro ao calcular combo: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao calcular combo: {str(e)}")

@api_router.post("/register-deck", response_model=DeckResponse)
async def register_deck(deck: DeckRegistration):
    """Registra um deck de torneio"""
    try:
        # Criar lista de combos
        combos = [
            f"{deck.combo1.blade} {deck.combo1.ratchet} {deck.combo1.bit}",
            f"{deck.combo2.blade} {deck.combo2.ratchet} {deck.combo2.bit}",
            f"{deck.combo3.blade} {deck.combo3.ratchet} {deck.combo3.bit}"
        ]
        
        # Criar documento do deck
        deck_id = str(uuid.uuid4())
        deck_doc = {
            "id": deck_id,
            "player_name": deck.player_name,
            "city": deck.city,
            "event_name": deck.event_name,
            "event_date": deck.event_date,
            "combos": combos,
            "registered_at": datetime.utcnow()
        }
        
        # Salvar deck
        await db.decks.insert_one(deck_doc)
        
        # Atualizar contadores de uso de cada combo
        for combo in combos:
            await db.combo_usage.update_one(
                {"combo": combo},
                {
                    "$inc": {"count": 1},
                    "$set": {"last_updated": datetime.utcnow()}
                },
                upsert=True
            )
        
        logger.info(f"✅ Deck registrado: {deck.player_name} - {deck.event_name}")
        
        return DeckResponse(**deck_doc)
    except Exception as e:
        logger.error(f"Erro ao registrar deck: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao registrar deck: {str(e)}")

@api_router.get("/ranking", response_model=List[RankingItem])
async def get_ranking(limit: int = 20):
    """Retorna o ranking dos combos mais usados"""
    try:
        # Buscar combos mais usados
        ranking = await db.combo_usage.find().sort("count", -1).limit(limit).to_list(limit)
        
        # Calcular total de usos para percentual
        total_uses = sum(item["count"] for item in ranking)
        
        result = []
        for item in ranking:
            percentage = (item["count"] / total_uses * 100) if total_uses > 0 else 0
            result.append(RankingItem(
                combo=item["combo"],
                usage_count=item["count"],
                percentage=round(percentage, 1)
            ))
        
        return result
    except Exception as e:
        logger.error(f"Erro ao buscar ranking: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar ranking")

@api_router.get("/combo-stats/{combo_name}")
async def get_combo_stats(combo_name: str):
    """Retorna estatísticas de uso de um combo específico"""
    try:
        usage_doc = await db.combo_usage.find_one({"combo": combo_name})
        
        if not usage_doc:
            return {
                "combo": combo_name,
                "usage_count": 0,
                "last_updated": None
            }
        
        return {
            "combo": usage_doc["combo"],
            "usage_count": usage_doc["count"],
            "last_updated": usage_doc.get("last_updated")
        }
    except Exception as e:
        logger.error(f"Erro ao buscar stats do combo: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar stats")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
