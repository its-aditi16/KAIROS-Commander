import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ServiceGraph = ({ data, onNodeClick }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || !data.nodes || !data.nodes.length || !svgRef.current || !containerRef.current) return;

    // Use ResizeObserver to handle dynamic sizing
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) return;

        // Re-initialize graph on resize
        d3.select(svgRef.current).selectAll("*").remove();
        initGraph(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    const initGraph = (width, height) => {
      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

      // Risk colors
      const getRiskColor = (risk) => {
        if (risk > 0.8) return "#FF2A6D"; // Critical
        if (risk > 0.5) return "#FF9F1C"; // Warning
        return "#05D5AA"; // Healthy
      };

      // Simulation
      const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(150)) // Increased distance
        .force("charge", d3.forceManyBody().strength(-600)) // Stronger repulsion
        .force("center", d3.forceCenter(0, 0)) // Center it properly
        .force("collide", d3.forceCollide().radius(70)); // Larger collision radius

      // Arrow marker
      svg.append("defs").selectAll("marker")
        .data(["end"])
        .enter().append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 22) // Adjusted for circle radius 20
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
        .data(data.links)
        .join("line")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");

      // Node Groups
      const node = svg.append("g")
        .selectAll("g")
        .data(data.nodes)
        .join("g")
        .style("cursor", "pointer");

      // D3 drag absorbs all pointer events including clicks.
      // We detect a "click" by measuring drag distance: < 5px = click, >= 5px = real drag.
      let dragStartX = 0;
      let dragStartY = 0;
      node.call(
        d3.drag()
          .on("start", function(event) {
            dragStartX = event.x;
            dragStartY = event.y;
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on("drag", function(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on("end", function(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
            // If total movement < 5px it was a click, not a drag
            const dx = event.x - dragStartX;
            const dy = event.y - dragStartY;
            if (Math.sqrt(dx * dx + dy * dy) < 5 && onNodeClick) {
              onNodeClick(d.id);
            }
          })
      );

      // Cell background (Glassmorphism circle)
      node.append("circle")
        .attr("r", 20)
        .attr("fill", "#1e293b")
        .attr("stroke", d => getRiskColor(d.risk))
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 5px rgba(0,0,0,0.5))");

      // Label outside node for readability
      node.append("text")
        .text(d => d.id)
        .attr("x", 0)
        .attr("y", 35) // Position below the node
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .attr("font-family", "Inter, sans-serif")
        .style("pointer-events", "none")
        .style("text-shadow", "0 0 3px rgba(0,0,0,1)");

      // Tooltip behavior
      node.append("title")
        .text(d => `${d.id}\nRisk Score: ${(d.risk * 100).toFixed(0)}%`);

      simulation.on("tick", () => {
        // Clamp nodes within the bounds
        data.nodes.forEach(node => {
          node.x = Math.max(-width / 2 + 30, Math.min(width / 2 - 30, node.x));
          node.y = Math.max(-height / 2 + 30, Math.min(height / 2 - 50, node.y)); // Extra padding for label
        });

        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);
      });

    };

    return () => {
      resizeObserver.disconnect();
    };
  }, [data, onNodeClick]);


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
