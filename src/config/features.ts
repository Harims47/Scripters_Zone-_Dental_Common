export type ProductTier = '50k' | '1l' | 'custom';

export interface FeatureFlags {
  /** Digital Radiography & Imaging (OPG / RVG viewer, annotations) */
  opgRvg: boolean;
  /** Insurance & Corporate Reimbursement Claims module */
  reimbursement: boolean;
  /** Same-day queue transfer between doctors */
  transferPatient: boolean;
  /** External Doctor Advice & Medical Clearance workflow */
  externalAdvice: boolean;
  /** In-house Pharmacy inventory and medicine dispensing */
  pharmacy: boolean;
  /** Separate Material / Lab Purchase Order menu & distinct report (e.g. Client Y customization) */
  separateMaterialPo: boolean;
  /** Receipt Audit field isolation (strictly disabled by default) */
  auditReceiptIsolation: boolean;
  /** Historical Paper Records Migration module */
  historicalMigration: boolean;
}

export interface ClinicBranding {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logoUrl: string;
  iconUrl: string;
}

// -----------------------------------------------------------------------------
// Baseline Defaults by Commercial Tier
// -----------------------------------------------------------------------------
const TIER_DEFAULTS: Record<ProductTier, FeatureFlags> = {
  '50k': {
    opgRvg: false,
    reimbursement: false,
    transferPatient: false,
    externalAdvice: false,
    pharmacy: true,
    separateMaterialPo: false,
    auditReceiptIsolation: false,
    historicalMigration: false,
  },
  '1l': {
    opgRvg: true,
    reimbursement: true,
    transferPatient: true,
    externalAdvice: true,
    pharmacy: true,
    separateMaterialPo: false,
    auditReceiptIsolation: false,
    historicalMigration: true,
  },
  'custom': {
    opgRvg: true,
    reimbursement: true,
    transferPatient: true,
    externalAdvice: true,
    pharmacy: true,
    separateMaterialPo: false,
    auditReceiptIsolation: false,
    historicalMigration: false,
  }
};

/**
 * Parses a boolean from environment variable with fallback.
 */
function parseBoolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  const lower = value.trim().toLowerCase();
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no') return false;
  return fallback;
}

/**
 * Resolves active feature flags based on VITE_APP_TIER + granular environment overrides.
 */
export function getFeatureFlags(): FeatureFlags {
  const envTier = (import.meta.env.VITE_APP_TIER || '1l').toLowerCase() as ProductTier;
  const base = TIER_DEFAULTS[envTier] || TIER_DEFAULTS['1l'];

  return {
    opgRvg: parseBoolEnv(import.meta.env.VITE_FEATURE_OPG_RVG, base.opgRvg),
    reimbursement: parseBoolEnv(import.meta.env.VITE_FEATURE_REIMBURSEMENT, base.reimbursement),
    transferPatient: parseBoolEnv(import.meta.env.VITE_FEATURE_TRANSFER_PATIENT, base.transferPatient),
    externalAdvice: parseBoolEnv(import.meta.env.VITE_FEATURE_EXTERNAL_ADVICE, base.externalAdvice),
    pharmacy: parseBoolEnv(import.meta.env.VITE_FEATURE_PHARMACY, base.pharmacy),
    separateMaterialPo: parseBoolEnv(import.meta.env.VITE_FEATURE_SEPARATE_MATERIAL_PO, base.separateMaterialPo),
    auditReceiptIsolation: parseBoolEnv(import.meta.env.VITE_FEATURE_AUDIT_FIELD, base.auditReceiptIsolation),
    historicalMigration: parseBoolEnv(import.meta.env.VITE_FEATURE_HISTORICAL_MIGRATION, base.historicalMigration),
  };
}

/**
 * Resolves clinic white-label branding configuration.
 */
export function getClinicBranding(): ClinicBranding {
  return {
    name: import.meta.env.VITE_CLINIC_NAME || 'Dental Care Clinic',
    tagline: import.meta.env.VITE_CLINIC_TAGLINE || 'Advanced Oral Health & Dental Care',
    phone: import.meta.env.VITE_CLINIC_PHONE || '+91 98765 43210',
    email: import.meta.env.VITE_CLINIC_EMAIL || 'care@dentalclinic.com',
    address: import.meta.env.VITE_CLINIC_ADDRESS || '123 Healthcare Ave, Medical Enclave',
    logoUrl: import.meta.env.VITE_CLINIC_LOGO_URL || '/scripters_zone_logo_zoomed.png',
    iconUrl: import.meta.env.VITE_CLINIC_ICON_URL || '/dental-icon.png',
  };
}

// Active singleton instances for immediate use
export const activeFeatures = getFeatureFlags();
export const activeBranding = getClinicBranding();
