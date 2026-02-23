import sys
import os
import networkx as nx

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.engines.blast_radius import estimate_blast_radius

def test_blast_radius_scenarios():
    # Setup mock graph
    G = nx.DiGraph()
    # 10 Services
    services = {
        "frontend": {"traffic_volume": 20000, "business_criticality_score": 5, "sla_tier": 1},
        "auth": {"traffic_volume": 15000, "business_criticality_score": 5, "sla_tier": 1},
        "payments": {"traffic_volume": 12000, "business_criticality_score": 5, "sla_tier": 1},
        "cart": {"traffic_volume": 10000, "business_criticality_score": 4, "sla_tier": 2},
        "catalog": {"traffic_volume": 8000, "business_criticality_score": 4, "sla_tier": 2},
        "inventory": {"traffic_volume": 5000, "business_criticality_score": 3, "sla_tier": 3},
        "shipping": {"traffic_volume": 3000, "business_criticality_score": 2, "sla_tier": 3},
        "email": {"traffic_volume": 1000, "business_criticality_score": 1, "sla_tier": 4},
        "db": {"traffic_volume": 2000, "business_criticality_score": 5, "sla_tier": 1},
        "redis": {"traffic_volume": 5000, "business_criticality_score": 4, "sla_tier": 2}
    }
    
    for s, data in services.items():
        G.add_node(s, **data)
        
    edges = [
        ("frontend", "auth"),
        ("frontend", "cart"),
        ("frontend", "catalog"),
        ("auth", "db"),
        ("cart", "payments"),
        ("payments", "db"),
        ("catalog", "inventory"),
        ("inventory", "redis"),
        ("shipping", "email")
    ]
    G.add_edges_from(edges)
    
    # Scenario 1: Root cause at Frontend (High Blast)
    print("--- Scenario 1: Root cause at Frontend ---")
    res_front = estimate_blast_radius(G, "frontend")
    print(f"Impacted: {res_front['total_services_impacted']}")
    print(f"Score: {res_front['blast_radius_score']}")
    print(f"Severity: {res_front['severity_level']}")
    assert res_front['total_services_impacted'] == 7
    # Downstream of frontend: auth, cart, catalog. 
    # Downstream of auth: db.
    # Downstream of cart: payments. 
    # Downstream of payments: db.
    # Downstream of catalog: inventory. 
    # Downstream of inventory: redis.
    # Total: auth, cart, catalog, db, payments, inventory, redis = 7 nodes.
    
    # Scenario 2: Root cause at Inventory (Low/Medium Blast)
    print("\n--- Scenario 2: Root cause at Inventory ---")
    res_inv = estimate_blast_radius(G, "inventory")
    print(f"Impacted: {res_inv['total_services_impacted']}")
    print(f"Score: {res_inv['blast_radius_score']}")
    print(f"Severity: {res_inv['severity_level']}")
    assert res_inv['total_services_impacted'] == 1 # redis only
    
    # Scenario 3: Root cause at Shipping (Isolated)
    print("\n--- Scenario 3: Root cause at Shipping ---")
    res_ship = estimate_blast_radius(G, "shipping")
    print(f"Impacted: {res_ship['total_services_impacted']}")
    print(f"Score: {res_ship['blast_radius_score']}")
    print(f"Severity: {res_ship['severity_level']}")
    assert res_ship['total_services_impacted'] == 1 # email
    
    print("\n✅ All unit tests passed!")

if __name__ == "__main__":
    test_blast_radius_scenarios()
