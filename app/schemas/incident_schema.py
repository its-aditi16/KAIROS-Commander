from pydantic import BaseModel


class CustomIncidentRequest(BaseModel):
    service: str
    error_rate: float
    latency: float
    cpu: float
    downstream: int
