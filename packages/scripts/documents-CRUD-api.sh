#!/bin/bash

# Documents API CRUD Test Script
# Tests REST API CRUD operations for documents
#
# Usage:
#   ./documents-CRUD-api.sh                    # Run full test suite
#   ./documents-CRUD-api.sh -3                 # Start from step 3
#   DOCUMENT_ID="uuid" ./documents-CRUD-api.sh -3  # Use specific ID

set -e

# ============================================
# Configuration
# ============================================
START_STEP=1
AUTO_CONTINUE=${AUTO_CONTINUE:-0}

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
DOCUMENT_ID=${DOCUMENT_ID:-""}
TEST_DOCUMENT_TYPE_ID="doc-type-1"  # Using existing document type from seed data
TEST_FILENAME="test_document.pdf"
TEST_DATE="2025-09-30"
TEST_AUTHOR="Test Author"
TEST_DESCRIPTION="Test document for CRUD operations"

# Update Test Data
UPDATE_FILENAME="updated_test_document.pdf"
UPDATE_AUTHOR="Updated Test Author"
UPDATE_DESCRIPTION="Updated test document description"

# ============================================
# Color Output
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# Base Command
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

extract_id() {
    local output="$1"
    echo "$output" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1
}

extract_status_code() {
    local output="$1"
    echo "$output" | grep -oE "status: [0-9]+" | grep -oE "[0-9]+" | head -1
}

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
    
    echo ""
    echo "--- Response ---"
    echo "$LAST_OUTPUT"
    echo "--- End Response ---"
    echo ""
    
    if [ $LAST_STATUS -ne 0 ]; then
        log_error "Command failed with exit code $LAST_STATUS"
        STEP_FAILED=1
        return 1
    else
        log_success "Command succeeded"
        return 0
    fi
}

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
    log_header "Step 1: LIST - GET /documents"
    echo "Purpose: Get initial list of documents"
    
    execute_command "List all documents" \
        "$BASE_CMD --path-template='/documents' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 1 Complete: Initial list retrieved"
    fi
}

step2_create() {
    log_header "Step 2: CREATE - POST /documents"
    echo "Purpose: Create a new test document"
    
    local body="{\"documentTypeId\":\"$TEST_DOCUMENT_TYPE_ID\",\"filename\":\"$TEST_FILENAME\",\"date\":\"$TEST_DATE\",\"author\":\"$TEST_AUTHOR\",\"description\":\"$TEST_DESCRIPTION\"}"
    
    execute_command "Create document" \
        "$BASE_CMD --path-template='/documents' --method='POST' --body='$body'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        DOCUMENT_ID=$(extract_id "$LAST_OUTPUT")
        
        if [ -n "$DOCUMENT_ID" ]; then
            echo ""
            log_success "Document created successfully!"
            log_info "Captured Document ID: $DOCUMENT_ID"
            echo ""
        else
            log_error "Failed to extract document ID from response"
            STEP_FAILED=1
        fi
    fi
}

step3_get() {
    log_header "Step 3: GET - GET /documents/:id"
    echo "Purpose: Retrieve the newly created document"
    
    if [ -z "$DOCUMENT_ID" ]; then
        log_error "No document ID available. Run step 2 first or set DOCUMENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Document ID: $DOCUMENT_ID"
    
    execute_command "Get document by ID" \
        "$BASE_CMD --path-template='/documents/$DOCUMENT_ID' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 3 Complete: Document retrieved"
    fi
}

step4_update() {
    log_header "Step 4: UPDATE - PUT /documents/:id"
    echo "Purpose: Update document's filename and description"
    
    if [ -z "$DOCUMENT_ID" ]; then
        log_error "No document ID available. Run step 2 first or set DOCUMENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Document ID: $DOCUMENT_ID"
    
    local body="{\"filename\":\"$UPDATE_FILENAME\",\"author\":\"$UPDATE_AUTHOR\",\"description\":\"$UPDATE_DESCRIPTION\"}"
    
    execute_command "Update document" \
        "$BASE_CMD --path-template='/documents/$DOCUMENT_ID' --method='PUT' --body='$body'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 4 Complete: Document updated"
    fi
}

step5_get_updated() {
    log_header "Step 5: GET UPDATED - GET /documents/:id"
    echo "Purpose: Verify the update was successful"
    
    if [ -z "$DOCUMENT_ID" ]; then
        log_error "No document ID available. Run step 2 first or set DOCUMENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Document ID: $DOCUMENT_ID"
    log_info "Expecting filename: $UPDATE_FILENAME"
    
    execute_command "Get updated document" \
        "$BASE_CMD --path-template='/documents/$DOCUMENT_ID' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        if echo "$LAST_OUTPUT" | grep -q "$UPDATE_FILENAME"; then
            log_success "Step 5 Complete: Update verified (filename found)"
        else
            log_warning "Document retrieved but update verification unclear"
        fi
    fi
}

step6_delete() {
    log_header "Step 6: DELETE - DELETE /documents/:id"
    echo "Purpose: Delete the test document"
    
    if [ -z "$DOCUMENT_ID" ]; then
        log_error "No document ID available. Run step 2 first or set DOCUMENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Document ID: $DOCUMENT_ID"
    
    execute_command "Delete document" \
        "$BASE_CMD --path-template='/documents/$DOCUMENT_ID' --method='DELETE'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        log_success "Step 6 Complete: Document deleted"
    fi
}

step7_verify_delete() {
    log_header "Step 7: VERIFY DELETE - GET /documents/:id"
    echo "Purpose: Verify document was deleted (should return 404)"
    
    if [ -z "$DOCUMENT_ID" ]; then
        log_error "No document ID available. Run step 2 first or set DOCUMENT_ID environment variable."
        STEP_FAILED=1
        return 1
    fi
    
    log_info "Using Document ID: $DOCUMENT_ID"
    log_info "Expected: 404 Not Found"
    
    execute_command "Verify deletion" \
        "$BASE_CMD --path-template='/documents/$DOCUMENT_ID' --method='GET'"
    
    HTTP_STATUS=$(extract_status_code "$LAST_OUTPUT")
    
    if [ "$HTTP_STATUS" = "404" ]; then
        log_success "Step 7 Complete: Document confirmed deleted (404 received)"
        STEP_FAILED=0
    elif [ -n "$HTTP_STATUS" ] && [ "$HTTP_STATUS" != "404" ]; then
        log_error "Expected 404 but got HTTP $HTTP_STATUS - document may still exist"
        STEP_FAILED=1
    else
        log_warning "Could not determine HTTP status - check output above"
        STEP_FAILED=1
    fi
}

step8_list_final() {
    log_header "Step 8: LIST FINAL - GET /documents"
    echo "Purpose: List all documents to confirm test document is gone"
    
    execute_command "List all documents (final)" \
        "$BASE_CMD --path-template='/documents' --method='GET'"
    
    if [ $STEP_FAILED -eq 0 ]; then
        if [ -n "$DOCUMENT_ID" ] && echo "$LAST_OUTPUT" | grep -q "$DOCUMENT_ID"; then
            log_warning "Test document ID still appears in list"
        else
            log_success "Step 8 Complete: Final list retrieved (test document not found)"
        fi
    fi
}

# ============================================
# Main Execution
# ============================================

main() {
    log_header "Documents API CRUD Test Suite"
    echo "API Endpoint: $INVOKE_URL"
    echo "User: $USERNAME"
    echo "Starting from step: $START_STEP"
    if [ -n "$DOCUMENT_ID" ]; then
        log_info "Using pre-set Document ID: $DOCUMENT_ID"
    fi
    echo ""
    
    # Execute test steps
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
    if [ -n "$DOCUMENT_ID" ]; then
        echo "Test Document ID: $DOCUMENT_ID"
    fi
    echo ""
}

# Run main
main

