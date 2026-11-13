import {
  formatDatePt,
  formatDecimal,
  formatEuroExact,
  formatNumber,
  formatScore,
} from "@/lib/format"
import type { ScoredCar } from "@/lib/scoring"

function SpecGroup({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: string }[]
}) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <dl className="mt-4 divide-y divide-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-6 py-3 text-sm"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-mono font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function SpecGrid({ entry }: { entry: ScoredCar }) {
  const { car } = entry
  const { specs, charging, warranty, price } = car
  const battery =
    specs.usableBatteryKwh !== specs.batteryKwh
      ? `${formatDecimal(specs.batteryKwh)} kWh (${formatDecimal(specs.usableBatteryKwh)} úteis)`
      : `${formatDecimal(specs.batteryKwh)} kWh`

  const dimensionRows = [
    { label: "Comprimento", value: `${formatNumber(specs.lengthMm)} mm` },
    { label: "Largura", value: `${formatNumber(specs.widthMm)} mm` },
    { label: "Altura", value: `${formatNumber(specs.heightMm)} mm` },
    { label: "Distância entre eixos", value: `${formatNumber(specs.wheelbaseMm)} mm` },
    {
      label: "Bagageira",
      value: `${specs.bootL} L${specs.frunkL > 0 ? ` + ${specs.frunkL} L` : ""}`,
    },
    { label: "Lugares", value: `${specs.seats}` },
    { label: "Portas", value: `${specs.doors}` },
  ]

  if (specs.towingBrakedKg) {
    dimensionRows.push({
      label: "Reboque com travão",
      value: `${formatNumber(specs.towingBrakedKg)} kg`,
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SpecGroup
        title="Powertrain e desempenho"
        rows={[
          {
            label: "Potência",
            value: `${formatNumber(specs.powerKw)} kW / ${formatNumber(specs.powerHp)} cv`,
          },
          { label: "Binário", value: `${formatNumber(specs.torqueNm)} Nm` },
          { label: "Tração", value: specs.drivetrain },
          {
            label: "0-100 km/h",
            value: `${formatScore(specs.acceleration0100)} s`,
          },
          {
            label: "Velocidade máxima",
            value: `${formatNumber(specs.topSpeedKmh)} km/h`,
          },
          { label: "Bateria", value: battery },
          { label: "Química", value: specs.batteryChemistry },
          { label: "Autonomia WLTP", value: `${formatNumber(specs.rangeKm)} km` },
          {
            label: "Consumo WLTP",
            value: `${formatDecimal(specs.consumptionKwh100)} kWh/100 km`,
          },
          { label: "Peso", value: `${formatNumber(specs.weightKg)} kg` },
        ]}
      />

      <SpecGroup
        title="Carregamento"
        rows={[
          { label: "Potência AC", value: `${formatNumber(charging.acKw)} kW` },
          { label: "Potência DC", value: `${formatNumber(charging.dcKw)} kW` },
          {
            label: "10-80% DC",
            value: `${formatNumber(charging.dcTime1080Min)} min`,
          },
          ...(charging.dcTime3080Min
            ? [
                {
                  label: "30-80% DC",
                  value: `${formatNumber(charging.dcTime3080Min)} min`,
                },
              ]
            : []),
          { label: "Conector", value: charging.connector },
          {
            label: "V2L",
            value: charging.v2l
              ? `Sim${charging.v2lKw ? ` (${formatScore(charging.v2lKw)} kW)` : ""}`
              : "Não",
          },
          { label: "V2H", value: charging.v2h ? "Sim" : "Não" },
        ]}
      />

      <SpecGroup title="Dimensões e praticidade" rows={dimensionRows} />

      <SpecGroup
        title="Preço e garantia"
        rows={[
          { label: "Versão avaliada", value: car.version },
          { label: "Preço", value: formatEuroExact(price.amount) },
          { label: "IVA", value: price.vatIncluded ? "Incluído" : "Não incluído" },
          { label: "Data de referência", value: formatDatePt(price.asOf) },
          { label: "Garantia do veículo", value: warranty.vehicle },
          { label: "Garantia da bateria", value: warranty.battery },
        ]}
      />
    </div>
  )
}
