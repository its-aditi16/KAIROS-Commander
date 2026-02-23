import json
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

class SimilarityEngine:
    def __init__(self):
        self.history_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'history.json')
        self.history = self._load_history()
        self.scaler = MinMaxScaler()
        # Features to compare: cpu, latency, error_rate, downstream, impact_score
        self.feature_keys = ['cpu', 'latency', 'error_rate', 'downstream', 'impact_score']

    def _load_history(self):
        if not os.path.exists(self.history_path):
            return []
        with open(self.history_path, 'r') as f:
            return json.load(f)

    def find_similar_incidents(self, current_telemetry, top_n=3):
        """
        Calculates similarity using balanced feature weighting.
        Weights: Error(0.30), Latency(0.25), CPU(0.20), Downstream(0.15), Impact(0.10)
        """
        if not self.history:
            return []

        # Weights mapping
        weights = {
            'error_rate': 0.30,
            'latency': 0.25,
            'cpu': 0.20,
            'downstream': 0.15,
            'impact_score': 0.10
        }

        def get_weighted_vector(data):
            # Normalize latency on the fly (max 5000ms as per severity logic)
            lat = float(data.get('latency', 0))
            norm_lat = min(1.0, lat / 5000)
            
            # Normalize error rate (assume 0-1)
            err = float(data.get('error_rate', 0))
            
            # Normalize CPU (0-100 to 0-1)
            cpu = float(data.get('cpu', 0)) / 100.0
            
            # Downstream failures (normalize by capping at 5)
            ds = min(1.0, float(data.get('downstream', 0)) / 5.0)
            
            # Impact score (already 0-1)
            imp = float(data.get('impact_score', 0))
            
            # Construct weighted vector
            return np.array([
                err * weights['error_rate'],
                norm_lat * weights['latency'],
                cpu * weights['cpu'],
                ds * weights['downstream'],
                imp * weights['impact_score']
            ])

        current_weighted = get_weighted_vector(current_telemetry).reshape(1, -1)
        
        results = []
        for incident in self.history:
            incident_weighted = get_weighted_vector(incident).reshape(1, -1)
            sim_score = cosine_similarity(current_weighted, incident_weighted)[0][0]
            
            results.append({
                "incident_id": incident["incident_id"],
                "name": incident["name"],
                "service": incident["service"],
                "similarity": round(float(sim_score) * 100, 1)
            })

        # Sort by similarity desc
        results.sort(key=lambda x: x['similarity'], reverse=True)

        return results[:top_n]

# Singleton instance
similarity_engine = SimilarityEngine()
