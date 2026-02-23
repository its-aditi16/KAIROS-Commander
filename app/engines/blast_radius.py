import networkx as nx
from typing import Dict, List, Any

def estimate_blast_radius(graph: nx.DiGraph, root_service: str, weights: Dict[str, float] = None) -> Dict[str, Any]:
    """
    Estimates the blast radius of a failure originating at root_service.
    
    Args:
        graph: NetworkX DiGraph of service dependencies.
        root_service: The service suspected as the root cause.
        weights: Configurable weights for scoring components.
    
    Returns:
        Structured JSON with blast radius metrics and score.
    """
    if root_service not in graph:
        return {"error": f"Service {root_service} not found in graph."}

    # Default weights if not provided
    if weights is None:
        weights = {
            "alpha": 2.0,  # multiplier for service count
            "beta": 0.001, # multiplier for traffic volume
            "gamma": 1.5,  # multiplier for aggregated criticality
            "delta": 5.0   # multiplier for max depth
        }

    # 1. Traverse downstream using BFS to calculate depth and identify impacted services
    downstream_nodes = []
    max_depth = 0
    
    # BFS traversal to keep track of depth
    visited = {root_service}
    queue = [(root_service, 0)]
    
    while queue:
        current_node, depth = queue.pop(0)
        if current_node != root_service:
            downstream_nodes.append(current_node)
            max_depth = max(max_depth, depth)
            
        for neighbor in graph.successors(current_node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, depth + 1))

    # 2. Extract metrics from impacted services
    total_services_impacted = len(downstream_nodes)
    total_traffic_impacted = 0
    aggregated_criticality_score = 0
    
    for node in downstream_nodes:
        data = graph.nodes[node]
        total_traffic_impacted += data.get("traffic_volume", 0)
        aggregated_criticality_score += data.get("business_criticality_score", 0)

    # 3. Compute Blast Radius Score (Graph Impact)
    blast_radius_weighted = (
        (weights["alpha"] * total_services_impacted) +
        (weights["beta"] * total_traffic_impacted) +
        (weights["gamma"] * aggregated_criticality_score) +
        (weights["delta"] * max_depth)
    )

    # 4. Redesigned Severity Classification using Combined Weighted Score
    # Extract root service metrics for weighted severity
    root_data = graph.nodes[root_service]
    error_rate = root_data.get("error_rate", 0)
    latency = root_data.get("latency", 0)
    cpu_usage = root_data.get("cpu_usage", 0)
    downstream_failures = root_data.get("downstream_failures", 0)
    impact_score = root_data.get("impact_score", 0)

    # Normalize metrics
    norm_latency = min(1.0, latency / 5000)
    norm_error = min(1.0, error_rate)
    norm_cpu = min(1.0, cpu_usage / 100)

    # Weighted Severity Score Formula
    severity_score = (
        (norm_error * 0.35) +
        (norm_latency * 0.30) +
        (downstream_failures * 1.0 * 0.20) + # Explicit weight for discrete value
        (norm_cpu * 0.10) +
        (impact_score * 0.05)
    )

    # Apply CPU Boosts
    if cpu_usage > 75 and error_rate > 0.15:
        severity_score += 0.05
    if cpu_usage > 85:
        severity_score += 0.10

    # Ensure score is capped appropriately for thresholding if needed, though thresholds go up to > 0.75
    severity_score = min(1.0, severity_score)

    # Severity Thresholds
    severity_level = "Low"
    if severity_score > 0.75:
        severity_level = "Critical"
    elif severity_score > 0.50:
        severity_level = "High"
    elif severity_score > 0.25:
        severity_level = "Medium"

    # 5. Generate Explanation
    explanation = (
        f"Service {root_service} impacts {total_services_impacted} downstream services. "
        f"Combined severity score ({severity_score:.2f}) reflects high metrics and graph propagation, "
        f"resulting in a {severity_level} severity classification."
    )

    return {
        "root_service": root_service,
        "downstream_services": downstream_nodes,
        "total_services_impacted": total_services_impacted,
        "max_depth": max_depth,
        "total_traffic_impacted": total_traffic_impacted,
        "aggregated_criticality_score": aggregated_criticality_score,
        "blast_radius_score": round(float(blast_radius_weighted), 2),
        "severity_score": round(float(severity_score), 2),
        "severity_level": severity_level,
        "explanation": explanation
    }

if __name__ == "__main__":
    # Quick test setup
    g = nx.DiGraph()
    g.add_node("frontend", traffic_volume=15000, business_criticality_score=5)
    g.add_node("auth-service", traffic_volume=12000, business_criticality_score=5)
    g.add_node("payment-service", traffic_volume=8000, business_criticality_score=5)
    g.add_node("database", traffic_volume=5000, business_criticality_score=4)
    
    g.add_edge("frontend", "auth-service")
    g.add_edge("auth-service", "payment-service")
    g.add_edge("payment-service", "database")
    
    print(estimate_blast_radius(g, "frontend"))
