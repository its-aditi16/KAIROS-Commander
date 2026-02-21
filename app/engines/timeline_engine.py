"""
timeline_engine.py
------------------
Generates a structured incident timeline from raw telemetry events.

Detection logic:
  1. Sort events chronologically.
  2. First anomaly  — earliest event where value > threshold.
  3. Cascade failure — another service anomaly within 10 min of the first anomaly.
  4. User impact     — event from "Frontend" service OR a user-facing metric.
"""

from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Metrics that indicate direct user impact even without Frontend service
USER_IMPACT_METRICS = {"error_rate", "http_5xx", "request_failures"}

# Cascade window: anomaly must appear within this many minutes of first anomaly
CASCADE_WINDOW_MINUTES = 10


# ---------------------------------------------------------------------------
# Helper — input validation
# ---------------------------------------------------------------------------

def _validate_event(event: dict) -> bool:
    """Return True if the event has all required keys and valid types."""
    required = {"timestamp", "service", "metric", "value", "threshold"}
    return required.issubset(event.keys())


# ---------------------------------------------------------------------------
# Helper — parse timestamp
# ---------------------------------------------------------------------------

def _parse_ts(ts: str) -> datetime:
    """Parse an ISO-format timestamp string into a datetime object."""
    return datetime.fromisoformat(ts)


# ---------------------------------------------------------------------------
# Helper — anomaly check
# ---------------------------------------------------------------------------

def _is_anomaly(event: dict) -> bool:
    """An event is anomalous when its value exceeds the threshold."""
    return event["value"] > event["threshold"]


# ---------------------------------------------------------------------------
# Helper — readable event description
# ---------------------------------------------------------------------------

def _build_event_string(event: dict) -> str:
    """Generate a human-readable description of the telemetry event."""
    service = event["service"]
    metric = event["metric"]
    value = event["value"]

    # Special formatting for common metric types
    if metric == "latency":
        return f"{service} {metric} spiked to {value}ms"
    elif metric in ("error_rate", "retry_rate", "http_5xx", "request_failures"):
        return f"{service} {metric} increased beyond threshold"
    else:
        return f"{service} {metric} exceeded threshold (value: {value})"


# ---------------------------------------------------------------------------
# Core detectors
# ---------------------------------------------------------------------------

def detect_first_anomaly(sorted_events: list) -> dict | None:
    """
    Returns the earliest event where value > threshold.
    sorted_events must already be in chronological order.
    """
    for event in sorted_events:
        if _is_anomaly(event):
            return event
    return None


def detect_cascade(event: dict, first_anomaly_event: dict | None) -> bool:
    """
    Returns True if:
      - A first anomaly already exists
      - This event is anomalous
      - This event comes from a DIFFERENT service
      - Its timestamp is within CASCADE_WINDOW_MINUTES of the first anomaly
    """
    if first_anomaly_event is None:
        return False
    if not _is_anomaly(event):
        return False
    if event["service"] == first_anomaly_event["service"]:
        return False  # same service, not a cascade

    first_ts = _parse_ts(first_anomaly_event["timestamp"])
    event_ts = _parse_ts(event["timestamp"])
    delta = event_ts - first_ts

    return timedelta(0) < delta <= timedelta(minutes=CASCADE_WINDOW_MINUTES)


def detect_user_impact(event: dict) -> bool:
    """
    Returns True if:
      - The service is "Frontend"
      - OR the metric is a known user-facing metric
    """
    return (
        event["service"].lower() == "frontend"
        or event["metric"] in USER_IMPACT_METRICS
    )


# ---------------------------------------------------------------------------
# Public entry-point
# ---------------------------------------------------------------------------

def generate_timeline(events: list) -> list:
    """
    Accept a list of raw telemetry events and return a structured timeline.

    Parameters
    ----------
    events : list of dict
        Each dict must contain: timestamp, service, metric, value, threshold.

    Returns
    -------
    list of dict
        Each item has: time, type, service, event.
        type is one of: "first_anomaly", "cascade_failure", "user_impact",
                        "normal" (for anomalous events that don't fit others).
    """
    if not events:
        return []

    # --- 1. Validate & filter valid events ---
    valid_events = [e for e in events if _validate_event(e)]
    if not valid_events:
        return []

    # --- 2. Sort chronologically ---
    sorted_events = sorted(valid_events, key=lambda e: _parse_ts(e["timestamp"]))

    # --- 3. Detect first anomaly (needed for cascade window) ---
    first_anomaly_event = detect_first_anomaly(sorted_events)

    # --- 4. Build timeline ---
    timeline = []
    seen_first = False  # flag so we only label the very first anomaly

    for event in sorted_events:
        if not _is_anomaly(event):
            # Skip non-anomalous events — they don't appear in the timeline
            continue

        # Determine event type (order of precedence matters)
        if not seen_first and event is first_anomaly_event:
            event_type = "first_anomaly"
            seen_first = True
        elif detect_user_impact(event):
            event_type = "user_impact"
        elif detect_cascade(event, first_anomaly_event):
            event_type = "cascade_failure"
        else:
            event_type = "normal"  # anomalous but outside cascade window

        # Format the display time as HH:MM
        display_time = _parse_ts(event["timestamp"]).strftime("%H:%M")

        timeline.append({
            "time": display_time,
            "type": event_type,
            "service": event["service"],
            "event": _build_event_string(event),
        })

    return timeline


# ---------------------------------------------------------------------------
# Quick test block
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sample_events = [
        {
            "timestamp": "2026-02-21T12:03:00",
            "service": "Payment Gateway",
            "metric": "latency",
            "value": 1500,
            "threshold": 800,
        },
        {
            "timestamp": "2026-02-21T12:07:00",
            "service": "Auth Service",
            "metric": "retry_rate",
            "value": 40,
            "threshold": 20,
        },
        {
            "timestamp": "2026-02-21T12:12:00",
            "service": "Frontend",
            "metric": "error_rate",
            "value": 15,
            "threshold": 5,
        },
        {
            "timestamp": "2026-02-21T12:25:00",
            "service": "Database",
            "metric": "cpu_usage",
            "value": 95,
            "threshold": 80,
        },
    ]

    timeline = generate_timeline(sample_events)
    import json
    print(json.dumps(timeline, indent=2))