import React from 'react';

interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  maiden_name?: string | null;
  gender: string;
  birth_date?: string | null;
  death_date?: string | null;
  is_living: boolean;
  bio?: string | null;
}

interface SiblingNode {
  person: Person;
  type: 'Full-Sibling' | 'Half-Sibling';
}

interface ImmediateFamily {
  parents: Person[];
  children: Person[];
  spouses: Person[];
  partners: Person[];
  siblings: SiblingNode[];
}

interface TreeNode {
  person: Person;
  generation: number;
  childId?: number | null;
  parentId?: number | null;
}

interface FamilyTreeProps {
  activePerson: Person;
  ancestors: TreeNode[];
  descendants: TreeNode[];
  immediateFamily: ImmediateFamily;
  onNodeClick: (id: number) => void;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({
  activePerson,
  ancestors,
  descendants,
  immediateFamily,
  onNodeClick
}) => {
  // Dimensions
  const cardWidth = 150;
  const cardHeight = 55;
  const svgWidth = 800;
  const svgHeight = 600;

  // Nodes position map
  const positions = new Map<number, { x: number; y: number }>();

  // 1. Position Active Person in center
  const activeX = (svgWidth - cardWidth) / 2; // 325
  const activeY = (svgHeight - cardHeight) / 2; // 272.5
  positions.set(activePerson.person_id, { x: activeX, y: activeY });

  // 2. Position Spouses and Partners (horizontal offset)
  const partners = [...immediateFamily.spouses, ...immediateFamily.partners];
  partners.forEach((partner, index) => {
    positions.set(partner.person_id, {
      x: activeX + (index + 1) * 190,
      y: activeY
    });
  });

  // Helper to distribute items horizontally centered
  const distributeRow = (nodes: any[], y: number) => {
    const count = nodes.length;
    if (count === 0) return;
    nodes.forEach((node, idx) => {
      let x = activeX;
      if (count > 1) {
        const spread = Math.min(600, count * 160);
        const startX = (svgWidth - spread) / 2;
        x = startX + (spread / (count - 1)) * idx - cardWidth / 2;
      } else {
        x = activeX;
      }
      const id = node.person?.person_id || node.person_id;
      if (id) {
        positions.set(id, { x, y });
      }
    });
  };

  // 3. Position Ancestors
  const gen1Ancestors = ancestors.filter(a => a.generation === 1);
  const gen2Ancestors = ancestors.filter(a => a.generation === 2);
  distributeRow(gen1Ancestors, activeY - 100);
  distributeRow(gen2Ancestors, activeY - 200);

  // 4. Position Descendants
  const gen1Descendants = descendants.filter(d => d.generation === 1);
  const gen2Descendants = descendants.filter(d => d.generation === 2);
  distributeRow(gen1Descendants, activeY + 100);
  distributeRow(gen2Descendants, activeY + 200);

  // Helper to draw bezier path from parent to child
  const getBezierPath = (parentId: number, childId: number) => {
    const parentPos = positions.get(parentId);
    const childPos = positions.get(childId);
    if (!parentPos || !childPos) return '';

    const x1 = parentPos.x + cardWidth / 2;
    const y1 = parentPos.y + cardHeight;
    const x2 = childPos.x + cardWidth / 2;
    const y2 = childPos.y;
    const midY = (y1 + y2) / 2;

    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  // Render node cards
  const renderCard = (person: Person, isActive = false) => {
    const pos = positions.get(person.person_id);
    if (!pos) return null;

    const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : '?';
    const deathYear = person.is_living ? 'Present' : (person.death_date ? new Date(person.death_date).getFullYear() : '†');

    return (
      <foreignObject
        key={person.person_id}
        x={pos.x}
        y={pos.y}
        width={cardWidth}
        height={cardHeight}
      >
        <div
          className={`node-card ${isActive ? 'active' : ''}`}
          onClick={() => onNodeClick(person.person_id)}
        >
          <div className="node-name">
            {person.first_name} {person.last_name}
          </div>
          <div className="node-meta">
            {birthYear} - {deathYear}
          </div>
        </div>
      </foreignObject>
    );
  };

  // Collect paths
  const paths: React.ReactNode[] = [];

  // Spouses connection lines
  partners.forEach(partner => {
    const activePos = positions.get(activePerson.person_id);
    const partnerPos = positions.get(partner.person_id);
    if (activePos && partnerPos) {
      const x1 = activePos.x + cardWidth;
      const y1 = activePos.y + cardHeight / 2;
      const x2 = partnerPos.x;
      const y2 = partnerPos.y + cardHeight / 2;
      paths.push(
        <path
          key={`spouse-${partner.person_id}`}
          d={`M ${x1} ${y1} L ${x2} ${y2}`}
          stroke="rgba(168, 85, 247, 0.4)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      );
    }
  });

  // Ancestors lines
  ancestors.forEach(anc => {
    const childId = anc.childId;
    if (childId && positions.has(anc.person.person_id) && positions.has(childId)) {
      paths.push(
        <path
          key={`anc-link-${anc.person.person_id}-${childId}`}
          d={getBezierPath(anc.person.person_id, childId)}
          className="tree-link"
        />
      );
    }
  });

  // Descendants lines
  descendants.forEach(desc => {
    const parentId = desc.parentId;
    if (parentId && positions.has(desc.person.person_id) && positions.has(parentId)) {
      paths.push(
        <path
          key={`desc-link-${parentId}-${desc.person.person_id}`}
          d={getBezierPath(parentId, desc.person.person_id)}
          className="tree-link"
        />
      );
    }
  });

  return (
    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block', margin: 'auto', minWidth: svgWidth, minHeight: svgHeight }}
      >
        <g>
          {/* Paths */}
          {paths}

          {/* Active Person Node */}
          {renderCard(activePerson, true)}

          {/* Spouse/Partner Nodes */}
          {partners.map(partner => renderCard(partner))}

          {/* Ancestor Nodes */}
          {ancestors.map(anc => renderCard(anc.person))}

          {/* Descendant Nodes */}
          {descendants.map(desc => renderCard(desc.person))}
        </g>
      </svg>
    </div>
  );
};
