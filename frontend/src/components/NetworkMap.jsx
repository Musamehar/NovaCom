import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { callBackend } from '../api';
import GlassCard from './GlassCard';

const NetworkMap = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const fgRef = useRef();

  useEffect(() => {
    // Fetch data from C++
    callBackend('get_visual_graph').then(data => {
      if (data && data.nodes) {
        setGraphData(data);
      }
    });
  }, []);

  return (
    <GlassCard className="h-full w-full relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="font-orbitron text-2xl text-cyan-supernova drop-shadow-glow">GALAXY MAP</h2>
        <p className="text-gray-400 text-xs">Real-time Network Topology</p>
      </div>

      <div className="flex-1 bg-void-black">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          // --- THEME STYLING ---
          backgroundColor="#0B0B15" 
          nodeColor={() => "#00F0FF"} 
          linkColor={() => "#6C63FF"} 
          nodeLabel="name"
          
          // --- PHYSICS TUNING (The Fix) ---
          nodeRelSize={4}          // Smaller nodes (Was 6)
          linkWidth={1}            // Thinner lines
          cooldownTicks={100}      // Let it settle faster
          
          // Custom Physics Engine Configuration
          d3VelocityDecay={0.08}   // Adds "friction" so nodes stop moving sooner
          d3AlphaDecay={0.02}
          
          onEngineStop={() => {
             // Optional: Zoom to fit when physics stops
             fgRef.current.zoomToFit(400, 20); 
          }}
          
          // This adds strong repulsion to push nodes apart
          d3Force="charge"
          d3ForceStrength={-200}    // Negative = Repel. Try -100 to -500.
          
          // Increase distance of links
          d3Force="link"
          d3LinkDistance={50}       // Longer lines = more space
        />
      </div>
    </GlassCard>
  );
};

export default NetworkMap;