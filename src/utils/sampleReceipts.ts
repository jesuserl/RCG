/**
 * Generador de comprobantes visuales SVG como DataURL para pruebas instantáneas
 */
export function generateSampleReceiptSvg(
  storeName: string,
  category: string,
  concept: string,
  amount: number,
  currency: string = 'VES',
  date: string,
  receiptNumber: string
): string {
  const formattedAmount = `Bs. ${amount.toFixed(2)}`;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640" style="background:#ffffff; font-family: monospace;">
    <defs>
      <pattern id="dashes" width="10" height="1" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="6" y2="0" stroke="#cbd5e1" stroke-width="2"/>
      </pattern>
    </defs>
    
    <!-- Paper background with subtle shadow border -->
    <rect x="12" y="12" width="456" height="616" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    
    <!-- Header -->
    <text x="240" y="55" text-anchor="middle" font-size="18" font-weight="bold" fill="#0f172a" letter-spacing="1">${storeName.toUpperCase()}</text>
    <text x="240" y="78" text-anchor="middle" font-size="11" fill="#64748b">RIF / REGISTRO FISCAL: J-30984521-0</text>
    <text x="240" y="96" text-anchor="middle" font-size="11" fill="#64748b">COMPROBANTE FISCAL DIGITAL / FACTURA</text>
    
    <!-- Divider -->
    <rect x="28" y="112" width="424" height="2" fill="url(#dashes)"/>
    
    <!-- Meta Info -->
    <text x="36" y="140" font-size="12" fill="#475569">FACTURA N°:</text>
    <text x="444" y="140" text-anchor="end" font-size="12" font-weight="bold" fill="#0f172a">${receiptNumber}</text>
    
    <text x="36" y="165" font-size="12" fill="#475569">FECHA DE EMISIÓN:</text>
    <text x="444" y="165" text-anchor="end" font-size="12" fill="#0f172a">${date}</text>
    
    <text x="36" y="190" font-size="12" fill="#475569">RUBRO / CATEGORÍA:</text>
    <text x="444" y="190" text-anchor="end" font-size="12" font-weight="bold" fill="#2563eb">${category.toUpperCase()}</text>
    
    <text x="36" y="215" font-size="12" fill="#475569">MÉTODO DE PAGO:</text>
    <text x="444" y="215" text-anchor="end" font-size="12" fill="#0f172a">TARJETA CORPORATIVA / PAGO MÓVIL</text>
    
    <!-- Divider -->
    <rect x="28" y="235" width="424" height="2" fill="url(#dashes)"/>
    
    <!-- Items Table Header -->
    <text x="36" y="260" font-size="11" font-weight="bold" fill="#334155">CANT.  DESCRIPCIÓN</text>
    <text x="444" y="260" text-anchor="end" font-size="11" font-weight="bold" fill="#334155">TOTAL</text>
    <line x1="36" y1="270" x2="444" y2="270" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Item 1 -->
    <text x="36" y="295" font-size="12" fill="#0f172a">1.0    ${concept.slice(0, 32)}</text>
    <text x="444" y="295" text-anchor="end" font-size="12" font-weight="bold" fill="#0f172a">${formattedAmount}</text>
    
    <!-- Totals Area -->
    <rect x="28" y="380" width="424" height="2" fill="url(#dashes)"/>
    
    <text x="36" y="415" font-size="12" fill="#64748b">SUBTOTAL:</text>
    <text x="444" y="415" text-anchor="end" font-size="12" fill="#0f172a">${formattedAmount}</text>
    
    <text x="36" y="440" font-size="12" fill="#64748b">I.V.A. (INCLUIDO):</text>
    <text x="444" y="440" text-anchor="end" font-size="12" fill="#0f172a">Bs. ${(amount * 0.16).toFixed(2)}</text>
    
    <rect x="28" y="460" width="424" height="40" rx="4" fill="#f1f5f9"/>
    <text x="40" y="485" font-size="14" font-weight="bold" fill="#0f172a">TOTAL LIQUIDADO:</text>
    <text x="440" y="485" text-anchor="end" font-size="16" font-weight="bold" fill="#1e3a8a">${formattedAmount}</text>
    
    <!-- Barcode & Stamp Simulation -->
    <g transform="translate(100, 520)">
      <rect x="0" y="0" width="3" height="40" fill="#0f172a"/>
      <rect x="6" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="12" y="0" width="5" height="40" fill="#0f172a"/>
      <rect x="22" y="0" width="1" height="40" fill="#0f172a"/>
      <rect x="28" y="0" width="4" height="40" fill="#0f172a"/>
      <rect x="36" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="42" y="0" width="6" height="40" fill="#0f172a"/>
      <rect x="54" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="62" y="0" width="4" height="40" fill="#0f172a"/>
      <rect x="72" y="0" width="1" height="40" fill="#0f172a"/>
      <rect x="78" y="0" width="7" height="40" fill="#0f172a"/>
      <rect x="90" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="98" y="0" width="4" height="40" fill="#0f172a"/>
      <rect x="108" y="0" width="6" height="40" fill="#0f172a"/>
      <rect x="120" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="128" y="0" width="5" height="40" fill="#0f172a"/>
      <rect x="138" y="0" width="3" height="40" fill="#0f172a"/>
      <rect x="146" y="0" width="1" height="40" fill="#0f172a"/>
      <rect x="154" y="0" width="4" height="40" fill="#0f172a"/>
      <rect x="164" y="0" width="6" height="40" fill="#0f172a"/>
      <rect x="176" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="184" y="0" width="4" height="40" fill="#0f172a"/>
      <rect x="194" y="0" width="3" height="40" fill="#0f172a"/>
      <rect x="204" y="0" width="5" height="40" fill="#0f172a"/>
      <rect x="214" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="222" y="0" width="4" height="40" fill="#0f172a"/>
      <rect x="232" y="0" width="7" height="40" fill="#0f172a"/>
      <rect x="246" y="0" width="2" height="40" fill="#0f172a"/>
      <rect x="254" y="0" width="5" height="40" fill="#0f172a"/>
      <rect x="264" y="0" width="3" height="40" fill="#0f172a"/>
    </g>
    <text x="240" y="580" text-anchor="middle" font-size="10" fill="#94a3b8">AUTORIZACIÓN SENIAT · CONTROL N° ${receiptNumber}</text>
    <text x="240" y="600" text-anchor="middle" font-size="10" fill="#cbd5e1">DOCUMENTO VÁLIDO PARA RENDICIÓN DE CUENTAS</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
