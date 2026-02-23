import networkx as nx

# Global state to persist telemetry changes during scenarios
_global_telemetry = {
    "frontend": {"error_rate": 0.01, "latency": 50, "cpu_usage": 30, "downstream_failures": 0, "traffic_volume": 15000, "business_criticality_score": 5, "sla_tier": 1},
    "auth-service": {"error_rate": 0.01, "latency": 80, "cpu_usage": 40, "downstream_failures": 0, "traffic_volume": 12000, "business_criticality_score": 5, "sla_tier": 1},
    "payment-service": {"error_rate": 0.01, "latency": 100, "cpu_usage": 50, "downstream_failures": 0, "traffic_volume": 8000, "business_criticality_score": 5, "sla_tier": 1},
    "database": {"error_rate": 0.01, "latency": 30, "cpu_usage": 20, "downstream_failures": 0, "traffic_volume": 5000, "business_criticality_score": 4, "sla_tier": 2},
}


def build_graph():
    """
    Build a directed graph representing service dependencies.

    Returns:
        nx.DiGraph: A directed graph with service dependency edges.
    """
    graph = nx.DiGraph()

    # Add edges representing service dependencies
    edges = [
        ("frontend", "auth-service"),
        ("auth-service", "payment-service"),
        ("payment-service", "database"),
    ]

    graph.add_edges_from(edges)

    graph.add_edges_from(edges)

    # Use global telemetry state instead of static defaults
    for service, metrics in _global_telemetry.items():
        if service not in graph:
            graph.add_node(service)
        graph.nodes[service].update(metrics)

    # Calculate blast radius and impact score for each node
    max_possible_impact = len(graph.nodes()) if len(graph.nodes()) > 0 else 1.0
    for node in graph.nodes():
        error_rate = graph.nodes[node].get("error_rate", 0)
        descendants = nx.descendants(graph, node)
        blast_radius = len(descendants)
        graph.nodes[node]["blast_radius"] = blast_radius
        # Normalize impact score to 0-1 range based on total possible blast radius
        raw_impact = error_rate * (1 + blast_radius)
        graph.nodes[node]["impact_score"] = min(1.0, raw_impact / max_possible_impact)

    # Calculate betweenness centrality
    centrality_scores = nx.betweenness_centrality(graph)

    for node, score in centrality_scores.items():
        graph.nodes[node]["centrality"] = score

    return graph


def _default_telemetry():
    """Default telemetry for all services."""
    return {
        "frontend": {
            "error_rate": 0.01,
            "latency": 50,
            "cpu_usage": 30,
            "downstream_failures": 0,
            "traffic_volume": 15000, 
            "business_criticality_score": 5, 
            "sla_tier": 1
        },
        "auth-service": {
            "error_rate": 0.01,
            "latency": 80,
            "cpu_usage": 40,
            "downstream_failures": 0,
            "traffic_volume": 12000, 
            "business_criticality_score": 5, 
            "sla_tier": 1
        },
        "payment-service": {
            "error_rate": 0.01,
            "latency": 100,
            "cpu_usage": 50,
            "downstream_failures": 0,
            "traffic_volume": 8000, 
            "business_criticality_score": 5, 
            "sla_tier": 1
        },
        "database": {
            "error_rate": 0.01,
            "latency": 30,
            "cpu_usage": 20,
            "downstream_failures": 0,
            "traffic_volume": 5000, 
            "business_criticality_score": 4, 
            "sla_tier": 2
        },
    }


def build_graph_with_override(telemetry_override: dict | None = None):
    """
    Build graph, optionally overriding telemetry for specific services.
    telemetry_override: Dict with service name as key, metrics dict as value.
    """
    graph = nx.DiGraph()
    edges = [
        ("frontend", "auth-service"),
        ("auth-service", "payment-service"),
        ("payment-service", "database"),
    ]
    graph.add_edges_from(edges)

    telemetry = _default_telemetry()
    if telemetry_override:
        for svc, metrics in telemetry_override.items():
            if svc in telemetry:
                telemetry[svc].update(metrics)
            else:
                telemetry[svc] = metrics

    for service, metrics in telemetry.items():
        if service not in graph.nodes:
            graph.add_node(service)
        graph.nodes[service]["error_rate"] = metrics.get("error_rate", 0)
        graph.nodes[service]["latency"] = metrics.get("latency", 0)
        graph.nodes[service]["cpu_usage"] = metrics.get("cpu_usage", 0)
        graph.nodes[service]["downstream_failures"] = metrics.get("downstream_failures", 0)
        graph.nodes[service]["traffic_volume"] = metrics.get("traffic_volume", 1000)
        graph.nodes[service]["business_criticality_score"] = metrics.get("business_criticality_score", 3)
        graph.nodes[service]["sla_tier"] = metrics.get("sla_tier", 3)

    max_possible_impact = len(graph.nodes()) if len(graph.nodes()) > 0 else 1.0
    for node in graph.nodes():
        error_rate = graph.nodes[node].get("error_rate", 0)
        descendants = nx.descendants(graph, node)
        blast_radius = len(descendants)
        graph.nodes[node]["blast_radius"] = blast_radius
        # Normalize impact score to 0-1 range based on total possible blast radius
        raw_impact = error_rate * (1 + blast_radius)
        graph.nodes[node]["impact_score"] = min(1.0, raw_impact / max_possible_impact)

    centrality_scores = nx.betweenness_centrality(graph)
    for node, score in centrality_scores.items():
        graph.nodes[node]["centrality"] = score

    return graph


class GraphEngine:
    """Engine for graph operations with attachable telemetry."""

    def __init__(self):
        self._telemetry_override = {}

    def attach_telemetry(self, telemetry: dict):
        """Attach/override telemetry for a service and persist it globally."""
        service = telemetry.get("service")
        if service:
            metrics = {
                "error_rate": telemetry.get("error_rate", 0),
                "latency": telemetry.get("latency", 0),
                "cpu_usage": telemetry.get("cpu", 0),
                "downstream_failures": telemetry.get("downstream_failures", 0),
            }
            _global_telemetry[service] = metrics

    def calculate_impact(self) -> dict:
        """Build graph with current global telemetry and return impact scores."""
        graph = build_graph()  # Now uses global state
        return {
            node: graph.nodes[node].get("impact_score", 0)
            for node in graph.nodes()
        }

    def reset_telemetry(self):
        """Restore global telemetry to default healthy values."""
        global _global_telemetry
        _global_telemetry.update(_default_telemetry())


def graph_to_json(graph):
    """
    Convert a NetworkX graph to a JSON-serializable dictionary.

    Args:
        graph: A NetworkX DiGraph

    Returns:
        dict: Dictionary with 'nodes' and 'edges' keys
    """
    nodes = []
    for node, data in graph.nodes(data=True):
        node_dict = {
            "id": node,
            "error_rate": data.get("error_rate"),
            "latency": data.get("latency"),
            "cpu_usage": data.get("cpu_usage"),
            "downstream_failures": data.get("downstream_failures"),
            "blast_radius": data.get("blast_radius"),
            "impact_score": data.get("impact_score"),
        }
        nodes.append(node_dict)

    edges = []
    for source, target in graph.edges():
        edge_dict = {
            "source": source,
            "target": target,
        }
        edges.append(edge_dict)

    return {
        "nodes": nodes,
        "edges": edges,
    }


if __name__ == "__main__":
    G = build_graph()
    for node in G.nodes():
        print(f"Service: {node}")
        print(f"  Error Rate: {G.nodes[node]['error_rate']}")
        print(f"  Blast Radius: {G.nodes[node]['blast_radius']}")
        print(f"  Centrality: {G.nodes[node]['centrality']}")
        print(f"  Impact Score: {G.nodes[node]['impact_score']}")
        print("------")
