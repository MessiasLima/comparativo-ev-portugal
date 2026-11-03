export interface EquipmentItem {
  id: string
  label: string
  category: string
}

export const EQUIPMENT_CHECKLIST: EquipmentItem[] = [
  // ADAS e segurança
  { id: "acc", label: "Cruise control adaptativo", category: "ADAS e segurança" },
  { id: "lane-keep", label: "Assistência de manutenção de faixa", category: "ADAS e segurança" },
  { id: "blind-spot", label: "Deteção de ângulo morto", category: "ADAS e segurança" },
  { id: "rear-cross-traffic", label: "Alerta de tráfego cruzado traseiro", category: "ADAS e segurança" },
  { id: "front-cross-traffic", label: "Alerta de tráfego cruzado dianteiro", category: "ADAS e segurança" },
  { id: "aeb", label: "Travagem automática de emergência", category: "ADAS e segurança" },
  { id: "traffic-sign", label: "Reconhecimento de sinais de trânsito", category: "ADAS e segurança" },
  { id: "driver-monitor", label: "Monitorização do condutor", category: "ADAS e segurança" },
  { id: "camera-360", label: "Câmara 360º", category: "ADAS e segurança" },
  { id: "remote-park", label: "Estacionamento remoto", category: "ADAS e segurança" },
  { id: "parking-sensors", label: "Sensores de estacionamento dianteiros e traseiros", category: "ADAS e segurança" },
  { id: "adaptive-high-beam", label: "Máximos automáticos", category: "ADAS e segurança" },

  // Conforto
  { id: "heated-seats", label: "Bancos dianteiros aquecidos", category: "Conforto" },
  { id: "ventilated-seats", label: "Bancos dianteiros ventilados", category: "Conforto" },
  { id: "memory-seats", label: "Bancos elétricos com memória", category: "Conforto" },
  { id: "heated-steering", label: "Volante aquecido", category: "Conforto" },
  { id: "climate-2zone", label: "Climatização de 2 zonas", category: "Conforto" },
  { id: "heat-pump", label: "Bomba de calor", category: "Conforto" },
  { id: "heated-rear-seats", label: "Bancos traseiros aquecidos", category: "Conforto" },

  // Tecnologia
  { id: "hud", label: "Head-up display", category: "Tecnologia" },
  { id: "premium-audio", label: "Sistema de som premium", category: "Tecnologia" },
  { id: "wireless-charging", label: "Carregamento wireless", category: "Tecnologia" },
  { id: "carplay", label: "Apple CarPlay / Android Auto", category: "Tecnologia" },
  { id: "digital-cockpit", label: "Cockpit digital", category: "Tecnologia" },
  { id: "large-screen", label: 'Ecrã central ≥12,9"', category: "Tecnologia" },
  { id: "connected-services", label: "Serviços conectados", category: "Tecnologia" },
  { id: "ota", label: "Atualizações OTA", category: "Tecnologia" },
  { id: "digital-key", label: "Chave digital / NFC", category: "Tecnologia" },

  // Carroçaria e conveniência
  { id: "panoramic-roof", label: "Teto panorâmico", category: "Carroçaria e conveniência" },
  { id: "v2l", label: "V2L (tomada externa)", category: "Carroçaria e conveniência" },
  { id: "v2h", label: "V2H (alimentar a casa)", category: "Carroçaria e conveniência" },
  { id: "electric-tailgate", label: "Porta-bagagens elétrico", category: "Carroçaria e conveniência" },
  { id: "frunk", label: "Bagageira dianteira (frunk)", category: "Carroçaria e conveniência" },
  { id: "wheels-19", label: 'Jantes de 19"', category: "Carroçaria e conveniência" },
  { id: "sport-seats", label: "Bancos desportivos", category: "Carroçaria e conveniência" },
  { id: "ambient-lighting", label: "Iluminação ambiente", category: "Carroçaria e conveniência" },
  { id: "rear-usb", label: "USB traseiras", category: "Carroçaria e conveniência" },
  { id: "adaptive-suspension", label: "Suspensão adaptativa", category: "Carroçaria e conveniência" },
]

export const EQUIPMENT_BY_ID = Object.fromEntries(
  EQUIPMENT_CHECKLIST.map((item) => [item.id, item]),
) as Record<string, EquipmentItem>

export const EQUIPMENT_CATEGORIES = [
  "ADAS e segurança",
  "Conforto",
  "Tecnologia",
  "Carroçaria e conveniência",
] as const
