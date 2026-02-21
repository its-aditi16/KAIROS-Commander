"""ML engine for ranking services by impact."""


def rank_services(impact_scores: dict) -> list:
    """
    Rank services by impact score (highest first).

    Args:
        impact_scores: Dict mapping service name to impact score

    Returns:
        List of (service, score) tuples sorted by score descending
    """
    return sorted(
        impact_scores.items(),
        key=lambda x: x[1],
        reverse=True,
    )
