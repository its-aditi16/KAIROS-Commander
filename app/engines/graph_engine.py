import networkx as nx


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

    # Attach dummy telemetry values to each node
    telemetry = {
        "frontend": {
            "error_rate": 0.01,
            "latency": 50,
            "cpu_usage": 30,
            "downstream_failures": 0,
        },
        "auth-service": {
            "error_rate": 0.05,
            "latency": 120,
            "cpu_usage": 60,
            "downstream_failures": 2,
        },
        "payment-service": {
            "error_rate": 0.15,
            "latency": 300,
            "cpu_usage": 85,
            "downstream_failures": 8,
        },
        "database": {
            "error_rate": 0.02,
            "latency": 80,
            "cpu_usage": 45,
            "downstream_failures": 0,
        },
    }

    for service, metrics in telemetry.items():
        graph.nodes[service]["error_rate"] = metrics["error_rate"]
        graph.nodes[service]["latency"] = metrics["latency"]
        graph.nodes[service]["cpu_usage"] = metrics["cpu_usage"]
        graph.nodes[service]["downstream_failures"] = metrics["downstream_failures"]

    # Calculate blast radius and impact score for each node
    for node in graph.nodes():
        error_rate = graph.nodes[node].get("error_rate", 0)
        descendants = nx.descendants(graph, node)
        blast_radius = len(descendants)
        graph.nodes[node]["blast_radius"] = blast_radius
        graph.nodes[node]["impact_score"] = error_rate * (1 + blast_radius)

    # Calculate betweenness centrality
    centrality_scores = nx.betweenness_centrality(graph)

    for node, score in centrality_scores.items():
        graph.nodes[node]["centrality"] = score

    return graph


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
