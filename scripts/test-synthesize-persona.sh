#!/usr/bin/env bash
# Test synthesize-persona for both seed companies.
# Requires: supabase secrets set LLM_API_KEY=sk-ant-...

set -euo pipefail

PROJECT_URL="${VITE_SUPABASE_URL:-https://ounihqegansfgubbsluy.supabase.co}"
ANON_KEY="${VITE_SUPABASE_ANON_KEY:?Set VITE_SUPABASE_ANON_KEY}"

PSVIEW_ID="${PSVIEW_COMPANY_ID:-dad84ee0-f465-49ce-a89e-4af554134104}"
MERIDIAN_ID="${MERIDIAN_COMPANY_ID:-47e9e500-4adc-44b1-9177-0e8855632cda}"

call_persona() {
  local name="$1"
  local company_id="$2"
  echo ""
  echo "=== $name ($company_id) ==="
  curl -s -X POST "$PROJECT_URL/functions/v1/synthesize-persona" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"company_id\":\"$company_id\"}" | python3 -m json.tool
}

call_persona "PSVIEW" "$PSVIEW_ID"
call_persona "Meridian Capital" "$MERIDIAN_ID"
