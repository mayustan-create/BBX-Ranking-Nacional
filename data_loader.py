# data_loader.py - Dados de todas as peças Beyblade X

# Classificação de Bits por tipo
BIT_TYPES = {
    "Attack": ["F", "LF", "R", "A", "GF", "L", "LR", "UF", "GR", "FF", "RA", "J"],
    "Defense": ["N", "HN", "P", "GP", "GN", "UN", "D", "W", "WB", "WW", "Y"],
    "Stamina": ["B", "O", "T", "HT", "S", "GB", "DB", "Q", "G", "LO", "M"],
    "Balance": ["H", "E", "FB", "MN", "U", "C", "BS", "TP", "K", "Z", "TK", "I", "Tr", "Op"]
}

# Todas as Blades organizadas por tipo
BLADES_DATA = {
    "BX": [
        "Dran Sword", "Hells Scythe", "Wizard Arrow", "Knight Shield", "Knight Lance",
        "Shark Edge", "Leon Claw", "Viper Tail", "Rhino Horn", "Dran Dagger",
        "Hells Chain", "Phoenix Wing", "Wyvern Gale", "Unicorn Sting", "Sphinx Cowl",
        "Tyranno Beat", "Weiss Tiger", "Cobalt Dragoon", "Black Shell", "Whale Wave",
        "Bear Scratch", "Crimson Garuda", "Shelter Drake", "Tricera Press", "Samurai Calibur",
        "Goat Tackle", "Dran Strike", "Cobalt Drake", "Phoenix Feather", "Shinobi Knife",
        "Mammoth Tusk", "Croc Crunch", "Samurai Steel"
    ],
    "UX": [
        "Dran Buster", "Hells Hammer", "Wizard Rod", "Shinobi Shadow", "Leon Crest",
        "Phoenix Rudder", "Silver Wolf", "Samurai Saber", "Knight Mail", "Ptera Swing",
        "Impact Drake", "Ghost Circle", "Golem Rock", "Scorpio Spear", "Shark Scale",
        "Tyranno Roar", "Clock Mirage", "Meteor Dragoon", "Mummy Curse", "Bullet Griffon",
        "Aero Pegasus", "Hover Wyvern", "Orochi Cluster"
    ],
    "CX": [
        "Dran Brave", "Wizard Arc", "Perseus Dark", "Hells Reaper", "Rhino Reaper",
        "Fox Brush", "Pegasus Blast", "Cerberus Flame", "Whale Flame", "Sol Eclipse",
        "Wolf Hunt", "Emperor Might", "Shark Gill", "Phoenix Flare", "Bahamut Blitz",
        "Knight Fortress", "Ragna Rage", "Leon Fang", "Valkyrie Volt"
    ]
}

# Todos os Ratchets
RATCHETS_DATA = [
    "0-60", "0-70", "0-80", "1-50", "1-60", "1-70", "1-80", "2-60", "2-70", "2-80",
    "3-60", "3-70", "3-80", "3-85", "4-50", "4-55", "4-60", "4-70", "4-80",
    "5-60", "5-70", "5-80", "6-60", "6-70", "6-80", "7-55", "7-60", "7-70", "7-80",
    "8-70", "9-60", "9-65", "9-70", "9-80", "M-85", "Tr", "Op"
]

# Todos os Bits com seus nomes completos
BITS_DATA = {
    "F": "Flat", "LF": "Low Flat", "R": "Rush", "A": "Accel", "GF": "Gear Flat",
    "L": "Level", "LR": "Low Rush", "UF": "Under Flat", "GR": "Gear Rush",
    "FF": "Free Flat", "RA": "Rubber Accel", "J": "Jolt",
    "N": "Needle", "HN": "High Needle", "P": "Point", "GP": "Gear Point",
    "GN": "Gear Needle", "UN": "Under Needle", "D": "Dot", "W": "Wedge",
    "WB": "Wall Ball", "WW": "Wall Wedge", "Y": "Yielding",
    "B": "Ball", "O": "Orb", "T": "Taper", "HT": "High Taper", "S": "Spike",
    "GB": "Gear Ball", "DB": "Disc Ball", "Q": "Quake", "G": "Glide",
    "LO": "Low Orb", "M": "Merge",
    "H": "Hexa", "E": "Elevate", "FB": "Free Ball", "MN": "Metal Needle",
    "U": "Unite", "C": "Cyclone", "BS": "Bound Spike", "TP": "Trans Point",
    "K": "Kick", "Z": "Zap", "TK": "Trans Kick", "I": "Ignition",
    "Tr": "Turbo", "Op": "Operate"
}

def get_bit_type(bit_code):
    """Retorna o tipo do bit baseado no código"""
    for bit_type, bits in BIT_TYPES.items():
        if bit_code in bits:
            return bit_type
    return "Balance"  # default

def get_ratchet_stats(ratchet):
    """Extrai pontos de contato e altura do ratchet"""
    if ratchet in ["Tr", "Op", "M-85"]:
        return {"contact_points": 0, "height": 85 if ratchet == "M-85" else 70}
    
    try:
        parts = ratchet.split("-")
        contact_points = int(parts[0])
        height = int(parts[1])
        return {"contact_points": contact_points, "height": height}
    except:
        return {"contact_points": 0, "height": 60}

def calculate_base_stats(blade_type, ratchet, bit_type):
    """
    Calcula stats base para um combo baseado em suas características
    Stats: Attack, Defense, Stamina, Xtreme_Dash, Burst_Resistance
    Valores de 0-100 cada
    """
    stats = {
        "attack": 50,
        "defense": 50,
        "stamina": 50,
        "xtreme_dash": 50,
        "burst_resistance": 50
    }
    
    # Blade contribui com características gerais
    if blade_type == "UX":
        stats["attack"] += 10
        stats["burst_resistance"] += 10
    elif blade_type == "CX":
        stats["defense"] += 5
        stats["stamina"] += 5
    
    # Ratchet - altura afeta defesa e estamina, pontos de contato afetam ataque
    ratchet_info = get_ratchet_stats(ratchet)
    height = ratchet_info["height"]
    contact_points = ratchet_info["contact_points"]
    
    # Altura menor = mais ataque e xtreme dash, maior = mais defesa
    if height <= 60:
        stats["attack"] += 15
        stats["xtreme_dash"] += 20
        stats["defense"] -= 5
    elif height >= 80:
        stats["defense"] += 15
        stats["attack"] -= 5
        stats["stamina"] += 10
    
    # Mais pontos de contato = mais ataque
    stats["attack"] += contact_points * 3
    stats["xtreme_dash"] += contact_points * 2
    
    # Bit type define o comportamento principal
    if bit_type == "Attack":
        stats["attack"] += 25
        stats["xtreme_dash"] += 25
        stats["stamina"] -= 15
        stats["burst_resistance"] += 10
    elif bit_type == "Defense":
        stats["defense"] += 25
        stats["burst_resistance"] += 15
        stats["attack"] -= 10
        stats["stamina"] += 5
    elif bit_type == "Stamina":
        stats["stamina"] += 30
        stats["defense"] += 10
        stats["attack"] -= 15
        stats["xtreme_dash"] -= 10
    elif bit_type == "Balance":
        stats["burst_resistance"] += 20
        stats["defense"] += 10
        stats["stamina"] += 10
    
    # Normalizar entre 0-100
    for key in stats:
        stats[key] = max(0, min(100, stats[key]))
    
    return stats

def get_blade_type(blade_name):
    """Retorna o tipo (BX, UX, CX) de uma blade"""
    for blade_type, blades in BLADES_DATA.items():
        if blade_name in blades:
            return blade_type
    return "BX"  # default

async def populate_database(db):
    """Popula o banco de dados com todas as peças"""
    
    # Limpar coleções existentes
    await db.blades.delete_many({})
    await db.ratchets.delete_many({})
    await db.bits.delete_many({})
    
    # Inserir Blades
    blades_to_insert = []
    for blade_type, blades in BLADES_DATA.items():
        for blade in blades:
            blades_to_insert.append({
                "name": blade,
                "type": blade_type,
                "display_name": blade
            })
    
    if blades_to_insert:
        await db.blades.insert_many(blades_to_insert)
    
    # Inserir Ratchets
    ratchets_to_insert = []
    for ratchet in RATCHETS_DATA:
        ratchet_info = get_ratchet_stats(ratchet)
        ratchets_to_insert.append({
            "name": ratchet,
            "contact_points": ratchet_info["contact_points"],
            "height": ratchet_info["height"],
            "display_name": ratchet
        })
    
    if ratchets_to_insert:
        await db.ratchets.insert_many(ratchets_to_insert)
    
    # Inserir Bits
    bits_to_insert = []
    for bit_code, bit_name in BITS_DATA.items():
        bit_type = get_bit_type(bit_code)
        bits_to_insert.append({
            "code": bit_code,
            "name": bit_name,
            "type": bit_type,
            "display_name": f"{bit_code} ({bit_name})"
        })
    
    if bits_to_insert:
        await db.bits.insert_many(bits_to_insert)
    
    print(f"✅ Database populated: {len(blades_to_insert)} blades, {len(ratchets_to_insert)} ratchets, {len(bits_to_insert)} bits")
