#!/usr/bin/env python3
"""
Beyblade X Combo Builder Backend API Test Suite
Tests all backend endpoints for the Beyblade X application
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# Backend URL configuration
BACKEND_URL = "https://blader-stats-hub.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class BeybladeTestSuite:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {}
        self.failed_tests = []
        self.passed_tests = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results[test_name] = {
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        
        if success:
            self.passed_tests.append(test_name)
        else:
            self.failed_tests.append(test_name)
    
    def test_connection(self):
        """Test basic connection to backend"""
        try:
            response = self.session.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Backend Connection", True, f"API version: {data.get('version', 'unknown')}")
                return True
            else:
                self.log_result("Backend Connection", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Backend Connection", False, str(e))
            return False
    
    def test_get_parts(self):
        """Test GET /api/parts endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/parts", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/parts", False, f"Status: {response.status_code}")
                return False
                
            data = response.json()
            
            # Validate structure
            if not all(key in data for key in ['blades', 'ratchets', 'bits']):
                self.log_result("GET /api/parts", False, "Missing required keys")
                return False
            
            # Check counts (approximately)
            blade_count = len(data['blades'])
            ratchet_count = len(data['ratchets'])
            bit_count = len(data['bits'])
            
            expected_ranges = {
                'blades': (70, 80),  # ~75 expected
                'ratchets': (35, 40), # ~37 expected
                'bits': (45, 50)     # ~48 expected
            }
            
            issues = []
            for part_type, count in [('blades', blade_count), ('ratchets', ratchet_count), ('bits', bit_count)]:
                min_count, max_count = expected_ranges[part_type]
                if not (min_count <= count <= max_count):
                    issues.append(f"{part_type}: {count} (expected {min_count}-{max_count})")
            
            if issues:
                self.log_result("GET /api/parts", False, f"Count issues: {', '.join(issues)}")
                return False
            
            # Store parts data for later tests
            self.parts_data = data
            self.log_result("GET /api/parts", True, 
                          f"Blades: {blade_count}, Ratchets: {ratchet_count}, Bits: {bit_count}")
            return True
            
        except Exception as e:
            self.log_result("GET /api/parts", False, str(e))
            return False
    
    def test_calculate_combo(self):
        """Test POST /api/calculate-combo endpoint"""
        test_combos = [
            {
                "name": "Wizard Rod combo",
                "combo": {"blade": "Wizard Rod", "ratchet": "1-60", "bit": "H (Hexa)"},
                "expected_keys": ["combo_string", "attack", "defense", "stamina", 
                                "xtreme_dash", "burst_resistance", "overall_rating"]
            },
            {
                "name": "Shark Scale combo",
                "combo": {"blade": "Shark Edge", "ratchet": "1-70", "bit": "LR (Low Rush)"},
                "expected_keys": ["combo_string", "attack", "defense", "stamina", 
                                "xtreme_dash", "burst_resistance", "overall_rating"]
            }
        ]
        
        all_passed = True
        
        for test_case in test_combos:
            try:
                response = self.session.post(
                    f"{API_BASE}/calculate-combo",
                    json=test_case["combo"],
                    timeout=10
                )
                
                if response.status_code != 200:
                    self.log_result(f"Calculate Combo - {test_case['name']}", False, 
                                  f"Status: {response.status_code}, Response: {response.text}")
                    all_passed = False
                    continue
                
                data = response.json()
                
                # Validate response structure
                missing_keys = [key for key in test_case["expected_keys"] if key not in data]
                if missing_keys:
                    self.log_result(f"Calculate Combo - {test_case['name']}", False, 
                                  f"Missing keys: {missing_keys}")
                    all_passed = False
                    continue
                
                # Validate data types and ranges
                validation_errors = []
                
                # Check stats are integers 0-100
                for stat in ["attack", "defense", "stamina", "xtreme_dash", "burst_resistance"]:
                    if not isinstance(data[stat], int) or not (0 <= data[stat] <= 100):
                        validation_errors.append(f"{stat}: {data[stat]} (should be int 0-100)")
                
                # Check overall_rating is float 0-10
                if not isinstance(data["overall_rating"], (int, float)) or not (0 <= data["overall_rating"] <= 10):
                    validation_errors.append(f"overall_rating: {data['overall_rating']} (should be float 0-10)")
                
                if validation_errors:
                    self.log_result(f"Calculate Combo - {test_case['name']}", False, 
                                  f"Validation errors: {', '.join(validation_errors)}")
                    all_passed = False
                    continue
                
                self.log_result(f"Calculate Combo - {test_case['name']}", True, 
                              f"Rating: {data['overall_rating']}, Attack: {data['attack']}, Defense: {data['defense']}")
                
            except Exception as e:
                self.log_result(f"Calculate Combo - {test_case['name']}", False, str(e))
                all_passed = False
        
        return all_passed
    
    def test_register_deck(self):
        """Test POST /api/register-deck endpoint"""
        test_deck = {
            "player_name": "Test Player João",
            "city": "São Paulo, SP",
            "event_name": "Torneio Test Beyblade X",
            "event_date": "2025-03-19",
            "combo1": {"blade": "Wizard Rod", "ratchet": "1-60", "bit": "H (Hexa)"},
            "combo2": {"blade": "Shark Edge", "ratchet": "1-70", "bit": "LR (Low Rush)"},
            "combo3": {"blade": "Cobalt Dragoon", "ratchet": "5-60", "bit": "E (Elevate)"}
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/register-deck",
                json=test_deck,
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result("Register Deck", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            # Validate response structure
            expected_keys = ["id", "player_name", "city", "event_name", "event_date", "combos", "registered_at"]
            missing_keys = [key for key in expected_keys if key not in data]
            if missing_keys:
                self.log_result("Register Deck", False, f"Missing keys: {missing_keys}")
                return False
            
            # Validate data
            if data["player_name"] != test_deck["player_name"]:
                self.log_result("Register Deck", False, f"Player name mismatch: {data['player_name']}")
                return False
            
            if len(data["combos"]) != 3:
                self.log_result("Register Deck", False, f"Expected 3 combos, got {len(data['combos'])}")
                return False
            
            # Store for ranking test
            self.registered_deck_id = data["id"]
            self.registered_combos = data["combos"]
            
            self.log_result("Register Deck", True, 
                          f"Deck ID: {data['id']}, Combos: {len(data['combos'])}")
            return True
            
        except Exception as e:
            self.log_result("Register Deck", False, str(e))
            return False
    
    def test_ranking(self):
        """Test GET /api/ranking endpoint"""
        try:
            # Wait a moment for database to update
            time.sleep(1)
            
            response = self.session.get(f"{API_BASE}/ranking", timeout=10)
            
            if response.status_code != 200:
                self.log_result("GET /api/ranking", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_result("GET /api/ranking", False, "Response should be a list")
                return False
            
            if len(data) == 0:
                self.log_result("GET /api/ranking", False, "No ranking data returned")
                return False
            
            # Validate structure of ranking items
            for i, item in enumerate(data[:3]):  # Check first 3 items
                expected_keys = ["combo", "usage_count", "percentage"]
                missing_keys = [key for key in expected_keys if key not in item]
                if missing_keys:
                    self.log_result("GET /api/ranking", False, 
                                  f"Item {i} missing keys: {missing_keys}")
                    return False
                
                # Validate data types
                if not isinstance(item["usage_count"], int) or item["usage_count"] < 0:
                    self.log_result("GET /api/ranking", False, 
                                  f"Invalid usage_count: {item['usage_count']}")
                    return False
                
                if not isinstance(item["percentage"], (int, float)) or not (0 <= item["percentage"] <= 100):
                    self.log_result("GET /api/ranking", False, 
                                  f"Invalid percentage: {item['percentage']}")
                    return False
            
            # Check if our registered combos appear in ranking
            registered_found = 0
            if hasattr(self, 'registered_combos'):
                for combo in self.registered_combos:
                    if any(item["combo"] == combo for item in data):
                        registered_found += 1
            
            self.log_result("GET /api/ranking", True, 
                          f"Ranking items: {len(data)}, Registered combos found: {registered_found}")
            return True
            
        except Exception as e:
            self.log_result("GET /api/ranking", False, str(e))
            return False
    
    def test_combo_stats(self):
        """Test GET /api/combo-stats/{combo} endpoint"""
        if not hasattr(self, 'registered_combos') or not self.registered_combos:
            self.log_result("Combo Stats", False, "No registered combos to test")
            return False
        
        try:
            # Test with first registered combo
            test_combo = self.registered_combos[0]
            # URL encode the combo name
            encoded_combo = test_combo.replace(" ", "%20")
            
            response = self.session.get(f"{API_BASE}/combo-stats/{encoded_combo}", timeout=10)
            
            if response.status_code != 200:
                self.log_result("Combo Stats", False, 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            # Validate structure
            expected_keys = ["combo", "usage_count", "last_updated"]
            missing_keys = [key for key in expected_keys if key not in data]
            if missing_keys:
                self.log_result("Combo Stats", False, f"Missing keys: {missing_keys}")
                return False
            
            # Validate data
            if data["combo"] != test_combo:
                self.log_result("Combo Stats", False, f"Combo mismatch: {data['combo']} vs {test_combo}")
                return False
            
            if not isinstance(data["usage_count"], int) or data["usage_count"] < 0:
                self.log_result("Combo Stats", False, f"Invalid usage_count: {data['usage_count']}")
                return False
            
            self.log_result("Combo Stats", True, 
                          f"Combo: {data['combo']}, Usage: {data['usage_count']}")
            return True
            
        except Exception as e:
            self.log_result("Combo Stats", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Beyblade X Backend API Test Suite")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Connection Test", self.test_connection),
            ("Parts API", self.test_get_parts),
            ("Calculate Combo API", self.test_calculate_combo),
            ("Register Deck API", self.test_register_deck),
            ("Ranking API", self.test_ranking),
            ("Combo Stats API", self.test_combo_stats),
        ]
        
        for test_name, test_func in tests:
            print(f"\n📝 Running: {test_name}")
            test_func()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {len(self.passed_tests)}")
        print(f"❌ Failed: {len(self.failed_tests)}")
        print(f"📈 Success Rate: {len(self.passed_tests)/(len(self.passed_tests)+len(self.failed_tests))*100:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   - {test}")
        
        if self.passed_tests:
            print(f"\n✅ Passed Tests:")
            for test in self.passed_tests:
                print(f"   - {test}")
        
        return len(self.failed_tests) == 0


def main():
    """Main test execution"""
    tester = BeybladeTestSuite()
    success = tester.run_all_tests()
    
    if success:
        print(f"\n🎉 ALL TESTS PASSED! Backend APIs are working correctly.")
        return 0
    else:
        print(f"\n⚠️  SOME TESTS FAILED! Check the details above.")
        return 1


if __name__ == "__main__":
    exit(main())