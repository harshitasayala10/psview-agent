#!/usr/bin/env bash
# Test agent-turn: opening, positive, skeptical, hostile scenarios.
set -euo pipefail

PROJECT_URL="${VITE_SUPABASE_URL:-https://ounihqegansfgubbsluy.supabase.co}"
ANON_KEY="${VITE_SUPABASE_ANON_KEY:?Set VITE_SUPABASE_ANON_KEY}"
AGENT_CONFIG_ID="${PSVIEW_AGENT_CONFIG_ID:-8542d691-f75d-46d1-976a-e13b6d6e7642}"

json_body() {
  local conv_id="$1"
  local reply="${2:-}"
  if [ -n "$reply" ]; then
    python3 -c 'import json, sys; print(json.dumps({"conversation_id": sys.argv[1], "candidate_reply": sys.argv[2]}))' \
      "$conv_id" "$reply"
  else
    python3 -c 'import json, sys; print(json.dumps({"conversation_id": sys.argv[1]}))' \
      "$conv_id"
  fi
}

call_turn() {
  local label="$1"
  local conv_id="$2"
  local reply="${3:-}"
  echo ""
  echo "=== $label (conversation: $conv_id) ==="
  curl -s -X POST "$PROJECT_URL/functions/v1/agent-turn" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "$(json_body "$conv_id" "$reply")" \
    | python3 -m json.tool
}

create_conversation() {
  curl -s -X POST "$PROJECT_URL/rest/v1/conversations" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{
      \"agent_config_id\": \"$AGENT_CONFIG_ID\",
      \"candidate_name\": \"Alex Chen\",
      \"candidate_profile\": \"Senior full-stack engineer, 5 years React/Node, Series B startup. Passive but curious about founding roles.\",
      \"intent\": \"Book a 15-minute intro call with a PSVIEW founder\"
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])"
}

echo "Creating test conversations..."
OPENING_ID=$(create_conversation)
POSITIVE_ID=$(create_conversation)
SKEPTICAL_ID=$(create_conversation)
HOSTILE_ID=$(create_conversation)

call_turn "1. Opening message" "$OPENING_ID"

call_turn "2. Positive reply (opening first)" "$POSITIVE_ID"
call_turn "2. Positive reply" "$POSITIVE_ID" "This sounds interesting! What does the team look like and what's the comp range?"

call_turn "3. Skeptical reply (opening first)" "$SKEPTICAL_ID"
call_turn "3. Skeptical reply" "$SKEPTICAL_ID" "I get a lot of these messages. Why should I care about another AI recruiting startup?"

call_turn "4. Hostile reply (opening first)" "$HOSTILE_ID"
call_turn "4. Hostile reply" "$HOSTILE_ID" "Stop spamming me. Take me off your list."

echo ""
echo "Done. Conversation IDs:"
echo "  opening=$OPENING_ID positive=$POSITIVE_ID skeptical=$SKEPTICAL_ID hostile=$HOSTILE_ID"
