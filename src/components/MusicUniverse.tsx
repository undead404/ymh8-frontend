import { useCallback, useRef, useState } from 'react';
import ForceGraph3D, { type ForceGraphMethods } from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

type Node = z.infer<typeof musicUniverseGraphSchema>['nodes'][0];
const Link = 'a';

import type { z } from 'astro/zod';

import type { MusicUniverseGraph, musicUniverseGraphSchema } from '../schemata';
import slugify from '../utils/slugify';

export const MusicUniverse = ({ graph }: { graph: MusicUniverseGraph }) => {
  const fgReference = useRef<ForceGraphMethods>(null);

  // State for interaction
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // 1. Handle Hover (Visual feedback only)
  const handleNodeHover = (node: Node | null) => {
    // If a node is currently selected (clicked), we disable hover effects
    // to prevent visual confusion, OR we can keep them. Let's keep them subtle.
    if ((!node && highlightNodes.size === 0) || (node && hoverNode === node))
      return;

    setHoverNode(node || null);

    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    if (node) {
      newHighlightNodes.add(node.id);
      for (const link of graph.links) {
        const sourceId = link.source;
        const targetId = link.target;

        if (sourceId === node.id || targetId === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(sourceId === node.id ? targetId : sourceId);
        }
      }
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  // 2. Handle Click (Select and Focus)
  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node);

    // Aim at the node from a distance calculated based on its size
    const distance = 150;
    const distributionRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    if (fgReference.current) {
      fgReference.current.cameraPosition(
        {
          x: node.x * distributionRatio,
          y: node.y * distributionRatio,
          z: node.z * distributionRatio,
        },
        { x: node.x, y: node.y, z: node.z },
        3000,
      );
    }
  }, []);

  // 3. Handle Background Click (Deselect)
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Memoize the node object generator to prevent GC thrashing
  const getNodeThreeObject = useCallback(
    (node: Node) => {
      const isHovered = node === hoverNode;
      const isSelected = node === selectedNode;
      const isNeighbor = highlightNodes.has(node.id);
      const isProminent = node.size > 20_000;

      const group = new THREE.Group();

      // Sphere
      const geometry = new THREE.SphereGeometry(Math.log(node.size) * 2);
      const material = new THREE.MeshPhysicalMaterial({
        color: node.color,
        emissive: node.color,
        // Dramatic glow if selected
        emissiveIntensity: isSelected
          ? 4
          : isHovered
            ? 2
            : isNeighbor
              ? 0.8
              : 0.2,
        roughness: 0.4,
        metalness: 0.1,
        transparent: true,
        opacity:
          highlightNodes.size > 0 && !isNeighbor && !isHovered && !isSelected
            ? 0.2
            : 1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);

      // Text Label
      if (isSelected || isHovered || isNeighbor || isProminent) {
        const sprite = new SpriteText(node.label);
        sprite.color = '#ffffff';
        sprite.textHeight = 8;
        sprite.position.set(0, 12, 0);
        group.add(sprite);
      }

      return group;
    },
    [hoverNode, selectedNode, highlightNodes],
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* THE 3D CANVAS */}
      <ForceGraph3D
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ref={fgReference as any}
        graphData={graph}
        cooldownTicks={0}
        backgroundColor="#050505"
        // Nodes
        nodeLabel="label"
        nodeThreeObject={getNodeThreeObject}
        nodeThreeObjectExtend={true} // Keep internal node logic if needed
        // Links
        linkColor={() => '#ffffff'}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 0.5)}
        linkOpacity={0.1}
        linkDirectionalParticles={(link) => (highlightLinks.has(link) ? 4 : 0)}
        linkDirectionalParticleWidth={2}
        // Interaction
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
      />

      {/* THE HTML INFO CARD (HUD) */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px', // Fixed position is better than following the 3D node
            width: '300px',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.85)',
            border: `1px solid ${selectedNode.color}`,
            borderRadius: '8px',
            color: 'white',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease',
            zIndex: 1000,
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', color: selectedNode.color }}>
            {selectedNode.label.toUpperCase()}
          </h2>

          <div
            style={{ marginBottom: '15px', fontSize: '0.9em', color: '#ccc' }}
          >
            <p>
              Popularity:{' '}
              {Math.round(selectedNode.originalPopularity).toLocaleString()}
            </p>
            <p>
              Coordinates: [{selectedNode.x.toFixed(0)},{' '}
              {selectedNode.y.toFixed(0)}]
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href={`/tags/${slugify(selectedNode.id)}/`}
              style={{
                flex: 1,
                padding: '10px',
                background: selectedNode.color,
                color: 'black',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: 'bold',
                borderRadius: '4px',
              }}
            >
              Explore Genre
            </Link>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                padding: '10px',
                background: 'transparent',
                border: '1px solid #555',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
