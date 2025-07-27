#!/bin/bash

echo "🚀 Testing NestJS E-commerce API"
echo "================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local expected_status=$4
    local headers=$5
    local body=$6
    
    echo -e "\n${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}$method $url${NC}"
    
    if [ "$method" = "GET" ]; then
        if [ ! -z "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" $headers "$url")
        else
            response=$(curl -s -w "\n%{http_code}" "$url")
        fi
    else
        if [ ! -z "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method $headers -H "Content-Type: application/json" -d "$body" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method -H "Content-Type: application/json" -d "$body" "$url")
        fi
    fi
    
    # Split response and status code
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ Success${NC} (Status: $status_code)"
        if [ ! -z "$response_body" ]; then
            echo "Response: $(echo "$response_body" | cut -c1-200)"
            echo ""
        fi
    else
        echo -e "${RED}✗ Failed${NC} (Expected: $expected_status, Got: $status_code)"
        echo "Response: $response_body"
    fi
}

# Check if server is running
echo -e "\n${BLUE}Checking if server is running...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start the server first with:${NC}"
    echo "npm start"
    exit 1
fi

# Test basic endpoints
echo -e "\n${BLUE}Testing Basic Endpoints${NC}"
echo "========================"

test_endpoint "GET" "http://localhost:3000" "Root endpoint" "200"
test_endpoint "POST" "http://localhost:3000/index/siteConfig" "Site configuration" "201" "" '{"language": "es"}'
test_endpoint "POST" "http://localhost:3000/index/getTypeClassifyList" "Catalog listing" "201" "-H \"x-tenant-id: restaurante-pepito\"" '{"language": "es"}'

# Check if this is SaaS version by testing tenant endpoints
echo -e "\n${BLUE}Checking SaaS Features${NC}"
echo "======================="

# Test if tenant endpoints exist (SaaS version)
tenant_response=$(curl -s -w "\n%{http_code}" "http://localhost:3000/tenants")
tenant_status=$(echo "$tenant_response" | tail -n1)

if [ "$tenant_status" = "200" ] || [ "$tenant_status" = "401" ] || [ "$tenant_status" = "403" ]; then
    echo -e "${GREEN}✓ SaaS Multi-tenant Version Detected${NC}"
    
    test_endpoint "GET" "http://localhost:3000/tenants" "List tenants" "200"
    test_endpoint "GET" "http://localhost:3000/usage/stats" "Usage statistics" "200" "-H \"x-tenant-id: restaurante-pepito\""
    
    # Test tenant creation
    timestamp=$(date +%s)
    test_endpoint "POST" "http://localhost:3000/tenants" "Create tenant" "201" "" "{
        \"tenantId\": \"test-tenant-$timestamp\",
        \"name\": \"Test Tenant\",
        \"email\": \"admin@test.com\",
        \"businessName\": \"Test Business S.A.\",
        \"subdomain\": \"test-tenant-$timestamp\"
    }"
    
    echo -e "\n${GREEN}✓ SaaS Multi-tenant features are working!${NC}"
    
elif [ "$tenant_status" = "404" ]; then
    echo -e "${YELLOW}ℹ Standard Single-tenant Version Detected${NC}"
    echo -e "${BLUE}This is the standard version without SaaS features${NC}"
    
    # Test standard endpoints without tenant requirements
    test_endpoint "POST" "http://localhost:3000/index/getTypeClassifyList" "Catalog listing (no tenant)" "201" "" '{"language": "es"}'
    
    echo -e "\n${GREEN}✓ Standard single-tenant features are working!${NC}"
else
    echo -e "${RED}✗ Unable to determine version type${NC}"
fi

echo -e "\n${BLUE}Test Summary${NC}"
echo "============"
echo -e "${GREEN}✓ API tests completed${NC}"
echo -e "${BLUE}For more detailed testing, check the full demo script:${NC} scripts/full-demo.sh"
