import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ServiceGraph = ({ data, blastRadius }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.nodes.length || !svgRef.current || !containerRef.current) return;

    // Use ResizeObserver to handle dynamic sizing
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width <= 0 || height <= 0) return;

        // Re-initialize graph on resize
        d3.select(svgRef.current).selectAll("*").remove();
        initGraph(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    const initGraph = (width, height) => {
      // Clone data to avoid mutating frozen props which causes React crashes
      const nodes = data.nodes.map(d => ({ ...d }));
      const links = (data.links || []).map(d => ({ ...d }));

      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

      // Blast Radius state
      const isRoot = (id) => id && blastRadius?.root_service === id;
      const isImpacted = (id) => id && blastRadius?.downstream_services?.includes(id);

      // Risk colors
      const getSeverityColor = (severity) => {
        if (severity === 'Critical') return "#FF2A6D";
        if (severity === 'High') return "#FF9F1C";
        if (severity === 'Medium') return "#FFD700";
        return "#05D5AA";
      };

      const getNodeColor = (d) => {
        if (isRoot(d.id)) return "#FF2A6D";
        if (isImpacted(d.id)) return getSeverityColor(blastRadius?.severity_level);

        const risk = d.risk || 0;
        if (risk > 0.8) return "#FF2A6D";
        if (risk > 0.5) return "#FF9F1C";
        return "#05D5AA";
      };

      // Simulation
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-600))
        .force("center", d3.forceCenter(0, 0))
        .force("collide", d3.forceCollide().radius(70));

      // Arrow marker
      svg.append("defs").selectAll("marker")
        .data(["end"])
        .enter().append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 22)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#94A3B8")
        .attr("d", "M0,-5L10,0L0,5");

      // Links
      const link = svg.append("g")
        .attr("stroke", "#475569")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", d => {
          const sourceId = (d.source && typeof d.source === 'object') ? d.source.id : d.source;
          if (isRoot(sourceId) || isImpacted(sourceId)) return "#FF2A6D";
          return "#475569";
        })
        .attr("stroke-opacity", d => {
          const sourceId = (d.source && typeof d.source === 'object') ? d.source.id : d.source;
          if (isRoot(sourceId) || isImpacted(sourceId)) return 1;
          return 0.6;
        })
        .attr("stroke-width", d => {
          const sourceId = (d.source && typeof d.source === 'object') ? d.source.id : d.source;
          if (isImpacted(sourceId) || isRoot(sourceId)) return 3;
          return 2;
        })
        .attr("marker-end", "url(#arrow)");

      // Node Groups
      const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      // Cell background with pulsing for root
      const circles = node.append("circle")
        .attr("r", 20)
        .attr("fill", "#1e293b")
        .attr("stroke", d => getNodeColor(d))
        .attr("stroke-width", d => isRoot(d.id) ? 4 : 2)
        .style("filter", d => isRoot(d.id) ? "drop-shadow(0 0 10px #FF2A6D)" : "drop-shadow(0 0 5px rgba(0,0,0,0.5))");

      // Pulsing animation for root
      circles.filter(d => isRoot(d.id))
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", "20;24;20")
        .attr("dur", "1.5s")
        .attr("repeatCount", "indefinite");

      // Label
      node.append("text")
        .text(d => d.id)
        .attr("x", 0)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .attr("font-weight", d => isRoot(d.id) ? "bold" : "500")
        .attr("font-family", "Inter, sans-serif")
        .style("pointer-events", "none")
        .style("text-shadow", "0 0 3px rgba(0,0,0,1)");

      // Tooltip
      node.append("title")
        .text(d => `${d.id}${isRoot(d.id) ? ' (ROOT CAUSE)' : ''}\nRisk Score: ${(d.risk * 100).toFixed(0)}%`);

      simulation.on("tick", () => {
        nodes.forEach(n => {
          n.x = Math.max(-width / 2 + 30, Math.min(width / 2 - 30, n.x));
          n.y = Math.max(-height / 2 + 30, Math.min(height / 2 - 50, n.y));
        });

        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);
      });

      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
    };

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, blastRadius]);

  return (
    <div ref={containerRef} className="glass-panel w-full h-full min-h-[300px] overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="font-semibold text-white tracking-wide flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-kairos-blue animate-pulse" />
          Service Map
        </h3>
      </div>
      <svg ref={svgRef} className="w-full h-full block"></svg>
    </div>
  );
};

export default ServiceGraph;
