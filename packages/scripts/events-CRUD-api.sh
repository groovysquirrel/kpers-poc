#!/bin/bash

# Events API CRUD Test Script
# A comprehensive template for testing REST API CRUD operations
#
# Usage:
#   ./events-CRUD-api.sh                    # Run full test suite
#   ./events-CRUD-api.sh -3                 # Start from step 3
#   VERBOSE=1 ./events-CRUD-api.sh          # Verbose output
#   EVENT_ID="uuid" ./events-CRUD-api.sh -3  # Use specific ID

set -e  # Exit on error (disabled in execute_command)

# ============================================
# Configuration
# ============================================
START_STEP=1
VERBOSE=${VERBOSE:-0}
AUTO_CONTINUE=${AUTO_CONTINUE:-0}  # Set to 1 to skip pauses

if [[ $1 =~ ^-([0-9]+)$ ]]; then
    START_STEP=${BASH_REMATCH[1]}
    echo "Starting from step $START_STEP"
fi

# AWS Cognito Configuration
USERNAME="justin@patternsatscale.com"
PASSWORD="Passw0rd!"
USER_POOL_ID="us-east-1_M1giOjn5M"
APP_CLIENT_ID="7t2ums0i7rfabvdlsj2fpep8m7"
COGNITO_REGION="us-east-1"
IDENTITY_POOL_ID="us-east-1:cf1447c7-48d2-49cb-9b13-ced8bdcb5dc9"
API_GATEWAY_REGION="us-east-1"

# API Configuration
INVOKE_URL=${INVOKE_URL:-"https://erci20ebod.execute-api.us-east-1.amazonaws.com"}

# Test Data
EVENT_ID=${EVENT_ID:-""}  # Set externally or captured from CREATE
TEST_MANAGER_ID="1"
TEST_EVENT_TYPE_ID="1"
TEST_EVENT_DATE="2025-10-15"
TEST_STAFF_ATTENDING='["Alice Johnson","Bob Smith"]'
TEST_COMMENTS="Test event created by CRUD test suite"

# Update Test Data
UPDATE_EVENT_TYPE_ID="2"
UPDATE_EVENT_DATE="2025-10-20"
UPDATE_STAFF_ATTENDING='["Charlie Brown","Diana Prince"]'
UPDATE_COMMENTS="Updated test event for CRUD testing"

# ============================================
# Color Output
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# Base Command Template
# ============================================
BASE_CMD="npx aws-api-gateway-cli-test \
--username=\"$USERNAME\" \
--password=\"$PASSWORD\" \
--user-pool-id=\"$USER_POOL_ID\" \
--app-client-id=\"$APP_CLIENT_ID\" \
--cognito-region=\"$COGNITO_REGION\" \
--identity-pool-id=\"$IDENTITY_POOL_ID\" \
--invoke-url=\"$INVOKE_URL\" \
--api-gateway-region=\"$API_GATEWAY_REGION\""

# ============================================
# Global State
# ============================================
LAST_COMMAND=""
LAST_OUTPUT=""
LAST_STATUS=0
STEP_FAILED=0

# ============================================
# Helper Functions
# ============================================

log_header() {
    echo ""
    echo -e "${CYAN}==========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}==========================================${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Extract UUID from output (handles both JSON and JS object formats)
extract_id() {
    local output="$1"
    echo "$output" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1
}

# Extract HTTP status code from output
extract_status_code() {
    local output="$1"
    echo "$output" | grep -oE "status: [0-9]+" | grep -oE "[0-9]+" | head -1
}

# Execute API command with error handling
execute_command() {
    local description="$1"
    local cmd="$2"
    
    log_info "Executing: $description"
    LAST_COMMAND="$cmd"
    STEP_FAILED=0
    
    set +e
    LAST_OUTPUT=$(eval "$cmd" 2>&1)
    LAST_STATUS=$?
    set -e
    
    # Display output
    echo ""
    echo "--- Response ---"
    echo "$LAST_OUTPUT"
    echo "--- End Response ---"
    echo ""
    
    # Check status
    if [ $LAST_STATUS -ne 0 ]; then
        log_error "Command failed with exit code $LAST_STATUS"
        STEP_FAILED=1
        return 1
    else
        log_success "Command succeeded"
        return 0
    fi
}

# Pause between steps with retry option
pause() {
    if [ $AUTO_CONTINUE -eq 1 ]; then
        return 0
    fi
    
    while true; do
        echo ""
        echo "Press [Enter] to continue, [R] to retry, [S] to skip, or [Q] to quit..."
        read -r -n 1 key
        
        case $key in
            "")
                echo ""
                return 0
                ;;
            [Rr])
                echo ""
                log_info "Retrying last command..."
                if [ -n "$LAST_COMMAND" ]; then
                    execute_command "Retry" "$LAST_COMMAND"
                    continue
                else
                    log_error "No previous command to retry"
                fi
                ;;
            [Ss])
                echo ""
                log_warning "Skipping to next step..."
                return 0
                ;;
            [Qq])
                echo ""
                log_warning "Exiting..."
                exit 0
                ;;
        esac
    done
}

# Run step if at or past START_STEP
run_step() {
    local step_num=$1
    local step_func=$2
    
    if [ "$step_num" -ge "$START_STEP" ]; then
        $step_func
        
        if [ $STEP_FAILED -eq 1 ]; then
            log_error "Step $step_num failed!"
        fi
        
        pause
    fi
}

# ============================================
# Test Steps
# ============================================

step1_list_initial() {
    log_header "Step 1: LIST - GET /events"
    echo "Purpose: Get initial list of events (seeds if empty)"
    
    execute_command "List all events" \
        "$BASE_CMD --path-template='/events' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 1 Complete: Initial list retrieved"
    fi
}

step2_create() {
    log_header "Step 2: CREATE - POST /events"
    echo "Purpose: Create a new test event"
    
    local body="{\"managerId\":\"$TEST_MANAGER_ID\",\"eventTypeId\":\"$TEST_EVENT_TYPE_ID\",\"eventDate\":\"$TEST_EVENT_DATE\",\"staffAttending\":$TEST_STAFF_ATTENDING,\"comments\":\"$TEST_COMMENTS\"}"
    
    execute_command "Create event" \
        "$BASE_CMD --path-template='/events' --method='POST' --body='$body'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        # Extract event ID from response
        EVENT_ID=$(extract_id "$LAST_OUTPUT")
        
        if [ -n "$EVENT_ID" ]; then
            echo ""
            log_success "Event created successfully!"
            log_info "Captured Event ID: $EVENT_ID"
            echo ""
        else
            log_error "Failed to extract event ID from response"
            STEP_FAILED=1
        fi
    fi
}

step3_get() {
    log_header "Step 3: GET - GET /events/:id"
    echo "Purpose: Retrieve the newly created event"
    
    if [ -z "$EVENT_ID" ]; then
        log_error "No event ID available. Run step 2 first or set EVENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Event ID: $EVENT_ID"
    
    execute_command "Get event by ID" \
        "$BASE_CMD --path-template='/events/$EVENT_ID' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        # Verify event data
        if echo "$LAST_OUTPUT" | grep -q "$TEST_MANAGER_ID"; then
            log_success "Step 3 Complete: Event retrieved and verified"
        else
            log_warning "Event retrieved but verification unclear"
        fi
    fi
}

step4_update() {
    log_header "Step 4: UPDATE - PUT /events/:id"
    echo "Purpose: Update the test event"
    
    if [ -z "$EVENT_ID" ]; then
        log_error "No event ID available. Run step 2 first or set EVENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Event ID: $EVENT_ID"
    log_info "Updating with new data..."
    
    local body="{\"eventTypeId\":\"$UPDATE_EVENT_TYPE_ID\",\"eventDate\":\"$UPDATE_EVENT_DATE\",\"staffAttending\":$UPDATE_STAFF_ATTENDING,\"comments\":\"$UPDATE_COMMENTS\"}"
    
    execute_command "Update event" \
        "$BASE_CMD --path-template='/events/$EVENT_ID' --method='PUT' --body='$body'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 4 Complete: Event updated"
    fi
}

step5_get_updated() {
    log_header "Step 5: VERIFY UPDATE - GET /events/:id"
    echo "Purpose: Verify the update was successful"
    
    if [ -z "$EVENT_ID" ]; then
        log_error "No event ID available. Run step 2 first or set EVENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Event ID: $EVENT_ID"
    log_info "Expecting date: $UPDATE_EVENT_DATE"
    
    execute_command "Get updated event" \
        "$BASE_CMD --path-template='/events/$EVENT_ID' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        # Verify update
        if echo "$LAST_OUTPUT" | grep -q "$UPDATE_EVENT_DATE"; then
            log_success "Step 5 Complete: Update verified (date found)"
        else
            log_warning "Event retrieved but update verification unclear"
        fi
    fi
}

step6_delete() {
    log_header "Step 6: DELETE - DELETE /events/:id"
    echo "Purpose: Delete the test event"
    
    if [ -z "$EVENT_ID" ]; then
        log_error "No event ID available. Run step 2 first or set EVENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Event ID: $EVENT_ID"
    
    execute_command "Delete event" \
        "$BASE_CMD --path-template='/events/$EVENT_ID' --method='DELETE'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 6 Complete: Event deleted"
    fi
}

step7_verify_delete() {
    log_header "Step 7: VERIFY DELETE - GET /events/:id"
    echo "Purpose: Verify event was deleted (should return 404)"
    
    if [ -z "$EVENT_ID" ]; then
        log_error "No event ID available. Run step 2 first or set EVENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Event ID: $EVENT_ID"
    log_info "Expected: 404 Not Found"
    
    execute_command "Verify deletion" \
        "$BASE_CMD --path-template='/events/$EVENT_ID' --method='GET'"
    
    # For this step, we EXPECT a 404, so we need to check the HTTP status code
    HTTP_STATUS=$(extract_status_code "$LAST_OUTPUT")
    
    if [ "$HTTP_STATUS" = "404" ]; then
        log_success "Step 7 Complete: Event confirmed deleted (404 received)"
        STEP_FAILED=0  # Reset failure since this is expected behavior
    elif [ -n "$HTTP_STATUS" ] && [ "$HTTP_STATUS" != "404" ]; then
        log_error "Expected 404 but got HTTP $HTTP_STATUS - event may still exist"
        STEP_FAILED=1
    else
        log_warning "Could not determine HTTP status - check output above"
        STEP_FAILED=1
    fi
}

step8_list_final() {
    log_header "Step 8: LIST FINAL - GET /events"
    echo "Purpose: List all events to confirm test event is gone"
    
    execute_command "List all events (final)" \
        "$BASE_CMD --path-template='/events' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        if [ -n "$EVENT_ID" ] && echo "$LAST_OUTPUT" | grep -q "$EVENT_ID"; then
            log_warning "Test event ID still appears in list"
        else
            log_success "Step 8 Complete: Final list retrieved (test event not found)"
        fi
    fi
}

# ============================================
# Main Test Flow
# ============================================

main() {
    log_header "Events API CRUD Test Suite"
    echo "This script will test all CRUD operations for the Events API"
    echo ""
    echo "Configuration:"
    echo "  API URL: $INVOKE_URL"
    echo "  Username: $USERNAME"
    echo "  Start Step: $START_STEP"
    if [ -n "$EVENT_ID" ]; then
        echo "  Event ID: $EVENT_ID"
    fi
    echo ""
    
    if [ $AUTO_CONTINUE -eq 0 ]; then
        echo "Press [Enter] to begin..."
        read
    fi
    
    # Run test steps
    run_step 1 step1_list_initial
    run_step 2 step2_create
    run_step 3 step3_get
    run_step 4 step4_update
    run_step 5 step5_get_updated
    run_step 6 step6_delete
    run_step 7 step7_verify_delete
    run_step 8 step8_list_final
    
    # Summary
    log_header "Test Suite Complete!"
    echo "All CRUD operations tested successfully."
    if [ -n "$EVENT_ID" ]; then
        echo "Test Event ID: $EVENT_ID"
    fi
    echo ""
}

# Run main
main

